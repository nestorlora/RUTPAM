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

/* global emt_proxy_url, ctan_api_url, ttl_rate_new, refresh_rate, ttl_rate_default, ttl_rate_old, L, betteremt_api_url */

function getModos(){
    $.getJSON({
		url: ctan_api_url+'/modostransporte?lang=ES'
	}).done(function (response, status){
		if(status === "success"){
            response = response.modosTransporte;
            for(var i = 0; i<response.length; i++){
				var modo = {
                    idModo: parseInt(response[i].idModo),
                    descripcion: response[i].descripcion
                }
                modos.push(modo);
			}
		}
	});
    return null;
}

function getLineasCtan(){
    $.getJSON({
		url: ctan_api_url+'/lineas?lang=ES'
	}).done(function (response, status){
		if(status === "success"){
            response = response.lineas;
            for(var i = 0; i<response.length; i++){
				addLineaCtan(response[i]); // Para cada línea de la respuesta la pasamos por addLinea()
			}
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
        idModo: parseInt(lin.idModo),
        hayNoticia: lin.hayNoticias,
        operadores: (lin.operadores).replace(/, $/, "")
    };
    lineas.push(linea);

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
    $(fila).append($("<td>").append(botonIda));
	$(fila).append($("<td>").append(botonVta));
	$(fila).append($("<td>").append(lineaIcon(linea.userCodLinea, "3x")));
	$(fila).append($("<td>").append($("<a>", {text: linea.nombreLinea, href: "#!"}).click(function(){verInfoLinea(linea.idLinea);})));

    switch(linea.idModo){
        case 1:
        $("#tablaLineasCTAN").append(fila);
        break;
    }
	
}