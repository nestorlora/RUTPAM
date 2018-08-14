/* 
 * The MIT License
 *
 * Copyright 2018 Nestor Manuel Lora Romero <nestorlora@gmail.com>.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/* global emt_proxy_url, url_red_icon, url_orange_icon, url_white_icon, ttl_rate_new, refresh_rate, ttl_rate_default, ttl_rate_old, L */

var rutpam_version = "4.5";
var timer;
var map;
var ttl_new = ttl_rate_new/refresh_rate; //Tiempo de vida para buses nuevos (naranjas)(al alcanzar default_ttl se vuelven blancos)
var default_ttl = ttl_rate_default/refresh_rate; //Número de actualizaciones fallidas sin aparecer para darlo por muerto
var ttl_old = ttl_rate_old/refresh_rate; //Número de actualizaciones fallidas sin aparecer para indicar que el bus probablemente haya desaparecido (color rojo)
var lineas_emt = [];
/* 
 * lineas_emt[].codLinea
 * lineas_emt[].userCodLinea
 * lineas_emt[].nombreLinea
 * lineas_emt[].cabeceraIda
 * lineas_emt[].cabeceraVta
 * lineas_emt[].paradasIda[]{codPar, orden}
 * lineas_emt[].paradasVta[]{codPar, orden}
 * lineas_emt[].trazadoIda
 * lineas_emt[].trazadoVta
 * lineas_emt[].getBuses
 * lineas_emt[].getIda
 * lineas_emt[].getVta
 */
var autobuses = [];
/* 
 * autobuses[].codBus
 * autobuses[].codLinea
 * autobuses[].sentido
 * autobuses[].codParIni
 * autobuses[].latitud
 * autobuses[].longitud
 * autobuses[].marker
 * autobuses[].popup
 * autobuses[].ttl
 */
var paradas = [];
/*
 * paradas[].codPar
 * paradas[].nombreParada
 * paradas[].servicios[]{codLinea, sentido, espera}
 * paradas[].latitud
 * paradas[].longitud
 * paradas[].marker
 * paradas[].popup
 */

/*var bus_icon_white = L.icon({
	iconUrl: url_white_icon,
	iconAnchor: [15, 15],
	popupAnchor: [0, -15]
});
var bus_icon_red = L.icon({
	iconUrl: url_red_icon,
	iconAnchor: [15, 15],
	popupAnchor: [0, -15]
});
var bus_icon_orange = L.icon({
	iconUrl: url_orange_icon,
	iconAnchor: [15, 15],
	popupAnchor: [0, -15]
});
var bus_stop_icon = L.icon({
});*/

$(document).ready(function(){
	initMap();
	document.title = "RUTPAM "+rutpam_version;
});

function initMap() {
	/*map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 36.7121977, lng: -4.4370495},
		zoom: 13,
		scrollwheel: true,
		streeViewControl: false,
		styles:[
			{
				featureType: "transit.station.bus",
				stylers: [{visibility: "off"}]
			}
		],
		mapTypeControlOptions: {
			style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
			position: google.maps.ControlPosition.TOP_RIGHT
		}
	});*/
	map = L.map('map', {
		center: [36.7121977, -4.4370495],
		zoom: 13,
		preferCanvas: false,
		closePopupOnClick: false
	});
	var osmUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
	var osmAttrib = 'RUTPAM v3.4 © Néstor Lora - 2018 | Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors';
	var osm = new L.TileLayer(osmUrl, {/*minZoom: 8,*/ maxZoom: 18, attribution: osmAttrib});
	map.addLayer(osm);
	
	$("#over_map").html(ControlRUTPAM($("<div>")));
}

function motor(){
	for(var y = 0; y < lineas_emt.length; y++){
		if(lineas_emt[y].getBuses){
			setTimeout(getUbicaciones, y*30, lineas_emt[y].codLinea);
		}
	}
	reducirTTL();
}

function stop(){
	clearInterval(timer);
	$("#pause").attr("disabled", true);
	$("#play").attr("disabled", false);
	$("#refresh").attr("disabled", false);
}

function start(){
	timer = setInterval(motor, refresh_rate*1000);
	$("#pause").attr("disabled", false);
	$("#play").attr("disabled", true);
	$("#refresh").attr("disabled", true);
}

