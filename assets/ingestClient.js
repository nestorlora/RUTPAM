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

var lineas_emt = new Array();
	var timer;
	
	$(document).ready(function (){
		var elemento = $("<div>",{"text": "Solicitando líneas..."});
		$("#log").prepend(elemento);
		pedirLineas();
	});
	
	function engine(){
		$("#log").empty();
		for(var y = 0; y < lineas_emt.length; y++){
			setTimeout(pedirUbicaciones, y*150, lineas_emt[y].codLinea);
		}
	}
	
	function pedirLineas(){
		$.ajax({
		type: 'GET',
		url: '/rutpam/index.php/proxy/emt-core/services/lineas/',
		dataType: 'json',
		success: function (response){
			lineas_emt = response;
			var elemento = $("<div>",{"text": "Obtenidas "+lineas_emt.length+" líneas"});
			$("#log").prepend(elemento);
			engine();
			timer = setInterval(engine, 10000);
			},
		failure: function (response){
			console.log(response);
			}
		});
	};
	
	function pedirUbicaciones(codLinea){
		$.ajax({
			type: 'GET',
			url: '/rutpam/index.php/proxy/emt-core/services/buses/?codLinea='+codLinea,
			dataType: 'json',
			success: function (response){
				var elemento = $("<div>",{"text": "Obtenidas "+response.length+" ubicaciones en línea "+codLinea});
				$("#log").prepend(elemento);
				for(var x = 0; x < response.length; x++){
					setTimeout(enviarUbicaciones, x*200, response[x]);
				}
			},
			failure: function (response){
				console.log(response);
			}
		});
	};
	
	function enviarUbicaciones(ubicacion){
		var var_data = {
			token: 0,
			codBus: ubicacion.codBus,
			codLinea: ubicacion.codLinea,
			codParIni: ubicacion.codParIni,
			latitud: ubicacion.latitud,
			longitud: ubicacion.longitud,
			sentido: ubicacion.sentido
		};
		$.ajax({
			method: 'POST',
			url: "/rutpam/index.php/api/ingest/addUbicacion",
			data: var_data,
		}).done(function(response, status){
			if(status === "success"){$("#log").prepend($("<div>",{"text": "Enviada ubicación L"+var_data.codLinea+"/C"+var_data.codBus}));}
		});
	};
