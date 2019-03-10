/**
 * @copyright
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

/* Este script necesia los archivos ctan.js y emt.js para poder funcionar correctamente */
'use strict';

var rutpam = new Rutpam();

/**
 * @description Lista de modos de transporte (medios de transporte)
 * @global
 * @var
 */
var modos = new Listado();

/**
 * @description Lista de zonas del CTAN
 * @global
 * @var
 */
var zonas = new Listado();

/**
 * @description Tabla de líneas cargadas
 * @type Array
 * @param {String} idLinea Identificador único de la línea (EMT+CTAN)
 * @param {String} userCodLinea Nombre corto de la línea (1, C2, N3)
 * @param {String} nombreLinea Nombre largo de la línea (Alameda-Churriana)
 * @param {String} cabeceraIda Nombre de la cabecera donde empieza la ida
 * @param {String} cabeceraVta Nombre de la cabecera donde empieza la vuelta
 * @param {Array} paradasIda Array de paradas a la ida {codPar,orden}
 * @param {Array} paradasVta Array de paradas a la vuelta {codPar, orden}
 * @param {Object} trazadoIda
 * @param {Object} trazadoVta
 * @param {Bool} getBuses
 * @param {Bool} getIda
 * @param {Bool} getVta
 * @param {Bool} verParadas Indica si esta activa sobre el mapa la visualización de las paradas de la línea
 * @param {Int} numBuses Indica la cantidad de buses que ahora mismo están operando en la línea
 * @param {String} modo Modo de transporte de la línea
 * @param {Bool} hayNoticia Indica si hay o no noticias relacionadas con la línea
 * @param {String} operadores Lista de operadores de la línea
 * @param {Bool} tieneIda Indica si la línea tiene trayecto de ida
 * @param {Bool} tieneVuelta Indica si la línea tiene trayecto de vuelta
 */
var lineas = [];

/**
 * @description Tabla de autobuses en servicio
 * @type Array
 * @param {Int} codBus Nº de coche, identificador
 * @param {Int} idLinea Código interno de la línea que sirve
 * @param {Int} sentido Sentido de la línea que está recorriendo actualmente
 * @param {Int} codParIni Código de la última parada a la que ha llegado
 * @param {Float} latitud Ubicación
 * @param {Float} longitud Ubicación
 * @param {L.marker} marker Objeto del marcador asociado al coche
 * @param {L.popup} popup Objeto del cuadro de información adicional del coche
 * @param {Int} ttl Time-to-live del coche
 */
var autobuses = [];

/**
 * @description Tabla de paradas cargadas
 * @type Array
 * @param {Int} codPar Código de la parada
 * @param {String} nombreParada Nombre de la parada
 * @param {String} direccion Dirección postal de la parada
 * @param {String} idNucleo Código del núcleo urbano de la parada
 * @param {Number} idZona Código de la zona
 * @param {Array} servicios Array de servicios {idLinea, sentido, espera} que hay en esa parada
 * @param {Float} latitud Ubicación
 * @param {Float} longitud Ubicación
 * @param {String} modos Modos de transporte de la parada
 * @param {L.marker} marker Objeto del marcador asociado a la parada
 * @param {L.popup} popup Objeto del cuadro de información asociado a la parada
 * @param {Int} viewCont Contador del número de líneas o acciones del usuario están solicitando ver esta parada
 */
var paradas = [];

/**
 * Función de puesta en marcha cuando finaliza la carga del DOM
 */
$(document).ready(function(){
	$("#control").html(ControlRUTPAM($("<div>"))); // Rellenamos el div del panel de control con lo que devuelve ControlRUTPAM()
	verCopyright(); // Mostramos el "Acerca de RUTPAM"
	initMap(); // Inicializamos el mapa y todo el layout
	document.title = "RUTPAM "+rutpam.version; // Seteamos el título del documento
	initKeys(); // Inicializamos las teclas de control
	getModos(); // Cargamos los modos de transporte
	getZonas(); // Cargamos las zonas
	getLineasEmt(); // Cargamos las líneas de la EMT
	getLineasCtan(); // Cargamos las líneas del CTAN
	inicializarParadas(); // Inicializamos los marcadores de las paradas
});

/**
 * @description Puesta en marcha del mapa y los elementos que se le superponen
 * @returns {null}
 */
function initMap() {
	let osmUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'; // URL del servidor cartográfico
	let osm = new L.TileLayer(osmUrl); // Creamos la capa de cartografía
	rutpam.map = L.map('map', {
		center: [36.7121977, -4.4370495], // Centro del mapa sobre málaga
		zoom: 13, // Nivel de zoom para ver todo el área metropolitana
		closePopupOnClick: false, // Deshabilitamos que los popups se cierren al hacer click en cualquier otro sitio fuera
		layers: osm, // Añadimos la capa de cartografía
		attributionControl: false // Deshabilitamos el footer de copyright porque ya tenemos una ventana para ello
	});
	return null;
}

/**
 * @description Pone en marcha los triggers adecuados para las teclas de control
 * @returns {null}
 */
function initKeys(){
	document.addEventListener('keydown', function(k){
		//console.log(k);
		switch(k.key){
			case "Escape":
				closeInfo();
				break;
			case "Backspace":
				for(var a = 0; a < lineas.length; a++){ // Para todas las líneas
					if(lineas[a].trazadoIda !== null){ // Si está cargado su trazado
						hideTrazado(lineas[a].idLinea, 1);
					}
					if(lineas[a].trazadoVta !== null){
						hideTrazado(lineas[a].idLinea, 2);
					}
				}
				break;
			case "?":
				verAyuda();
				break;
			case "1":
				togglePanelEmt();
				break;
			case "2":
				togglePanelCtan();
				break;
			case "3":
				togglePanelMetro();
				break;
			case "4":
				togglePanelRenfe();
				break;
			default:
				break;
		}
	});
}

/**
 * @description Función asíncrona para refrescar los datos periódicamente
 * @returns {null}
 */
function motor(){
	getBusesEmt(); // Pedimos toda la información actualizada de los buses
	let pos = 0; // Empezamos por el principio
	while(pos < autobuses.length){ // Para todos los autobuses
		let poslinea = findLinea(autobuses[pos].linea); // Extraemos la dirección de la línea en el array
		autobuses[pos].ttl--; // Decrementar TTL
		if(autobuses[pos].ttl <= 0){ // SI su vida útil ha expirado
			console.log("DROP "+autobuses[pos].id); // Registramos que se pierde
			autobuses[pos].marker.remove(); // Quitamos el marcador del mapa
			lineas[poslinea].numVehiculos--; // Decrementamos el número de buses en la línea
			autobuses.splice(pos, 1); // Borramos el objeto del array
		}else if(lineas[poslinea].estado.getBuses === false){ // O SI no estamos haciendo un seguimiento de esa línea
			autobuses[pos].marker.remove(); // Quitamos el marcador del mapa
			pos++; // Avanzamos de posición
		}else if(autobuses[pos].ttl <= rutpam.ttl.old){ // O SI el TTL es bajo y el bus lleva rato sin refrescarse
			autobuses[pos].marker.setIcon(busIconContent(autobuses[pos], 2)); // Cambiamos el icono para que aparezca como no-actualizado
			pos++; // Avanzamos de posición
		}else{ // O Todo está bien
			pos++; // Avanzamos de posición
		}
	}
	for(let a = 0; a < lineas.length; a++){ // Para todas las líneas
		$("#cont"+lineas[a].id).text(lineas[a].numVehiculos); // Actualizamos el indicador de buses en servicio
	}
	return null;
}

/**
 * @description Función para detener el motor
 * @returns {null}
 */
function stop(){
	clearInterval(rutpam.timer);
	$("#pause").prop("disabled", true);
	$("#play").prop("disabled", false);
	$("#refresh").prop("disabled", false);
	return null;
}

/**
 * @description Función para arrancar el motor
 * @returns {null}
 */
function start(){
	rutpam.timer = setInterval(motor, refresh_rate*1000);
	$("#pause").prop("disabled", false);
	$("#play").prop("disabled", true);
	$("#refresh").prop("disabled", true);
	return null;
}

