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

class Ubicacion extends CI_Model{
	
	/**
	 * Numero de registro de esta ubicación		
	 * @var u_INT
	 */
	public $ub_id;
	
	/**
	 * Marca de tiempo correspondiente al registro de esta ubicación
	 * @var DATETIME
	 */
	public $ub_datetime;
	
	/**
	 * Número de coche
	 * @var u_SMALLINT
	 */
	public $codBus;
	
	/**
	 * Código numérico de la línea servida por el coche
	 * @var u_SMALLINT
	 */
	public $codLinea;
	
	/**
	 * Código del sentido en el que el coche está recorriendo la línea
	 * @var u_TINYINT
	 */
	public $sentido;
	
	/**
	 * Código de la última parada a la que este coche ha llegado
	 * @var u_MEDIUMINT
	 */
	public $codParIni;
	
	/**
	 * Latitud geográfica del coche
	 * @var float
	 */
	public $latitud;
	
	/**
	 * Longitud geográfica del coche
	 * @var float
	 */
	public $longitud;
	
	/**
	 * Constructor: Inicializa $ub_timestamp al tiempo actual para minimizar retrasos y que siempre esté definido
	 */
	public function __construct() {
		parent::__construct();
		$this->ub_datetime = date(TIEMPO);
	}
	
	/**
	 * Inserta la ubicación en la BBDD
	 */
	private function insert(){
		$this->db->insert('ubicaciones', $this);
		$this->ub_id = $this->db->insert_id();
	}
	
	/**
	 * Actualiza la ubicación existente en la BBDD con la información del objeto
	 */
	private function update(){
		$this->db->update('ubicaciones',$this,array('ub_id' => $this->ub_id));
	}
	
	/**
	 * Actualiza o inserta la ubicación en la BBDD depediendo de si ya se encuentra creada o no
	 */
	public function save(){
		if(!isset($this->ub_id)||$this->ub_id==null){
			$this->insert();
		}else{
			$this->update();
		}
	}
	
	/**
	 * Devuelve un arrray asociativo con todos los registros de la BBDD
	 * @return type Array Asociativo
	 */
	public function getList(){
		// Generamos una consulta y devolvemos el resultado
		$consulta = $this->db->get('productos');
		return $consulta->result_array();
	}
}
