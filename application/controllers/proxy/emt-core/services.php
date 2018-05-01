<?php

/* 
 * The MIT License
 *
 * Copyright 2018 Nestor Manuel Lora Romero <nestorlora@gmail.com>.
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

class Services extends CI_Controller{
	public function lineas(){
		if($this->input->get('codLinea') != null){
			// Solicitar una línea en concreto (not working yet)
			$this->output->set_content_type('application/json');
			$recurso = fopen("http://www.emtmalaga.es/emt-core/services/lineas/?codLinea=".$this->input->get('codLinea'),"r");
			while(!feof($recurso)){
				echo fgets($recurso);
			}
			fclose($recurso);
		}else{
			// Solicitar todas las líneas
			$this->output->set_content_type('application/json');
			$recurso = fopen("http://www.emtmalaga.es/emt-core/services/lineas/","r");
			while(!feof($recurso)){
				echo fgets($recurso);
			}
			fclose($recurso);
		}
	}
	
	public function buses(){
		if($this->input->get('codLinea') != null){
			// Solicitar una línea en concreto
			$this->output->set_content_type('application/json');
			$recurso = fopen("http://www.emtmalaga.es/emt-core/services/buses/?codLinea=".$this->input->get('codLinea'),"r");
			while(!feof($recurso)){
				echo fgets($recurso);
			}
			fclose($recurso);
		}else{
			// Cuando no se especifica ninguna linea
			$this->output->set_content_type('application/json');
			echo "[]";
		}
	}
}
