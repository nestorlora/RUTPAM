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

class Ingest extends CI_Controller{
	public function index(){
		echo 'RUTPAM Ingest API v0.1<br>';
		echo 'at '.gethostname().'<br>';
		echo date(TIEMPO);
	}
	
	public function addUbicacion(){
		$this->load->model('Ubicacion');
		if($this->input->post('token') != null){
			// TO-DO: Token verification
			if($this->input->post('token') == 0){
				$ubicacion = new Ubicacion();
				$ubicacion->codBus = $this->input->post('codBus');
				$ubicacion->codLinea = $this->input->post('codLinea');
				$ubicacion->codParIni = $this->input->post('codParIni');
				$ubicacion->latitud = $this->input->post('latitud');
				$ubicacion->longitud = $this->input->post('longitud');
				$ubicacion->sentido = $this->input->post('sentido');
				$ubicacion->save();
				$this->output->set_status_header(200);
				echo 'OK';
			}else{
				$this->output->set_status_header(401);
				echo 'Authorization Required';
			}
		}else{
			$this->output->set_status_header(400);
			echo 'Bad Request';
		}
	}
	
	public function addUbicaciones(){
		$this->load->model('Ubicacion');
		if($this->input->post('token') != null){
			// TO-DO: Token verification
			if($this->input->post('token') == 0){
				$data = json_decode($this->input->post('data'));
				$tiempo = date(TIEMPO);
				foreach($data as $var){
					$ubicacion = new Ubicacion();
					$ubicacion->codBus = $var->codBus;
					$ubicacion->codLinea = $var->codLinea;
					$ubicacion->codParIni = $var->codParIni;
					$ubicacion->latitud = $var->latitud;
					$ubicacion->longitud = $var->longitud;
					$ubicacion->sentido = $var->sentido;
					$ubicacion->ub_datetime = $tiempo;
					$ubicacion->save();
				}
			}else{
				$this->output->set_status_header(401);
				echo 'Authorization Required';
			}
		}else{
			$this->output->set_status_header(400);
			echo 'Bad Request';
		}
	}
}
