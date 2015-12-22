<?php

// by haidang009

class SalesPanel_ListViewActions_View extends Vtiger_Index_View{
	public function process(Vtiger_Request $request){
		$viewer = $this->getViewer($request);
		$pageNumber = $request->get('page');
		if(empty ($pageNumber)){
			$pageNumber = '1';
		}
		$pagingModel = new Vtiger_Paging_Model();
		$pagingModel->set('page', $pageNumber);
		$pagingModel->set('viewid', $cvId);
		$viewer->assign('PAGING_MODEL', $pagingModel);

		if (PerformancePrefs::getBoolean('LISTVIEW_COMPUTE_PAGE_COUNT', false)) {
			if(!$this->listViewCount){
				$this->listViewCount = $accountListViewModel->getListViewCount();
			}
			$totalCount = $this->listViewCount;
			$pageLimit = $pagingModel->getPageLimit();
			$pageCount = ceil((int) $totalCount / (int) $pageLimit);

			if($pageCount == 0){
				$pageCount = 1;
			}
			$viewer->assign('PAGE_COUNT', $pageCount);
			$viewer->assign('LISTVIEW_COUNT', $totalCount);
		}

		if(!$this->listViewEntries){
			$this->listViewEntries = $accountListViewModel->getListViewEntries($pagingModel);
		}
		$noOfEntries = count($this->listViewEntries);
		$viewer->assign('LISTVIEW_ENTRIES_COUNT',$noOfEntries);
		$viewer->view('ListViewActions.tpl', $request->getModule());
	}
}