/**
 * @file Clase Core de RUTPAM
 * @version v5.0
 * @author Néstor Manuel Lora Romero <nestorlora@geeklab.es>
 * @copyright Geeklab - Néstor Manuel Lora Romero 2018-2019
 * @license MIT
 */

'use strict';



/**
 * @class Core
 * @description Núcleo de la aplicación; almacena las constantes, variables y objetos globales; así como funciones generales.
 * @since v5.0
 * @property {string}   version     Versión de RUTPAM
 * @property {enum}     colores     Colores estándar de las redes y sus elementos
 * @property {enum}     ttl         Time-to-live estándar de los vehículos
 */
class Core {
    constructor(){
        // PARÁMETROS

        this.version = new Parametros().version;
        this.colores = new Parametros().colores;
        this.ttl = new Parametros().ttl;
        this.url = new Parametros().url;
        this.red = new Parametros().red;

        // Variables
        this.timer = undefined;
        this.map = undefined;
        this.lineasCargadas = 0;
        this.paradasInicializadas = false;
        this.modos = new Listado();
        this.zonas = new Listado();
        this.lineas = new Listado();
        this.paradas = new Listado();
        this.vehiculos = new Listado();
        // Interfaz
        this.ui = {
            // Variables
            show: {
                emt: false,
                ctan: false,
                metro: false,
                renfe: false
            },

            // Textos
            textos: {
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
                    <span class="fa-layers fa-2x"><i class="fas fa-circle" style="color:'+this.colores.emtA+'"></i></span> Líneas convencionales<br>\n\
                    <span class="fa-layers fa-2x"><i class="fas fa-circle" style="color:'+this.colores.emtC+'"></i></span> Líneas circulares EMT<br>\n\
                    <span class="fa-layers fa-2x"><i class="fas fa-circle" style="color:'+this.colores.emtN+'"></i></span> Líneas nocturnas<br>\n\
                    </p>\n\
                    <h5>Líneas Interurbanas</h5>\n\
                    <p>\n\
                    <span class="fa-layers fa-2x"><i class="fas fa-circle" style="color:'+this.colores.ctmamA+'"></i></span> Líneas convencionales<br>\n\
                    <span class="fa-layers fa-2x"><i class="fas fa-circle" style="color:'+this.colores.ctmamN+'"></i></span> Líneas búho<br>\n\
                    <span class="fa-layers fa-2x"><i class="fas fa-circle" style="color:'+this.colores.ctmamT+'"></i></span> Líneas estacionales<br>\n\
                    </p>\n\
                    <h5>Líneas Especiales</h5>\n\
                    <p>\n\
                    <span class="fa-layers fa-2x"><i class="fas fa-circle" style="color:'+this.colores.especial+'"></i></span> Líneas especiales/Servicios especiales<br>\n\
                    <span class="fa-layers fa-2x"><i class="fas fa-circle" style="color:'+this.colores.express+'"></i></span> Líneas express<br>\n\
                    <span class="fa-layers fa-2x"><i class="fas fa-circle" style="color:'+this.colores.lanzaderas+'"></i></span> Líneas lanzadera<br>\n\
                    </p>\n\
                    <h5>Líneas de Metro/Ferrocarril</h5>\n\
                    <p>\n\
                    <span class="fa-layers fa-2x"><i class="fas fa-circle" style="color:'+this.colores.renfeA+'"></i></span> Renfe  Cercanías/Regional/Media Distancia<br>\n\
                    <span class="fa-layers fa-2x"><i class="fas fa-circle" style="color:'+this.colores.metro+'"></i></span> Metro Málaga<br>\n\
                    </p>\n\
                    <h4>Información de líneas</h4>\n\
                    <p>Las paradas pertenecen o bien a la EMT o bien al consorcio por lo que aparecen como EMT-XXXX o CTAN-XXXX y EXXXX o CXXXX en las versiones cortas</p>\n\
                    <p>En proceso...</p>\n\
                    <h4>Información de paradas</h4>\n\
                    <p>En proceso...</p>\n\
                    <h4>Información de vehículos</h4>\n\
                    <p>Los marcadores de cada vehículo muestran su código, la línea que están sirviendo, el destino y, si es posible, la última parada realizada. En los vehículos de la EMT también hay un enlace a Busca Bus para consultar la información relativa al vehículo<br>\n\
                    Bus, Línea, Última Parada Realizada, Sentido, link a BuscaBus</p>',
                copyright: 'R.U.T.P.A.M. v'+this.version+'<br>\n\
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
            },
            // Funciones
            action: {
                closeWindow: function(){
                    $("#ventana").hide();
                },
                clearInfo: function(){
                    $("#infoContent").empty();
                }
            },
            // Inicializadores
            init: {
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
                }
            }
        }
    }
    // Ingest de datos
    getZonas(){
        $.getJSON({
            url: this.url.ctan+'/zonas?lang=ES'
        }).done(function(response, status){
            if(status === "success"){
                response = response.zonas;
                for(let i = 0; i<response.length; i++){
                    let zona = new Zona();
                    zona.id = response[i].idZona;
                    zona.nombre = response[i].nombre;
                    zona.color = response[i].color;
                    core.zonas.push(zona);
                }
            }
        }).fail(function(response, status, error){
            if(error === "Bad Request"){
                core.getZonas();
            }else{
                throw {response, status, error};
            }
        });
    }
    getModos(){
        // Petición AJAX
        $.getJSON({
            url: core.url.ctan+'/modostransporte?lang=ES'
        }).done(function (response, status){
            if(status === "success"){
                response = response.modosTransporte;
                for(let i = 0; i<response.length; i++){
                    let modo = new Modo();
                    modo.id = parseInt(response[i].idModo);
                    modo.descripcion = response[i].descripcion;
                    core.modos.push(modo);
                }
            }
        }).fail(function(response, status, error){
            if(error === "Bad Request"){
                core.getModos();
            }else{
                throw {response, status, error};
            }
        });  
    }
}
