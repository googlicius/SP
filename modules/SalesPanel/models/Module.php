<?php

class SalesPanel_Module_Model extends Vtiger_Module_Model{
	/**
	 * Function returns the default view for the module
	 * @return <String>
	 */
	public function getDefaultViewName() {
		return 'Dashboard';
	}

	public function getSidebarLinks($linkParams){
		$links = parent::getSidebarLinks($linkParams);
		// hd_debug($this->getName(),"filename","a");
		$quickLinks = array(
			array(
				'linktype' => 'SIDEBARLINK',
				'linklabel' => 'Quotes',
				'linkurl' => 'javascript:;',
				'linkicon' => ''),
			array(
				'linktype' => 'SIDEBARLINK',
				'linklabel' => 'SalesOrder',
				'linkurl' => 'javascript:;',
				'linkicon' => ''),
			array(
				'linktype' => 'SIDEBARLINK',
				'linklabel' => 'Invoice',
				'linkurl' => 'javascript:;',
				'linkicon' => ''),
			array(
				'linktype' => 'SIDEBARLINK',
				'linklabel' => 'HelpDesk',
				'linkurl' => 'javascript:;',
				'linkicon' => ''),
			array(
				'linktype' => 'SIDEBARLINK',
				'linklabel' => 'Calendar',
				'linkurl' => 'javascript:;',
				'linkicon' => ''),
			array(
				'linktype' => 'SIDEBARLINK',
				'linklabel' => 'Coupons',
				'linkurl' => 'javascript:;',
				'linkicon' => ''),
			array(
				'linktype' => 'SIDEBARLINK',
				'linklabel' => 'PBXManager',
				'linkurl' => 'javascript:;',
				'linkicon' => ''),
		);
		
		//Check profile permissions for Dashboards
		$moduleModel = Vtiger_Module_Model::getInstance($this->getName());
		$userPrivilegesModel = Users_Privileges_Model::getCurrentUserPrivilegesModel();
		$permission = $userPrivilegesModel->hasModulePermission($moduleModel->getId());
		if($permission) {
			foreach ($quickLinks as $quickLink) {
				$links['SIDEBARLINK'][] = Vtiger_Link_Model::getInstanceFromValues($quickLink);
			}
		}
		
		return $links;
	}

	/**
	 * Function to check whether the module is an entity type module or not
	 * @return <Boolean> true/false
	 */
	 
	public function isQuickCreateSupported(){
		//the module is not enabled for quick create
		return false;
	}
}