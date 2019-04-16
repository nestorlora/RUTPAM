/**
 * @file Clase Parametros de RUTPAM
 * @version v5.0
 * @author Néstor Manuel Lora Romero <nestorlora@geeklab.es>
 * @copyright Geeklab - Néstor Manuel Lora Romero 2018-2019
 * @license MIT
 */

'use strict';

/**
 * @class Parametros
 * @description Núcleo de la aplicación; almacena las constantes, variables y objetos globales; así como funciones generales.
 * @since v5.0
 * @property {string}   version     Versión de RUTPAM
 * @property {enum}     colores     Colores estándar de las redes y sus elementos
 * @property {enum}     ttl         Time-to-live estándar de los vehículos
 * @property {enum}     url         URLs de la aplicación y de recursos externos
 * @property {enum}     red         Identificadores de las diferentes redes de pasajeros
 * 
 * @todo Añadir controles para prevenir modificaciones
 */
class Parametros {
    constructor(){
        
        /**
         * @description Versión de RUTPAM
         * @readonly
         */
        this.version = "5.0 @Dev";
        
        /**
         * @description Colores estándar de las redes y sus elementos
         * @readonly
         * @enum {string}
         */
        this.colores = {
            /**@description EMT: Primario, lineas regulares, sentido ida */
            emtA: "#1E3180",
            /**@description EMT: Secuntario, sentido vuelta */
            emtB: "#4876FE",
            /**@description EMT: Circulares */
            emtC: "#F77F00",
            /**@description EMT: Nocturnos */
            emtN: "#04141F",
            /**@description CTMAM: Oficial primario, líneas regulares, sentido ida */
            ctmamA: "#009639",
            /**@description CTMAM: Sentido vuelta */
            ctmamB: "#11B237",
            /**@description CTMAM: Líneas buho */
            ctmamN: "#006983",
            /**@description CTMAM: Oficial secundario, lineas estacionales */
            ctmamT: "#E4D77E",
            //ctmamU: "#E4D77E", // líneas universitarias
            //ctmamV: "#71A9F7", // líneas de verano
            /**@description Renfe: Oficial general */
            renfeA: "#8A0072",
            /**@description Renfe: Oficial cercanías*/
            renfeB: "#EF3340",
            /**@description Metro Málaga: Oficial*/
            metro: "#DC241F",
            // Lineas especiales
            /**@description RUTPAM: Líneas y servicios especiales */
            especial: "#FCCC0A",
            /**@description RUTPAM: Servicios exprés */
            express: "#996633",
            /**@description RUTPAM: Lanzaderas */
            lanzaderas: "#808183"
        };
        
        this.refresh_rate = 3; // Periodo entre refrescos (s)
        let ttl_rate_default = 60; // TTL por defecto (en refrescos)
        
        /**
         * @description Time-to-live estándar de los vehículos
         * @readonly
         * @enum {int}
         */
        this.ttl = {
            /**@description TTL por defencto para los vehículos en la aplicación */
            default: ttl_rate_default/refresh_rate,
            /**@description TTL para los nuevos vehículos */
            new: (ttl_rate_default+10)/refresh_rate,
            /**@description TTL que indica que el vehículo lleva mucho tiempo perdido */
            old: (ttl_rate_default-15)/refresh_rate
        }

        /**
         * @description URLs de la aplicación y de recursos externos
         * @readonly
         * @enum {string}
         */
        this.url = {
            /**@description URL de la aplicación */
            site: '/RUTPAM',
            /**@description URL del proxy/API de la EMT */
            emt: '/proxy/emt-core',
            /**@description URL de la API de BetterEMT */
            betteremt: 'https://betteremt.edufdezsoy.es/api',
            /**@description URL de la API de los consorcios de transporte */
            ctan: 'http://api.ctan.es/v1/Consorcios/4',
            /**@description URL del Portal de Datos Abiertos de Málaga */
            odm: 'https://datosabiertos.malaga.eu/api/3/action/'
        }

        /**
         * @description Identificadores de las diferentes redes de pasajeros
         * @readonly
         * @enum {int}
         */
        this.red = {
            /**@description ID de la EMT */
            emt: 1,
            /**@description ID del CTMAM */
            ctan: 2,
            /**@description ID de Metro Málaga */
            metro: 3,
            /**@description ID de Renfe Operadora */
            renfe: 4
        }
    }
}