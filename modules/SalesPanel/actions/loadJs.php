<?php

// by haidang009

class SalesPanel_LoadJs_Action extends Vtiger_Action_Controller{
	function checkPermission(Vtiger_Request $request) {
		return;
	}
	
	public function process(Vtiger_Request $request){
		global $root_directory;
		$relatedModule = $request->get('relatedModule');
		$relatedView = $request->get('relatedView');

		include_once "modules/Vtiger/views/$relatedView.php";
		if(file_exists($root_directory . "modules/$relatedModule/views/$relatedView.php")){
			include_once "modules/$relatedModule/views/$relatedView.php";
			$viewName = ucwords($relatedModule) . "_" . ucwords($relatedView) . "_View";
		}else{
			$viewName = "Vtiger_" . ucwords($relatedView) . "_View";
		}

		$viewInstance = new $viewName();
		$request->set('module',$relatedModule);
		$request->set('view',$relatedView);
		$headerScriptInstances = $viewInstance->getHeaderScripts($request);

		$jsList = array();
		foreach ($headerScriptInstances as $key => $jsModel) {
			$jsList[] = $jsModel->getSrc();
		}
		$response = new Vtiger_Response();
		$response->setResult($jsList);
		$response->emit();
	}
}