function inicializarParadas(){
	if(rutpam.lineasCargadas < lineas.length || rutpam.lineasCargadas < 80){
		setTimeout(inicializarParadas, 1500);
	}else{
		$("#loader").remove();
		for(let a = 0; a < paradas.length; a++){
			paradas[a].marker = L.marker(paradas[a].posicion, {icon: paradaIconContent(paradas[a].codPar)});
			paradas[a].popup = L.popup({autoPan: false, autoClose: false}).setContent(paradaPopupContent(paradas[a].id));
			paradas[a].marker.bindPopup(paradas[a].popup);
		}
		rutpam.paradasInicializadas = true;
	}
}

function verInfoLinea(id){
	let linea = lineas[findLinea(id)];
	$("#ventana").hide(); // Escondemos la ventana
	$("#infoContent").empty(); // Eliminamos contenido anterior
	//
	// Header
	//
	$("#infoContent").append($("<h3>", {text: "Línea "+linea.userCod}).css("text-align", "center")); // Título de la ventana
	$("#infoContent").append($("<h4>", {text: linea.nombre}).css("text-align", "center")); // Subtítulo (nombre línea)
	//
	// Botones
	//
	let botones = $("<p>");
	if(linea.paradasIda.length > 0){ // SI tenemos almacenadas paradas de la línea
		botones.append(generarBotonToggleParadas(id)); // Botón para activar/desactivar las paradas sobre el mapa
	}
	$("#infoContent").append(botones); // Añadimos la botonera
	let datos = $("<div>");
	//
	// Datos de línea
	//
	let datosLinea = $("<table>");
	datosLinea.append($("<tr>").append($("<th>", {text: "Id. interno"})).append($("<td>", {text: linea.id})));
	datosLinea.append($("<tr>").append($("<th>", {text: "Operador"})).append($("<td>", {text: linea.operadores})));
	if(linea.numVehiculos !== null){
		datosLinea.append($("<tr>").append($("<th>", {text: "Num. Coches"})).append($("<td>", {text: linea.numVehiculos})));
	}
	datos.append($("<p>", {class: "inline-block"}).append(datosLinea));
	//
	// Datos longitud
	//
	let distanciaIda =0, distanciaVuelta = 0, tiempoIda = 0,tiempoVuelta = 0; // Creamos variables para los datos numéricos
	let datosTrazado = $("<table>"); // Tabla para los datos numéricos del trazado
	if(linea.estado.getIda){ // SI se ha cargado el trazado de ida
		distanciaIda = Math.floor(distanciaTrazado(linea.trazadoIda)); // Calcular la distancia de la ruta
		tiempoIda = Math.floor(distanciaIda/1000/13.5*60); // Estimar el tiempo de viaje
		if(/^EMT-/.test(id)){
			datosTrazado.append($("<tr>").append($("<td>")).append($("<th>", {text: "Longitud"})).append($("<th>", {text: "Tiempo de viaje (estimado)"}))); // Cabecera de la tabla para los datos numéricos del trazado
			datosTrazado.append($("<tr>").append($("<th>", {text: "Ida"})).append($("<td>", {text: distanciaIda+" m"})).append($("<td>", {text: tiempoIda+" min"}))); // Añadimos los datos de la ida
		}else{
			datosTrazado.append($("<tr>").append($("<td>")).append($("<th>", {text: "Longitud"}))); // Cabecera de la tabla para los datos numéricos del trazado
			datosTrazado.append($("<tr>").append($("<th>", {text: "Ida"})).append($("<td>", {text: distanciaIda+" m"}))); // Añadimos los datos de la ida
		}
	}
	if(linea.getVta){ // SI se ha cargado el trazado de vuelta (también se ha cargado el de ida)
		distanciaVuelta = Math.floor(distanciaTrazado(linea.trazadoVta)); // Calcular la distancia de la ruta
		tiempoVuelta = Math.floor(distanciaVuelta/1000/13.5*60); // Estimar el tiempo de viaje
		if(/^EMT-/.test(id)){
			datosTrazado.append($("<tr>").append($("<th>", {text: "Vuelta"})).append($("<td>", {text: distanciaVuelta+" m"})).append($("<td>", {text: tiempoVuelta+" min"}))); // Añadimos los datos de la vuelta
		}else{
			datosTrazado.append($("<tr>").append($("<th>", {text: "Vuelta"})).append($("<td>", {text: distanciaVuelta+" m"}))); // Añadimos los datos de la vuelta
		}
	}
	datos.append($("<p>", {class: "inline-block"}).append(datosTrazado)); // Añadimos la tabla a la ventana
	//
	// Datos frecuencia y espaciado de coches
	//
	if(linea.numVehiculos > 0 && linea.estado.getIda){ // SI hay buses en la línea Y se ha cargado su trazado
		let distanciaTotal = distanciaIda + distanciaVuelta; // Calculamos la distancia ida+vuelta
		let distanciaEntreBuses = distanciaTotal/linea.numBuses; // Calculamos la media de distancia entre buses en servicio
		let frecuenciaTeorica = distanciaEntreBuses/1000/13.5*60; // Estimamos la frecuencia media teórica
		let datosPaso = $("<table>"); // Creamos la tabla para estos datos
		datosPaso.append($("<tr>").append($("<th>", {text: "Frecuencia media teórica estimada"})).append($("<td>", {text: Math.floor(frecuenciaTeorica*100)/100+" min"}))); // Incluimos la frecuencia media teórica
		datosPaso.append($("<tr>").append($("<th>", {text: "Distancia media entre coches"})).append($("<td>", {text: Math.floor(distanciaEntreBuses*100)/100+" m"}))); // Incluimos la distancia entre buses
		datos.append($("<p>", {class: "inline-block"}).append(datosPaso)); // Añadimos lz tabla a la ventana
	}
	$("#infoContent").append(datos);
	//
	// Paradas
	//
	if(linea.paradasIda.length > 0){
		$("#infoContent").append($("<p>").append(generarTablaParadas(linea)));
	}
	$("#ventana").show();
	return null;
}

function generarBotonToggleParadas(idLinea){
	let botonParadas = $("<button>", {
		"type": "button",
		"class": "boton"
	});
	$(botonParadas).text("Mostrar/Ocultar paradas");
	if(rutpam.paradasInicializadas){// SI las paradas estan inicializadas
		if(lineas[findLinea(idLinea)].estado.verParadas === true){ // SI estamos mostrando las paradas de esta línea
			$(botonParadas).css("background-color", rutpam.colores.especial); // Poner el botón en on
		}
		$(botonParadas).on("click", function(){
			let linea = lineas[findLinea(idLinea)]; // Sacamos la línea para trabajar con ella
			if(linea.estado.verParadas === true){ // SI estamos mostrando las paradas de esta línea
				for(let a = 0; a < linea.paradasIda.length; a++){ // Ocultar todas las paradas a la ida
					hideParada(linea.paradasIda[a].id);
				}
				for(let a = 0; a < linea.paradasVta.length; a++){ // Ocultar todas las paradas a al vuelta
					hideParada(linea.paradasVta[a].id);
				}
				$(this).css("background-color", "white"); // Ponemos el botón en off
				linea.estado.verParadas = false; // Setear que NO se están mostrando las paradas
			}else if(linea.estado.verParadas === false){ // SI NO estamos mostrando las paradas de esta línea
				for(let a = 0; a < linea.paradasIda.length; a++){ // Mostrar todas las paradas a la ida
					showParada(linea.paradasIda[a].id);
				}
				for(let a = 0; a < linea.paradasVta.length; a++){ // Mostrar todas las paradas a la vuelta
					showParada(linea.paradasVta[a].id);
				}
				$(this).css("background-color", rutpam.colores.especial); // Ponemos el botón en on
				linea.verParadas = true; // Setear que se están mostrando las paradas
			}
		});
	}else{ // SI NO están inicializadas las paradas
		$(botonParadas).prop("disabled", true);
	}
	return botonParadas;
}