function reducirTTL(){
	var pos = 0;
	while(pos < autobuses.length){
		autobuses[pos].ttl--;
		if(autobuses[pos].ttl <= 0){
			console.log("DROP "+autobuses[pos].codBus);
			autobuses[pos].marker.remove();
			autobuses.splice(pos, 1);
		}else if(lineas_emt[findLinea(autobuses[pos].codLinea)].getBuses === false){
			autobuses[pos].marker.remove();
			pos++;
		}else if(autobuses[pos].ttl <= ttl_old){
			autobuses[pos].marker.setIcon(busIconContent(autobuses[pos], 2));
			pos++;
		}else{
			pos++;
		}
	}
}

function getLineas(){
	$("#getLineas").remove();
	$.getJSON({
		url: emt_proxy_url+'/services/lineas/'
	}).done(function (response, status){
		if(status === "success"){
			lineas_emt = [];
			for(var i = 0; i<response.length; i++){
				addLinea(response[i]);
			}
			motor();
			start();
			$("#play").css("display", "inline-block");
			$("#refresh").css("display", "inline-block");
			$("#pause").css("display", "inline-block");
		}
	});
};

function getTrazados(codLinea){
	$("#botonIda"+codLinea).prop("indeterminate", false);
	$("#botonIda"+codLinea).prop("disabled", true);
	$("#botonIda"+codLinea).prop("checked", false);
	$("#botonIda"+codLinea).off('click');
	$("#botonVta"+codLinea).prop("indeterminate", false);
	$("#botonVta"+codLinea).prop("disabled", true);
	$("#botonVta"+codLinea).prop("checked", false);
	$("#botonVta"+codLinea).off('click');
	$.getJSON({
		url: emt_proxy_url+'/services/trazados/?codLinea='+codLinea+'&sentido=1'
	}).done(function (response, status){
		if(status === "success" && response.length > 0){
			var posLinea = findLinea(codLinea);
			var trazado = [];
			for(var a = 0; a < response.length; a++){
				trazado.push({lat: response[a].latitud, lng: response[a].longitud});
			}
			lineas_emt[posLinea].trazadoIda = L.polyline(trazado, {
				color: '#1E3180',
				opacity: 1.0,
				weight: 3
			});
			$("#botonIda"+codLinea).prop("disabled", false);
			$("#botonIda"+codLinea).prop("checked", false);
			$("#botonIda"+codLinea).change(function(){
				var isChecked = $(this).is(':checked');
				if(isChecked){
					showTrazado(codLinea, 1);
				}else{
					hideTrazado(codLinea, 1);
				}
			});
		}
	});
	$.getJSON({
		url: emt_proxy_url+'/services/trazados/?codLinea='+codLinea+'&sentido=2'
	}).done(function (response, status){
		if(status === "success" && response.length > 0){
			//console.log("Línea "+codLinea+" Vta: "+response.length);
			var posLinea = findLinea(codLinea);
			var trazado = [];
			for(var a = 0; a < response.length; a++){
				trazado.push({lat: response[a].latitud, lng: response[a].longitud});
			}
			lineas_emt[posLinea].trazadoVta = L.polyline(trazado, {
				color: '#4876FE',
				opacity: 1.0,
				weight: 3
			});
			$("#botonVta"+codLinea).prop("disabled", false);
			$("#botonVta"+codLinea).prop("checked", false);
			$("#botonVta"+codLinea).change(function(){
				var isChecked = $(this).is(':checked');
				if(isChecked){
					showTrazado(codLinea, 2);
				}else{
					hideTrazado(codLinea, 2);
				}
			});
		}		
	});
}

function getUbicaciones(codLinea){
	$.getJSON({
		url: emt_proxy_url+'/services/buses/?codLinea='+codLinea
	}).done(function (response, status){
		if(status === "success"){
			for(var x = 0; x < response.length; x++){
				pos = findBus(response[x].codBus);
				if(pos !== null){
					updateBus(response[x], pos);
				}else{
					addBus(response[x]);
				}
			}
			$("#cont"+codLinea).text(response.length);
		}		
	});
};

function addBus(Bus){
	console.log("ADDED "+Bus.codBus);
	var coordenadas = {lat: Bus.latitud , lng: Bus.longitud};
	var data = {
		marker: L.marker(coordenadas, {
			//icon: bus_icon_orange
			icon: busIconContent(Bus, 1)
		}),
		popup: L.popup({autoPan: false, autoClose: false}).setContent(busInfoContent(Bus)),
		codBus: Bus.codBus,
		codLinea: Bus.codLinea,
		sentido: Bus.sentido,
		codParIni: Bus.codParIni,
		latitud: Bus.latitud,
		longitud: Bus.longitud,
		ttl: ttl_new
	};
	var pos = autobuses.push(data)-1;
	autobuses[pos].marker.bindPopup(autobuses[pos].popup);
	autobuses[pos].marker.addTo(map);
}

