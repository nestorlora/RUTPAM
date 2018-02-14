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

/* global google, emt_proxy_url, url_red_icon, url_orange_icon, url_white_icon, ttl_rate_new, refresh_rate, ttl_rate_default, ttl_rate_old */

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
 * lineas_emt[].getBuses
 * lineas_emt[].trazadoIda
 * lineas_emt[].trazadoVta
 */
var autobuses = [];
/* 
 * autobuses[].codBus
 * autobuses[].marker
 * autobuses[].infoWindow
 * autobuses[].ttl
 */

function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
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
	});	
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
			autobuses[pos].marker.setMap(null);
			autobuses.splice(pos, 1);
		}else if(!lineas_emt[findLinea(autobuses[pos].codLinea)].getBuses){
			autobuses[pos].marker.setMap(null);
			pos++;
		}else if(autobuses[pos].ttl <= ttl_old){
			autobuses[pos].marker.setMap(null);
			autobuses[pos].marker.setIcon(url_red_icon);
			autobuses[pos].marker.setMap(map);
			pos++;
		}else{
			pos++;
		}
	}
}

function getLineas(){
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
			$("#getLineas").remove();
			$("#play").css("display", "inline-block");
			$("#refresh").css("display", "inline-block");
			$("#pause").css("display", "inline-block");
		}
	});
};

function getTrazados(codLinea){
	$.getJSON({
		url: emt_proxy_url+'/services/trazados/?codLinea='+codLinea+'&sentido=1'
	}).done(function (response, status){
		if(status === "success" && response.length > 0){
			var posLinea = findLinea(codLinea);
			var trazado = [];
			for(var a = 0; a < response.length; a++){
				trazado.push({lat: response[a].latitud, lng: response[a].longitud});
			}
			lineas_emt[posLinea].trazadoIda = new google.maps.Polyline({
				path: trazado,
				strokeColor: '#1E3180',
				strokeOpacity: 1.0,
				strokeWeight: 3
			});
			$("#botonIda"+codLinea).attr("disabled", false);
			$("#botonIda"+codLinea).click(function(){
				showTrazado(codLinea, 1);
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
			lineas_emt[posLinea].trazadoVta = new google.maps.Polyline({
				path: trazado,
				strokeColor: '#4876FE',
				strokeOpacity: 1.0,
				strokeWeight: 3
			});
			//lineas_emt[posLinea].trazadoVta.setMap(map);
			$("#botonVta"+codLinea).attr("disabled", false);
			$("#botonVta"+codLinea).click(function(){
				showTrazado(codLinea, 2);
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
		}		
	});
};

function addBus(Bus){
	console.log("ADDED "+Bus.codBus);
	var coordenadas = {lat: Bus.latitud , lng: Bus.longitud};
	var data = {
		marker: new google.maps.Marker({
			position: coordenadas,
			map: map,
			icon: url_orange_icon
		}),
		infoWindow: new google.maps.InfoWindow({
			content:
				"codBus: "+Bus.codBus+"<br>"+
				"codLinea: "+Bus.codLinea+"<br>"+
				"codParIni: "+Bus.codParIni+"<br>"+
				"sentido: "+Bus.sentido
		}),
		codLinea: Bus.codLinea,
		codBus: Bus.codBus,
		ttl: ttl_new
	};
	autobuses.push(data);
}

function updateBus(Bus, pos){
	var coordenadas = {lat: Bus.latitud , lng: Bus.longitud};
	if(autobuses[pos].marker.getPosition() !== coordenadas){
		autobuses[pos].marker.setMap(null);
		autobuses[pos].marker.setPosition(coordenadas);
		autobuses[pos].marker.setMap(map);
	}
	if(autobuses[pos].ttl < default_ttl){
		autobuses[pos].ttl = default_ttl;
		autobuses[pos].marker.setMap(null);
		autobuses[pos].marker.setIcon(url_white_icon);
		autobuses[pos].marker.setMap(map);
	}
}

function addLinea(linea){
	lineas_emt.push({
		codLinea: linea.codLinea,
		userCodLinea: linea.userCodLinea,
		nombreLinea: linea.nombreLinea,
		getIda: false,
		getVta: false,
		getBuses: false
	});
	var fila = $("<tr>");
	var botonIda = $("<input>", {
		"type": "checkbox",
		"id": "botonIda"+linea.codLinea,
		"disabled": true
	});
	var botonVta = $("<input>", {
		"type": "checkbox",
		"id": "botonVta"+linea.codLinea,
		"disabled": true
	});
	var botonBus = $("<input>", {
		"type": "checkbox",
		"id": "botonBus"+linea.codLinea
	}).attr('checked', false).click(function(){
		enableBusUpdate(linea.codLinea);
	});
	var id = $('<span>').addClass('fa-layers fa-fw fa-2x');
	id.append($('<i>').addClass('fas fa-circle').css("color", "262C72"));
	id.append($('<span>').addClass("fa-layers-text fa-inverse").text(linea.userCodLinea).attr("data-fa-transform", "shrink-6"));
	$(fila).append($("<td>").append(botonIda));
	$(fila).append($("<td>").append(botonVta));
	$(fila).append($("<td>").append(botonBus));
	$(fila).append($("<td>").append(id));
	$(fila).append($("<td>", {
		"text": linea.nombreLinea
	}));
	$(fila).append($("<td>"));

	$("#tablaLineas").append(fila);
	getTrazados(linea.codLinea);
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

function showTrazado(codLinea, sentido){
	if(sentido === 1){
		lineas_emt[findLinea(codLinea)].trazadoIda.setMap(map);
		$("#botonIda"+codLinea).attr("checked", true);
		$("#botonIda"+codLinea).unbind("click");
		$("#botonIda"+codLinea).click(function(){
			hideTrazado(codLinea, sentido);
		});
	}else if(sentido === 2){
		lineas_emt[findLinea(codLinea)].trazadoVta.setMap(map);
		$("#botonVta"+codLinea).attr("checked", true);
		$("#botonVta"+codLinea).unbind("click");
		$("#botonVta"+codLinea).click(function(){
			hideTrazado(codLinea, sentido);
		});
	}
}

function hideTrazado(codLinea, sentido){
	if(sentido === 1){
		lineas_emt[findLinea(codLinea)].trazadoIda.setMap(null);
		$("#botonIda"+codLinea).attr("checked", false);
		$("#botonIda"+codLinea).unbind("click");
		$("#botonIda"+codLinea).click(function(){
			showTrazado(codLinea, sentido);
		});
	}else if(sentido === 2){
		lineas_emt[findLinea(codLinea)].trazadoVta.setMap(null);
		$("#botonVta"+codLinea).attr("checked", false);
		$("#botonVta"+codLinea).unbind("click");
		$("#botonVta"+codLinea).click(function(){
			showTrazado(codLinea, sentido);
		});
	}
}

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
