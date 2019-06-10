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
    generarIconMap(estado){
        let linea = core.lineas.buscar(this.linea);
        let codigo = this.id.replace(/^EMT-|^CTAN-/,"");
        let html = linea.codigo+"<br>"+codigo;
        let clase;
        switch (this.sentido){
            case 1:
                clase = 'marker ida';
                break;
            case 2:
                if(linea.tieneVuelta){
                    clase = 'marker vta';
                }else{
                    clase = 'marker ida';
                }
                break;
            default:
                clase = 'marker desconocido';
                break;
        }
        switch (estado){
            case 1:
                clase += ' bus-new';
                break;
            case 2:
                clase += ' bus-lost';
                break;
            default:
                clase += ' bus-normal';
                break;
        }
        return L.divIcon({
            className: clase,
            iconSize: [32, 30],
            iconAnchor: [0, 0],
            popupAnchor: [16, 0],
            html: html
        });
    }
    generarPopup(){
        let linea = core.lineas.buscar(this.linea);
        let codigo = this.id.replace(/^EMT-|^CTAN-/,"");
        let sentido;
        switch(this.sentido){
            case 1: // Ida
                sentido = linea.cabeceraVuelta;
                break;
            case 2: // Vuelta
                sentido = linea.cabeceraIda;
                break;
            default:
                sentido = "¿? Desconocido ("+this.sentido+") ¿?";
        }
        let parada = core.paradas.buscar(this.paradaInicio);
        let textoParada;
        if(parada !== undefined){
            textoParada = "Ult. Par. Realizada: <b>"+this.paradaInicio+"<br>"+parada.nombre+"</b>";
        }else{
            textoParada = "Ult. Par. Realizada: <b>"+this.paradaInicio+"</b>";
        }
        return "Bus: <b>"+this.id+"</b>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbspLínea: <b>"+linea.codigo+"</b><br>"+
        textoParada+"<br>"+
        "Sentido: <b>"+sentido+"</b><br>"+
        "<a href='http://buscabus.tk/bus/?bus="+codigo+"' target='_blank'>Ver en BuscaBus</a>";
    }
    nuevoEmt(respuesta){
        this.id = respuesta.codBus;
        this.linea = respuesta.codLinea;
        this.sentido = respuesta.sentido;
        this.paradaInicio = respuesta.codParIni;
        this.posicion = new LatLong(respuesta.latitud, respuesta.longitud);
        this.marker = L.marker(this.posicion, {
            icon: this.generarIconMap(1)
        });
        this.popup = L.popup({
            autoPan: false,
            autoClose: false
        }).setContent(this.generarPopup());
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
        this.popup.setContent(this.generarPopup());

        if(core.lineas.buscar(this.linea).estado.getBuses){
            this.marker.addTo(core.map);
        }
        if(this.ttl < core.ttl.default){
            this.ttl = core.ttl.default;
            this.marker.setIcon(this.generarIconMap());
        }
    }
}
