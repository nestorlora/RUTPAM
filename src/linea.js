/**
 * @file Clase Linea de RUTPAM
 * @version v5.0
 * @author Néstor Manuel Lora Romero <nestorlora@geeklab.es>
 * @copyright Geeklab - Néstor Manuel Lora Romero 2018-2019
 * @license MIT
 */

'use strict';

class Linea {
    constructor(){
        this.id = undefined;
        this.codigo = undefined;
        this.nombre = undefined;
        this.tieneIda = undefined;
        this.tieneVuelta = undefined;
        this.esCircular = undefined;
        this.cabeceraIda = undefined;
        this.cabeceraVuelta = undefined;
        this.paradasIda = new ListadoOrdenado();
        this.paradasVuelta = new ListadoOrdenado();
        this.trazadoIda = undefined;
        this.trazadoVuelta = undefined;
        this.estado = {
            getBuses: undefined, // Mostrar los buses en el mapa
            getIda: undefined, // Trazado de ida obtenido
            getVuelta: undefined, // Trazado de vuelta obtenido
            verParadas: undefined, // Mostrar las paradas en el mapa
        };
        this.numVehiculos = undefined;
        this.modo = undefined;
        this.operadores = undefined;
        this.hayNoticia = undefined;
        this.red = undefined;
    }
    distanciaTrazado(selector){
        if((selector === 1||selector === 2)&&this.estado.getIda){
            let distancia = 0;
            let trazado = selector===1?this.trazadoIda:this.trazadoVuelta;
            for(let pos = 1; pos < trazado.getLatLngs().length; pos++){
                distancia = distancia + core.map.distance(trazado.getLatLngs()[pos-1], trazado.getLatLngs()[pos]);
            }
            return distancia;
        }else{
            return null;
        }
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
    generarIcon(zoom){
        if(zoom == null){// IF zoom no está inicializado
            zoom = 1; // Ponemos a zoom un valor por defecto
        }
        zoom = zoom.toString()+"x"; // Preparamos zoom para ser usado en Font Awesome
        let esNegro = false;
        let span = $('<span>').addClass('fa-layers fa-'+zoom);
        let i = $('<i>');
        let t = $('<span>').addClass('fa-layers-text fa-inverse');
        let color;
        let texto = this.codigo;
        switch(this.red){
            case core.red.emt: // Red EMT
                $(i).addClass('fas fa-square');
                if(/^C[1-9]$|^29$/.test(this.codigo)){ // Circulares
                    color = core.colores.emtC;
                }else if(/^N[1-9]$/.test(this.codigo)){ // Nocturnos
                    color = core.colores.emtN;
                }else if(/^A$|^E$/.test(this.codigo)){ // Exprés
                    color = core.colores.express;
                }else if(/^L$|^M$/.test(this.codigo)){ // Lanzaderas
                    color = core.colores.lanzaderas;
                }else if(/^12$|^16$|^26$/.test(this.codigo)){ // Especiales (Líneas de refuerzo)
                    color = core.colores.especial;
                    esNegro = true;
                }else if(/^[0-9]{1,}.[0-9]$/.test(this.codigo)){ // Especiales (Superlíneas divididas)
                    color = core.colores.especial;
                    esNegro = true;
                }else if(/^[A-Z]/.test(this.codigo)){ // Especiales (Feria y otros)
                    color = core.colores.especial;
                    esNegro = true;
                }else if(/^91$|^92$/.test(this.codigo)){ // Turísticas
                    color = core.colores.especial;
                    esNegro = true;
                }else{ // Convecionales
                    color = core.colores.emtA;
                }
            break;
            case core.red.ctan: // Red CTMAM
                $(i).addClass('fas fa-square');
                texto = texto.replace(/^M-/, "M\n");
                if(/N[1-9]$|^M-138$|^M-155$|^M-168$/.test(this.codigo)){ // Buho
                    color = core.colores.ctmamN;
                }else if(/^M-114$|^M-116$|^M-143$|^M-166$/.test(this.codigo)){ // Universitarias
                    color = core.colores.ctmamT;
                    esNegro = true;
                }else if(/^M-4[0-9]{2}/.test(this.codigo)){ // Servicios Especiales (Feria)
                    color = core.colores.especial
                    esNegro = true;
                }else if(/^M-5[0-9]{2}/.test(this.codigo)){ // Verano
                    color = core.colores.ctmamT;
                    esNegro = true;
                }else if(/^M-6[0-9]{2}/.test(this.codigo)){ // Servicios Especiales (Semana Santa)
                    color = core.colores.especial;
                    esNegro = true;
                }else if(/^R-|^T-|^M-10[1-4]$/.test(this.codigo)){ // Urbanas
                    color = core.colores.emtA;
                    texto = texto.replace(/^R-/, "R").replace(/^T-/, "T");
                }else if(/^M$/.test(this.codigo)){ // Lazanderas
                    color = core.colores.lanzaderas;
                }else{ // Convencionales
                    color = core.colores.ctmamA;
                }
            break;
            case core.red.metro: // Red Metro
                $(i).addClass('fas fa-square');
                color = core.colores.metro;
                texto = texto.replace(/^METRO /, "");
            break;
            case core.red.renfe: // Red Renfe
                $(i).addClass('fas fa-square');
                color = core.colores.renfeA;
                texto = texto.replace(/^C-/, "C");
            break;
        }
        if(texto.length < 3){ // 0 o 1
            $(t).attr("data-fa-transform", "shrink-6");
        }else if(texto.length < 5){ // 2 o 3 o 4
            $(t).attr("data-fa-transform", "shrink-8");
        }else if(texto.length < 6){ // 5
            $(t).attr("data-fa-transform", "shrink-10");
        }else if(texto.length < 7){ // 6
            $(t).attr("data-fa-transform", "shrink-11");
        }else{ // 7 o más
            $(t).attr("data-fa-transform", "shrink-12");
        }
        $(t).text(texto); // Ponemos el contenido del span de texto
        $(i).css("color", color); // Coloreamos el icono según corresponda
        if(esNegro){
            $(t).css("color", "black");
        }
        $(span).append(i); // Añadimos al div el icono
        $(span).append(t); // Añadimos al div el texto
        let id = this.id;
        $(span).click(function(){ // Linkeamos al div la función para ver la línea en detalle
            verInfoLinea(id);
        });
        return span; // Devolvemos el div principal
    }
}
