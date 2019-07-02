/**
 * @file Script principal de RUTPAM
 * @version v5.0
 * @author Néstor Manuel Lora Romero <nestorlora@geeklab.es>
 * @copyright Geeklab - Néstor Manuel Lora Romero 2018-2019
 * @license MIT
 */

'use strict';

var core = new Core();

/**
 * Función de puesta en marcha cuando finaliza la carga del DOM
 */
$(document).ready(function(){
	core.ui.init.controles(); // Rellenamos el div del panel de control con lo que devuelve ControlRUTPAM()
	core.ui.ver.copyright(); // Mostramos el "Acerca de RUTPAM"
	core.ui.init.mapa(); // Inicializamos el mapa y todo el layout
	document.title = "RUTPAM "+core.version; // Seteamos el título del documento
	core.ui.init.teclas(); // Inicializamos las teclas de control
	core.getModos(); // Cargamos los modos de transporte
	core.getZonas(); // Cargamos las zonas
	core.getLineasEmt(); // Cargamos las líneas de la EMT
	core.getLineasCtan(); // Cargamos las líneas del CTAN
	inicializarParadas(); // Inicializamos los marcadores de las paradas
	motor(); // Llamamos la primera vez al motor
	start(); // Programamos que se ejecute periódicamente
	// Mostramos la botoner de control del motor
	$("#play").css("display", "inline-block");
	$("#refresh").css("display", "inline-block");
	$("#pause").css("display", "inline-block");
});

/**
 * @description Función asíncrona para refrescar los datos periódicamente
 * @returns {null}
 */
function motor(){
	getBusesEmt(); // Pedimos toda la información actualizada de los buses
	let pos = 0; // Empezamos por el principio
	while(pos < core.vehiculos.length){ // Para todos los autobuses
		//let poslinea = findLinea(vehiculos[pos].linea); // Extraemos la dirección de la línea en el array
		let linea = core.lineas.buscar(core.vehiculos[pos].linea);
		core.vehiculos[pos].ttl--; // Decrementar TTL
		if(core.vehiculos[pos].ttl <= 0){ // SI su vida útil ha expirado
			console.log("DROP "+core.vehiculos[pos].id); // Registramos que se pierde
			core.vehiculos[pos].marker.remove(); // Quitamos el marcador del mapa
			linea.numVehiculos--; // Decrementamos el número de buses en la línea
			core.vehiculos.splice(pos, 1); // Borramos el objeto del array
		}else if(linea.estado.getBuses === false){ // O SI no estamos haciendo un seguimiento de esa línea
			core.vehiculos[pos].marker.remove(); // Quitamos el marcador del mapa
			pos++; // Avanzamos de posición
		}else if(core.vehiculos[pos].ttl <= core.ttl.old){ // O SI el TTL es bajo y el bus lleva rato sin refrescarse
			core.vehiculos[pos].marker.setIcon(core.vehiculos[pos].generarIconMap(2)); // Cambiamos el icono para que aparezca como no-actualizado
			pos++; // Avanzamos de posición
		}else{ // O Todo está bien
			pos++; // Avanzamos de posición
		}
	}
	for(let a = 0; a < core.lineas.length; a++){ // Para todas las líneas
		$("#cont"+core.lineas[a].id).text(core.lineas[a].numVehiculos); // Actualizamos el indicador de buses en servicio
	}
	return null;
}

/**
 * @description Función para detener el motor
 * @returns {null}
 */
function stop(){
	clearInterval(core.timer);
	core.ui.action.motor.stop();
	return null;
}

/**
 * @description Función para arrancar el motor
 * @returns {null}
 */
function start(){
	core.timer = setInterval(motor, new Parametros().refresh_rate*1000);
	core.ui.action.motor.start();
	return null;
}

function inicializarParadas(){
	if(core.lineasCargadas < core.lineas.length || core.lineasCargadas < 80){
		setTimeout(inicializarParadas, 1500);
	}else{
		$("#loader").remove();
		for(let a = 0; a < core.paradas.length; a++){
			core.paradas[a].inicializar();
		}
		core.paradasInicializadas = true;
	}
}

