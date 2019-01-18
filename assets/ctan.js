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

/* Este archivo forma parte de R.U.T.P.A.M. no funcionará por separado */

/* global emt_proxy_url, ctan_api_url, ttl_rate_new, refresh_rate, ttl_rate_default, ttl_rate_old, L, betteremt_api_url, lineas, modos, zonas, paradas, lineasCargadas  */

function getModos(){
	// Petición AJAX
	$.getJSON({
		url: ctan_api_url+'/modostransporte?lang=ES'
	}).done(function (response, status){
		if(status === "success"){
            response = response.modosTransporte;
            for(var i = 0; i<response.length; i++){
				var modo = {
                    idModo: parseInt(response[i].idModo),
                    descripcion: response[i].descripcion
                };
                modos.push(modo);
			}
		}
	});
    return null;
}

function getZonas(){
    // Petición AJAX
	$.getJSON({
		url: ctan_api_url+'/zonas?lang=ES'
	}).done(function (response, status){
		if(status === "success"){
            response = response.zonas;
            for(var i = 0; i<response.length; i++){
				var zona = {
                    idZona: response[i].idZona,
                    nombre: response[i].nombre,
                    color: response[i].color
                };
                zonas.push(zona);
			}
		}
	});
}

function getLineasCtan(){
    // Petición AJAX
	$.getJSON({
		url: ctan_api_url+'/lineas?lang=ES'
	}).done(function (response, status){
		if(status === "success"){
			response = response.lineas;
            for(var i = 0; i<response.length; i++){
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
		url: ctan_api_url+'/lineas/'+ctanId+'?lang=ES'
	}).done(function (response, status){
		if(status === "success"){
			updateLineaCtan(response); // Pasamos la línea por addLinea()
			lineasCargadas++;
		}
	}).fail(function (response, status, error){
		if(error === "Bad Request"){ //Si el servidor no ha atendido la petición, se vuelve a hacer con recursividad
			getLineaCompletaCtan(ctanId);
		}
	});
	return null;
}

function addLineaCtan(lin){
    var linea = {
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

    var fila = $("<tr>");
    var botonIda = $("<input>", {
		"type": "checkbox",
		"id": "botonIda"+linea.idLinea
	}).prop('checked', false).prop("indeterminate", true).prop("disabled", true);
	var botonVta = $("<input>", {
		"type": "checkbox",
		"id": "botonVta"+linea.idLinea,
		"checked": true
    }).prop('checked', false).prop("indeterminate", true).prop("disabled", true);
   	//$(fila).append($("<td>").append(botonIda));
	//$(fila).append($("<td>").append(botonVta));
	$(fila).append($("<td>").append(lineaIcon(linea.userCodLinea, "3x")));
	$(fila).append($("<td>").append($("<a>", {text: linea.nombreLinea, href: "#!"}).click(function(){verInfoLinea(linea.idLinea);})));

    switch(linea.modo){
        case "Autobús":
        $("#tablaLineasCTAN").append(fila);
        break;
    }
}

function updateLineaCtan(lin){
	posLinea = findLinea("CTAN-"+lin.idLinea);
	lineas[posLinea].tieneIda = lin.tieneIda===1?true:false;
	lineas[posLinea].tieneVuelta = lin.tieneVuelta===1?true:false;
	if(lin.tieneVuelta){
		lineas[posLinea].cabeceraIda = paradas[findParada(lineas[posLinea].paradasIda[0].codPar)].nombreParada;
		lineas[posLinea].cabeceraVta = paradas[findParada(lineas[posLinea].paradasVta[0].codPar)].nombreParada;
	}else{
		lineas[posLinea].cabeceraIda = paradas[findParada(lineas[posLinea].paradasIda[0].codPar)].nombreParada;
	}
}

function getParadasLineaCtan(id){
    // Petición AJAX
	$.getJSON({
		url: ctan_api_url+'/lineas/'+idLinea(id)+'/paradas?lang=ES'
	}).done(function (response, status){
		if(status === "success"){
			linea = lineas[findLinea(id)];
			response = response.paradas;
			var cabeceraIda, cabeceraVta;
            for(var i = 0; i<response.length; i++){
				if(Number(response[i].sentido) === 1 && response[i].orden === 1){
					cabeceraIda = response[i].idParada;
					addParadaCtan(response[i], id); // Pasamos por addLinea() la cabecera
				}else if(Number(response[i].sentido) === 2 && response[i].orden === 1){
					cabeceraVta = response[i].idParada;
					addParadaCtan(response[i], id); // Pasamos por addLinea() la cabecera
				}else if(response[i].idParada !== cabeceraIda && response[i].idParada !== cabeceraVta){
					addParadaCtan(response[i], id); // Pasamos por addLinea() el resto de líneas menos la ultima parada si coincide con la cabecera
				}
                if(response[i].sentido == 1){
                    linea.paradasIda.push({
                        codPar: "CTAN-"+response[i].idParada,
                        orden: response[i].orden
					});
                }else if(response[i].sentido == 2){
                    linea.paradasVta.push({
                        codPar: "CTAN-"+response[i].idParada,
                        orden: response[i].orden
					});
                }
			}
		}
	}).fail(function (response, status, error){
		if(error === "Bad Request"){ //Si el servidor no ha atendido la petición, se vuelve a hacer con recursividad
			getParadasLineaCtan(id);
		}
	});
}

function addParadaCtan(parada, idLinea){
	var pos = findParada("CTAN-"+parada.idParada);
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