/**
 * @copyright
 * The MIT License
 *
 * Copyright 2019 Nestor Manuel Lora Romero <nestorlora@geeklab.es>.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
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
