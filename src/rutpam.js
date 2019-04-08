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

class Rutpam {
    constructor(){
        this.version = rutpam_version;
        this.timer = undefined;
        this.map = undefined;
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
        this.ui = {
            show: {
                emt: false,
                ctan: false,
                metro: false,
                renfe: false
            }
        }
        this.url = {
            site: site_url,
            emt: emt_url,
            betteremt: betteremt_url,
            ctan: ctan_url,
            odm: odm_url
        }
        this.lineasCargadas = 0;
        this.paradasInicializadas = false;
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
        this.ttl = new Rutpam().ttl.new;
    }
}

class RelacionParadas {
    constructor(id, orden){
        this.id = id;
        this.orden = orden;
    }
}

class Servicios {
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
    // TO DO: Sort function
}

class LatLong {
    constructor(lat, lon){
        this.lat = lat;
        this.lng = lon;
    }
}
