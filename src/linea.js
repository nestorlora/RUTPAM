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
}
