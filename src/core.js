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
    getLineasEmt(){
        //$("#getLineas").remove(); // Eliminamos el botón para pedir las líneas
        // Petición AJAX
        $.getJSON({
            url: core.url.emt+'/services/lineas/'
        }).done(function (response, status){
            if(status === "success"){
                for(let i = 0; i<response.length; i++){
                    let datos = response[i];
                    // Creamos la línea e introducimos sus datos
                    let linea = new Linea();
                    linea.nuevaEmt(datos);
                    // Paradas
                    for(let a = 0; a < datos.paradas.length; a++){
                        addParadaEmt(datos.paradas[a].parada, linea.id, datos.paradas[a].sentido);
                        let relacion = new RelacionParadas(
                            "EMT-"+datos.paradas[a].parada.codParada,
                            datos.paradas[a].orden
                        );
                        if(datos.paradas[a].sentido === 1){
                            linea.paradasIda.push(relacion);
                        }else if(datos.paradas[a].sentido === 2){
                            linea.paradasVuelta.push(relacion);
                        }
                    }
                    // TODO Implementar en clase Línea
                    // Arreglos de direcciones y destinos
                    if(linea.paradasIda.length > 1){
                        linea.tieneIda = true;
                    }
                    if(linea.paradasVuelta.length > 1){
                        linea.tieneVuelta = true;
                    }else{
                        linea.tieneVuelta = false;
                        linea.esCircular = true;
                        linea.cabeceraIda = "Circular";
                        linea.cabeceraVuelta = "Circular";
                    }
                    // TODO Implementar en clase Línea
                    // Corrección en orden de paradas
                    let maxIda = linea.paradasIda.length;
                    for(let x = 0; x < linea.paradasVuelta.length; x++){
                        linea.paradasVuelta[x].orden -= maxIda;
                    }
                    // TODO Implementar en clase Línea
                    // Corrección en cabeceras si tiene vuelta
                    if(linea.tieneVuelta){
                        linea.paradasIda.push(new RelacionParadas(linea.paradasVuelta[0].id,linea.paradasIda.length));
                        linea.paradasVuelta.push(new RelacionParadas(linea.paradasIda[0].id,linea.paradasVuelta.length));
                    }
                    core.lineas.push(linea);
                    //getTrazados(linea.idLinea);
                    // Añadimos la línea al panel
                    core.ui.action.addLinea(linea);
                    core.lineasCargadas++;
                }
            }
        });
    }
}
