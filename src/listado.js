/**
 * @file Clase Listado de RUTPAM
 * @version v5.0
 * @author Néstor Manuel Lora Romero <nestorlora@geeklab.es>
 * @copyright Geeklab - Néstor Manuel Lora Romero 2018-2019
 * @license MIT
 */

'use strict';

/**
 * @name Listado
 * @classdesc Listado de elementos con ID
 * @class
 */
class Listado extends Array {
    /**
     * @method
     * @name buscar
     * @description Devuelve el primer elemento del listado cuyo campo id sea igual al proporcionado
     * @param {String} id
     * @returns {Object} Objeto con el id, si lo hay
     */
    buscar(id){
        return this.find(obj => obj.id === id);
        // TO DO throw not found
    }
    push(obj){
        if(obj instanceof Modo||obj instanceof Zona||obj instanceof Linea||obj instanceof Parada||obj instanceof Vehiculo){
            return super.push(obj);
        }else{
            throw obj;
        }
    }
}
