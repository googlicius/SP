<?php

//by haidang009 - 06/01/2016

class SalesPanel_GetNameFields_Action extends Vtiger_Action_Controller{
	function checkPermission(Vtiger_Request $request) {
		return;
	}

	public function process(Vtiger_Request $request){
		
		$name_fields = array();

		$response = new Vtiger_Response();
		$response->setResult($cvIds);
		$response->emit();
	}
}