function generarTablaParadas(linea){
	let tabla = $("<table>"); // Creamos la tabla de paradas
	let cabecera = $("<tr>"); // Creamos una cabecera
	if(linea.tieneVuelta){ // SI la línea es de ida y vuelta
		cabecera.append($("<th>", {text: "Sentido"}).prop("colspan", 3).append($("<br>")).append(linea.cabeceraVta)); // Columna sentido ida
		cabecera.append($("<th>", {text: "Sentido"}).prop("colspan", 3).append($("<br>")).append(linea.cabeceraIda)); // Columna sentido vuelta
	}else{ // ELSE la línea es circular
		cabecera.append($("<th>", {text: "Sentido"}).prop("colspan", 3).append($("<br>")).append(linea.cabeceraIda)); // Columna sentido único
	}
	tabla.append(cabecera); // Añadimos la cabecera a la tabla
	for(let a = 0; a < Math.max(linea.paradasIda.length, linea.paradasVta.length); a++){ // PARA el máximo de paradas entre ida y vuelta
		let fila = $("<tr>"); // Creamos una fila
		if(a < linea.paradasIda.length){
			let codPar = linea.paradasIda[a].codPar;
			fila = generarFilaParada(fila, codPar, linea.idLinea);
		}else /*if(a === linea.paradasIda.length && linea.tieneVuelta){
			var codPar = linea.paradasVta[0].codPar;
			fila = generarFilaParada(fila, codPar, linea.idLinea);
		}else if(linea.tieneVuelta)*/{
			fila = generarFilaParada(fila);
		}
		if(linea.tieneVuelta){
			if(a < linea.paradasVta.length){
				let codPar = linea.paradasVta[a].codPar;
				fila = generarFilaParada(fila, codPar, linea.idLinea);
			}else /*if(a === linea.paradasVta.length && linea.tieneVuelta){
				var codPar = linea.paradasIda[0].codPar;
				fila = generarFilaParada(fila, codPar, linea.idLinea);
			}else*/{
				fila = generarFilaParada(fila);
			}
		}
		tabla.append(fila); // Añadimos la fila
	}
	return tabla;
}

function generarFilaParada(div, codPar, idLinea){
	if(codPar !== undefined && codPar !== null){
		let nombre = paradas[findParada(codPar)].nombreParada;
		div.append($("<td>").append($("<a>", {text: codPar, href: "#!"}).click(function(){verInfoParada(codPar);})));
		div.append($("<td>", {html: acortarParada(nombre)}));
		div.append(extrarCorrespondencias($("<td>"),codPar, idLinea));
	}else{
		div.append($("<td>")).append($("<td>")).append($("<td>"));
	}
	return div;
}

function verInfoParada(id){
	let parada = paradas[findParada(id)];
	$("#ventana").hide();
	$("#infoContent").empty();
	$("#infoContent").append($("<h3>", {text: "Parada "+parada.codPar}).css("text-align", "center"));
	$("#infoContent").append($("<h4>", {text: parada.nombreParada}).css("text-align", "center"));
	if(parada.direccion !== null){
		$("#infoContent").append($("<p>", {text: "Dirección: "+parada.direccion}));
	}
	let tabla = $("<table>");
	let cabecera = $("<tr>");
	cabecera.append($("<th>", {text: "Servicios"}).prop("colspan", /*3*/2));
	tabla.append(cabecera);
	for(let a = 0; a < parada.servicios.length; a++){
		let linea = lineas[findLinea(parada.servicios[a].idLinea)];
		let sentido;
		switch (parada.servicios[a].sentido){
			case 1:
				sentido = linea.cabeceraVta;
				break;
			case 2:
				sentido = linea.cabeceraIda;
				break;
			default:
				sentido = "-";
				break;
		}
		let fila = $("<tr>");
		fila.append($("<td>", {html: lineaIcon(linea.userCodLinea, "3x", linea.idLinea)}));
		fila.append($("<td>", {text: sentido}));
		//fila.append($("<td>", {text: "??? min."}).css("text-align", "right"));
		tabla.append(fila);
	}
	$("#infoContent").append(tabla);
	$("#ventana").show();

	return null;
}

function enableBusUpdate(idLinea){
	lineas[findLinea(idLinea)].getBuses = true;
	$("#botonBus"+idLinea).prop("checked", true);
	$("#botonBus"+idLinea).unbind("click");
	$("#botonBus"+idLinea).click(function(){
		disableBusUpdate(idLinea);
	});
}

function disableBusUpdate(idLinea){
	lineas[findLinea(idLinea)].getBuses = false;
	$("#botonBus"+idLinea).prop("checked", false);
	$("#botonBus"+idLinea).unbind("click");
	$("#botonBus"+idLinea).click(function(){
		enableBusUpdate(idLinea);
	});
}

/**
 * Al ser llamada, añade al mapa el trazado de la línea indicada y prepara el botón para realizar la acción contraria cuando vuelva a ser llamado
 * @param {Number} idLinea
 * @param {Number} sentido
 */
function showTrazado(idLinea, sentido){
	if(sentido === 1){
		lineas[findLinea(idLinea)].trazadoIda.addTo(rutpam.map);
	}else if(sentido === 2){
		lineas[findLinea(idLinea)].trazadoVta.addTo(rutpam.map);
	}
}

/**
 * Al ser llamada, borra del mapa el trazado de la línea indicada y prepara el botón para realizar la acción contraria cuando vuelva a ser llamado
 * @param {Number} idLinea
 * @param {Number} sentido
 */
function hideTrazado(idLinea, sentido){
	if(sentido === 1){
		lineas[findLinea(idLinea)].trazadoIda.remove();
		$("#botonIda"+idLinea).prop("checked", false);
	}else if(sentido === 2){
		lineas[findLinea(idLinea)].trazadoVta.remove();
		$("#botonVta"+idLinea).prop("checked", false);
	}
}

function showParada(codParada){
	let parada = paradas[findParada(codParada)];
	if(parada.viewCont++ === 0){ // SI nadie ha puesto antes el marcador (y lo incrementamos)
		parada.marker.addTo(rutpam.map); // Añadimos el marcador al mapa
	}
}

function hideParada(codParada){
	let parada = paradas[findParada(codParada)];
	if(--parada.viewCont === 0){ // (Reducimos contador) | SI nadie ha puesto antes el marcador... lo quitamos
		parada.marker.remove(); // Quitamos el marcador del mapa
	}
}

/**
 * Busca la posición de una línea dentro de lineas[]
 * @param {Number} idLinea
 * @returns {Number} Posición en lineas[]
 */
