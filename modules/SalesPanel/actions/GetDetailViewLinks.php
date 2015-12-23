<?php

class SalesPanel_GetDetailViewLinks_Action extends Vtiger_Action_Controller{
	function checkPermission(Vtiger_Request $request) {
		return;
	}

	function process(Vtiger_Request $request) {
		$recordId = $request->get('relatedRecord');
		$moduleName = $request->get('relatedModule');
		$currentUserModel = Users_Record_Model::getCurrentUserModel();
		$moduleModel = Vtiger_Module_Model::getInstance($moduleName);
		if(!$this->record){
			$this->record = Vtiger_DetailView_Model::getInstance($moduleName, $recordId);
		}
		$detailViewLinkParams = array('MODULE'=>$moduleName,'RECORD'=>$recordId);
		$detailViewLinks = $this->record->getDetailViewLinks($detailViewLinkParams);

		$selectedTabLabel = $request->get('tab_label');

		if(empty($selectedTabLabel)) {
            if($currentUserModel->get('default_record_view') === 'Detail') {
                $selectedTabLabel = vtranslate('SINGLE_'.$moduleName, $moduleName).' '. vtranslate('LBL_DETAILS', $moduleName);
            } else{
                if($moduleModel->isSummaryViewSupported()) {
                    $selectedTabLabel = vtranslate('SINGLE_'.$moduleName, $moduleName).' '. vtranslate('LBL_SUMMARY', $moduleName);
                } else {
                    $selectedTabLabel = vtranslate('SINGLE_'.$moduleName, $moduleName).' '. vtranslate('LBL_DETAILS', $moduleName);
                }
            }
        }
        $id = 0;
		foreach ($detailViewLinks['DETAILVIEWTAB'] as $key => $RELATED_LINK) {
        	$RELATED_LINK->set('linkLabelTrans',vtranslate($RELATED_LINK->getLabel(),$moduleName));
        	$RELATED_LINK->set('linkId','relatedlink_' . $id);
        	$id++;
		}
		if(is_array($detailViewLinks['DETAILVIEWBASIC'])){
			foreach ($detailViewLinks['DETAILVIEWBASIC'] as $key => $RELATED_LINK) {
	        	$RELATED_LINK->set('linkLabelTrans',vtranslate($RELATED_LINK->getLabel(),$moduleName));
	        	if($RELATED_LINK->isPageLoadLink()){
	        		$RELATED_LINK->set('isPageLoadLink',true);
	        	}else{
	        		$RELATED_LINK->set('isPageLoadLink',false);
	        	}
			}
		}
		if(is_array($detailViewLinks['DETAILVIEW'])){
			foreach ($detailViewLinks['DETAILVIEW'] as $key => $RELATED_LINK) {
	        	$RELATED_LINK->set('linkLabelTrans',vtranslate($RELATED_LINK->getLabel(),$moduleName));
			}
		}
		if(is_array($detailViewLinks['DETAILVIEWRELATED'])){
			foreach ($detailViewLinks['DETAILVIEWRELATED'] as $key => $RELATED_LINK) {
				$RELATED_LINK->set('linkLabelTrans',vtranslate($RELATED_LINK->getLabel(),$moduleName));
				$RELATED_LINK->set('linkId','relatedlink_' . $id);
	        	$id++;
			}
		}
		$response = new Vtiger_Response();
		$response->setResult($detailViewLinks);
		$response->emit();
	}
}