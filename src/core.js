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
        this.ui = new UI();
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
