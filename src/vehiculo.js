/**
 * @file Clase Vehiculo de RUTPAM
 * @version v5.0
 * @author Néstor Manuel Lora Romero <nestorlora@geeklab.es>
 * @copyright Geeklab - Néstor Manuel Lora Romero 2018-2019
 * @license MIT
 */

'use strict';

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
        this.red = undefined;
    }
}
