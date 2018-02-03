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

var timer;
var map;
var default_ttl = 10; //Número de actualizaciones fallidas sin aparecer para darlo por muerto
var lineas_emt;
var autobuses = [];
/* autobuses[].codBus
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
	
	var lineasLayer = ControlLineas($("<div>"));
	lineasLayer.index = 1;
	map.controls[google.maps.ControlPosition.TOP_LEFT].push(lineasLayer[0]);
	
	//getLineas();
}

function getLineas(){
	$.getJSON({
		url: '/rutpam/index.php/proxy/emt-core/services/lineas/'
	}).done(function (response, status){
		if(status === "success"){
			lineas_emt = response;
			motor();
			timer = setInterval(motor, 3000);
		}
	});
};

function motor(){
	for(var y = 0; y < lineas_emt.length; y++){
		setTimeout(getUbicaciones, y*30, lineas_emt[y].codLinea);
	}
	reducirTTL();
}

function stop(){
	clearInterval(timer);
}

function getUbicaciones(codLinea){
	$.getJSON({
		url:'/rutpam/index.php/proxy/emt-core/services/buses/?codLinea='+codLinea
	}).done(function (response, status){
		if(status === "success"){
			for(var x = 0; x < response.length; x++){
				var coordenadas = {lat: response[x].latitud , lng: response[x].longitud};
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

function reducirTTL(){
	var pos = 0;
	while(pos < autobuses.length){
		autobuses[pos].ttl--;
		if(autobuses[pos].ttl <= 0){
			console.log("DROP "+autobuses[pos].codBus);
			autobuses[pos].marker.setMap(null);
			autobuses.splice(pos, 1);
		}
		pos++;
	}
}

function addBus(Bus){
	console.log("ADDED "+Bus.codBus);
	var coordenadas = {lat: Bus.latitud , lng: Bus.longitud};
	var data = {
		marker: new google.maps.Marker({
			position: coordenadas,
			map: map,
			icon: '/rutpam/assets/ico_bus.png'
		}),
		infoWindow: new google.maps.InfoWindow({
			content:
				"codBus: "+Bus.codBus+"<br>"+
				"codLinea: "+Bus.codLinea+"<br>"+
				"codParIni: "+Bus.codParIni+"<br>"+
				"sentido: "+Bus.sentido
		}),
		codBus: Bus.codBus,
		ttl: default_ttl
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
	autobuses[pos].ttl = default_ttl;
}

function ControlLineas(mapDiv){
	var titulo = $("<div>", {
		"id": "layer"
		}).append(
		$("<p>").append($("<b>", {
			"text": "RUTPAM"
		})).append(
		$("<p>", {
			"text": "Seguimiento buses EMT en tiempo real"
	})));
	$(mapDiv).append(titulo);
	return mapDiv;
}