function updateBus(Bus, pos){
	var coordenadas = {lat: Bus.latitud , lng: Bus.longitud};
	if(!autobuses[pos].marker.getLatLng().equals(coordenadas)){
		autobuses[pos].marker.setLatLng(coordenadas);
	}
	autobuses[pos].codLinea = Bus.codLinea;
	autobuses[pos].sentido = Bus.sentido;
	autobuses[pos].codParIni = Bus.codParIni;
	autobuses[pos].latitud = Bus.latitud;
	autobuses[pos].longitud = Bus.longitud;
	autobuses[pos].popup.setContent(busInfoContent(Bus));
	autobuses[pos].marker.addTo(map);
	if(autobuses[pos].ttl < default_ttl){
		autobuses[pos].ttl = default_ttl;
		autobuses[pos].marker.setIcon(busIconContent(autobuses[pos], 0));
	}
}

function addLinea(lin){
	var linea = {
		codLinea: lin.codLinea,
		userCodLinea: lin.userCodLinea.replace(/^F-/, "F"),
		nombreLinea: lin.nombreLinea.replace(/(\(F\))|(\(?F-[0-9A-Z]{1,2}\)$)/, ""),
		cabeceraIda: lin.cabeceraIda, 
		cabeceraVta: lin.cabeceraVuelta,
		paradasIda: [],
		paradasVta: [],
		getIda: false,
		getVta: false,
		getBuses: false
	};
	for(var a = 0; a < lin.paradas.length; a++){
		addParada(lin.paradas[a].parada, linea.codLinea, lin.paradas[a].sentido);
		if(lin.paradas[a].sentido === 1){
			linea.paradasIda.push({
				codPar: lin.paradas[a].parada.codParada,
				orden: lin.paradas[a].orden
			});
		}
		if(lin.paradas[a].sentido === 2){
			linea.paradasVta.push({
				codPar: lin.paradas[a].parada.codParada,
				orden: lin.paradas[a].orden
			});
		}
	}
	lineas_emt.push(linea);
	//getTrazados(linea.codLinea);
	
	var fila = $("<tr>");
	var botonIda = $("<input>", {
		"type": "checkbox",
		"id": "botonIda"+linea.codLinea
	}).prop('checked', true).prop("indeterminate", true).click(function(){
		getTrazados(linea.codLinea);
	});
	var botonVta = $("<input>", {
		"type": "checkbox",
		"id": "botonVta"+linea.codLinea,
		"checked": true
	}).prop('checked', true).prop("indeterminate", true).click(function(){
		getTrazados(linea.codLinea);
	});
	var botonBus = $("<input>", {
		"type": "checkbox",
		"id": "botonBus"+linea.codLinea
	}).prop('checked', false).click(function(){
		enableBusUpdate(linea.codLinea);
	});
	var id = $('<span>').addClass('fa-layers fa-fw fa-3x');
	if(/^C[1-9]/.test(linea.userCodLinea)){ // Circulares
		id.append($('<i>').addClass('fas fa-circle').css("color", "F77F00"));
	}else if(/^N[1-9]/.test(linea.userCodLinea)){ // Nocturno
		id.append($('<i>').addClass('fas fa-circle').css("color", "04151F"));
	}else if(/^A$|^E$|^L$/.test(linea.userCodLinea)){ // Lineas Exprés y Lanzaderas
		id.append($('<i>').addClass('fas fa-circle').css("color", "AA1155"));
	}else if(/^91$|^92$/.test(linea.userCodLinea)){ // Servicios Turísticos
		id.append($('<i>').addClass('fas fa-circle').css("color", "62A87C"));
	}else if(/^12$|^16$|^26$|^64$|^[A-Z]/.test(linea.userCodLinea)){ // Servicios Especiales
		id.append($('<i>').addClass('fas fa-circle').css("color", "D62828"));
	}else{ // Líneas Convencionales
		id.append($('<i>').addClass('fas fa-circle').css("color", "262C72"));
	}
	if(linea.userCodLinea.length < 3){
		id.append($('<span>').addClass("fa-layers-text fa-inverse").text(linea.userCodLinea).attr("data-fa-transform", "shrink-6"));
	}else{
		id.append($('<span>').addClass("fa-layers-text fa-inverse").text(linea.userCodLinea).attr("data-fa-transform", "shrink-8"));
	}
	$(fila).append($("<td>").append(botonIda));
	$(fila).append($("<td>").append(botonVta));
	$(fila).append($("<td>").append(botonBus));
	$(fila).append($("<td>").append(id));
	$(fila).append($("<td>", {
		"text": linea.nombreLinea
	}));
	$(fila).append($("<td>").append($("<p>").attr('id', "cont"+linea.codLinea)));

	$("#tablaLineas").append(fila);
}