function verInfoLinea(id){
	let linea = core.lineas.buscar(id);
	core.ui.action.closeWindow(); // Escondemos la ventana
	core.ui.action.clearInfo(); // Eliminamos contenido anterior
	//
	// Header
	//
	$("#infoContent").append($("<h3>", {text: "Línea "+linea.codigo}).css("text-align", "center")); // Título de la ventana
	$("#infoContent").append($("<h4>", {text: linea.nombre}).css("text-align", "center")); // Subtítulo (nombre línea)
	//
	// Botones
	//
	let botones = $("<p>");
	if(linea.paradasIda.length > 0){ // SI tenemos almacenadas paradas de la línea
		botones.append(core.ui.generar.botonToggleParadas(core.lineas.buscar(id))); // Botón para activar/desactivar las paradas sobre el mapa
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
	let distanciaIda = 0, distanciaVuelta = 0, tiempoIda = 0,tiempoVuelta = 0; // Creamos variables para los datos numéricos
	let datosTrazado = $("<table>"); // Tabla para los datos numéricos del trazado
	if(linea.estado.getIda){ // SI se ha cargado el trazado de ida
		distanciaIda = Math.floor(linea.distanciaTrazado(1)); // Calcular la distancia de la ruta
		tiempoIda = Math.floor(distanciaIda/1000/13.5*60); // Estimar el tiempo de viaje
		if(/^EMT-/.test(id)){
			datosTrazado.append($("<tr>").append($("<td>")).append($("<th>", {text: "Longitud"})).append($("<th>", {text: "Tiempo de viaje (estimado)"}))); // Cabecera de la tabla para los datos numéricos del trazado
			datosTrazado.append($("<tr>").append($("<th>", {text: "Ida"})).append($("<td>", {text: distanciaIda+" m"})).append($("<td>", {text: tiempoIda+" min"}))); // Añadimos los datos de la ida
		}else{
			datosTrazado.append($("<tr>").append($("<td>")).append($("<th>", {text: "Longitud"}))); // Cabecera de la tabla para los datos numéricos del trazado
			datosTrazado.append($("<tr>").append($("<th>", {text: "Ida"})).append($("<td>", {text: distanciaIda+" m"}))); // Añadimos los datos de la ida
		}
	}
	if(linea.estado.getVuelta){ // SI se ha cargado el trazado de vuelta (también se ha cargado el de ida)
		distanciaVuelta = Math.floor(linea.distanciaTrazado(2)); // Calcular la distancia de la ruta
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
		let distanciaEntreBuses = distanciaTotal/linea.numVehiculos; // Calculamos la media de distancia entre buses en servicio
		let frecuenciaTeorica = distanciaEntreBuses/1000/13.5*60; // Estimamos la frecuencia media teórica
		let datosPaso = $("<table>"); // Creamos la tabla para estos datos
		datosPaso.append($("<tr>").append($("<th>", {text: "Frecuencia media teórica estimada"})).append($("<td>", {text: Math.floor(frecuenciaTeorica*100)/100+" min"}))); // Incluimos la frecuencia media teórica
		datosPaso.append($("<tr>").append($("<th>", {text: "Distancia media entre coches"})).append($("<td>", {text: Math.floor(distanciaEntreBuses*100)/100+" m"}))); // Incluimos la distancia entre buses
		datos.append($("<p>", {class: "inline-block"}).append(datosPaso)); // Añadimos la tabla a la ventana
	}
	$("#infoContent").append(datos);
	//
	// Paradas
	//
	if(linea.paradasIda.length > 0){
		$("#infoContent").append($("<p>").append(core.ui.generar.tablaParadas(linea)));
	}
	$("#ventana").show();
	return null;
}

function verInfoParada(id){
	let parada = core.paradas.buscar(id);
	$("#ventana").hide();
	$("#infoContent").empty();
	$("#infoContent").append($("<h3>", {text: "Parada "+parada.id}).css("text-align", "center"));
	$("#infoContent").append($("<h4>", {text: parada.nombre}).css("text-align", "center"));
	if(parada.direccion !== null){
		$("#infoContent").append($("<p>", {text: "Dirección: "+parada.direccion}));
	}
	let tabla = $("<table>");
	let cabecera = $("<tr>");
	cabecera.append($("<th>", {text: "Servicios"}).prop("colspan", /*3*/2));
	tabla.append(cabecera);
	for(let a = 0; a < parada.servicios.length; a++){
		let linea = core.lineas.buscar(parada.servicios[a].linea);
		let sentido;
		switch (parada.servicios[a].sentido){
			case 1:
				sentido = linea.cabeceraVuelta;
				break;
			case 2:
				sentido = linea.cabeceraIda;
				break;
			default:
				sentido = "-";
				break;
		}
		let fila = $("<tr>");
		fila.append($("<td>", {html: linea.generarIcon(3)}));
		fila.append($("<td>", {text: sentido}));
		//fila.append($("<td>", {text: "??? min."}).css("text-align", "right"));
		tabla.append(fila);
	}
	$("#infoContent").append(tabla);
	$("#ventana").show();

	return null;
}

function enableBusUpdate(idLinea){
	core.lineas.buscar(idLinea).estado.getBuses = true;
	$("#botonBus"+idLinea).prop("checked", true);
	$("#botonBus"+idLinea).unbind("click");
	$("#botonBus"+idLinea).click(function(){
		disableBusUpdate(idLinea);
	});
}

function disableBusUpdate(idLinea){
	core.lineas.buscar(idLinea).estado.getBuses = false;
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
		core.lineas.buscar(idLinea).trazadoIda.addTo(core.map);
	}else if(sentido === 2){
		core.lineas.buscar(idLinea).trazadoVuelta.addTo(core.map);
	}
}

