/**
 * @file Clase Linea de RUTPAM
 * @version v5.0
 * @author Néstor Manuel Lora Romero <nestorlora@geeklab.es>
 * @copyright Geeklab - Néstor Manuel Lora Romero 2018-2019
 * @license MIT
 */

'use strict';

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
        this.red = undefined;
    }
    distanciaTrazado(selector){
        if((selector === 1||selector === 2)&&this.estado.getIda){
            let distancia = 0;
            let trazado = selector===1?this.trazadoIda:this.trazadoVuelta;
            for(let pos = 1; pos < trazado.getLatLngs().length; pos++){
                distancia = distancia + core.map.distance(trazado.getLatLngs()[pos-1], trazado.getLatLngs()[pos]);
            }
            return distancia;
        }else{
            return null;
        }
    }
    normalizaId(){
        switch(this.red){
            case core.red.emt:
                return this.id.replace(/^EMT-/, "");
            case core.red.ctan:
                return this.id.replace(/^CTAN-/, "");
            case core.red.metro:
                return this.id.replace(/^CTAN-/, "");
            case core.red.renfe:
                return this.id.replace(/^CTAN-/, "");
            default:
                throw("normalizarId() red no definida");
        }
    }
}