function addParada(parada, codLinea, sentido){
	var pos = findParada(parada.codParada);
	if(pos !== null){
		paradas[pos].servicios.push({
			codLinea: codLinea,
			sentido: sentido,
			espera: null
		});
	}else{
		pos = paradas.push({
			codPar: parada.codParada,
			nombreParada: parada.nombreParada,
			servicios: [],
			latitud: parada.latitud,
			longitud: parada.longitud,
			marker: L.marker({lat: parada.latitud, lng: parada.longitud}/*, {
				icon: bus_stop_icon
			}*/)
		})-1;
		paradas[pos].servicios.push({
			codLinea: codLinea,
			sentido: sentido,
			espera: null
		});
		//paradas[pos].marker.addTo(map);
	}
}

function enableBusUpdate(codLinea){
	lineas_emt[findLinea(codLinea)].getBuses = true;
	$("#botonBus"+codLinea).attr("checked", true);
	$("#botonBus"+codLinea).unbind("click");
	$("#botonBus"+codLinea).click(function(){
		disableBusUpdate(codLinea);
	});
}

function disableBusUpdate(codLinea){
	lineas_emt[findLinea(codLinea)].getBuses = false;
	$("#botonBus"+codLinea).attr("checked", false);
	$("#botonBus"+codLinea).unbind("click");
	$("#botonBus"+codLinea).click(function(){
		enableBusUpdate(codLinea);
	});
}

/**
 * Al ser llamada, añade al mapa el trazado de la línea indicada y prepara el botón para realizar la acción contraria cuando vuelva a ser llamado
 * @param {Number} codLinea
 * @param {Number} sentido
 */
function showTrazado(codLinea, sentido){
	if(sentido === 1){
		lineas_emt[findLinea(codLinea)].trazadoIda.addTo(map);
		/*$("#botonIda"+codLinea).attr("checked", true);
		$("#botonIda"+codLinea).unbind("click");
		$("#botonIda"+codLinea).click(function(){
			hideTrazado(codLinea, sentido);
		});*/
	}else if(sentido === 2){
		lineas_emt[findLinea(codLinea)].trazadoVta.addTo(map);
		/*$("#botonVta"+codLinea).attr("checked", true);
		$("#botonVta"+codLinea).unbind("click");
		$("#botonVta"+codLinea).click(function(){
			hideTrazado(codLinea, sentido);
		});*/
	}
}

/**
 * Al ser llamada, borra del mapa el trazado de la línea indicada y prepara el botón para realizar la acción contraria cuando vuelva a ser llamado
 * @param {Number} codLinea
 * @param {Number} sentido
 */
function hideTrazado(codLinea, sentido){
	if(sentido === 1){
		lineas_emt[findLinea(codLinea)].trazadoIda.remove();
		$("#botonIda"+codLinea).attr("checked", false);
		$("#botonIda"+codLinea).unbind("click");
		$("#botonIda"+codLinea).click(function(){
			showTrazado(codLinea, sentido);
		});
	}else if(sentido === 2){
		lineas_emt[findLinea(codLinea)].trazadoVta.remove();
		$("#botonVta"+codLinea).attr("checked", false);
		$("#botonVta"+codLinea).unbind("click");
		$("#botonVta"+codLinea).click(function(){
			showTrazado(codLinea, sentido);
		});
	}
}

/**
 * Busca la posición de una línea dentro de lineas_emt[]
 * @param {Number} codLinea
 * @returns {Number} Posición en lineas_emt[]
 */
function findLinea(codLinea){
	var pos = 0;
	var found = false;
	while(pos < lineas_emt.length && !found){
		if(lineas_emt[pos].codLinea === codLinea){
			found = true;
		}else{
			pos++;
		}
	}
	if(pos >= lineas_emt.length){
		return null;
	}else{
		return pos;
	}
}

