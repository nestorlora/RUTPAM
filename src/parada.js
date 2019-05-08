/**
 * @file Clase Parada de RUTPAM
 * @version v5.0
 * @author Néstor Manuel Lora Romero <nestorlora@geeklab.es>
 * @copyright Geeklab - Néstor Manuel Lora Romero 2018-2019
 * @license MIT
 */

'use strict';

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
    inicializar(){
        this.marker = L.marker((this.ubicacion), {icon: paradaIconContent(this.id)});
        this.popup = L.popup({autoPan: false, autoClose: false}).setContent(paradaPopupContent(this.id));
        this.marker.bindPopup(this.popup);
    }
}