function findLinea(idLinea){
	let pos = 0;
	let found = false;
	while(pos < lineas.length && !found){
		if(lineas[pos].idLinea === idLinea){
			found = true;
		}else{
			pos++;
		}
	}
	if(pos >= lineas.length){
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
	let pos = 0;
	let found = false;
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

/**
 * Busca la posición de ua parada dentro de paradas[]
 * @param {Number} codPar
 * @returns {Number} Posición en paradas[]
 */
function findParada(codPar){
	let pos = 0;
	let found = false;
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

function findModo(idModo){
	let pos = 0;
	let found = false;
	while(pos < modos.length && !found){
		if(modos[pos].idModo === idModo){
			found = true;
		}else{
			pos++;
		}
	}
	if(pos >= modos.length){
		return null;
	}else{
		return pos;
	}
}

/**
 * @description Calcula la distancia total de un trazado indicado
 * @param {linea.trazado} trazado
 * @returns {Float}
 */
function distanciaTrazado(trazado){
	let total = 0;
	if(trazado !== null){
		for(let pos = 1; pos < trazado.getLatLngs().length; pos++){
			total = total + rutpam.map.distance(trazado.getLatLngs()[pos-1], trazado.getLatLngs()[pos]);
		}
	}
	return total;
}

function extrarCorrespondencias(div, codPar, idLinea){
	$(div).css("max-width", "73px");
	let parada = paradas[findParada(codPar)];
	for(let a = 0; a < parada.servicios.length; a++){
		let servicio = parada.servicios[a].idLinea;
		if(servicio !== idLinea){
			if(a === 0){
				let linea = lineas[findLinea(servicio)];
				let spanIcon = lineaIcon(linea.userCodLinea, "2x", linea.idLinea);
				$(div).append(spanIcon);
			}else if(servicio !== parada.servicios[a-1].idLinea){
				let linea = lineas[findLinea(servicio)];
				let spanIcon = lineaIcon(linea.userCodLinea, "2x", linea.idLinea);
				$(div).append(spanIcon);
			}
		}
	}
	return div;
}

function acortarParada(nombre){
	return nombre.replace(/\s-\s/, "<br>");
}

function lineaIcon(userCodLinea, zoom, idLinea){
	let id = $('<span>').addClass('fa-layers fa-'+zoom);
	let esNegro = false;
	if(/^C[1-9]$|^29$/.test(userCodLinea)){ // Circulares EMT
		id.append($('<i>').addClass('fas fa-circle').css("color", rutpam.colores.emtC));
	}else if(/^N[1-9]/.test(userCodLinea)){ // Nocturno EMT
		id.append($('<i>').addClass('fas fa-circle').css("color", rutpam.colores.emtN));
	}else if(/^A$|^E$/.test(userCodLinea)){ // Lineas exprés
		id.append($('<i>').addClass('fas fa-circle').css("color", rutpam.colores.express));
	}else if(/^L$|^P$/.test(userCodLinea)){ // Lineas Lanzaderas
		id.append($('<i>').addClass('fas fa-circle').css("color", rutpam.colores.lanzaderas));
	}else if(/N[1-9]$|^M-168$|^M-155$|^M-168$/.test(userCodLinea)){ // Líneas Buho CTAN
		id.append($('<i>').addClass('fas fa-circle').css("color", rutpam.colores.ctmamN));
	}else if(/^M-5[0-9]{2}$/.test(userCodLinea)){ // Líneas Verano CTAN
		id.append($('<i>').addClass('fas fa-circle').css("color", rutpam.colores.ctmamT));
	}else if(/^M-114$|^M-116$|^M-143$|^M-166$/.test(userCodLinea)){ // Líneas Universitarias CTAN
		id.append($('<i>').addClass('fas fa-circle').css("color", rutpam.colores.ctmamT));
		esNegro = true;
	}else if(/^R-|^T-|^M-10[1-4]$/.test(userCodLinea)){ // Líneas Urbanas CTAN
		id.append($('<i>').addClass('fas fa-circle').css("color", rutpam.colores.emtA));
	}else if(/^M-/.test(userCodLinea)){ // Líneas Interurbanas CTAN
		id.append($('<i>').addClass('fas fa-circle').css("color", rutpam.colores.ctmamA));
	}else if(/^91$|^92$/.test(userCodLinea)){ // Servicios Turísticos
		id.append($('<i>').addClass('fas fa-circle').css("color", rutpam.colores.especial));
		esNegro = true;
	}else if(/^METRO-[1-2]$/.test(userCodLinea)){ // Metro
		id.append($('<i>').addClass('fas fa-circle').css("color", rutpam.colores.metro));
	}else if(/^C-[1-2]$/.test(userCodLinea)){ // Cercanías
		id.append($('<i>').addClass('fas fa-circle').css("color", rutpam.colores.renfeA));
	}else if(/^12$|^16$|^26$|^64$|^[A-Z]/.test(userCodLinea)){ // Servicios Especiales
		id.append($('<i>').addClass('fas fa-circle').css("color", rutpam.colores.especial));
		esNegro = true;
	}else{ // Líneas Urbanas EMT
		id.append($('<i>').addClass('fas fa-circle').css("color", rutpam.colores.emtA));
	}

	let texto = userCodLinea.replace(/^M-/, "M\n").replace(/^R-/, "R").replace(/^T-/, "T").replace(/^METRO-/, "").replace(/^C-/, "C");
	let textdiv;
	if(texto.length < 3){
		textdiv = $('<span>').addClass("fa-layers-text fa-inverse").text(texto).attr("data-fa-transform", "shrink-6");
	}else if(texto.length < 5){
		textdiv = $('<span>').addClass("fa-layers-text fa-inverse").text(texto).attr("data-fa-transform", "shrink-8");
	}else if(texto.length < 6){
		textdiv = $('<span>').addClass("fa-layers-text fa-inverse").text(texto).attr("data-fa-transform", "shrink-10");
	}else if(texto.length < 7){
		textdiv = $('<span>').addClass("fa-layers-text fa-inverse").text(texto).attr("data-fa-transform", "shrink-11");
	}else{
		textdiv = $('<span>').addClass("fa-layers-text fa-inverse").text(texto).attr("data-fa-transform", "shrink-12");
	}
	if(esNegro){
		textdiv.css("color", "black");
	}
	id.append(textdiv);
	if(idLinea !== undefined && idLinea !== null){
		id.click(function(){verInfoLinea(idLinea);});
	}
	return id;
}

/**
 * Devuelve el contenido HTML de una ventana de información adicional de autobús
 * @param {Bus} Bus
 * @returns {String}
 */
function busPopupContent(Bus){
	let linea = lineas[findLinea(Bus.idLinea)];
	let sentido;
	switch(Bus.sentido){
		case 1: // Ida
			sentido = linea.cabeceraVta;
			break;
		case 2: // Vuelta
			sentido = linea.cabeceraIda;
			break;
		default:
			sentido = "¿? Desconocido ("+Bus.sentido+") ¿?";
	}
	let parada = paradas[findParada(Bus.codParIni)];
	if(parada !== undefined){
		parada = "Ult. Par. Realizada: <b>"+Bus.codParIni+"<br>"+parada.nombreParada+"</b>";
	}else{
		parada = "Ult. Par. Realizada: <b>"+Bus.codParIni+"</b>";
	}
	return "Bus: <b>"+Bus.codBus+"</b>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbspLínea: <b>"+linea.userCodLinea+"</b><br>"+
	parada+"<br>"+
	"Sentido: <b>"+sentido+"</b><br>"+
	"<a href='http://buscabus.tk/bus/?bus="+Bus.codBus+"' target='_blank'>Ver en BuscaBus</a>";
}

function paradaPopupContent(id){
	let div = $("<div>");
	let parada = paradas[findParada(id)];
	$(div).append($("<h3>", {text: "Parada "+parada.codPar}).css("text-align", "center"));
	$(div).append($("<h4>", {text: parada.nombreParada}).css("text-align", "center"));
	let tabla = $("<table>");
	/*var cabecera = $("<tr>");
	$(cabecera).append($("<th>", {text: "Servicios"}).prop("colspan", /*3 2));
	$(tabla).append(cabecera);*/
	for(let a = 0; a < parada.servicios.length; a++){
		let linea = lineas[findLinea(parada.servicios[a].idLinea)];
		let sentido;
		switch (parada.servicios[a].sentido){
			case 1:
				sentido = linea.cabeceraVta;
				break;
			case 2:
				sentido = linea.cabeceraIda;
				break;
			default:
				sentido = "-";
				break;
		}
		let fila = $("<tr>");
		$(fila).append($("<td>", {html: lineaIcon(linea.userCodLinea, "2x", linea.idLinea)}));
		$(fila).append($("<td>", {text: sentido}));
		//fila.append($("<td>", {text: "??? min."}).css("text-align", "right"));
		$(tabla).append(fila);
	}
	$(div).append(tabla);
	return $(div).html();
}

function busIconContent(Bus, estado){
	let linea = lineas[findLinea(Bus.idLinea)];
	let html = linea.userCodLinea+"<br>"+Bus.codBus;
	let clase;
	switch (Bus.sentido){
		case 1:
			clase = 'marker ida';
			break;
		case 2:
			if(linea.tieneVuelta){
				clase = 'marker vta';
			}else{
				clase = 'marker ida';
			}
			break;
		default:
			clase = 'marker desconocido';
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
		iconSize: [32, 30],
		iconAnchor: [0, 0],
		popupAnchor: [16, 0],
		html: html
	});
}

function paradaIconContent(codPar){
	if(/^CTAN-/.test(codPar)){
		return L.divIcon({
			className: 'marker paradaC',
			iconSize: [36, 15],
			iconAnchor: [60, 10],
			popupAnchor: [-42, -10],
			html: codPar.replace(/^CTAN-/, "")
		});
	}else{
		return L.divIcon({
			className: 'marker paradaE',
			iconSize: [36, 15],
			iconAnchor: [18, 7],
			popupAnchor: [0, -7],
			html: codPar.replace(/^EMT-/, "")
		});
	}
}

function togglePanelEmt(){
	if(rutpam.ui.show.emt){
		$("#tablaLineasEMT").css("display", "none");
		$("#verEMT").css("color", "black").css("background-color", "white");
		rutpam.ui.show.emt = false;
	}else{
		$("#tablaLineasEMT").css("display", "block");
		$("#verEMT").css("color", "white").css("background-color", rutpam.colores.emtA);
		rutpam.ui.show.emt = true;
	}
}

function togglePanelCtan(){
	if(rutpam.ui.show.ctan){
		$("#tablaLineasCTAN").css("display", "none");
		$("#verCTAN").css("color", "black").css("background-color", "white");
		rutpam.ui.show.ctan = false;
	}else{
		$("#tablaLineasCTAN").css("display", "block");
		$("#verCTAN").css("color", "white").css("background-color", rutpam.colores.ctmamA);
		rutpam.ui.show.ctan = true;
	}
}

function togglePanelMetro(){
	if(rutpam.ui.show.metro){
		$("#tablaLineasMetro").css("display", "none");
		$("#verMetro").css("color", "black").css("background-color", "white");
		rutpam.ui.show.metro = false;
	}else{
		$("#tablaLineasMetro").css("display", "block");
		$("#verMetro").css("color", "white").css("background-color", rutpam.colores.metro);
		rutpam.ui.show.metro = true;
	}
}

function togglePanelRenfe(){
	if(rutpam.ui.show.renfe){
		$("#tablaLineasRenfe").css("display", "none");
		$("#verRenfe").css("color", "black").css("background-color", "white");
		rutpam.ui.show.renfe = false;
	}else{
		$("#tablaLineasRenfe").css("display", "block");
		$("#verRenfe").css("color", "white").css("background-color", rutpam.colores.renfeA);
		rutpam.ui.show.renfe = true;
	}
}

/**
 * @description Recoge un elemento del DOM y lo devuelve rellenado con el HTML adecuado de la barra de control
 * @param {DOM_Element} mapDiv
 * @returns {DOM_Element}
 */
function ControlRUTPAM(mapDiv){
	let titulo = $("<h2>", {"text":"RUTPAM"});
	let descripcion = $("<p>", {"text":"Información de transportes metropolitanos del área de Málaga"});
	let loader = $("<p>", {"id": "loader", "text": "Todavía cargando datos..."}).css("color", "white").css("background-color", "red");
	$(mapDiv).append(titulo).append(descripcion).append(loader);
	let botonEMT = $("<button>", {
		"id": "verEMT",
		"type": "button",
		"class": "boton",
		"text": "Red EMT"
	}).on("click", togglePanelEmt);
	let botonCTAN = $("<button>", {
		"id": "verCTAN",
		"type": "button",
		"class": "boton",
		"text": "Red CTMAM"
	}).on("click", togglePanelCtan);
	let botonRenfe = $("<button>", {
		"id": "verRenfe",
		"type": "button",
		"class": "boton",
		"text": "RENFE"
	}).on("click", togglePanelRenfe);
	let botonMetro = $("<button>", {
		"id": "verMetro",
		"type": "button",
		"class": "boton",
		"text": "Red Metro"
	}).on("click", togglePanelMetro);
	let play = $("<button>", {
		"id": "play",
		"type": "button",
		"class": "boton",
		"text": "Play"
	}).on("click", start).css("display", "none");
	let refresh = $("<button>", {
		"id": "refresh",
		"type": "button",
		"class": "boton",
		"text": "Refrescar"
	}).on("click", motor).css("display", "none");
	let pause = $("<button>", {
		"id": "pause",
		"type": "button",
		"class": "boton",
		"text": "Pausa"
	}).on("click", stop).css("display", "none");
	let controles = $("<p>", {id: "controles"}).append(botonEMT).append(botonCTAN).append(botonMetro).append(botonRenfe).append($("<br>")).append(play).append(refresh).append(pause);
	$(mapDiv).append(controles);
	/*var tiempoDatos = $("<p>", {id: "tiempoDatos", text: "Datos actualizados: "});
	$(mapDiv).append(tiempoDatos);*/
	let tablaEmt = $("<table>", {"id": "tablaLineasEMT"}).css("display", "none");
	let encabezadoEmt = $("<tr>");
	$(encabezadoEmt).html('<th>Ida</th><th>Vta</th><th>Bus</th><th colspan="2">Línea</th><th>NºB.</th>');
	$(tablaEmt).append(encabezadoEmt);
	$(mapDiv).append(tablaEmt);
	let tablaCtan = $("<table>", {"id": "tablaLineasCTAN"}).css("display", "none");
	let encabezadoCtan = $("<tr>");
	$(encabezadoCtan).html('<th>Ida</th><th>Vta</th><th colspan="2">Línea</th>');
	$(tablaCtan).append(encabezadoCtan);
	$(mapDiv).append(tablaCtan);
	let tablaMetro = $("<table>", {"id": "tablaLineasMetro"}).css("display", "none");
	let encabezadoMetro = $("<tr>");
	$(encabezadoMetro).html('<th></th><th colspan="2">Línea</th>');
	$(tablaMetro).append(encabezadoMetro);
	$(mapDiv).append(tablaMetro);
	let tablaRenfe = $("<table>", {"id": "tablaLineasRenfe"}).css("display", "none");
	let encabezadoRenfe = $("<tr>");
	$(encabezadoRenfe).html('<th></th><th colspan="2">Línea</th>');
	$(tablaRenfe).append(encabezadoRenfe);
	$(mapDiv).append(tablaRenfe);
	$(mapDiv).append('<br><small><a href="#!" onclick="verCopyright()">Acerca de RUTPAM</a></small>');
	$(mapDiv).append('<br><small><a href="#!" onclick="verAyuda()">Ayuda</a></small>');
	return mapDiv;
}

function verCopyright(){
	let rutpam_credits = 'R.U.T.P.A.M. v'+rutpam.version+'<br>\n\
	Licencia MIT © Néstor M. Lora - 2018/2019<br>\n\
	<a href="mailto:nestorlora@geeklab.es">nestorlora@geeklab.es</a><br><br>\n\
	Datos cartográficos: <i class="fab fa-creative-commons"></i><i class="fab fa-creative-commons-by"></i><i class="fab fa-creative-commons-sa"></i> Colaboradores de <a href="https://openstreetmap.org">OpenStreetMap</a><br>\n\
	<i class="fab fa-creative-commons"></i><i class="fab fa-creative-commons-by"></i></i><i class="fab fa-creative-commons-sa"></i> Datos Abiertos del Ayuntamiento de Málaga<br>\n\
	Datos Abiertos de la Red de Consorcios de Transporte de Andalucía<br>\n\
	<br>\n\
	Construido con <i title="HTML 5" class="fab fa-html5 fa-2x fa-fw" style="color: orangered"></i> \n\
	<i title="CSS 3" class="fab fa-css3-alt fa-2x fa-fw" style="color: dodgerblue"></i> \n\
	<span title="JavaScript" class="fa-2x fa-layers fa-fw">\n\
	<i class="fas fa-square" style="color: black"></i>\n\
	<i class="fab fa-js" style="color: yellow"></i>\n\
	</span>\n\
	jQuery <a href="http://leafletjs.com" title="A JS library for interactive maps">Leaflet</a> \n\
	<i title="Font Awesome" class="fab fa-font-awesome fa-2x fa-fw" style="color: dodgerblue"></i><br>\n\
	Consulta el repositorio en <a href="https://github.com/nestorlora/RUTPAM">Github<i class="fab fa-github fa-fw" style="color: indigo"></i></a>';
	$("#ventana").hide();
	$("#infoContent").empty();
	$("#infoContent").append($("<h3>", {text: "Información"}).css("text-align", "center"));
	$("#infoContent").append($("<p>", {html: rutpam_credits}).css("text-align", "center"));
	$("#ventana").show();
}

function verAyuda(){
	let ayuda = '<h4>Controles</h4>\n\
	<p>\n\
		<table>\n\
			<tbody>\n\
				<tr><th colspan="2">Mapa</th></tr>\n\
				<tr><td>-</td><td>Reducir Zoom</td></tr>\n\
				<tr><td>+</td><td>Aumentar Zoom</td></tr>\n\
				<tr><th colspan="2">Ventanas</th></tr>\n\
				<tr><td>Esc</td><td>Cierra todas las ventanas</td></tr>\n\
				<tr><td>?</td><td>Muestra la ventana de ayuda</td></tr>\n\
				<tr><th colspan="2">Redes</th></tr>\n\
				<tr><td>1</td><td>Muestra/oculta Red EMT</td></tr>\n\
				<tr><td>2</td><td>Muestra/oculta Red CTMAM</td></tr>\n\
				<tr><td>3</td><td>Muestra/oculta Red Metro</td></tr>\n\
				<tr><td>4</td><td>Muestra/oculta RENFE</td></tr>\n\
			</tbody>\n\
		</table>\n\
	</p>\n\
	<h4>Leyenda de colores</h4>\n\
	<p>Cada línea de autobús muestra un color en el disco con su código</p>\n\
	<h5>Líneas Urbanas</h5>\n\
	<p>\n\
	<span class="fa-layers fa-2x"><i class="fas fa-circle" style="color:'+rutpam.colores.emtA+'"></i></span> Líneas convencionales<br>\n\
	<span class="fa-layers fa-2x"><i class="fas fa-circle" style="color:'+rutpam.colores.emtC+'"></i></span> Líneas circulares EMT<br>\n\
	<span class="fa-layers fa-2x"><i class="fas fa-circle" style="color:'+rutpam.colores.emtN+'"></i></span> Líneas nocturnas<br>\n\
	</p>\n\
	<h5>Líneas Interurbanas</h5>\n\
	<p>\n\
	<span class="fa-layers fa-2x"><i class="fas fa-circle" style="color:'+rutpam.colores.ctmamA+'"></i></span> Líneas convencionales<br>\n\
	<span class="fa-layers fa-2x"><i class="fas fa-circle" style="color:'+rutpam.colores.ctmamN+'"></i></span> Líneas búho<br>\n\
	<span class="fa-layers fa-2x"><i class="fas fa-circle" style="color:'+rutpam.colores.ctmamT+'"></i></span> Líneas estacionales<br>\n\
	</p>\n\
	<h5>Líneas Especiales</h5>\n\
	<p>\n\
	<span class="fa-layers fa-2x"><i class="fas fa-circle" style="color:'+rutpam.colores.especial+'"></i></span> Líneas especiales/Servicios especiales<br>\n\
	<span class="fa-layers fa-2x"><i class="fas fa-circle" style="color:'+rutpam.colores.express+'"></i></span> Líneas express<br>\n\
	<span class="fa-layers fa-2x"><i class="fas fa-circle" style="color:'+rutpam.colores.lanzaderas+'"></i></span> Líneas lanzadera<br>\n\
	</p>\n\
	<h5>Líneas de Metro/Ferrocarril</h5>\n\
	<p>\n\
	<span class="fa-layers fa-2x"><i class="fas fa-circle" style="color:'+rutpam.colores.renfeA+'"></i></span> Renfe  Cercanías/Regional/Media Distancia<br>\n\
	<span class="fa-layers fa-2x"><i class="fas fa-circle" style="color:'+rutpam.colores.metro+'"></i></span> Metro Málaga<br>\n\
	</p>\n\
	<h4>Información de líneas</h4>\n\
	<p>Las paradas pertenecen o bien a la EMT o bien al consorcio por lo que aparecen como EMT-XXXX o CTAN-XXXX y EXXXX o CXXXX en las versiones cortas</p>\n\
	<p>En proceso...</p>\n\
	<h4>Información de paradas</h4>\n\
	<p>En proceso...</p>\n\
	<h4>Información de vehículos</h4>\n\
	<p>Los marcadores de cada vehículo muestran su código, la línea que están sirviendo, el destino y, si es posible, la última parada realizada. En los vehículos de la EMT también hay un enlace a Busca Bus para consultar la información relativa al vehículo<br>\n\
	Bus, Línea, Última Parada Realizada, Sentido, link a BuscaBus</p>';
	$("#ventana").hide();
	$("#infoContent").empty();
	$("#infoContent").append($("<h3>", {text: "Ayuda"}).css("text-align", "center"));
	$("#infoContent").append($("<div>", {html: ayuda}));
	$("#ventana").show();
}

function closeInfo(){
	$("#ventana").hide();
}










// EMT.JS










/**
 * @description Función que llama a la API para cargar las líneas. Cambia algunos elementos para preparar la interfaz.
 * @returns {null}
 */
function getLineasEmt(){
	//$("#getLineas").remove(); // Eliminamos el botón para pedir las líneas
	// Petición AJAX
	$.getJSON({
		url: rutpam.url.emt+'/services/lineas/'
	}).done(function (response, status){
		if(status === "success"){
			for(let i = 0; i<response.length; i++){
				addLineaEmt(response[i]); // Para cada línea de la respuesta la pasamos por addLinea()
				rutpam.lineasCargadas++;
			}
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
 * @param {Int} idLinea
 * @returns {null}
 */
function getTrazadosEmt(idLinea){
	// Cambiamos el estado a deshabilitado a la espera de recibir los datos
	$("#botonIda"+idLinea).prop("indeterminate", false).prop("disabled", true).off('click');
	$("#botonVta"+idLinea).prop("indeterminate", false).prop("disabled", true).off('click');
	// Llamada AJAX Ida
	$.getJSON({
		url: rutpam.url.emt+'/services/trazados/?codLinea='+codLinea(idLinea)+'&sentido=1'
	}).done(function (response, status){
		if(status === "success" && response.length > 0){
			let posLinea = findLinea(idLinea); // Almacenamos la posición en lineas[] para uso más cómodo
			let trazado = []; // Creamos un array con los puntos de latitud y longitud del polígono
			for(let a = 0; a < response.length; a++){
				trazado.push({lat: response[a].latitud, lng: response[a].longitud});  // Rellenamos con los datos de la respuesta
			}
			lineas[posLinea].trazadoIda = L.polyline(trazado, {
				color: rutpam.colores.emtA, // Fijamos el color de la ida
				opacity: 1.0, // Opacidad
				weight: 3 // Grosor
			});
			lineas[posLinea].getIda = true;
			$("#botonIda"+idLinea).prop("disabled", false); 
			$("#botonIda"+idLinea).change(function(){
				let isChecked = $(this).is(':checked');
				if(isChecked){
					showTrazado(idLinea, 1); // Mostramos el trazado
				}else{
					hideTrazado(idLinea, 1); // Ocultamos el trazado
				}
			});
			$("#botonIda"+idLinea).trigger("change");
		}
	});
	// Llamada AJAX Vuelta
	$.getJSON({
		url: rutpam.url.emt+'/services/trazados/?codLinea='+codLinea(idLinea)+'&sentido=2'
	}).done(function (response, status){
		if(status === "success" && response.length > 0){
			let posLinea = findLinea(idLinea); // Almacenamos la posición en lineas[] para uso más cómodo
			let trazado = []; // Creamos un array con los puntos de latitud y longitud del polígono
			for(let a = 0; a < response.length; a++){
				trazado.push({lat: response[a].latitud, lng: response[a].longitud}); // Rellenamos con los datos de la respuesta
			}
			lineas[posLinea].trazadoVta = L.polyline(trazado, {
				color: rutpam.colores.emtB, // Fijamos el color de la vuelta
				opacity: 1.0, // Opacidad
				weight: 3 // Grosor
			});
			lineas[posLinea].getVta = true;
			$("#botonVta"+idLinea).prop("disabled", false);
			$("#botonVta"+idLinea).change(function(){
				let isChecked = $(this).is(':checked');
				if(isChecked){
					showTrazado(idLinea, 2); // Mostramos el trazado
				}else{
					hideTrazado(idLinea, 2); // Ocultamos el trazado
				}
			});
			$("#botonVta"+idLinea).trigger("change");
		}		
	});
	return null;
}

/**
 * @deprecated
 * @param {String} idLinea 
 */
function getUbicacionesEmt(idLinea){
	$.getJSON({
		//url: emt_proxy_url+'/services/buses/?codLinea='+codLinea
		url: betteremt_api_url+'/buses/linea/'+codLinea(idLinea)
	}).done(function (response, status){
		if(status === "success"){
			for(let x = 0; x < response.length; x++){
                pos = findBus(response[x].codBus);
                response[x].idLinea = "EMT-"+response[x].codLinea;
				if(pos !== null){
					updateBusEmt(response[x], pos);
				}else{
					addBusEmt(response[x]);
				}
			}
			lineas[findLinea(idLinea)].numBuses = response.length;
			$("#cont"+idLinea).text(response.length);
		}		
	});
};

function getBusesEmt(){
	$.getJSON({
		//url: betteremt_api_url+'/buses/all'
		url: rutpam.url.odm+'datastore_search_sql?sql=SELECT * from "9bc05288-1c11-4eec-8792-d74b679c8fcf" WHERE last_update=(SELECT MAX(last_update) from "9bc05288-1c11-4eec-8792-d74b679c8fcf")'
	}).done(function (response, status){
		if(status === "success"){
			/* Limpieza Open Data Málaga */
			response = response.result.records;
			for(let x = 0; x < response.length; x++){
				response[x].codBus = Number(response[x].codBus);
				response[x].codLinea = Number(response[x].codLinea);
				response[x].codParIni = Number(response[x].codParIni);
				response[x].latitud = Number(response[x].lat);
				response[x].longitud = Number(response[x].lon);
				response[x].sentido = Number(response[x].sentido);
			}
			/* Procesado de ubicaciones con normalidad */
			for(let x = 0; x < response.length; x++){
                let pos = findBus(response[x].codBus);
                response[x].idLinea = "EMT-"+response[x].codLinea;
				 response[x].codParIni = "EMT-"+response[x].codParIni;
				if(pos !== null){
					updateBusEmt(response[x], pos);
				}else{
					addBusEmt(response[x]);
				}
			}
		}		
	});
}

function addBusEmt(Bus){
	console.log("ADDED "+Bus.codBus);
    let coordenadas = {lat: Bus.latitud , lng: Bus.longitud};
	let data = {
		marker: L.marker(coordenadas, {
			icon: busIconContent(Bus, 1)
		}),
		popup: L.popup({autoPan: false, autoClose: false}).setContent(busPopupContent(Bus)),
		codBus: Bus.codBus,
		idLinea: Bus.idLinea,
		sentido: Bus.sentido,
		codParIni: Bus.codParIni,
		latitud: Bus.latitud,
		longitud: Bus.longitud,
		ttl: rutpam.ttl.new
	};
	let pos = autobuses.push(data)-1;
	autobuses[pos].marker.bindPopup(autobuses[pos].popup);
	let poslinea = findLinea(Bus.idLinea);
	if(lineas[poslinea].getBuses){
		autobuses[pos].marker.addTo(rutpam.map);
	}
	lineas[poslinea].numBuses++;
}

function updateBusEmt(Bus, pos){
	let coordenadas = {lat: Bus.latitud , lng: Bus.longitud};
	if(!autobuses[pos].marker.getLatLng().equals(coordenadas)){
		autobuses[pos].marker.setLatLng(coordenadas);
	}
	autobuses[pos].idLinea = Bus.idLinea;
	autobuses[pos].sentido = Bus.sentido;
	autobuses[pos].codParIni = Bus.codParIni;
	autobuses[pos].latitud = Bus.latitud;
	autobuses[pos].longitud = Bus.longitud;
	autobuses[pos].popup.setContent(busPopupContent(Bus));
	if(lineas[findLinea(Bus.idLinea)].getBuses){
		autobuses[pos].marker.addTo(rutpam.map);
	}
	if(autobuses[pos].ttl < rutpam.ttl.default){
		autobuses[pos].ttl = rutpam.ttl.default;
		autobuses[pos].marker.setIcon(busIconContent(autobuses[pos], 0));
	}
}

function addLineaEmt(lin){
	let linea = {
        idLinea: "EMT-"+lin.codLinea,
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
        numBuses: 0,
        modo: "Autobús",
        hayNoticia: null,
        operadores: "Empresa Malagueña de Transportes S.A.M.",
		tieneIda: null,
		tieneVuelta: null
	};
	for(let a = 0; a < lin.paradas.length; a++){
		addParadaEmt(lin.paradas[a].parada, linea.idLinea, lin.paradas[a].sentido);
		if(lin.paradas[a].sentido === 1){
			linea.paradasIda.push({
				codPar: "EMT-"+lin.paradas[a].parada.codParada,
				orden: lin.paradas[a].orden
			});
		}
		if(lin.paradas[a].sentido === 2){
			linea.paradasVta.push({
				codPar: "EMT-"+lin.paradas[a].parada.codParada,
				orden: lin.paradas[a].orden
			});
		}
	}
	if(linea.paradasIda.length > 1){
		linea.tieneIda = true;
	}
	if(linea.paradasVta.length > 1){
		linea.tieneVuelta = true;
	}else{
		linea.cabeceraIda = "Circular";
		linea.cabeceraVta = "Circular";
	}
	// Corrección en paradas
	if(linea.tieneIda){
		let maxIda = linea.paradasIda.length;
		for(let x = 0; x < linea.paradasVta.length; x++){
			linea.paradasVta[x].orden -= maxIda;
		}
		if(linea.tieneVuelta){
			linea.paradasIda.push({
				codPar: linea.paradasVta[0].codPar,
				orden: -1
			});
			linea.paradasVta.push({
				codPar: linea.paradasIda[0].codPar,
				orden: -1
			});
		}
	}
	lineas.push(linea);
	//getTrazados(linea.idLinea);
	
	let fila = $("<tr>");
	let botonIda = $("<input>", {
		"type": "checkbox",
		"id": "botonIda"+linea.idLinea
	}).prop('checked', false).prop("indeterminate", true).click(function(){
		getTrazadosEmt(linea.idLinea);
	});
	let botonVta = $("<input>", {
		"type": "checkbox",
		"id": "botonVta"+linea.idLinea,
		"checked": true
	}).prop('checked', false).prop("indeterminate", true).click(function(){
		getTrazadosEmt(linea.idLinea);
	});
	let botonBus = $("<input>", {
		"type": "checkbox",
		"id": "botonBus"+linea.idLinea
	}).prop('checked', false).click(function(){
		enableBusUpdate(linea.idLinea);
	});
	$(fila).append($("<td>").append(botonIda));
	$(fila).append($("<td>").append(botonVta));
	$(fila).append($("<td>").append(botonBus));
	$(fila).append($("<td>").append(lineaIcon(linea.userCodLinea, "3x")));
	$(fila).append($("<td>").append($("<a>", {text: linea.nombreLinea, href: "#!"}).click(function(){verInfoLinea(linea.idLinea);})));
	$(fila).append($("<td>").append($("<p>").attr('id', "cont"+linea.idLinea)));

	$("#tablaLineasEMT").append(fila);
}

function addParadaEmt(parada, idLinea, sentido){
	let pos = findParada("EMT-"+parada.codParada);
	if(pos !== null){
		paradas[pos].servicios.push({
			idLinea: idLinea,
			sentido: sentido,
			espera: null
		});
	}else{
		pos = paradas.push({
			codPar: "EMT-"+parada.codParada,
			nombreParada: parada.nombreParada,
			direccion: parada.direccion,
			idNucleo: 0,
			idZona: "A",
			servicios: [],
			latitud: parada.latitud,
			longitud: parada.longitud,
			modos: "Autobús",
			marker: null,
			popup: null,
			viewCont: 0
		})-1;
		paradas[pos].servicios.push({
			idLinea: idLinea,
			sentido: sentido,
			espera: null
		});
	}
}

function codLinea(idLinea){
    return idLinea.replace(/^EMT-/, "");
}










// CTAN.JS











function getModos(){
	// Petición AJAX
	$.getJSON({
		url: rutpam.url.ctan+'/modostransporte?lang=ES'
	}).done(function (response, status){
		if(status === "success"){
            response = response.modosTransporte;
            for(let i = 0; i<response.length; i++){
				let modo = new Modo();
				modo.id = parseInt(response[i].idModo);
				modo.descripcion = response[i].descripcion;
                modos.push(modo);
			}
		}
	});
}

function getZonas(){
    // Petición AJAX
	$.getJSON({
		url: rutpam.url.ctan+'/zonas?lang=ES'
	}).done(function (response, status){
		if(status === "success"){
            response = response.zonas;
            for(let i = 0; i<response.length; i++){
				let zona = new Zona();
				zona.id = response[i].idZona;
				zona.nombre = response[i].nombre;
				zona.color = response[i].color;
                zonas.push(zona);
			}
		}
	});
}

function getLineasCtan(){
    // Petición AJAX
	$.getJSON({
		url: rutpam.url.ctan+'/lineas?lang=ES'
	}).done(function (response, status){
		if(status === "success"){
			response = response.lineas;
            for(let i = 0; i<response.length; i++){
				addLineaCtan(response[i]);
				setTimeout(getLineaCompletaCtan, 1000+(90*i), response[i].idLinea);
			}
		}
	});
	return null;
}

function getLineaCompletaCtan(ctanId){
	// Petición AJAX
	$.getJSON({
		url: rutpam.url.ctan+'/lineas/'+ctanId+'?lang=ES'
	}).done(function (response, status){
		if(status === "success"){
			updateLineaCtan(response); // Pasamos la línea por addLinea()
			rutpam.lineasCargadas++;
		}
	}).fail(function (response, status, error){
		if(error === "Bad Request"){ //Si el servidor no ha atendido la petición, se vuelve a hacer con recursividad
			getLineaCompletaCtan(ctanId);
		}
	});
	return null;
}

function addLineaCtan(lin){
    let linea = {
        idLinea: "CTAN-"+lin.idLinea,
        userCodLinea: lin.codigo,
        nombreLinea: lin.nombre,
        cabeceraIda: null,
        cabeceraVta: null,
        paradasIda: [],
        paradasVta: [],
        trazadoIda: null,
        trazadoVta: null,
        getBuses: false,
        getIda: false,
        getVta: false,
        verParadas: false,
        numBuses: null,
        modo: lin.modo,
        hayNoticia: lin.hayNoticia,
		operadores: (lin.operadores).replace(/, $/, ""),
		tieneIda: null,
		tieneVuelta: null
    };
    lineas.push(linea);

	getParadasLineaCtan(linea.idLinea);

    let fila = $("<tr>");
    let botonIda = $("<input>", {
		"type": "checkbox",
		"id": "botonIda"+linea.idLinea
	}).prop('checked', false).prop("indeterminate", true).prop("disabled", true);
	let botonVta = $("<input>", {
		"type": "checkbox",
		"id": "botonVta"+linea.idLinea,
		"checked": true
    }).prop('checked', false).prop("indeterminate", true).prop("disabled", true);
   	$(fila).append($("<td>").append(botonIda));
	if(linea.modo !== "Tren" && linea.modo !== "Metro"){
		$(fila).append($("<td>").append(botonVta));
	}
	$(fila).append($("<td>").append(lineaIcon(linea.userCodLinea, "3x")));
	$(fila).append($("<td>").append($("<a>", {text: linea.nombreLinea, href: "#!"}).click(function(){verInfoLinea(linea.idLinea);})));

    switch(linea.modo){
        case "Autobús":
			$("#tablaLineasCTAN").append(fila);
			break;
		case "Metro":
			$("#tablaLineasMetro").append(fila);
			break;
		case "Tren":
			$("#tablaLineasRenfe").append(fila);
			break;
    }
}

function updateLineaCtan(lin){
	let posLinea = findLinea("CTAN-"+lin.idLinea);
	let idLinea = lineas[posLinea].idLinea;
	lineas[posLinea].tieneIda = lin.tieneIda===1?true:false;
	lineas[posLinea].tieneVuelta = lin.tieneVuelta===1?true:false;
	if(lin.tieneVuelta){
		lineas[posLinea].cabeceraIda = /*paradas[findParada(lineas[posLinea].paradasIda[0].codPar)].nombreParada*/"Vuelta";
		lineas[posLinea].cabeceraVta = /*paradas[findParada(lineas[posLinea].paradasVta[0].codPar)].nombreParada*/"Ida";
	}else{
		lineas[posLinea].cabeceraIda = /*paradas[findParada(lineas[posLinea].paradasIda[0].codPar)].nombreParada*/"Ida";
		lineas[posLinea].cabeceraVta = "Ida";
	}
	// Polilíneas de trazado
	let trazadoIda = []; // Creamos un array con los puntos de latitud y longitud del polígono
	let trazadoVta = []; // Creamos un array con los puntos de latitud y longitud del polígono
	for(let a = 0; a < lin.polilinea.length; a++){
		let lat, lon, sentido;
		let punto = lin.polilinea[a][0].split(","); // Parseamos el string con la información del punto
		lat = punto[0];
		lon = punto[1];
		sentido = punto[2];
		if(sentido === "1" || sentido === undefined){
			trazadoIda.push({lat: lat, lng: lon});  // Rellenamos con los datos de la respuesta
		}else if(sentido === "2"){
			trazadoVta.push({lat: lat, lng: lon});  // Rellenamos con los datos de la respuesta
		}
	}
	let color;
	switch(lin.modo){
		case "Autobús":
			color = rutpam.colores.ctmamA;
			break;
		case "Metro":
			color = rutpam.colores.metro;
			break;
		case "Tren":
			color = rutpam.colores.renfeA;
			break;
	}
	lineas[posLinea].trazadoIda = L.polyline(trazadoIda, {
		color: color, // Fijamos el color de la ida
		opacity: 1.0, // Opacidad
		weight: 3 // Grosor
	});
	$("#botonIda"+idLinea).prop("indeterminate", false).prop("disabled", false); // Cambiamos el estado del botón a habilitado
	$("#botonIda"+idLinea).change(function(){
		let isChecked = $(this).is(':checked');
		if(isChecked){
			showTrazado(idLinea, 1); // Mostramos el trazado
		}else{
			hideTrazado(idLinea, 1); // Ocultamos el trazado
		}
	});
	if(trazadoVta.length !== 0){
		lineas[posLinea].trazadoVta = L.polyline(trazadoVta, {
			color: rutpam.colores.ctmamB, // Fijamos el color de la vuelta (solo los buses tienen vuelta)
			opacity: 1.0, // Opacidad
			weight: 3 // Grosor
		});
		$("#botonVta"+idLinea).prop("indeterminate", false).prop("disabled", false); // Cambiamos el estado del botón a habilitado
		$("#botonVta"+idLinea).change(function(){
			let isChecked = $(this).is(':checked');
			if(isChecked){
				showTrazado(idLinea, 2); // Mostramos el trazado
			}else{
				hideTrazado(idLinea, 2); // Ocultamos el trazado
			}
		});
	}
}

function getParadasLineaCtan(id){
    // Petición AJAX
	$.getJSON({
		url: rutpam.url.ctan+'/lineas/'+idLinea(id)+'/paradas?lang=ES'
	}).done(function (response, status){
		if(status === "success"){
			let linea = lineas[findLinea(id)];
			response = response.paradas;
			let cabeceraIda, cabeceraVta;
            for(let i = 0; i<response.length; i++){
				if(Number(response[i].sentido) === 1 && response[i].orden === 1){
					cabeceraIda = response[i].idParada;
					addParadaCtan(response[i], id); // Pasamos por addLinea() la cabecera
				}else if(Number(response[i].sentido) === 2 && response[i].orden === 1){
					cabeceraVta = response[i].idParada;
					addParadaCtan(response[i], id); // Pasamos por addLinea() la cabecera
				}else if(response[i].idParada !== cabeceraIda && response[i].idParada !== cabeceraVta){
					addParadaCtan(response[i], id); // Pasamos por addLinea() el resto de líneas menos la ultima parada si coincide con la cabecera
				}
                if(Number(response[i].sentido) === 1){
                    linea.paradasIda.push({
                        codPar: "CTAN-"+response[i].idParada,
                        orden: response[i].orden
					});
                }else if(Number(response[i].sentido) === 2){
                    linea.paradasVta.push({
                        codPar: "CTAN-"+response[i].idParada,
                        orden: response[i].orden
					});
                }
			}
			if(linea.paradasIda.length !== 0){
				linea.getIda = true;
			}
			if(linea.paradasVta.length !== 0){
				linea.getVta = true;
			}
		}
	}).fail(function (response, status, error){
		if(error === "Bad Request"){ //Si el servidor no ha atendido la petición, se vuelve a hacer con recursividad
			getParadasLineaCtan(id);
		}
	});
}

function addParadaCtan(parada, idLinea){
	let pos = findParada("CTAN-"+parada.idParada);
	if(pos !== null){
		paradas[pos].servicios.push({
			idLinea: idLinea,
			sentido: Number(parada.sentido),
			espera: null
		});
	}else{
		pos = paradas.push({
			codPar: "CTAN-"+parada.idParada,
			nombreParada: parada.nombre,
			direccion: null,
			idNucleo: parada.idNucleo,
			idZona: parada.idZona,
			servicios: [],
			latitud: parada.latitud,
			longitud: parada.longitud,
			modos: parada.modos,
			marker: null,
			popup: null,
			viewCont: 0
		})-1;
		paradas[pos].servicios.push({
			idLinea: idLinea,
			sentido: Number(parada.sentido),
			espera: null
		});
	}
}

function idLinea(id){
    return id.replace(/^CTAN-/, "");
}
