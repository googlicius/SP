<?php

// by haidang009

class SalesPanel_Dashboard_View extends Vtiger_Index_View {

     public function process(Vtiger_Request $request) {
     	$current_user_model = Users_Record_Model::getCurrentUserModel();


        $viewer = $this->getViewer($request);
        $viewer->assign('MODULE_NAME', $request->getModule());
        $viewer->assign('NOW', date('d-m-Y'));
        $viewer->assign('FIRST_DAY_OF_MONTH', date('01-m-Y'));
       
        $viewer->assign('CURRENT_USER_MODEL', $current_user_model);
        $viewer->view('Dashboard.tpl', $request->getModule());
    }

    function getHeaderScripts(Vtiger_Request $request) {
		$headerScriptInstances = parent::getHeaderScripts($request);

		$moduleName = $request->getModule();

		$jsFileNames = array(
			'layouts.vlayout.modules.Vtiger.resources.List',
			'layouts.vlayout.modules.' .$request->getModule() . '.resources.underscore.underscore-min',
			'layouts.vlayout.modules.' .$request->getModule() . '.resources.Statics',
			'layouts.vlayout.modules.' .$request->getModule() . '.resources.ListView',
			'layouts.vlayout.modules.' .$request->getModule() . '.resources.dashboard',
			'layouts.vlayout.modules.' .$request->getModule() . '.resources.jquery-tzCheckbox.jquery-tzCheckbox',
			'layouts.vlayout.modules.Vtiger.resources.Detail',
			'layouts.vlayout.modules.Vtiger.resources.Edit',
			'layouts.vlayout.modules.Inventory.resources.Detail',
			'layouts.vlayout.modules.Inventory.resources.Edit',
		);

		$jsFileNames[] = $modulePopUpFile;
		$jsScriptInstances = $this->checkAndConvertJsScripts($jsFileNames);
		$headerScriptInstances = array_merge($headerScriptInstances, $jsScriptInstances);

		return $headerScriptInstances;
	}

	/**
	 * Function to get the list of Css models to be included
	 * @param Vtiger_Request $request
	 * @return <Array> - List of Vtiger_CssScript_Model instances
	 */
	public function getHeaderCss(Vtiger_Request $request) {
		$parentHeaderCssScriptInstances = parent::getHeaderCss($request);

		$headerCss = array(
			'~/layouts/vlayout/modules/' . $request->getModule() .'/resources/jquery-tzCheckbox/jquery-tzCheckbox.css',
		);
		$cssScripts = $this->checkAndConvertCssStyles($headerCss);
		$headerCssScriptInstances = array_merge($parentHeaderCssScriptInstances , $cssScripts);
		return $headerCssScriptInstances;
	}
}