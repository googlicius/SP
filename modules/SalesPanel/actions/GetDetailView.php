<?php

// by haidang009

class SalesPanel_GetDetailView_Action extends Vtiger_Action_Controller{
	function checkPermission(Vtiger_Request $request) {
		return;
	}

	function process(Vtiger_Request $request) {
		$this->recordId = $request->get('relatedRecord');
		$this->moduleName = $request->get('relatedModule');
		$this->currentUserModel = Users_Record_Model::getCurrentUserModel();
		$this->moduleModel = Vtiger_Module_Model::getInstance($this->moduleName);
		if(!$this->record){
			$this->record = Vtiger_DetailView_Model::getInstance($this->moduleName, $this->recordId);
		}
		$parentRecordModel = Vtiger_Record_Model::getInstanceById($this->recordId, $this->moduleName);

		$detailView = array();
		$detailView['detailViewLinks'] = $this->getDetailViewLinks($request);
		$detailView['nameFields'] = $this->moduleModel->getNameFields();
		$detailView['columnFields'] = $parentRecordModel->getDisplayableValues();

		$fields = $this->moduleModel->getFields();
		$fieldLabelList = array();
		foreach($fields as $field) {
			$fieldLabelList[$field->getName()] = vtranslate($field->get('label'),$this->moduleName);
		}
		$detailView['fieldLabels'] = $fieldLabelList;
		$response = new Vtiger_Response();
		$response->setResult($detailView);
		$response->emit();
	}

	function getColumnFields(Vtiger_Request $request){

	}

	function getDetailViewLinks(Vtiger_Request $request){
		$recordId = $this->recordId;
		$moduleName = $this->moduleName;
		$record = $this->record;

		$currentUserModel = $this->currentUserModel;
		$moduleModel = $this->moduleModel;

		$detailViewLinkParams = array('MODULE'=>$moduleName,'RECORD'=>$recordId);
		$detailViewLinks = $record->getDetailViewLinks($detailViewLinkParams);

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
				$relatedModuleName = $RELATED_LINK->get('relatedModuleName');
				//$noOfEntries = $this->getNoOfEntries($request,$relatedModuleName);
				$RELATED_LINK->set('noOfEntries',-1);
				$id++;
			}
		}
		return $detailViewLinks;
	}

	function getNoOfEntries($request, $relatedModuleName){
		$pagingModel = new Vtiger_Paging_Model();
		$pagingModel->set('page',1);
		$recordId = $request->get('relatedRecord');
		$moduleName = $request->get('relatedModule');
		$allowCountModules = array('Contacts','Accounts','Quotes','SalesOrder','Invoice','HelpDesk','Coupons','Calendar');
		if(in_array($relatedModuleName, $allowCountModules)){
			$parentRecordModel = Vtiger_Record_Model::getInstanceById($recordId, $moduleName);
			$relationListView = Vtiger_RelationListView_Model::getInstance($parentRecordModel, $relatedModuleName);
			$models = $relationListView->getEntries($pagingModel);
			$noOfEntries = count($models);
			return $noOfEntries;
		}
		return -1;
	}
}