<?php

// by haidang009

class SalesPanel_CustomView_View extends Vtiger_Index_View{
	function process(Vtiger_Request $request){
		$relatedModuleName = $request->get('relatedModule');

		$relatedMduleModel = Vtiger_Module_Model::getInstance($relatedModuleName);
		$viewer = $this->getViewer($request);
		$viewer->assign('DEFAULT_CUSTOM_FILTER_ID', $relatedMduleModel->getDefaultCustomFilter());
		$viewer->assign('FOLDERS', Documents_Module_Model::getAllFolders());
        $viewer->assign('CUSTOM_VIEWS', CustomView_Record_Model::getAllByGroup($relatedModuleName));
        $viewer->assign('CURRENT_USER_MODEL', Users_Record_Model::getCurrentUserModel());
		$viewer->view('CustomFilter.tpl', $request->getModule());
	}
}