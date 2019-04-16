/**
 * @file Clase ListadoOrdenado de RUTPAM
 * @version v5.0
 * @author Néstor Manuel Lora Romero <nestorlora@geeklab.es>
 * @copyright Geeklab - Néstor Manuel Lora Romero 2018-2019
 * @license MIT
 */

'use strict';

class ListadoOrdenado extends Array {
    push(obj){
        if(obj instanceof RelacionParadas){
            return super.push(obj);
        }else{
            throw obj;
        }
    }
    // TO DO: Verificación de que no contiene ya ese ID
    // TO DO: Sort function
}
