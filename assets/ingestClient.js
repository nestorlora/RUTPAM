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

var tokenKey = 0; // TO-DO: Update key
var lineas_emt = [];
var ubicaciones = [];
var waiting = 0;
var timer;

function motorIndividual(){
	clearlog();
	for(var y = 0; y < lineas_emt.length; y++){
		setTimeout(getUbicaciones, y*150, lineas_emt[y].codLinea);
	}
}

function motorMasivo(){
	clearlog();
	ubicaciones = [];
	for(var y = 0; y < lineas_emt.length; y++){
		setTimeout(getListUbicaciones, y*80, lineas_emt[y].codLinea);
		waiting++;
	}
}

function getLineas(motor){
	$.getJSON({
		url: '/rutpam/index.php/proxy/emt-core/services/lineas/'
	}).done(function (response, status){
		if(status === "success"){
			lineas_emt = response;
			log("Obtenidas "+lineas_emt.length+" líneas");
			motor();
			timer = setInterval(motor, 10000);
		}
	});
};

function getUbicaciones(codLinea){
	$.getJSON({
		url:'/rutpam/index.php/proxy/emt-core/services/buses/?codLinea='+codLinea
	}).done(function (response, status){
		if(status === "success"){
			log("L"+codLinea+":"+response.length);
			for(var x = 0; x < response.length; x++){
				setTimeout(postUbicacion, x*200, response[x]);
			}
		}		
	});
};

function getListUbicaciones(codLinea){
	$.getJSON({
		url:'/rutpam/index.php/proxy/emt-core/services/buses/?codLinea='+codLinea
	}).done(function (response, status){
		if(status === "success"){
			log("L"+codLinea+":"+response.length);
			while(response.length > 0){
				ubicaciones.push(response.shift());
			}
		}		
	}).always(function(){
		waiting--;
		if(waiting === 0){
			postUbicaciones(ubicaciones);
		}
	});
}

function postUbicacion(ubicacion){
	var var_data = {
		token: tokenKey,
		codBus: ubicacion.codBus,
		codLinea: ubicacion.codLinea,
		codParIni: ubicacion.codParIni,
		latitud: ubicacion.latitud,
		longitud: ubicacion.longitud,
		sentido: ubicacion.sentido
	};
	$.post({
		url: "/rutpam/index.php/api/ingest/addUbicacion",
		data: var_data
	}).done(function(response, status){
		if(status === "success"){log("L"+var_data.codLinea+"/C"+var_data.codBus);}
	});
};

function postUbicaciones(ubicaciones){
	$.post({
		url: "/rutpam/index.php/api/ingest/addUbicaciones",
		data: {token: tokenKey, data: JSON.stringify(ubicaciones)}
	}).done(function(response, status){
		if(status === "success"){log("Enviadas "+ubicaciones.length+" ubicaciones");}
	});
}

function log(texto){
	var elemento = $("<div>",{"text": texto});
	$("#log").prepend(elemento);
}

function clearlog(){
	$("#log").empty();
}

function stop(){
	clearInterval(timer);
}
