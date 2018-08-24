<!--
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
-->
<head>
	<link rel="shorcut icon" type="image/png" href="./assets/favicon.png">
	<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Rubik">
	<link rel="stylesheet" href="assets/leaflet.css"/>
	<script src="assets/leaflet.js"></script>
	<script src="https://code.jquery.com/jquery-3.3.1.min.js" integrity="sha256-FgpCb/KJQlLNfOu91ta32o/NMZxltwRo8QtmkMRdAu8=" crossorigin="anonymous"></script>
    <script defer src="https://use.fontawesome.com/releases/v5.0.11/js/all.js"></script>
	<link rel="stylesheet" href="./assets/styles.css">
	<meta name="viewport" content="initial-scale=1.0">
    <meta charset="utf-8">
</head>
<body>
<div id="map"></div>
<div id="ventana" class="cuadroFlotante panelInfo">
	<button class="botonCierre" onclick="closeInfo();">&#x274C;</button> 
	<div id="infoContent"></div>
</div>
<div id="lineas" class="cuadroFlotante panelLineas"></div>
<script>
var site_url = '/RUTPAM';
var url_white_icon = site_url+'/assets/img/white_bus.png';
var url_red_icon = site_url+'/assets/img/red_bus.png';
var url_orange_icon = site_url+'/assets/img/orange_bus.png';
var emt_proxy_url = '/proxy/emt-core';
var refresh_rate = 1;
var ttl_rate_default = 60;
var ttl_rate_new = ttl_rate_default+30;
var ttl_rate_old = ttl_rate_default-15;
</script>
<script src="./assets/rutpam.js"></script>
</body>
