/**
 * @file Clase Parametros de RUTPAM
 * @version v5.0
 * @author Néstor Manuel Lora Romero <nestorlora@geeklab.es>
 * @copyright Geeklab - Néstor Manuel Lora Romero 2018-2019
 * @license MIT
 */

'use strict';

/**@ignore */
let rutpam_version = "5.0 @Dev";
/**@ignore */
let site_url = '/RUTPAM';
/**@ignore */
let emt_url = '/proxy/emt-core';
/**@ignore */
let betteremt_url = 'https://betteremt.edufdezsoy.es/api';
/**@ignore */
let ctan_url = 'http://api.ctan.es/v1/Consorcios/4';
/**@ignore */
let odm_url = 'https://datosabiertos.malaga.eu/api/3/action/';
/**@ignore */
let refresh_rate = 3; // Periodo entre refrescos (s)
/**@ignore */
let ttl_rate_default = 60; // TTL por defecto (en refrescos)

class Parametros {
    constructor(){
        /**
         * @readonly
         */
        this.version = rutpam_version;
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
        this.ttl = {
            default: ttl_rate_default/refresh_rate,
            new: (ttl_rate_default+10)/refresh_rate,
            old: (ttl_rate_default-15)/refresh_rate
        }
        this.url = {
            site: site_url,
            emt: emt_url,
            betteremt: betteremt_url,
            ctan: ctan_url,
            odm: odm_url
        }
        this.red = {
            emt: 1,
            ctan: 2,
            metro: 3,
            renfe: 4
        }
    }
}