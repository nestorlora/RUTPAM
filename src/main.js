/**
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
 * @copyright
 */

/* Este script necesia los archivos ctan.js y emt.js para poder funcionar correctamente */

/* global emt_proxy_url, ctan_api_url, ttl_rate_new, refresh_rate, ttl_rate_default, ttl_rate_old, L, betteremt_api_url, showEMT, showCTAN */

/**
 * @description Variable global para la versión del programa
 * @global
 * @constant
 * @type String
 */
const rutpam_version = "4.13.4";

/**
 * @description Variable global para almacenar el timer maestro
 * @global
 * @var
 * @type JS_Timer
 */
var timer;

/**
 * @description Variable global para almacenar el mapa
 * @global
 * @var
 * @type L.map
 */
var map;

/**
 * @description Variable global para almacenar los colores utilizados por la app
 * @global
 * @constant
 * @enum
 */
const colores = {
	// EMT SAM + Urbanos Consorcio
	emtA: "#1E3180", // Primario, lineas regulares, sentido ida
	emtB: "#4876FE", // Secundario, sentido vuelta
	emtC: "#F77F00", // Circulares
	emtN: "#04141F", // Nocturnos
	// Consorcio de Transportes
	ctmamA: "#009639", // Oficial Primario, líneas regulares, sentido ida
	ctmamB: "#11B237", // sentido vuelta
	ctmamN: "#006983", // lineas buho
	ctmamT: "#E4D77E", // Oficial Secundario, líneas estacionales
	/*ctmamU: "#E4D77E", // líneas universitarias
	ctmamV: "#71A9F7", // líneas de verano*/
	// Renfe Operadora
	renfeA: "#8A0072", // Oficial general
	renfeB: "#EF3340", // Oficial cercanías
	// Metro Málaga
	metro: "#DC241F", // "Oficial"
	// Lineas especiales
	especial: "#FCCC0A", // Líneas y servicios especiales
	express: "#996633", // Servicios exprés
	lanzaderas: "#808183" // Lanzadera
};

/**
 * @description Tiempo de vida para buses nuevos (verde)(al alcanzar default_ttl se vuelven blancos)
 * @global
 * @constant
 * @type int
 */
const ttl_new = ttl_rate_new/refresh_rate;

/**
 * @description Número de actualizaciones fallidas sin aparecer para darlo por muerto
 * @global
 * @constant
 * @type Int
 */
const default_ttl = ttl_rate_default/refresh_rate;

/**
 * @description Número de actualizaciones fallidas sin aparecer para indicar que el bus probablemente haya desaparecido (color rojo)
 * @global
 * @var
 * @type Int
 */
const ttl_old = ttl_rate_old/refresh_rate;

/**
 * @description Indicador de estado de si se están mostrando las líneas de la EMT
 * @global
 * @var
 * @type Boolean
 */
var showEMT = false;

/**
 * @description Indicador de estado de si se están mostrando las líneas del consorcio
 * @global
 * @var
 * @type Boolean
 */
var showCTAN = false;

/**
 * @description Indicador de estado de si se están mostrando las líneas de metro
 * @global
 * @var
 * @type Boolean
 */
var showMetro = false;

/**
 * @description Indicador de estado de si se están mostrando las líneas de renfe
 * @global
 * @var
 * @type Boolean
 */
var showRenfe = false;
/**
 * @description Contador de las líneas que han sido cargadas en detalle
 * @global
 * @var
 * @type Number
 */
var lineasCargadas = 0;

/**
 * @description Indica si la función de inicializar los marcadores se ha ejecutado ya y habilita los botones de marcar paradas en el mapa
 * @global
 * @var
 * @type Boolean
 */
var paradasInicializadas = false;

/**
 * @description Tabla de modos de transporte (medios de transporte)
 * @global
 * @var
 * @type Array
 * @param {Int} idModo Identificador del modo
 * @param {String} descripcion Descripción del modo
 */
var modos = [];

/**
 * @description Tabla de zonas del CTAN
 * @global
 * @var
 * @type Array
 * @param {String} idZona Identificador de la zona
 * @param {String} nombre Nombre de la zona
 * @param {String} color Color de la zona
 */
