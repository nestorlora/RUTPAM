/* 
 * The MIT License
 *
 * Copyright 2018 Nestor Manuel Lora Romero <nestorlora@geeklab.es>.
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

/* global emt_proxy_url, ctan_api_url, ttl_rate_new, refresh_rate, ttl_rate_default, ttl_rate_old, L, betteremt_api_url */

/**
 * @description Función que llama a la API para cargar las líneas. Cambia algunos elementos para preparar la interfaz.
 * @returns {null}
 */
function getLineas(){
	$("#getLineas").remove(); // Eliminamos el botón para pedir las líneas
	// Petición AJAX
	$.getJSON({
		url: emt_proxy_url+'/services/lineas/'
	}).done(function (response, status){
		if(status === "success"){
			lineas = [];
			$("#tablaLineas").show();
			for(var i = 0; i<response.length; i++){
				addLinea(response[i]); // Para cada línea de la respuesta la pasamos por addLinea()
			}
			inicializarParadas();
			motor(); // Llamamos la primera vez al motor
			start(); // Programamos que se ejecute periódicamente
			// Mostramos la botoner de control del motor
			$("#play").css("display", "inline-block");
			$("#refresh").css("display", "inline-block");
			$("#pause").css("display", "inline-block");
		}
	});
	return null;
};

/**
 * @description Función que llama a la API para cargar los trazados de una linea dada. A continuación los muestra sobre el mapa según el usuario lo haya indicado
 * @param {Int} codLinea
 * @returns {null}
 */
function getTrazados(codLinea){
	// Cambiamos el estado a deshabilitado a la espera de recibir los datos
	$("#botonIda"+codLinea).prop("indeterminate", false).prop("disabled", true).off('click');
	$("#botonVta"+codLinea).prop("indeterminate", false).prop("disabled", true).off('click');
	// Llamada AJAX
	$.getJSON({
		url: emt_proxy_url+'/services/trazados/?codLinea='+codLinea+'&sentido=1'
	}).done(function (response, status){
		if(status === "success" && response.length > 0){
			var posLinea = findLinea(codLinea); // Almacenamos la posición en lineas[] para uso más cómodo
			var trazado = []; // Creamos un array con los puntos de latitud y longitud del polígono
			for(var a = 0; a < response.length; a++){
				trazado.push({lat: response[a].latitud, lng: response[a].longitud});  // Rellenamos con los datos de la respuesta
			}
			lineas[posLinea].trazadoIda = L.polyline(trazado, {
				color: '#1E3180', // Fijamos el color de la ida
				opacity: 1.0, // Opacidad
				weight: 3 // Grosor
			});
			lineas[posLinea].getIda = true;
			$("#botonIda"+codLinea).prop("disabled", false); 
			$("#botonIda"+codLinea).change(function(){
				var isChecked = $(this).is(':checked');
				if(isChecked){
					showTrazado(codLinea, 1); // Mostramos el trazado
				}else{
					hideTrazado(codLinea, 1); // Ocultamos el trazado
				}
			});
			$("#botonIda"+codLinea).trigger("change");
		}
	});
	$.getJSON({
		url: emt_proxy_url+'/services/trazados/?codLinea='+codLinea+'&sentido=2'
	}).done(function (response, status){
		if(status === "success" && response.length > 0){
			var posLinea = findLinea(codLinea); // Almacenamos la posición en lineas[] para uso más cómodo
			var trazado = []; // Creamos un array con los puntos de latitud y longitud del polígono
			for(var a = 0; a < response.length; a++){
				trazado.push({lat: response[a].latitud, lng: response[a].longitud}); // Rellenamos con los datos de la respuesta
			}
			lineas[posLinea].trazadoVta = L.polyline(trazado, {
				color: '#4876FE', // Fijamos el color de la vuelta
				opacity: 1.0, // Opacidad
				weight: 3 // Grosor
			});
			lineas[posLinea].getVta = true;
			$("#botonVta"+codLinea).prop("disabled", false);
			$("#botonVta"+codLinea).change(function(){
				var isChecked = $(this).is(':checked');
				if(isChecked){
					showTrazado(codLinea, 2); // Mostramos el trazado
				}else{
					hideTrazado(codLinea, 2); // Ocultamos el trazado
				}
			});
			$("#botonVta"+codLinea).trigger("change");
		}		
	});
	return null;
}

function getUbicaciones(codLinea){
	$.getJSON({
		//url: emt_proxy_url+'/services/buses/?codLinea='+codLinea
		url: betteremt_api_url+'/buses/linea/'+codLinea
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
			lineas[findLinea(codLinea)].numBuses = response.length;
			$("#cont"+codLinea).text(response.length);
		}		
	});
};

function addBus(Bus){
	console.log("ADDED "+Bus.codBus);
	var coordenadas = {lat: Bus.latitud , lng: Bus.longitud};
	var data = {
		marker: L.marker(coordenadas, {
			icon: busIconContent(Bus, 1)
		}),
		popup: L.popup({autoPan: false, autoClose: false}).setContent(busPopupContent(Bus)),
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
	autobuses[pos].popup.setContent(busPopupContent(Bus));
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
        trazadoIda: null,
        trazadoVta: null,
        getBuses: false,
		getIda: false,
		getVta: false,
		verParadas: false,
		numBuses: 0
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
	lineas.push(linea);
	//getTrazados(linea.codLinea);
	
	var fila = $("<tr>");
	var botonIda = $("<input>", {
		"type": "checkbox",
		"id": "botonIda"+linea.codLinea
	}).prop('checked', false).prop("indeterminate", true).click(function(){
		getTrazados(linea.codLinea);
	});
	var botonVta = $("<input>", {
		"type": "checkbox",
		"id": "botonVta"+linea.codLinea,
		"checked": true
	}).prop('checked', false).prop("indeterminate", true).click(function(){
		getTrazados(linea.codLinea);
	});
	var botonBus = $("<input>", {
		"type": "checkbox",
		"id": "botonBus"+linea.codLinea
	}).prop('checked', false).click(function(){
		enableBusUpdate(linea.codLinea);
	});
	$(fila).append($("<td>").append(botonIda));
	$(fila).append($("<td>").append(botonVta));
	$(fila).append($("<td>").append(botonBus));
	$(fila).append($("<td>").append(lineaIcon(linea.userCodLinea, "3x")));
	$(fila).append($("<td>").append($("<a>", {text: linea.nombreLinea, href: "#!"}).click(function(){verInfoLinea(linea.codLinea);})));
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
			direccion: parada.direccion,
			servicios: [],
			latitud: parada.latitud,
			longitud: parada.longitud,
			marker: null,
			popup: null,
			viewCont: 0
		})-1;
		paradas[pos].servicios.push({
			codLinea: codLinea,
			sentido: sentido,
			espera: null
		});
	}
}