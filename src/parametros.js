/**
 * @file Clase Parametros de RUTPAM
 * @version v5.0
 * @author Néstor Manuel Lora Romero <nestorlora@geeklab.es>
 * @copyright Geeklab - Néstor Manuel Lora Romero 2018-2019
 * @license MIT
 */

'use strict';

class Parametros {
    constructor(){
        /**
         * @readonly
         */
        this.version = "5.0 @Dev";
        /**
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
        let refresh_rate = 3; // Periodo entre refrescos (s)
        let ttl_rate_default = 60; // TTL por defecto (en refrescos)
        this.ttl = {
            default: ttl_rate_default/refresh_rate,
            new: (ttl_rate_default+10)/refresh_rate,
            old: (ttl_rate_default-15)/refresh_rate
        }
        this.url = {
            site: '/RUTPAM',
            emt: '/proxy/emt-core',
            betteremt: 'https://betteremt.edufdezsoy.es/api',
            ctan: 'http://api.ctan.es/v1/Consorcios/4',
            odm: 'https://datosabiertos.malaga.eu/api/3/action/'
        }
        this.red = {
            emt: 1,
            ctan: 2,
            metro: 3,
            renfe: 4
        }
    }
}