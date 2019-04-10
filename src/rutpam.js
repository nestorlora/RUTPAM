/**
 * @copyright
 * The MIT License
 *
 * Copyright 2019 Nestor Manuel Lora Romero <nestorlora@geeklab.es>.
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
'use strict';

const rutpam_version = "5.0 @Dev";
const site_url = '/RUTPAM';
const emt_url = '/proxy/emt-core';
const betteremt_url = 'https://betteremt.edufdezsoy.es/api';
const ctan_url = 'http://api.ctan.es/v1/Consorcios/4';
const odm_url = 'https://datosabiertos.malaga.eu/api/3/action/';
const refresh_rate = 3; // Periodo entre refrescos (s)
const ttl_rate_default = 60; // TTL por defecto (en refrescos)

class Core {
    constructor(){
        // Parámetros
        this.version = rutpam_version;
        this.colores = {
            // EMT SAM + Urbanos Consorcio
            emtA: "#1E3180", // Primario, lineas regulares, sentido ida
            emtB: "#4876FE", // Secundario, sentido vuelta
            emtC: "#F77F00", // Circulares
            emtN: "#04141F", // Nocturnos
            // Consorcio de Transportes
            ctmamA: "#009639", // Oficial Primario, líneas regulares, sentido ida
            ctmamB: "#11B237", // sentido vuelta
            ctmamN: "#006983", // lineas buho
            ctmamT: "#E4D77E", // Oficial Secundario, líneas estacionales
            //ctmamU: "#E4D77E", // líneas universitarias
            //ctmamV: "#71A9F7", // líneas de verano
            // Renfe Operadora
            renfeA: "#8A0072", // Oficial general
            renfeB: "#EF3340", // Oficial cercanías
            // Metro Málaga
            metro: "#DC241F", // "Oficial"
            // Lineas especiales
            especial: "#FCCC0A", // Líneas y servicios especiales
            express: "#996633", // Servicios exprés
            lanzaderas: "#808183" // Lanzadera
        };
        this.ttl = {
            default: ttl_rate_default/refresh_rate,
            new: (ttl_rate_default+10)/refresh_rate,
            old: (ttl_rate_default-15)/refresh_rate
        }
        this.url = {
            site: site_url,
            emt: emt_url,
            betteremt: betteremt_url,
            ctan: ctan_url,
            odm: odm_url
        }
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

class Modo {
    constructor(){
        this.id = new Number();
        this.descripcion = new String();
    }
}

class Zona {
    constructor(){
        this.id = new String();
        this.nombre = new String;
        this.color = new String();
    }
}

class Linea {
    constructor(){
        this.id = undefined;
        this.codigo = undefined;
        this.nombre = undefined;
        this.tieneIda = undefined;
        this.tieneVuelta = undefined;
        this.esCircular = undefined;
        this.cabeceraIda = undefined;
        this.cabeceraVuelta = undefined;
        this.paradasIda = new ListadoOrdenado();
        this.paradasVuelta = new ListadoOrdenado();
        this.trazadoIda = undefined;
        this.trazadoVuelta = undefined;
        this.estado = {
            getBuses: undefined, // Mostrar los buses en el mapa
            getIda: undefined, // Trazado de ida obtenido
            getVuelta: undefined, // Trazado de vuelta obtenido
            verParadas: undefined, // Mostrar las paradas en el mapa
        };
        this.numVehiculos = undefined;
        this.modo = undefined;
        this.operadores = undefined;
        this.hayNoticia = undefined;
        //TO DO this.red = undefined; // 0 EMT 1 CTMAM
    }
};

class Parada {
    constructor(){
        this.id = undefined;
        this.nombre = undefined;
        this.direccion = undefined;
        this.nucleo = undefined;
        this.zona = undefined;
        this.servicios = new Array();
        this.ubicacion = new LatLong();
        this.modos = new Array(); // No utilizado
        this.marker = null;
        this.popup = null;
        this.vistas = 0;
        // TO DO this.red = undefined; // 0 EMT 1 CTMAM
    }
}

class Vehiculo {
    constructor(){
        this.id = undefined;
        this.linea = undefined;
        this.sentido = undefined;
        this.paradaInicio = undefined;
        this.posicion = new LatLong();
        this.marker = null;
        this.popup = null;
        this.ttl = new Core().ttl.new;
        // TO DO this.red = undefined; // 0 EMT 1 CTMAM
    }
}

class RelacionParadas {
    constructor(id, orden){
        this.id = id;
        this.orden = orden;
    }
}

class Servicio {
    constructor(){
        this.linea = undefined;
        this.sentido = undefined;
        //this.espera = undefined;
    }
}

/**
 * @name Listado
 * @classdesc Listado de elementos con ID
 * @class
 */
class Listado extends Array {
    /**
     * @method
     * @name buscar
     * @description Devuelve el primer elemento del listado cuyo campo id sea igual al proporcionado
     * @param {String} id
     * @returns {Object} Objeto con el id, si lo hay
     */
    buscar(id){
        return this.find(obj => obj.id === id);
        // TO DO throw not found
    }
    push(obj){
        if(obj instanceof Modo||obj instanceof Zona||obj instanceof Linea||obj instanceof Parada||obj instanceof Vehiculo){
            return super.push(obj);
        }else{
            throw obj;
        }
    }
}

class ListadoOrdenado extends Array {
    push(obj){
        if(obj instanceof RelacionParadas){
            return super.push(obj);
        }else{
            throw obj;
        }
    }
    // TO DO: Verificación de que no contiene ya ese ID
    // TO DO: Sort function
}

class LatLong {
    constructor(lat, lon){
        this.lat = lat;
        this.lng = lon;
    }
}
