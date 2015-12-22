<?php

class SalesPanel_getViewNames_Action extends Vtiger_Action_Controller{
	function checkPermission(Vtiger_Request $request) {
		return;
	}
	
	public function process(Vtiger_Request $request){
		$customView = new CustomView();

		$modules = $request->get('related_modules');

		$cvIds = array();
		if(is_array($modules)){
			foreach ($modules as $key => $module) {				
        		$cvIds[$module] = $customView->getViewId($module);
			}
		}

		$response = new Vtiger_Response();
		$response->setResult($cvIds);
		$response->emit();
	}
}