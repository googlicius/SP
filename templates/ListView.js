/*
 * by haidang009
 * Class SalesPanel_ListView_js extends Vtiger_List_Js
 * To load list of specific module to Variable tmp
 */

Vtiger_List_Js('SalesPanel_ListView_js',{
	self : false,
	getInstance : function(){
		if(!this.self)
			this.self = new SalesPanel_ListView_js();
		return this.self;
	},
	getSelectedModule : function(){
		var quickLinksContainer = jQuery(".quickLinksDiv");
		var selectedQuickLink = quickLinksContainer.find('p[class="selectedQuickLink"]');
		var moduleName = selectedQuickLink.data('module');
		return moduleName;
	}
},{
	moduleName : 'Accounts',
	ListOfListView : {},
	CvIds : {},
	eventRegisted : false,

	registerEvents : function(){
		if(this.eventRegisted == false){
			this.eventRegisted = true;
			this._super();
		}
	},

	getCurrentCvId : function(){
		return jQuery('#CurrentAccountCvId').val();
	},

	//Function to storge viewname of modules
	setCvIds : function(data){
		this.CvIds = data;
	},

	/*getDefaultParams : function() {
		var params = this.getDefaultParams2();

		var moduleName = SalesPanel_ListView_js.getSelectedModule();
		var cvId = this.CvIds[moduleName];
		
		params.module = moduleName;
		params.viewname = cvId;
		params.search_params = JSON.stringify(this.getListSearchParams());
		return params;
	},

	getDefaultParams2 : function(){
		var pageNumber = jQuery('#pageNumber').val();
		var module = this.moduleName;
		var parent = app.getParentModuleName();
		var cvId = this.cvId;
		var orderBy = jQuery('#orderBy').val();
		var sortOrder = jQuery("#sortOrder").val();
		var params = {
			'module': module,
			'parent' : parent,
			'page' : pageNumber,
			'view' : "List",
			'viewname' : this.cvId,
			'orderby' : orderBy,
			'sortorder' : sortOrder
		}

		var searchValue = this.getAlphabetSearchValue();

		if((typeof searchValue != "undefined") && (searchValue.length > 0)) {
			params['search_key'] = this.getAlphabetSearchField();
			params['search_value'] = searchValue;
			params['operator'] = "s";
		}
		
		return params;
	},*/

	loadPagingTemplate : function(){
		var template = '';
		return template;
	},

	/*
	 * Function which will give you all the list view params
	 */
	getListViewRecords2 : function(urlParams) {		
		
		if(typeof urlParams == 'undefined') {
			urlParams = {};
		}

		var thisInstance = this;
		var quickLinksContainer = jQuery(".quickLinksDiv");
		var defaultParams = this.getDefaultParams2();
		var urlParams = jQuery.extend(defaultParams, urlParams);

		SalesPanel_Statics_Js.sendRequest(urlParams).then(function(cur_params,result){
			thisInstance.ListOfListView[cur_params.module] = result;

			var currentQuickLink = jQuery('p[data-module="' + cur_params.module + '"]',quickLinksContainer);
			currentQuickLink.find('span[class*="pull-right"]').remove();
			if(currentQuickLink.hasClass("selectedQuickLink")){
				Dashboard.getInstance().listView.listViewRender(result,"- " + app.vtranslate('List') + " " + app.vtranslate(cur_params.module));
			}
		});
	},

	getListViewRecords : function(){
		if(typeof urlParams == 'undefined') {
			urlParams = {};
		}
		var aDeferred = jQuery.Deferred();

		var thisInstance = this;
		var defaultParams = this.getDefaultParams();
		var urlParams = jQuery.extend(defaultParams, urlParams);
		var progressIndicatorElement = jQuery.progressIndicator();
		
		urlParams.search_params = JSON.stringify(this.getListSearchParams());
		
		SalesPanel_Statics_Js.sendRequest(urlParams).then(function(cur_params,result){
			progressIndicatorElement.hide();
			var listViewContentsContainer = jQuery('.listViewPageDiv');
			thisInstance.ListOfListView[cur_params.module] = result;
            listViewContentsContainer.html(result);
            Dashboard.getInstance().listView.rowOnclick(jQuery('tr.listViewEntries',listViewContentsContainer))
            
            thisInstance.registerEventsAfterRenderListViewToDOM(result).then(function(data){
            	aDeferred.resolve(data);
            });
		});
		return aDeferred.promise();
	},

	registerEventsAfterRenderListViewToDOM : function(data){
		var aDeferred = jQuery.Deferred();
		var thisInstance = this;
		// COMMENT BY HAIDANG009
       var listViewContentsContainer = jQuery('div.listViewPageDiv');
       
        app.showSelect2ElementView(listViewContentsContainer.find('select.select2'));
        app.changeSelectElementView(listViewContentsContainer);
        thisInstance.registerTimeListSearch(listViewContentsContainer);

        thisInstance.registerDateListSearch(listViewContentsContainer);
        // AND COMMENT

		thisInstance.calculatePages().then(function(data){
			Vtiger_Helper_Js.showHorizontalTopScrollBar();

			var selectedIds = thisInstance.readSelectedIds();
			if(selectedIds != ''){
				if(selectedIds == 'all'){
					jQuery('.listViewEntriesCheckBox').each( function(index,element) {
						jQuery(this).attr('checked', true).closest('tr').addClass('highlightBackgroundColor');
					});
					jQuery('#deSelectAllMsgDiv').show();
					var excludedIds = thisInstance.readExcludedIds();
					if(excludedIds != ''){
						jQuery('#listViewEntriesMainCheckBox').attr('checked',false);
						jQuery('.listViewEntriesCheckBox').each( function(index,element) {
							if(jQuery.inArray(jQuery(element).val(),excludedIds) != -1){
								jQuery(element).attr('checked', false).closest('tr').removeClass('highlightBackgroundColor');
							}
						});
					}
				} else {
					jQuery('.listViewEntriesCheckBox').each( function(index,element) {
						if(jQuery.inArray(jQuery(element).val(),selectedIds) != -1){
							jQuery(this).attr('checked', true).closest('tr').addClass('highlightBackgroundColor');
						}
					});
				}
				thisInstance.checkSelectAll();
			}
			aDeferred.resolve(data);

			// Let listeners know about page state change.
			app.notifyPostAjaxReady();
		});
		return aDeferred.promise();
	}
});