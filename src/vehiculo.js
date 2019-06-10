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
    nuevoEmt(respuesta){
        this.id = respuesta.codBus;
        this.linea = respuesta.codLinea;
        this.sentido = respuesta.sentido;
        this.paradaInicio = respuesta.codParIni;
        this.posicion = new LatLong(respuesta.latitud, respuesta.longitud);
        this.marker = L.marker(this.posicion, {
            icon: busIconContent(this, 1)
        });
        this.popup = L.popup({
            autoPan: false,
            autoClose: false
        }).setContent(busPopupContent(this));
        this.marker.bindPopup(this.popup);
        this.red = core.red.emt;
    }
    refrescarEmt(bus){
        let posicion = new LatLong(bus.latitud, bus.longitud);
        if(!this.marker.getLatLng().equals(posicion)){
            this.marker.setLatLng(posicion)
            this.posicion = posicion;
        }
        this.linea = bus.codLinea;
        this.sentido = bus.sentido;
        this.paradaInicio = bus.codParIni
        this.popup.setContent(busPopupContent(this));

        if(core.lineas.buscar(this.linea).estado.getBuses){
            this.marker.addTo(core.map);
        }
        if(this.ttl < core.ttl.default){
            this.ttl = core.ttl.default;
            this.marker.setIcon(busIconContent(this, 0));
        }
    }
}