/**
 * Al ser llamada, borra del mapa el trazado de la línea indicada y prepara el botón para realizar la acción contraria cuando vuelva a ser llamado
 * @param {Number} idLinea
 * @param {Number} sentido
 */
function hideTrazado(idLinea, sentido){
	if(sentido === 1){
		core.lineas.buscar(idLinea).trazadoIda.remove();
		$("#botonIda"+idLinea).prop("checked", false);
	}else if(sentido === 2){
		core.lineas.buscar(idLinea).trazadoVuelta.remove();
		$("#botonVta"+idLinea).prop("checked", false);
	}
}

function showParada(id){
	let parada = core.paradas.buscar(id);
	if(parada.vistas++ === 0){ // SI nadie ha puesto antes el marcador (y lo incrementamos)
		parada.marker.addTo(core.map); // Añadimos el marcador al mapa
	}
}

function hideParada(id){
	let parada = core.paradas.buscar(id);
	if(--parada.vistas === 0){ // (Reducimos contador) | SI nadie ha puesto antes el marcador... lo quitamos
		parada.marker.remove(); // Quitamos el marcador del mapa
	}
}










// EMT.JS












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
		url: core.url.emt+'/services/trazados/?codLinea='+core.lineas.buscar(idLinea).normalizaId()+'&sentido=1'
	}).done(function (response, status){
		if(status === "success" && response.length > 0){
			//let posLinea = findLinea(idLinea); // Almacenamos la posición en lineas[] para uso más cómodo
			let linea = core.lineas.buscar(idLinea); // Referenciamos la línea con la que trabajamos
			let trazado = []; // Creamos un array con los puntos de latitud y longitud del polígono
			for(let a = 0; a < response.length; a++){
				trazado.push(new LatLong(response[a].latitud, response[a].longitud));  // Rellenamos con los datos de la respuesta
			}
			linea.trazadoIda = L.polyline(trazado, {
				color: core.colores.emtA, // Fijamos el color de la ida
				opacity: 1.0, // Opacidad
				weight: 3 // Grosor
			});
			linea.estado.getIda = true;
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
		url: core.url.emt+'/services/trazados/?codLinea='+core.lineas.buscar(idLinea).normalizaId()+'&sentido=2'
	}).done(function (response, status){
		if(status === "success" && response.length > 0){
			//let posLinea = findLinea(idLinea); // Almacenamos la posición en lineas[] para uso más cómodo
			let linea = core.lineas.buscar(idLinea); // Referenciamos la línea con la que trabajamos
			let trazado = []; // Creamos un array con los puntos de latitud y longitud del polígono
			for(let a = 0; a < response.length; a++){
				trazado.push(new LatLong(response[a].latitud, response[a].longitud)); // Rellenamos con los datos de la respuesta
			}
			linea.trazadoVuelta = L.polyline(trazado, {
				color: core.colores.emtB, // Fijamos el color de la vuelta
				opacity: 1.0, // Opacidad
				weight: 3 // Grosor
			});
			linea.estado.getVuelta = true;
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

function getBusesEmt(){
	$.getJSON({
		//url: betteremt_api_url+'/buses/all'
		url: core.url.odm+'datastore_search_sql?sql=SELECT * from "9bc05288-1c11-4eec-8792-d74b679c8fcf" WHERE last_update=(SELECT MAX(last_update) from "9bc05288-1c11-4eec-8792-d74b679c8fcf")'
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
				response[x].codBus = "EMT-"+response[x].codBus;
				response[x].codLinea = "EMT-"+response[x].codLinea;
				response[x].codParIni = "EMT-"+response[x].codParIni;
				if(core.vehiculos.buscar(response[x].codBus) !== undefined){
					core.vehiculos.buscar(response[x].codBus).refrescarEmt(response[x]);
				}else{
					addBusEmt(response[x]);
				}
			}
		}		
	});
}

function addBusEmt(bus){
	let vehiculo = new Vehiculo();
	vehiculo.nuevoEmt(bus);
	// Insertamos el vehículo
	core.vehiculos.push(vehiculo);
	console.log("ADDED "+vehiculo.id);
	// Añadimos el vehículo si la línea está siendo visualizada
	let linea = core.lineas.buscar(vehiculo.linea);
	if(linea.estado.getBuses){
		vehiculo.marker.addTo(core.map);
	}
	linea.numVehiculos++;
}

function addParadaEmt(par, idLinea, sentido){
	let parada = core.paradas.buscar("EMT-"+par.codParada);
	if(parada === undefined){ // La parada no existe
		// Creación de la parada
		parada = new Parada();
		parada.nuevaEmt(par);
		// Guardamos la parada
		core.paradas.push(parada);
	}
	parada = core.paradas.buscar("EMT-"+par.codParada);
	// Creamos el servicio
	let servicio = new Servicio();
	servicio.linea = idLinea;
	servicio.sentido = sentido;
	// Guardamos el servicio
	parada.servicios.push(servicio);
}









// CTAN.JS











function getParadasLineaCtan(id){
    // Petición AJAX
	$.getJSON({
		url: core.url.ctan+'/lineas/'+core.lineas.buscar(id).normalizaId()+'/paradas?lang=ES'
	}).done(function (response, status){
		if(status === "success"){
			let linea = core.lineas.buscar(id);
			let cabeceraIda, cabeceraVuelta;
			response = response.paradas;
            for(let i = 0; i<response.length; i++){ // Por cada parada
				// Establecemos las cabeceras de la línea
				if(Number(response[i].sentido) === 1 && response[i].orden === 1){
					cabeceraIda = response[i].idParada;
					addParadaCtan(response[i], id); // Pasamos por addLinea() la cabecera
				}else if(Number(response[i].sentido) === 2 && response[i].orden === 1){
					cabeceraVuelta = response[i].idParada;
					addParadaCtan(response[i], id); // Pasamos por addLinea() la cabecera
				}else if(response[i].idParada !== cabeceraIda && response[i].idParada !== cabeceraVuelta){
					addParadaCtan(response[i], id); // Pasamos por addLinea() el resto de líneas menos la ultima parada si coincide con la cabecera
				}
				// Insertar paradas en la línea
				let relacion = new RelacionParadas(
					"CTAN-"+response[i].idParada,
					response[i].orden
				);
				if(Number(response[i].sentido) === 1){
					linea.paradasIda.push(relacion);
				}else if(Number(response[i].sentido) === 2){
					linea.paradasVuelta.push(relacion);
				}
/*
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
                }*/
			}
			/*
			if(linea.paradasIda.length !== 0){
				linea.getIda = true;
			}
			if(linea.paradasVta.length !== 0){
				linea.getVta = true;
			}*/
		}
	}).fail(function (response, status, error){
		if(error === "Bad Request"){ //Si el servidor no ha atendido la petición, se vuelve a hacer con recursividad
			getParadasLineaCtan(id);
		}
	});
}

function addParadaCtan(par, idLinea){
	let parada = core.paradas.buscar("CTAN-"+par.idParada);
	if(parada === undefined){ // La parada no existe
		// Creación de la parada
		parada = new Parada();
		parada.id = "CTAN-"+par.idParada;
		parada.nombre = par.nombre;
		parada.direccion = null;
		parada.nucleo = par.idNucleo;
		parada.zona = par.idZona;
		parada.ubicacion = new LatLong(Number(par.latitud),Number(par.longitud));
		switch(par.modos){
			case "Autobús":
				parada.modos.push(1);
				break;
			case "Bicicleta":
				parada.modos.push(2);
				break;
			case "Metro":
				parada.modos.push(3);
				break;
			case "Tren":
				parada.modos.push(4);
				break;
		}
		parada.red = core.lineas.buscar(idLinea).red;
		// Guardamos la parada
		core.paradas.push(parada);
	}
	parada = core.paradas.buscar("CTAN-"+par.idParada);
	// Creamos el servicio
	let servicio = new Servicio();
	servicio.linea = idLinea;
	servicio.sentido = Number(par.sentido);
	// Guardamos el servicio
	parada.servicios.push(servicio);
}
