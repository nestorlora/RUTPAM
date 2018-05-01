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


defined('BASEPATH') OR exit('No direct script access allowed');

class Client extends CI_Controller{
	/**
	 * Muestra información del controlador y opciones disponibles
	 */
	public function index(){
		echo '<h3>RUTPAM Ingest API AJAX Client v0.2</h3>';
		echo date(TIEMPO).' at '.gethostname().'<br>';
		echo '<a href="'.site_url('/api/client/ubicacionIndividual').'">Ubicacion Individual</a><br>';
		echo '<a href="'.site_url('/api/client/ubicacionMasiva').'">Ubicación Masiva</a><br>';
	}
	
	/**
	 * Carga la vista con JS que envía un POST para cada ubicación por todos 
	 * los autobuses en circulación en este momento
	 */
	public function ubicacionIndividual(){
		$this->load->view('/api/ingestClient/ubicacionIndividual.php');
	}
	
	/**
	 * Carga la vista con JS que envía un POST con todas las ubicaciones de todos 
	 * los autobuses en circulación en este momento
	 */
	public function ubicacionMasiva(){
		$this->load->view('/api/ingestClient/ubicacionMasiva.php');
	}
}