/**
 * Busca la posición de un coche dentro de autobuses[]
 * @param {Number} codBus
 * @returns {Number} Posición en autobuses[]
 */
function findBus(codBus){
	var pos = 0;
	var found = false;
	while(pos < autobuses.length && !found){
		if(autobuses[pos].codBus === codBus){
			found = true;
		}else{
			pos++;
		}
	}
	if(pos >= autobuses.length){
		return null;
	}else{
		return pos;
	}
}

function findParada(codPar){
	var pos = 0;
	var found = false;
	while(pos < paradas.length && !found){
		if(paradas[pos].codPar === codPar){
			found = true;
		}else{
			pos++;
		}
	}
	if(pos >= paradas.length){
		return null;
	}else{
		return pos;
	}
}

/**
 * Devuelve el contenido HTML de una ventana de información adicional de autobús
 * @param {Bus} Bus
 * @returns {String}
 */
function busInfoContent(Bus){
	var linea = lineas_emt[findLinea(Bus.codLinea)];
	var sentido;
	switch(Bus.sentido){
		case 1: // Ida
			sentido = linea.cabeceraVta;
			break;
		case 2: // Vuelta
			sentido = linea.cabeceraIda;
			break;
		default:
			sentido = "¿? Desconocido ¿?";
	}
	return "Bus: "+Bus.codBus+"<br>"+
	"Línea: "+linea.userCodLinea+"<br>"+
	"Última parada realizada: "+Bus.codParIni+"<br>"+
	"Sentido: "+sentido;
}

function busIconContent(Bus, estado){
	var linea = lineas_emt[findLinea(Bus.codLinea)].userCodLinea;
	var html = linea+"<br>"+Bus.codBus;
	var clase;
	switch (Bus.sentido){
		case 1:
			clase = 'bus-marker bus-ida';
			break;
		case 2:
			clase = 'bus-marker bus-vta';
			break;
		default:
			clase = 'bus-marker bus-other';
			break;
	}
	switch (estado){
		case 1:
			clase += ' bus-new';
			break;
		case 2:
			clase += ' bus-lost';
			break;
		default:
			clase += ' bus-normal';
			break;
	}
	return L.divIcon({
		className: clase,
		iconSize: [37, 34],
		iconAnchor: [5, 2],
		popupAnchor: [13, -2],
		html: html
	});
}

/**
 * Recoge un elemento del DOM y lo devuelve rellenado con el HTML adecuado de la barra de control
 * @param {DOM Element} mapDiv
 * @returns {DOM Element}
 */
function ControlRUTPAM(mapDiv){
	var layer = $("<div>", {"id":"layer"});
	var titulo = $("<p>").append($("<b>", {"text":"RUTPAM"}));
	var descripcion = $("<p>", {"text":"Seguimiento buses EMT en tiempo real"});
	$(layer).append(titulo).append(descripcion);
	
	var obtenerLineas = $("<button>", {
		"id": "getLineas",
		"type": "button",
		"class": "boton",
		"text": "Obtener líneas"
	});
	obtenerLineas.on("click", getLineas);
	var play = $("<button>", {
		"id": "play",
		"type": "button",
		"class": "boton",
		"text": "Play"
	});
	play.on("click", function(){
		start();
	});
	play.css("display", "none");
	var refresh = $("<button>", {
		"id": "refresh",
		"type": "button",
		"class": "boton",
		"text": "Refrescar"
	});
	refresh.on("click", function(){
		motor();
	});
	refresh.css("display", "none");
	var pause = $("<button>", {
		"id": "pause",
		"type": "button",
		"class": "boton",
		"text": "Pausa"
	});
	pause.on("click", function(){
		stop();
	});
	pause.css("display", "none");
	$(layer).append(obtenerLineas).append(play).append(refresh).append(pause);
	
	var tabla = $("<table>", {
		"id": "tablaLineas"
	});
	
	var encabezado = $("<tr>");
	$(encabezado).html('<th>Ida</th><th>Vta</th><th>Bus</th><th colspan="2">Línea</th><th>NºB.</th>');
	
	$(tabla).append(encabezado);
	$(layer).append($("<div>", {"class": "scroll"}).append(tabla));
	
	$(mapDiv).append(layer);
	return mapDiv;
}
