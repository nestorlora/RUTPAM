/**
 * @file Clase Core de RUTPAM
 * @version v5.0
 * @author Néstor Manuel Lora Romero <nestorlora@geeklab.es>
 * @copyright Geeklab - Néstor Manuel Lora Romero 2018-2019
 * @license MIT
 */

'use strict';

/**
 * @class UI
 * @description Clase Interfaz de Usuario; almacena las fuciones, constantes, variables y objetos relativas a la interfaz de usuario
 * @since v5.0
 */
class UI {
    show = {
        emt: false,
        ctan: false,
        metro: false,
        renfe: false
    };
    textos = {
        ayuda: '<h4>Controles</h4>\n\
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
            <span class="fa-layers fa-2x"><i class="fas fa-circle" style="color:'+new Parametros().colores.emtA+'"></i></span> Líneas convencionales<br>\n\
            <span class="fa-layers fa-2x"><i class="fas fa-circle" style="color:'+new Parametros().colores.emtC+'"></i></span> Líneas circulares EMT<br>\n\
            <span class="fa-layers fa-2x"><i class="fas fa-circle" style="color:'+new Parametros().colores.emtN+'"></i></span> Líneas nocturnas<br>\n\
            </p>\n\
            <h5>Líneas Interurbanas</h5>\n\
            <p>\n\
            <span class="fa-layers fa-2x"><i class="fas fa-circle" style="color:'+new Parametros().colores.ctmamA+'"></i></span> Líneas convencionales<br>\n\
            <span class="fa-layers fa-2x"><i class="fas fa-circle" style="color:'+new Parametros().colores.ctmamN+'"></i></span> Líneas búho<br>\n\
            <span class="fa-layers fa-2x"><i class="fas fa-circle" style="color:'+new Parametros().colores.ctmamT+'"></i></span> Líneas estacionales<br>\n\
            </p>\n\
            <h5>Líneas Especiales</h5>\n\
            <p>\n\
            <span class="fa-layers fa-2x"><i class="fas fa-circle" style="color:'+new Parametros().colores.especial+'"></i></span> Líneas especiales/Servicios especiales<br>\n\
            <span class="fa-layers fa-2x"><i class="fas fa-circle" style="color:'+new Parametros().colores.express+'"></i></span> Líneas express<br>\n\
            <span class="fa-layers fa-2x"><i class="fas fa-circle" style="color:'+new Parametros().colores.lanzaderas+'"></i></span> Líneas lanzadera<br>\n\
            </p>\n\
            <h5>Líneas de Metro/Ferrocarril</h5>\n\
            <p>\n\
            <span class="fa-layers fa-2x"><i class="fas fa-circle" style="color:'+new Parametros().colores.renfeA+'"></i></span> Renfe  Cercanías/Regional/Media Distancia<br>\n\
            <span class="fa-layers fa-2x"><i class="fas fa-circle" style="color:'+new Parametros().colores.metro+'"></i></span> Metro Málaga<br>\n\
            </p>\n\
            <h4>Información de líneas</h4>\n\
            <p>Las paradas pertenecen o bien a la EMT o bien al consorcio por lo que aparecen como EMT-XXXX o CTAN-XXXX y EXXXX o CXXXX en las versiones cortas</p>\n\
            <p>En proceso...</p>\n\
            <h4>Información de paradas</h4>\n\
            <p>En proceso...</p>\n\
            <h4>Información de vehículos</h4>\n\
            <p>Los marcadores de cada vehículo muestran su código, la línea que están sirviendo, el destino y, si es posible, la última parada realizada. En los vehículos de la EMT también hay un enlace a Busca Bus para consultar la información relativa al vehículo<br>\n\
            Bus, Línea, Última Parada Realizada, Sentido, link a BuscaBus</p>',
        copyright: 'R.U.T.P.A.M. v'+new Parametros().version+'<br>\n\
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
            Consulta el repositorio en <a href="https://github.com/nestorlora/RUTPAM">Github<i class="fab fa-github fa-fw" style="color: indigo"></i></a>'
    };
    action = {
        closeWindow: function(){
            $("#ventana").hide();
        },
        clearInfo: function(){
            $("#infoContent").empty();
        }
    };
    init = {
        controles: function(){
            let div = $("<div>");
            let titulo = $("<h2>", {"text":"RUTPAM"});
            let descripcion = $("<p>", {"text":"Información de transportes metropolitanos del área de Málaga"});
            let loader = $("<p>", {"id": "loader", "text": "Todavía cargando datos..."}).css("color", "white").css("background-color", "red");
            $(div).append(titulo).append(descripcion).append(loader);
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
            $(div).append(controles);
            /*var tiempoDatos = $("<p>", {id: "tiempoDatos", text: "Datos actualizados: "});
            $(div).append(tiempoDatos);*/
            let tablaEmt = $("<table>", {"id": "tablaLineasEMT"}).css("display", "none");
            let encabezadoEmt = $("<tr>");
            $(encabezadoEmt).html('<th>Ida</th><th>Vta</th><th>Bus</th><th colspan="2">Línea</th><th>NºB.</th>');
            $(tablaEmt).append(encabezadoEmt);
            $(div).append(tablaEmt);
            let tablaCtan = $("<table>", {"id": "tablaLineasCTAN"}).css("display", "none");
            let encabezadoCtan = $("<tr>");
            $(encabezadoCtan).html('<th>Ida</th><th>Vta</th><th colspan="2">Línea</th>');
            $(tablaCtan).append(encabezadoCtan);
            $(div).append(tablaCtan);
            let tablaMetro = $("<table>", {"id": "tablaLineasMetro"}).css("display", "none");
            let encabezadoMetro = $("<tr>");
            $(encabezadoMetro).html('<th></th><th colspan="2">Línea</th>');
            $(tablaMetro).append(encabezadoMetro);
            $(div).append(tablaMetro);
            let tablaRenfe = $("<table>", {"id": "tablaLineasRenfe"}).css("display", "none");
            let encabezadoRenfe = $("<tr>");
            $(encabezadoRenfe).html('<th></th><th colspan="2">Línea</th>');
            $(tablaRenfe).append(encabezadoRenfe);
            $(div).append(tablaRenfe);
            $(div).append('<br><small><a href="#!" onclick="verCopyright()">Acerca de RUTPAM</a></small>');
            $(div).append('<br><small><a href="#!" onclick="verAyuda()">Ayuda</a></small>');

            $("#control").html(div);
        },
        mapa: function(){
            let osmUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'; // URL del servidor cartográfico
            let osm = new L.TileLayer(osmUrl); // Creamos la capa de cartografía
            core.map = L.map('map', {
                center: [36.7121977, -4.4370495], // Centro del mapa sobre málaga
                zoom: 13, // Nivel de zoom para ver todo el área metropolitana
                closePopupOnClick: false, // Deshabilitamos que los popups se cierren al hacer click en cualquier otro sitio fuera
                layers: osm, // Añadimos la capa de cartografía
                attributionControl: false // Deshabilitamos el footer de copyright porque ya tenemos una ventana para ello
            });
        },
        teclas: function(){
            document.addEventListener('keydown', function(k){
                switch(k.key){
                    case "Escape":
                        core.ui.action.closeWindow();
                        break;
                    case "Backspace":
                        for(var a = 0; a < core.lineas.length; a++){ // Para todas las líneas
                            if(core.lineas[a].trazadoIda !== null){ // Si está cargado su trazado
                                hideTrazado(core.lineas[a].id, 1);
                            }
                            if(core.lineas[a].trazadoVuelta !== null){
                                hideTrazado(core.lineas[a].id, 2);
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
    };
}