<?php

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
?>
<head>
    <title>RUTPAM v3.1</title>
	<script src="https://code.jquery.com/jquery-3.3.1.min.js" integrity="sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8=" crossorigin="anonymous"></script>
    <script defer src="https://use.fontawesome.com/releases/v5.0.6/js/all.js"></script>
	<meta name="viewport" content="initial-scale=1.0">
    <meta charset="utf-8">
	<link rel="stylesheet" href="./assets/styles.css">
</head>
<body>
<div id="wrapper">
	<div id="map">Aquí debería ir el mapa</div>
	<div id="over_map">
		<span class="padding">
			<b>RUTPAM</b> Seguimiento buses EMT en tiempo real
		</span>
	</div>
</div>
<script>
var base_url = 'http://localhost';
var site_url = base_url+'/rutpam';
var url_white_icon = site_url+'/assets/img/white_bus.png';
var url_red_icon = site_url+'/assets/img/red_bus.png';
var url_orange_icon = site_url+'/assets/img/orange_bus.png';
var emt_proxy_url = base_url+'/proxy/emt-core';
var refresh_rate = 1;
var ttl_rate_default = 60;
var ttl_rate_new = ttl_rate_default+30;
var ttl_rate_old = ttl_rate_default-15;
</script>
<script src="./assets/realTimeMapaUbicaciones.js"></script>
<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyCPD4goi4Rqi6ZfeoaMyD_7LNYoW7fXn2A&callback=initMap"
async defer></script>
</body>