var zonas = [];

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
 * @param {...} trazadoIda
 * @param {...} trazadoVta
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
	document.title = "RUTPAM "+rutpam_version; // Seteamos el título del documento
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
	var osmUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'; // URL del servidor cartográfico
	var osm = new L.TileLayer(osmUrl); // Creamos la capa de cartografía
	map = L.map('map', {
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
	var pos = 0; // Empezamos por el principio
	while(pos < autobuses.length){ // Para todos los autobuses
		var poslinea = findLinea(autobuses[pos].idLinea); // Extraemos la dirección de la línea en el array
		autobuses[pos].ttl--; // Decrementar TTL
		if(autobuses[pos].ttl <= 0){ // SI su vida útil ha expirado
			console.log("DROP "+autobuses[pos].codBus); // Registramos que se pierde
			autobuses[pos].marker.remove(); // Quitamos el marcador del mapa
			lineas[poslinea].numBuses--; // Decrementamos el número de buses en la línea
			autobuses.splice(pos, 1); // Borramos el objeto del array
		}else if(lineas[poslinea].getBuses === false){ // O SI no estamos haciendo un seguimiento de esa línea
			autobuses[pos].marker.remove(); // Quitamos el marcador del mapa
			pos++; // Avanzamos de posición
		}else if(autobuses[pos].ttl <= ttl_old){ // O SI el TTL es bajo y el bus lleva rato sin refrescarse
			autobuses[pos].marker.setIcon(busIconContent(autobuses[pos], 2)); // Cambiamos el icono para que aparezca como no-actualizado
			pos++; // Avanzamos de posición
		}else{ // O Todo está bien
			pos++; // Avanzamos de posición
		}
	}
	for(var a = 0; a < lineas.length; a++){ // Para todas las líneas
		$("#cont"+lineas[a].idLinea).text(lineas[a].numBuses); // Actualizamos el indicador de buses en servicio
	}
	return null;
}

/**
 * @description Función para detener el motor
 * @returns {null}
 */
function stop(){
	clearInterval(timer);
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
	timer = setInterval(motor, refresh_rate*1000);
	$("#pause").prop("disabled", false);
	$("#play").prop("disabled", true);
	$("#refresh").prop("disabled", true);
	return null;
}

/**
 * @description Función para limpiar los buses que no estamos siguiendo, llevan mucho sin refrescarse, o han desaparecido
 * @returns {null}
 */
function reducirTTL(){
	return null;
}

function inicializarParadas(){
	if(lineasCargadas < lineas.length || lineasCargadas < 80){
		setTimeout(inicializarParadas, 1500);
	}else{
		$("#loader").remove();
		for(var a = 0; a < paradas.length; a++){
			paradas[a].marker = L.marker({lat: paradas[a].latitud, lng: paradas[a].longitud}, {
				icon: paradaIconContent(paradas[a].codPar)
			});
			paradas[a].popup = L.popup({autoPan: false, autoClose: false}).setContent(paradaPopupContent(paradas[a].codPar));
			paradas[a].marker.bindPopup(paradas[a].popup);
		}
		paradasInicializadas = true;
	}
}

function verInfoLinea(id){
	var linea = lineas[findLinea(id)];
	$("#ventana").hide(); // Escondemos la ventana
	$("#infoContent").empty(); // Eliminamos contenido anterior
	//
	// Header
	//
	$("#infoContent").append($("<h3>", {text: "Línea "+linea.userCodLinea}).css("text-align", "center")); // Título de la ventana
	$("#infoContent").append($("<h4>", {text: linea.nombreLinea}).css("text-align", "center")); // Subtítulo (nombre línea)
	//
	// Botones
	//
	var botones = $("<p>");
	if(linea.paradasIda.length > 0){ // SI tenemos almacenadas paradas de la línea
		botones.append(generarBotonToggleParadas(id)); // Botón para activar/desactivar las paradas sobre el mapa
	}
	$("#infoContent").append(botones); // Añadimos la botonera
	var datos = $("<div>");
	//
	// Datos de línea
	//
	var datosLinea = $("<table>");
	datosLinea.append($("<tr>").append($("<th>", {text: "Id. interno"})).append($("<td>", {text: linea.idLinea})));
	datosLinea.append($("<tr>").append($("<th>", {text: "Operador"})).append($("<td>", {text: linea.operadores})));
	if(linea.numBuses !== null){
		datosLinea.append($("<tr>").append($("<th>", {text: "Num. Coches"})).append($("<td>", {text: linea.numBuses})));
	}
	datos.append($("<p>", {class: "inline-block"}).append(datosLinea));
	//
	// Datos longitud
	//
	var distanciaIda =0, distanciaVuelta = 0, tiempoIda = 0,tiempoVuelta = 0; // Creamos variables para los datos numéricos
	var datosTrazado = $("<table>"); // Tabla para los datos numéricos del trazado
	if(linea.getIda){ // SI se ha cargado el trazado de ida
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
	if(linea.numBuses > 0 && linea.getIda){ // SI hay buses en la línea Y se ha cargado su trazado
		var distanciaTotal = distanciaIda + distanciaVuelta; // Calculamos la distancia ida+vuelta
		var distanciaEntreBuses = distanciaTotal/linea.numBuses; // Calculamos la media de distancia entre buses en servicio
		var frecuenciaTeorica = distanciaEntreBuses/1000/13.5*60; // Estimamos la frecuencia media teórica
		var datosPaso = $("<table>"); // Creamos la tabla para estos datos
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
	var botonParadas = $("<button>", {
		"type": "button",
		"class": "boton"
	});
	$(botonParadas).text("Mostrar/Ocultar paradas");
	if(paradasInicializadas){// SI las paradas estan inicializadas
		if(lineas[findLinea(idLinea)].verParadas === true){ // SI estamos mostrando las paradas de esta línea
			$(botonParadas).css("background-color", colores.especial); // Poner el botón en on
		}
		$(botonParadas).on("click", function(){
			let linea = lineas[findLinea(idLinea)]; // Sacamos la línea para trabajar con ella
			if(linea.verParadas === true){ // SI estamos mostrando las paradas de esta línea
				for(var a = 0; a < linea.paradasIda.length; a++){ // Ocultar todas las paradas a la ida
					hideParada(linea.paradasIda[a].codPar);
				}
				for(var a = 0; a < linea.paradasVta.length; a++){ // Ocultar todas las paradas a al vuelta
					hideParada(linea.paradasVta[a].codPar);
				}
				$(this).css("background-color", "white"); // Ponemos el botón en off
				linea.verParadas = false; // Setear que NO se están mostrando las paradas
			}else if(linea.verParadas === false){ // SI NO estamos mostrando las paradas de esta línea
				for(var a = 0; a < linea.paradasIda.length; a++){ // Mostrar todas las paradas a la ida
					showParada(linea.paradasIda[a].codPar);
				}
				for(var a = 0; a < linea.paradasVta.length; a++){ // Mostrar todas las paradas a la vuelta
					showParada(linea.paradasVta[a].codPar);
				}
				$(this).css("background-color", colores.especial); // Ponemos el botón en on
				linea.verParadas = true; // Setear que se están mostrando las paradas
			}
		});
	}else{ // SI NO están inicializadas las paradas
		$(botonParadas).prop("disabled", true);
	}
	return botonParadas;
}

function generarTablaParadas(linea){
	var tabla = $("<table>"); // Creamos la tabla de paradas
	var cabecera = $("<tr>"); // Creamos una cabecera
	if(linea.tieneVuelta){ // SI la línea es de ida y vuelta
		cabecera.append($("<th>", {text: "Sentido"}).prop("colspan", 3).append($("<br>")).append(linea.cabeceraVta)); // Columna sentido ida
		cabecera.append($("<th>", {text: "Sentido"}).prop("colspan", 3).append($("<br>")).append(linea.cabeceraIda)); // Columna sentido vuelta
	}else{ // ELSE la línea es circular
		cabecera.append($("<th>", {text: "Sentido"}).prop("colspan", 3).append($("<br>")).append(linea.cabeceraIda)); // Columna sentido único
	}
	tabla.append(cabecera); // Añadimos la cabecera a la tabla
	for(var a = 0; a < Math.max(linea.paradasIda.length, linea.paradasVta.length); a++){ // PARA el máximo de paradas entre ida y vuelta
		var fila = $("<tr>"); // Creamos una fila
		if(a < linea.paradasIda.length){
			var codPar = linea.paradasIda[a].codPar;
			fila = generarFilaParada(fila, codPar, linea.idLinea);
		}else /*if(a === linea.paradasIda.length && linea.tieneVuelta){
			var codPar = linea.paradasVta[0].codPar;
			fila = generarFilaParada(fila, codPar, linea.idLinea);
		}else if(linea.tieneVuelta)*/{
			fila = generarFilaParada(fila);
		}
		if(linea.tieneVuelta){
			if(a < linea.paradasVta.length){
				var codPar = linea.paradasVta[a].codPar;
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
		var nombre = paradas[findParada(codPar)].nombreParada;
		div.append($("<td>").append($("<a>", {text: codPar, href: "#!"}).click(function(){verInfoParada(codPar);})));
		div.append($("<td>", {html: acortarParada(nombre)}));
		div.append(extrarCorrespondencias($("<td>"),codPar, idLinea));
	}else{
		div.append($("<td>")).append($("<td>")).append($("<td>"));
	}
	return div;
}

function verInfoParada(id){
	var parada = paradas[findParada(id)];
	$("#ventana").hide();
	$("#infoContent").empty();
	$("#infoContent").append($("<h3>", {text: "Parada "+parada.codPar}).css("text-align", "center"));
	$("#infoContent").append($("<h4>", {text: parada.nombreParada}).css("text-align", "center"));
	if(parada.direccion !== null){
		$("#infoContent").append($("<p>", {text: "Dirección: "+parada.direccion}));
	}
	var tabla = $("<table>");
	var cabecera = $("<tr>");
	cabecera.append($("<th>", {text: "Servicios"}).prop("colspan", /*3*/2));
	tabla.append(cabecera);
	for(var a = 0; a < parada.servicios.length; a++){
		var linea = lineas[findLinea(parada.servicios[a].idLinea)];
		var sentido;
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
		var fila = $("<tr>");
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
		lineas[findLinea(idLinea)].trazadoIda.addTo(map);
	}else if(sentido === 2){
		lineas[findLinea(idLinea)].trazadoVta.addTo(map);
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
	parada = paradas[findParada(codParada)];
	if(parada.viewCont++ === 0){ // SI nadie ha puesto antes el marcador (y lo incrementamos)
		parada.marker.addTo(map); // Añadimos el marcador al mapa
	}
}

function hideParada(codParada){
	parada = paradas[findParada(codParada)];
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
	var pos = 0;
	var found = false;
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

/**
 * Busca la posición de ua parada dentro de paradas[]
 * @param {Number} codPar
 * @returns {Number} Posición en paradas[]
 */
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

function findModo(idModo){
	var pos = 0;
	var found = false;
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
	var total = 0;
	if(trazado !== null){
		for(var pos = 1; pos < trazado.getLatLngs().length; pos++){
			total = total + map.distance(trazado.getLatLngs()[pos-1], trazado.getLatLngs()[pos]);
		}
	}
	return total;
}

function extrarCorrespondencias(div, codPar, idLinea){
	$(div).css("max-width", "73px");
	var parada = paradas[findParada(codPar)];
	for(var a = 0; a < parada.servicios.length; a++){
		var servicio = parada.servicios[a].idLinea;
		if(servicio !== idLinea){
			if(a === 0){
				var linea = lineas[findLinea(servicio)];
				var spanIcon = lineaIcon(linea.userCodLinea, "2x", linea.idLinea);
				$(div).append(spanIcon);
			}else if(servicio !== parada.servicios[a-1].idLinea){
				var linea = lineas[findLinea(servicio)];
				var spanIcon = lineaIcon(linea.userCodLinea, "2x", linea.idLinea);
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
	var id = $('<span>').addClass('fa-layers fa-'+zoom);
	var esNegro = false;
	if(/^C[1-9]$|^29$/.test(userCodLinea)){ // Circulares EMT
		id.append($('<i>').addClass('fas fa-circle').css("color", colores.emtC));
	}else if(/^N[1-9]/.test(userCodLinea)){ // Nocturno EMT
		id.append($('<i>').addClass('fas fa-circle').css("color", colores.emtN));
	}else if(/^A$|^E$/.test(userCodLinea)){ // Lineas exprés
		id.append($('<i>').addClass('fas fa-circle').css("color", colores.express));
	}else if(/^L$|^P$/.test(userCodLinea)){ // Lineas Lanzaderas
		id.append($('<i>').addClass('fas fa-circle').css("color", colores.lanzaderas));
	}else if(/N[1-9]$|^M-168$|^M-155$|^M-168$/.test(userCodLinea)){ // Líneas Buho CTAN
		id.append($('<i>').addClass('fas fa-circle').css("color", colores.ctmamN));
	}else if(/^M-5[0-9]{2}$/.test(userCodLinea)){ // Líneas Verano CTAN
		id.append($('<i>').addClass('fas fa-circle').css("color", colores.ctmamT));
	}else if(/^M-114$|^M-116$|^M-143$|^M-166$/.test(userCodLinea)){ // Líneas Universitarias CTAN
		id.append($('<i>').addClass('fas fa-circle').css("color", colores.ctmamT));
		esNegro = true;
	}else if(/^R-|^T-|^M-10[1-4]$/.test(userCodLinea)){ // Líneas Urbanas CTAN
		id.append($('<i>').addClass('fas fa-circle').css("color", colores.emtA));
	}else if(/^M-/.test(userCodLinea)){ // Líneas Interurbanas CTAN
		id.append($('<i>').addClass('fas fa-circle').css("color", colores.ctmamA));
	}else if(/^91$|^92$/.test(userCodLinea)){ // Servicios Turísticos
		id.append($('<i>').addClass('fas fa-circle').css("color", colores.especial));
		esNegro = true;
	}else if(/^METRO-[1-2]$/.test(userCodLinea)){ // Metro
		id.append($('<i>').addClass('fas fa-circle').css("color", colores.metro));
	}else if(/^C-[1-2]$/.test(userCodLinea)){ // Cercanías
		id.append($('<i>').addClass('fas fa-circle').css("color", colores.renfeA));
	}else if(/^12$|^16$|^26$|^64$|^[A-Z]/.test(userCodLinea)){ // Servicios Especiales
		id.append($('<i>').addClass('fas fa-circle').css("color", colores.especial));
		esNegro = true;
	}else{ // Líneas Urbanas EMT
		id.append($('<i>').addClass('fas fa-circle').css("color", colores.emtA));
	}

	var texto = userCodLinea.replace(/^M-/, "M\n").replace(/^R-/, "R").replace(/^T-/, "T").replace(/^METRO-/, "").replace(/^C-/, "C");
	var textdiv;
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
	var linea = lineas[findLinea(Bus.idLinea)];
	var sentido;
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
	var parada = paradas[findParada(Bus.codParIni)];
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
	var div = $("<div>");
	var parada = paradas[findParada(id)];
	$(div).append($("<h3>", {text: "Parada "+parada.codPar}).css("text-align", "center"));
	$(div).append($("<h4>", {text: parada.nombreParada}).css("text-align", "center"));
	var tabla = $("<table>");
	/*var cabecera = $("<tr>");
	$(cabecera).append($("<th>", {text: "Servicios"}).prop("colspan", /*3 2));
	$(tabla).append(cabecera);*/
	for(var a = 0; a < parada.servicios.length; a++){
		var linea = lineas[findLinea(parada.servicios[a].idLinea)];
		var sentido;
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
		var fila = $("<tr>");
		$(fila).append($("<td>", {html: lineaIcon(linea.userCodLinea, "2x", linea.idLinea)}));
		$(fila).append($("<td>", {text: sentido}));
		//fila.append($("<td>", {text: "??? min."}).css("text-align", "right"));
		$(tabla).append(fila);
	}
	$(div).append(tabla);
	return $(div).html();
}

function busIconContent(Bus, estado){
	var linea = lineas[findLinea(Bus.idLinea)];
	var html = linea.userCodLinea+"<br>"+Bus.codBus;
	var clase;
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
	if(showEMT){
		$("#tablaLineasEMT").css("display", "none");
		$("#verEMT").css("color", "black").css("background-color", "white");
		showEMT = false;
	}else{
		$("#tablaLineasEMT").css("display", "block");
		$("#verEMT").css("color", "white").css("background-color", colores.emtA);
		showEMT = true;
	}
}

function togglePanelCtan(){
	if(showCTAN){
		$("#tablaLineasCTAN").css("display", "none");
		$("#verCTAN").css("color", "black").css("background-color", "white");
		showCTAN = false;
	}else{
		$("#tablaLineasCTAN").css("display", "block");
		$("#verCTAN").css("color", "white").css("background-color", colores.ctmamA);
		showCTAN = true;
	}
}

function togglePanelMetro(){
	if(showEMT){
		$("#tablaLineasMetro").css("display", "none");
		$("#verMetro").css("color", "black").css("background-color", "white");
		showMetro = false;
	}else{
		$("#tablaLineasMetro").css("display", "block");
		$("#verMetro").css("color", "white").css("background-color", colores.metro);
		showMetro = true;
	}
}

function togglePanelRenfe(){
	if(showEMT){
		$("#tablaLineasRenfe").css("display", "none");
		$("#verRenfe").css("color", "black").css("background-color", "white");
		showRenfe = false;
	}else{
		$("#tablaLineasRenfe").css("display", "block");
		$("#verRenfe").css("color", "white").css("background-color", colores.renfeA);
		showRenfe = true;
	}
}

/**
 * Recoge un elemento del DOM y lo devuelve rellenado con el HTML adecuado de la barra de control
 * @param {DOM Element} mapDiv
 * @returns {DOM Element}
 */
function ControlRUTPAM(mapDiv){
	var titulo = $("<h2>", {"text":"RUTPAM"});
	var descripcion = $("<p>", {"text":"Información de transportes metropolitanos del área de Málaga"});
	var loader = $("<p>", {"id": "loader", "text": "Todavía cargando datos..."}).css("color", "white").css("background-color", "red");
	$(mapDiv).append(titulo).append(descripcion).append(loader);
	var botonEMT = $("<button>", {
		"id": "verEMT",
		"type": "button",
		"class": "boton",
		"text": "Red EMT"
	}).on("click", togglePanelEmt);
	var botonCTAN = $("<button>", {
		"id": "verCTAN",
		"type": "button",
		"class": "boton",
		"text": "Red CTMAM"
	}).on("click", togglePanelCtan);
	var botonRenfe = $("<button>", {
		"id": "verRenfe",
		"type": "button",
		"class": "boton",
		"text": "RENFE"
	}).on("click", togglePanelRenfe);
	var botonMetro = $("<button>", {
		"id": "verMetro",
		"type": "button",
		"class": "boton",
		"text": "Red Metro"
	}).on("click", togglePanelMetro);
	var play = $("<button>", {
		"id": "play",
		"type": "button",
		"class": "boton",
		"text": "Play"
	}).on("click", start).css("display", "none");
	var refresh = $("<button>", {
		"id": "refresh",
		"type": "button",
		"class": "boton",
		"text": "Refrescar"
	}).on("click", motor).css("display", "none");
	var pause = $("<button>", {
		"id": "pause",
		"type": "button",
		"class": "boton",
		"text": "Pausa"
	}).on("click", stop).css("display", "none");
	var controles = $("<p>", {id: "controles"}).append(botonEMT).append(botonCTAN).append(botonMetro).append(botonRenfe).append($("<br>")).append(play).append(refresh).append(pause);
	$(mapDiv).append(controles);
	/*var tiempoDatos = $("<p>", {id: "tiempoDatos", text: "Datos actualizados: "});
	$(mapDiv).append(tiempoDatos);*/
	var tablaEmt = $("<table>", {"id": "tablaLineasEMT"}).css("display", "none");
	var encabezadoEmt = $("<tr>");
	$(encabezadoEmt).html('<th>Ida</th><th>Vta</th><th>Bus</th><th colspan="2">Línea</th><th>NºB.</th>');
	$(tablaEmt).append(encabezadoEmt);
	$(mapDiv).append(tablaEmt);
	var tablaCtan = $("<table>", {"id": "tablaLineasCTAN"}).css("display", "none");
	var encabezadoCtan = $("<tr>");
	$(encabezadoCtan).html('<th>Ida</th><th>Vta</th><th colspan="2">Línea</th>');
	$(tablaCtan).append(encabezadoCtan);
	$(mapDiv).append(tablaCtan);
	var tablaMetro = $("<table>", {"id": "tablaLineasMetro"}).css("display", "none");
	var encabezadoMetro = $("<tr>");
	$(encabezadoMetro).html('<th></th><th colspan="2">Línea</th>');
	$(tablaMetro).append(encabezadoMetro);
	$(mapDiv).append(tablaMetro);
	var tablaRenfe = $("<table>", {"id": "tablaLineasRenfe"}).css("display", "none");
	var encabezadoRenfe = $("<tr>");
	$(encabezadoRenfe).html('<th></th><th colspan="2">Línea</th>');
	$(tablaRenfe).append(encabezadoRenfe);
	$(mapDiv).append(tablaRenfe);
	$(mapDiv).append('<br><small><a href="#!" onclick="verCopyright()">Acerca de RUTPAM</a></small>');
	$(mapDiv).append('<br><small><a href="#!" onclick="verAyuda()">Ayuda</a></small>');
	return mapDiv;
}

function verCopyright(){
	var rutpam_credits = 'R.U.T.P.A.M. v'+rutpam_version+'<br>\n\
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
	var ayuda = '<h4>Controles</h4>\n\
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
	<span class="fa-layers fa-2x"><i class="fas fa-circle" style="color:'+colores.emtA+'"></i></span> Líneas convencionales<br>\n\
	<span class="fa-layers fa-2x"><i class="fas fa-circle" style="color:'+colores.emtC+'"></i></span> Líneas circulares EMT<br>\n\
	<span class="fa-layers fa-2x"><i class="fas fa-circle" style="color:'+colores.emtN+'"></i></span> Líneas nocturnas<br>\n\
	</p>\n\
	<h5>Líneas Interurbanas</h5>\n\
	<p>\n\
	<span class="fa-layers fa-2x"><i class="fas fa-circle" style="color:'+colores.ctmamA+'"></i></span> Líneas convencionales<br>\n\
	<span class="fa-layers fa-2x"><i class="fas fa-circle" style="color:'+colores.ctmamN+'"></i></span> Líneas búho<br>\n\
	<span class="fa-layers fa-2x"><i class="fas fa-circle" style="color:'+colores.ctmamT+'"></i></span> Líneas estacionales<br>\n\
	</p>\n\
	<h5>Líneas Especiales</h5>\n\
	<p>\n\
	<span class="fa-layers fa-2x"><i class="fas fa-circle" style="color:'+colores.especial+'"></i></span> Líneas especiales/Servicios especiales<br>\n\
	<span class="fa-layers fa-2x"><i class="fas fa-circle" style="color:'+colores.express+'"></i></span> Líneas express<br>\n\
	<span class="fa-layers fa-2x"><i class="fas fa-circle" style="color:'+colores.lanzaderas+'"></i></span> Líneas lanzadera<br>\n\
	</p>\n\
	<h5>Líneas de Metro/Ferrocarril</h5>\n\
	<p>\n\
	<span class="fa-layers fa-2x"><i class="fas fa-circle" style="color:'+colores.renfeA+'"></i></span> Renfe  Cercanías/Regional/Media Distancia<br>\n\
	<span class="fa-layers fa-2x"><i class="fas fa-circle" style="color:'+colores.metro+'"></i></span> Metro Málaga<br>\n\
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