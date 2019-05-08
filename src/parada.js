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
        this.red = undefined;
    }
    inicializar(){
        this.marker = L.marker((this.ubicacion), {icon: this.generarIconMap()});
        this.popup = L.popup({autoPan: false, autoClose: false}).setContent(this.generarPopup());
        this.marker.bindPopup(this.popup);
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
    generarIconMap(){
        if(this.red === core.red.emt){
            return L.divIcon({
                className: 'marker paradaE',
                iconSize: [36, 15],
                iconAnchor: [18, 7],
                popupAnchor: [0, -7],
                html: this.normalizaId()
            }); 
        }else{
            return L.divIcon({
                className: 'marker paradaC',
                iconSize: [36, 15],
                iconAnchor: [60, 10],
                popupAnchor: [-42, -10],
                html: this.normalizaId()
            });
        }
    }
    generarPopup(){
        let div = $("<div>");
        $(div).append($("<h3>", {text: "Parada "+this.id}).css("text-align", "center"));
        $(div).append($("<h4>", {text: this.nombre}).css("text-align", "center"));
        let tabla = $("<table>");
        /*var cabecera = $("<tr>");
        $(cabecera).append($("<th>", {text: "Servicios"}).prop("colspan", /*3 2));
        $(tabla).append(cabecera);*/
        for(let a = 0; a < this.servicios.length; a++){
            let linea = core.lineas.buscar(this.servicios[a].linea);
            let sentido;
            switch (this.servicios[a].sentido){
                case 1:
                    sentido = linea.cabeceraVuelta;
                    break;
                case 2:
                    sentido = linea.cabeceraIda;
                    break;
                default:
                    sentido = "-";
                    break;
            }
            let fila = $("<tr>");
            $(fila).append($("<td>", {html: linea.generarIcon(2)}));
            $(fila).append($("<td>", {text: sentido}));
            //fila.append($("<td>", {text: "??? min."}).css("text-align", "right"));
            $(tabla).append(fila);
        }
        $(div).append(tabla);
        return $(div).html();
    }
}
