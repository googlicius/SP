
// by haidang009 - 12/12/2015

jQuery.Class('Dashboard',{
	self : false,
	getInstance : function(){
		if(!this.self)
			this.self = new Dashboard();
		return this.self;
	},
	triggerRemoveAllTooltip : function(){
		jQuery('body').find('.tooltip').remove();
	}
},{

	SalesPanelModuleName : 'SalesPanel',

	//Variable storage list of Quotes, SalesOrder, Invoice,... to display immediately for User.
	htmlTemplateFolder : 'layouts/vlayout/modules/SalesPanel/htmlTemplates/',

	// Modify a litle in labelSearch function of Vtiger_Header_Js
	registerCustomizeLabelSearch : function(){
		var thisInstance = this;
		var basicSearch = new Vtiger_BasicSearch_Js();
		// re-define function search of basicSearch
		basicSearch.search = function(value) {
			var searchModule = this.getCurrentSearchModule();
			// Added by haidang009
			if(searchModule == '')
				searchModule = thisInstance.SalesPanelModuleName;
			// End added
			var params = {};
			params.value = value;
			if(typeof searchModule != 'undefined') {
				params.searchModule = searchModule;
			}

			return this._search(params);
		}

		// re-define function labelSearch of Vtiger_Header_Js
		Vtiger_Header_Js.getInstance().labelSearch = function(currentTarget){
			var val = currentTarget.val();
			if (val == '') {
				alert(app.vtranslate('JS_PLEASE_ENTER_SOME_VALUE'));
				currentTarget.focus();
				return false;
			}
			var progress = jQuery.progressIndicator();
			basicSearch.search(val).then(function(data) {
				basicSearch.showSearchResults(data);
				progress.progressIndicator({
					'mode': 'hide'
				});
				// Added by haidang009
				thisInstance.captureGlobalSearch();
				// End added
			});
		};
	},

	captureGlobalSearch : function(){
		var thisInstance = this;
		var globalSearchResults = jQuery(".globalSearchResults");
		var contents = globalSearchResults.find('.contents ul.nav');
		var records = contents.find('li');

		jQuery(".cursorPointer",globalSearchResults).on('click',function(e){
			var checkbox_on_off = jQuery(".checkbox-on-off");
			if(checkbox_on_off.is(":checked")){
				if (!e) var e = window.event;
				e.cancelBubble = true;
				if (e.stopPropagation) e.stopPropagation();

				var url = jQuery(this).attr('href');
				var url_vars = SalesPanel_Statics_Js.getUrlVars(url);

				thisInstance.detailView.relatedMenuIsHorizol = true;
				thisInstance.detailView.loadDetailView(url_vars);
				jQuery(".blockUI.blockOverlay").trigger('click');
				return false;
			}
			jQuery(".blockUI.blockOverlay").trigger('click');
		});
		if(records.length == 1){
			records.find(".cursorPointer").trigger('click');
		}
	},

	registerCloseTooltipClick : function(){
		jQuery('body').on('click','[name="vtTooltipClose"]',function(e){
			jQuery(this).closest('.popover').remove();
			e.preventDefault();
		});
	},

	detailView : {
		detailviewJsInstance : null,
		pending : false, // prevent double click
		relatedMenuIsHorizol : true, // mark related menu is horizoltal

		//primary field name of each module
		module_name_fields : {
			'Accounts'		: {'sub_fields': ['phone','otherphone','email1','bill_street'],'image':'summary_organizations.png'},
			'Contacts'		: {'sub_fields': ['account_id','mobile','otherphone','mailingstreet'],'image':'summary_Contact.png'},
			'HelpDesk'		: {'sub_fields': [],'image':'summary_Tickets.png'},
			'Leads'			: {'sub_fields': [],'image':'summary_Leads.png'},
		},

		buildTitle : function(detailViewData){
			var module = app.getModuleName();
			var title = {'primary':'','sub_title':{},'image':''};

			var columnFields = detailViewData.columnFields;
			var nameFields = detailViewData.nameFields;
			var fieldLabels = detailViewData.fieldLabels;

			//build Primary title
			for (var i = 0; i < nameFields.length; i++) {
				if(columnFields[nameFields[i]] != ''){
					title.primary += " " + columnFields[nameFields[i]];
				}
			};
			
			//build sub title
			if(typeof this.module_name_fields[module] != 'undefined'){
				var sub_fields = this.module_name_fields[module].sub_fields;
				for (var i = 0; i < sub_fields.length; i++) {
					var fieldLabel = fieldLabels[sub_fields[i]];
					var fieldValue = columnFields[sub_fields[i]];
					if(fieldLabel != null && fieldValue != ''){
						title.sub_title[sub_fields[i]] = {'fieldLabel': fieldLabel,'fieldValue': fieldValue};
					}
				};

				var image = this.module_name_fields[module].image;
				title.image = 'layouts/vlayout/skins/images/'+ image;
			}
			if(title.primary == ''){
				title.primary = app.vtranslate('Detail') + " " + app.vtranslate(module);
			}
			return title;
		},

		loadDetailView : function(url_vars,isPjax){
			var thisInstance = this;
			if(this.pending == true) return;
			this.pending = true;
			var dashboardInstance = Dashboard.getInstance();
			var params = url_vars;
			var progressInstance = jQuery.progressIndicator();
			thisInstance.relatedView.resetListOfRelatedListView();

			params.mode = "showDetailViewByMode";
			params.requestMode = "sumary";

			var aDeferred = jQuery.Deferred();
			var bDeferred = jQuery.Deferred();

			var functionTarget = (typeof isPjax != 'undefined' && isPjax == true) ? 'sendRequest' : 'sendRequestPjax';

			//Get detailview CONTENT
			SalesPanel_Statics_Js[functionTarget](params).then(function(related_params,result){
				aDeferred.resolve(result);
				dashboardInstance.view.setModule(related_params.module);
				console.log(related_params.module);
				dashboardInstance.view.setView(related_params.view);
				dashboardInstance.view.setRecordId(related_params.record);
				//Load js files of current view of this view
				dashboardInstance.view.loadJsOfCurrentView(related_params);
				thisInstance.pending = false;
			});

			//Get detailview DATA
			var params2 = {module: 'SalesPanel',action: 'GetDetailView', relatedModule : params.module, relatedRecord: params.record};
			SalesPanel_Statics_Js.sendRequest(params2).then(function(related_params,result){
				bDeferred.resolve(result.result);
			});

			/**
			 * RENDER TO DOM
			 * @sumaryHTML <HTML string> ready render to DOM
			 * @detailViewData <Object> infomartion about current View: links, columFields, Fields Title
			 */
			jQuery.when(aDeferred,bDeferred).then(function(sumaryHTML,detailViewData){
				var module = app.getModuleName();
				console.log(module);
				// RENDER CONTENT
				thisInstance.detaiViewRender(sumaryHTML, thisInstance.buildTitle(detailViewData));

				//RENDER RELATED MENU
				var detailViewLinks = detailViewData.detailViewLinks;
				detailViewLinks.MODULE = module;
				//This code is execute after DetailView have been loaded and fill to DOM
				thisInstance.actionsRender(detailViewLinks);
				thisInstance.relatedView.relatedMenuRender(detailViewLinks);

				progressInstance.hide();
			});
		},

		setHorizonRelatedMenuInOneRow : function(){
			//var thisInstance = this;

			var detailViewContainer = this.getDetailViewContainer();
			var relatedContainer = jQuery(".related",detailViewContainer);
			var ListItems = jQuery('li',relatedContainer);
			var offset = [];

			var firstItem = ListItems[Object.keys(ListItems)[1]];
			var firstOffset = jQuery(firstItem).offset().top;
			var ListItemsInDropDownMenu = [];
			//If 
			ListItems.each(function(i,item){
				var thisOffset = jQuery(this).offset().top;
				if(firstOffset != thisOffset){
					ListItemsInDropDownMenu.push(jQuery(this).clone().addClass('clearBoth'));
					jQuery(this).addClass('hide');
				}else{
					jQuery(this).removeClass('hide');
				}
			});

			if(ListItemsInDropDownMenu.length == 0) return;
			// Hide the first
			ListItemsInDropDownMenu.push(jQuery(firstItem).clone().addClass('clearBoth'));
			jQuery(firstItem).addClass('hide');


			var DropDownContainer = jQuery('<span class="hd-dropdown dropdown" onclick="return false"></span>');
			var DropDownToggleLink = jQuery('<a href="javascript:;" class="dropdown-toggle">Thêm <b class="caret"></b></a>');
			DropDownContainer.append(DropDownToggleLink);

			var DropDownMenu = jQuery('<ul class="dropdown-menu pull-right"></ul>');
			for (var i = 0; i < ListItemsInDropDownMenu.length; i++) {
				DropDownMenu.append(ListItemsInDropDownMenu[i]);
			};
			var UL = relatedContainer.find('ul');
			DropDownContainer.append(DropDownMenu);
			UL.append(DropDownContainer);

			this.relatedMenuIsHorizol = false;
		},

		actionsRender : function(data){
			data.PRELOAD_BTNS = {
				Contacts : [
					{module : 'SalesOrder',name : 'contact_id'},
					{module : 'Quotes',name : 'contact_id'},
					{module : 'HelpDesk',name : 'contact_id'}
				],
				Accounts : [
					{module : 'SalesOrder',name : 'account_id'},
					{module : 'Quotes',name : 'account_id'},
					{module : 'HelpDesk',name : 'parent_id'},
				]
			};
			 _.templateSettings.variable = "rc";
			var template = _.template(jQuery('.detailViewActionsTemplate').html());
			var actionsHolder = jQuery("#actionsHolder");
			actionsHolder.html(template(data));
			Dashboard.getInstance().view.ajaxyTheLinks(actionsHolder);

			// after render actions buttons, preload EditView
			var detailViewContainer = this.getDetailViewContainer();
			var preloadEditViewBtns = jQuery(".preloadEditViewBtnsHolder",actionsHolder).find('span');

			for (var i = 0; i < preloadEditViewBtns.length; i++) {
				var params = {
					module : jQuery(preloadEditViewBtns[i]).data('module'),
					view : 'Edit',
					sourceModule : jQuery("#module").val(),
					sourceRecord : jQuery("#recordId").val(),
					relationOperation : true
				};
				params[jQuery(preloadEditViewBtns[i]).data('name')] = jQuery("#recordId").val();
				Dashboard.getInstance().editView.preloadEditView(params);
			};

			// register preloadEditViewBtns click
			preloadEditViewBtns.on('click',function(e){
				if(jQuery(this).find('a').attr('disabled') == 'disabled') return;
				var params = {
					module : jQuery(this).data('module'),
					view : 'Edit',
					sourceModule : jQuery("#module").val(),
					sourceRecord : jQuery("#recordId").val(),
					relationOperation : true
				}

				params[jQuery(this).data('name')] = jQuery("#recordId").val();
				Dashboard.getInstance().editView.loadEditViewFromPreloadStorage(params);
			});
		},

		detaiViewRender : function(data,title){
			var dashboardInstance = Dashboard.getInstance();
			var detailViewContainer = this.getDetailViewContainer();
			var horizonRelatedMenuClone = jQuery("#horizonRelatedMenuClone");
			// get and save horizonRelatedMenu before it being removed by resetAll
			if(this.relatedMenuIsHorizol == false){
				horizonRelatedMenuClone.html(jQuery('.horizon-related',detailViewContainer));
			}

			dashboardInstance.quicklink.resetAll();
			dashboardInstance.view.resetAll();

			if(this.relatedMenuIsHorizol == true){
				var detailviewTemplate = jQuery('#detailViewInfoHidden_withHorizolRelatedMenu');
				var titleViewContainer = jQuery(".titleViewHolder");
			}else{
				var detailviewTemplate = jQuery('#detailViewInfoHidden');
				//title = null;
			}
			// Render template data for detail view content, (like Zerg building on Creep)
			var detailViewInfo = detailviewTemplate.html();
			dashboardInstance.view.render(detailViewInfo,detailViewContainer);
			// Then fill data on the template
			var detailViewContents = jQuery('.contents',detailViewContainer);
			dashboardInstance.view.render(data,detailViewContents);

			// second title holder
			var secondTitleViewHolder = '<div class="secondTitleViewHolder"></div><br>';
			detailViewContents.prepend(secondTitleViewHolder);
			console.log(this.relatedMenuIsHorizol);
			if(this.relatedMenuIsHorizol == false){
				var titleViewContainer = jQuery(".secondTitleViewHolder");
			}
			if(typeof title == 'string')
				dashboardInstance.view.render('<h3>' + title + '</h3>',titleViewContainer);
			else if(typeof title == 'object'){
				_.templateSettings.variable = "rc";
				var template = _.template(jQuery('.titleTemplate').html());
				titleViewContainer.html(template(title));
			}

			//Only account module
			//if(app.getModuleName() == 'Accounts')	this.setHardInfo();

			app.showSelect2ElementView(detailViewContents.find('select.select2'));
			app.changeSelectElementView(detailViewContents);

			dashboardInstance.view.ajaxyTheLinks(detailViewContainer);
		},

		getDetailViewContainer : function(){
			return jQuery(".detailViewContainer");
		},

		relatedView : {
			ListOfRelatedListView : {},

			resetListOfRelatedListView : function(){
				this.ListOfRelatedListView = {};
			},
			addLoadingGif : function(){
				//<span class="pull-right" style="width:20px"><img class="loadinImg alignMiddle" src="layouts/vlayout/skins/softed/images/loading.gif"></span>
			},
			relatedMenuRender : function(data){
				var dashboardInstance = Dashboard.getInstance();
				var content = '<ul class="nav nav-stacked nav-pills">';
				var DETAILVIEWTAB = data.DETAILVIEWTAB;
				var DETAILVIEWRELATED = data.DETAILVIEWRELATED;

				var activeClass = 'active active2';
				jQuery.each(DETAILVIEWTAB,function(i,item){
					content += '<li class="' + activeClass + '" id="'+ item.linkId +'" data-url="'+ item.linkurl +'" data-label-key="'+ item.linklabel +'" data-link-key="'+ item.linkKey +'" >';
					content += '<a href="javascript:void(0);" class="textOverflowEllipsis" style="width:auto" title="'+ item.linkLabelTrans +'"><strong>'+ item.linkLabelTrans +'</strong></a>';
					content += '</li>';
					if(activeClass != '')
						activeClass = '';
				});
				if(DETAILVIEWRELATED){
					jQuery.each(DETAILVIEWRELATED,function(i,item){
						content += '<li class="" id="'+ item.linkId +'" data-url="'+ item.linkurl +'" data-label-key="'+ item.linklabel +'" data-link-key="'+ item.linkKey +'" >';
						content += '<a href="javascript:void(0);" class="textOverflowEllipsis" style="width:auto" title="'+ item.linkLabelTrans +'"><strong>'+ item.linkLabelTrans;
						if(item.noOfEntries != '-1')
							content += '( ' + item.noOfEntries + ')';
						content += '</strong></a>';
						content += '</li>';
					});
				}
				content += '</ul>';
				var detailViewContainer = dashboardInstance.detailView.getDetailViewContainer();
				var relatedContainer = jQuery(".related",detailViewContainer);
				dashboardInstance.view.render(content,relatedContainer);
				if(dashboardInstance.detailView.relatedMenuIsHorizol == true){
					dashboardInstance.detailView.setHorizonRelatedMenuInOneRow();
				}else{
					// Add horizonRelatedMenu to detailViewContainer
					var detailViewInfo = jQuery('.detailViewInfo',detailViewContainer);
					var horizonmenu = jQuery("#horizonRelatedMenuClone").html();
					detailViewInfo.prepend(horizonmenu);
				}

				// Re-style horizon related menu
				//nav nav-tabs massEditTabs
				var horizonUL = jQuery('.horizon-related > ul',detailViewContainer);
				horizonUL.removeClass('nav-stacked nav-pills').addClass('nav-tabs massEditTabs');

				// Register click on dropdown link in horizon related menu
				var DropDownToggleLink = jQuery('.dropdown-toggle',detailViewContainer);
				DropDownToggleLink.on('click',function(e){
					//Not on children
					if(e.target == this){
						jQuery(this).closest('span').toggleClass('open');
					}
				});
				this.registerRelatedMenuClick();
			},

			registerRelatedMenuClick : function(){
				var dashboardInstance = Dashboard.getInstance();
				var thisInstance = this;
				var detailViewContainer = dashboardInstance.detailView.getDetailViewContainer();
				var relatedContainer = jQuery(".related",detailViewContainer);
				var detailViewContents = jQuery('.contents',detailViewContainer);
				jQuery('li', relatedContainer).on('click',function(e){

					if( jQuery(this).closest('div.related').hasClass('horizon-related') ){
						// Remove vertical related menu when click on horiron related menu
						if( detailViewContainer.find('.related').hasClass('span2') ){
							detailViewContainer.find('.detailViewInfo > .span10').removeClass('span10').addClass('span12');
							detailViewContainer.find('.span2').remove();
						}
						
						// We have two relatedContainer, and here we only care about relatedContainer of this target
						var thisRelatedContainer = jQuery(this).closest('div.related');
						thisRelatedContainer.find('li.active2').removeClass('active2');
						jQuery(this).addClass('active2');
					}
					e.preventDefault();

					Dashboard.getInstance().view.render(app.vtranslate('Loading') + '...',detailViewContents);
					app.listenPostAjaxReady(function(){
						// Ajax all the links in related list
						dashboardInstance.view.ajaxyTheLinks(detailViewContents);

						// Add class active to horizonContainer after it have been removed by default
						var horizonRelatedMenu = jQuery(".horizon-related",detailViewContainer);
						horizonRelatedMenu.find('li.active2').addClass('active');
					});
				});
			}
		},
	},

	editView : {
		pending : false, // prevent double click
		loadEditView : function(url_vars,isAjax){
			var thisInstance = this;
			if(this.pending == true) return;
			this.pending = true;
			var dashboardInstance = Dashboard.getInstance();
			var params = url_vars;
			var progressInstance = jQuery.progressIndicator();

			// Mark related menu detail View is horizoltable
			dashboardInstance.detailView.relatedMenuIsHorizol = true;

			//Get editview content
			var aDeferred = jQuery.Deferred();
			var functionTarget = (typeof isAjax != 'undefined') ? 'sendRequest' : 'sendRequestPjax';
			SalesPanel_Statics_Js[functionTarget](params).then(function(related_params,result){
				thisInstance.editViewRender(result, app.vtranslate('Edit') + " " + app.vtranslate(related_params.module));
				dashboardInstance.view.setModule(related_params.module);
				dashboardInstance.view.setView(related_params.view);
				dashboardInstance.view.setRecordId(related_params.record);
				progressInstance.hide();
				thisInstance.pending = false;
				//Load js files of current view of this view
				dashboardInstance.view.loadJsOfCurrentView(related_params).then(function(){
					var editViewPagDiv = jQuery(".editViewPagDiv");
					thisInstance.registerSubmitForm(editViewPagDiv);
				});
			});
		},

		//Load view from preload storage;
		loadEditViewFromPreloadStorage : function(url_vars){
			var thisInstance = this;
			if(this.pending == true) return;
			this.pending = true;
			var dashboardInstance = Dashboard.getInstance();
			this.editViewRender(this.editViewsPreloaded[url_vars.module], app.vtranslate('Create new') + " " + app.vtranslate(url_vars.module));
			dashboardInstance.view.setModule(url_vars.module);
			dashboardInstance.view.setView(url_vars.view);
			//dashboardInstance.view.setRecordId(url_vars.record); // create new, not store record.
			// Mark related menu detail View is horizoltable
			dashboardInstance.detailView.relatedMenuIsHorizol = true;

			//pushState url
			SalesPanel_Statics_Js.pushHistory(url_vars);
			this.pending = false;
			//Load js files of current view of this view
			dashboardInstance.view.loadJsOfCurrentView(url_vars).then(function(){
				var editViewPagDiv = jQuery(".editViewPagDiv");
				thisInstance.registerSubmitForm(editViewPagDiv);
			});
		},

		editViewRender : function(data,title){
			var dashboardInstance = Dashboard.getInstance();
			var editViewPagDiv = jQuery(".editViewPagDiv");
			var titleViewContainer = jQuery(".titleViewHolder");

			dashboardInstance.quicklink.resetAll();
			dashboardInstance.view.resetAll();
			
			dashboardInstance.view.render(data,editViewPagDiv);
			dashboardInstance.view.render('<h3>' + title + '</h3>',titleViewContainer);
			app.showSelect2ElementView(editViewPagDiv.find('select.select2'));
			app.changeSelectElementView(editViewPagDiv);

			dashboardInstance.view.ajaxyTheLinks(editViewPagDiv);
		},

		registerSubmitForm : function(editViewPagDiv){
			editInstance = Vtiger_Edit_Js.editInstance;
			if(editInstance == false){
				alert("Edit instance not registed");
			}
			editInstance.registerSubmitEvent = function() {
				var editViewForm = jQuery("#EditView",editViewPagDiv);
				editViewForm.submit(function(e){
					if(editViewForm.data('submit') == "true"){
						var progressInstance = jQuery.progressIndicator();
						var params = editViewForm.serialize();
						AppConnector.request(params).then(function(data){
							progressInstance.hide();
							alert("done"); //expect never happen
						},function(err,error){
							var parmas_vars = SalesPanel_Statics_Js.getUrlVars(params);
							if(parmas_vars.record != ''){
								detail_params = {module: parmas_vars.module,view: 'Detail',record: parmas_vars.record};
							}else if(typeof parmas_vars.sourceModule != 'undefined' && parmas_vars.sourceModule != ''){
								detail_params = {module: parmas_vars.sourceModule,view: 'Detail',record: parmas_vars.sourceRecord};
							}
							progressInstance.hide();
							Dashboard.getInstance().detailView.loadDetailView(detail_params);
						});
						//end added
					}
					return false;
					
				});
			};
			editInstance.registerSubmitEvent();
		},

		// preload EditView by specific url
		editViewsPreloaded : {},
		preloadEditView : function(url_vars){
			var thisInstance = this;
			//var dashboardInstance = Dashboard.getInstance();
			var params = url_vars;
			//Get editview content
			var aDeferred = jQuery.Deferred();
			SalesPanel_Statics_Js.sendRequest(params).then(function(related_params,result){
				var actionsHolder = jQuery("#actionsHolder");
				thisInstance.editViewsPreloaded[related_params.module] = result;
				jQuery(".preload_" + related_params.module,actionsHolder).removeAttr('disabled');
			});
		}
	},

	listView : {
		/*modulesAllowAjaxListView : ['Accounts','Contacts','Quotes','SalesOrder','HelpDesk','Coupons','Products','Invoice'],*/
		ListOfListView : {},
		loadListView : function(params){
			var thisInstance = this;
			var dashboardInstance = Dashboard.getInstance();
			dashboardInstance.view.setModule(params.module);
			dashboardInstance.view.setView(params.view);

			// Mark related menu detail View is horizoltable
			dashboardInstance.detailView.relatedMenuIsHorizol = true;

			var aDeferred = jQuery.Deferred();
			var bDeferred = jQuery.Deferred();

			/*if(SalesPanel_Statics_Js.checkStorageSupport()){
				thisInstance.ListOfListView = ( sessionStorage.getItem('ListOfListView') == null ) ? {} : sessionStorage.getItem('ListOfListView');
			}*/

			if(typeof thisInstance.ListOfListView[params.module] == 'undefined'){
				var progressInstance = jQuery.progressIndicator();
				SalesPanel_Statics_Js.sendRequestPjax(params).then(function(related_params,data){
					aDeferred.resolve(data);
				});

				var CustomViewParams = {module : 'SalesPanel',view : 'CustomView', relatedModule : app.getModuleName()};
				SalesPanel_Statics_Js.sendRequest(CustomViewParams).then(function(related_params,data){
					bDeferred.resolve(data);
				});

				jQuery.when(aDeferred,bDeferred).done(function(listViewData,customViewData){
					thisInstance.ListOfListView[params.module] = {};
					thisInstance.ListOfListView[params.module].listViewData = listViewData;
					thisInstance.ListOfListView[params.module].customViewData = customViewData;
					thisInstance.listViewRender(params.module, app.vtranslate('List') + " " + app.vtranslate(params.module));
					progressInstance.hide();
				});
			}else{
				var data = thisInstance.ListOfListView[params.module];
				thisInstance.listViewRender(params.module, app.vtranslate('List') + " " + app.vtranslate(params.module));
				SalesPanel_Statics_Js.pushHistory(params);
			}
		},

		listViewRender : function(module,title){
			var listViewContentsContainer = jQuery('div.listViewPageDiv');
			var titleViewContainer = jQuery(".titleViewHolder");
			var pagingTemplate = jQuery("#PagingTemplate").html();
			var dashboardInstance = Dashboard.getInstance();
			var thisInstance = this;

			dashboardInstance.view.resetAll();
			var listViewData = thisInstance.ListOfListView[module].listViewData;
			var customViewData = thisInstance.ListOfListView[module].customViewData;
			dashboardInstance.view.render(listViewData,listViewContentsContainer);
			dashboardInstance.view.render('<h3>' + title + '</h3>',titleViewContainer);
			dashboardInstance.view.renderActions(customViewData);
			thisInstance.rowOnclick(jQuery('tr.listViewEntries',listViewContentsContainer));
			
			SalesPanel_ListView_js.getInstance().registerEventsAfterRenderListViewToDOM(listViewData);
			SalesPanel_ListView_js.getInstance().registerEvents();
		},

		registerLinkHeaderClick : function(){
			var thisInstance = this;
			var modulesListContanainer = jQuery(".modulesList");
			jQuery('li.tabs',modulesListContanainer).on('click',function(e){
				var href = jQuery(this).find('a').attr('href');
				var params = SalesPanel_Statics_Js.getUrlVars(href);

				//Only support modules have List view
				if(params.view != 'List'){
					Vtiger_Helper_Js.showPnotify({title:'Message',text:app.vtranslate('Cache only support modules have List view'),width:'300px'});
					return;
				} 

				modulesListContanainer.find('.selected2').removeClass('selected2');
				jQuery(this).addClass('selected2');
				thisInstance.loadListView(params);
				e.preventDefault();
			});
		},

		rowOnclick : function(rowContainer){
			dashboardInstance = Dashboard.getInstance();
			rowContainer.on('click',function(e){
				var target = jQuery(e.target).closest('a');
				var data_url = (target.length == 1) ? target.attr('href') : jQuery(this).data('recordurl');
				var url_vars = SalesPanel_Statics_Js.getUrlVars(data_url);
				
				dashboardInstance.detailView.loadDetailView(url_vars);
				e.preventDefault();
			});
		}
	},

	anotherViews : {

	},

	quicklink : {
		injectDataAttrib : function(){
			var quickLinksContainer = jQuery(".quickLinksDiv");
			jQuery('p',quickLinksContainer).each(function(i,item){
				jQuery(this).append('<span class="pull-right span1"><img class="loadinImg alignMiddle" src="layouts/vlayout/skins/softed/images/loading.gif"></span>');
				var id = jQuery(this).attr('id');
				var id_splited = id.split('_sideBar_link_');
				var moduleName = id_splited[1];
				var imgHolder = jQuery('<span>').addClass('pull-right imgHolder');
				jQuery(this).attr('data-module',moduleName).append(imgHolder);
			});
		},
		resetAll : function(){
			var quickLinksContainer = jQuery(".quickLinksDiv");
			var selectedQuickLink = quickLinksContainer.find('p[class="selectedQuickLink"]');
			selectedQuickLink.removeClass('selectedQuickLink').addClass('unSelectedQuickLink');
			return selectedQuickLink;
		},
		registerQuickLinkClick : function(){
			var quickLinksContainer = jQuery(".quickLinksDiv");
			var thisInstance = this;
			jQuery("p",quickLinksContainer).on('click',function(){
				thisInstance.resetAll();
				var moduleName = jQuery(this).data('module');
				var data = SalesPanel_ListView_js.getInstance().ListOfListView[moduleName];

				if(jQuery(this).hasClass('unSelectedQuickLink')){
					jQuery(this).addClass('selectedQuickLink').removeClass('unSelectedQuickLink');
				}

				Dashboard.getInstance().listView.listViewRender(data, app.vtranslate('List') + " " + app.vtranslate(moduleName));
			});
		},
		getSelectedLink : function(){
			return quickLinksContainer.find('p[class="selectedQuickLink"]');
		}
	},

	checkBox : {
		setCheckBoxLocalStorage : function(){
			var checkbox_on_off = jQuery("input.checkbox-on-off");
			var captureGlobalSearchCheckboxVal = (typeof checkbox_on_off.attr("checked") == 'undefined') ? true : false;
			localStorage.setItem("captureGlobalSearchCheckboxVal",captureGlobalSearchCheckboxVal);
		},
		getCheckBoxLocalStorage : function(){
			return localStorage.getItem("captureGlobalSearchCheckboxVal");
		},
	},

	view : {
		jsViewInstance : null,
		render : function(data,container){
			if(data != null){
				container.html(data);
			}
			/*jQuery(".searchByPhoneHolder").removeClass('hide');*/
		},

		renderActions : function(data){
			jQuery('#actionsHolder').html(data);
		},

		resetAll : function(){
			jQuery("#actionsHolder,#titleViewHolder,#contentViewHolder,.listViewPageDiv,.detailViewContainer,.editViewContainer").html('');
			if(Dashboard.getInstance().detailView.relatedMenuIsHorizol == true){
				jQuery("#account_hard_info_holder").html('');
			}
			jQuery(".mainContainer,#leftPanel,#rightPanel").removeStyle('min-height');
		},

		//Load javascript file for specific view
		loadJs : function(module,view){
			var Deferred = jQuery.Deferred();
			var thisInstance = this;
			var params = {module: 'SalesPanel', action: 'loadJs',relatedModule: module, relatedView: view};
			var jsContainer = jQuery('.jsHolder');
			SalesPanel_Statics_Js.sendRequest(params).then(function(related_params,result){
				Deferred.resolve(result);
			});
			return Deferred.promise();
		},

		loadJsOfCurrentView : function(related_params){
			var progressInstance = jQuery.progressIndicator();
			var aDeferred = jQuery.Deferred()
			var thisInstance = this;
			jQuery.ajaxSetup({
				cache: true
			});			
			thisInstance.loadJs(related_params.module,related_params.view).then(function(data){
				var scriptsNotIncluded = dashboardInstance.view.getScriptsNotIncluded(data.result);
				var bDeferred = jQuery.Deferred();
				jQuery.getMultiScripts(scriptsNotIncluded).then(
					function(){
						bDeferred.resolve();
					},
					function(){
						bDeferred.resolve();
					}
				);
				bDeferred.promise().then(function(){
					thisInstance.jsViewInstance = null;
					delete thisInstance.jsViewInstance;
					if(related_params.view == 'Detail'){
						Vtiger_Detail_Js.detailInstance = false;
						thisInstance.jsViewInstance = Vtiger_Detail_Js.getInstance();
						Dashboard.getInstance().rewriteDetailViewFunctions(thisInstance.jsViewInstance);
					}else if(related_params.view == 'Edit'){
						Vtiger_Edit_Js.editInstance = false;
						thisInstance.jsViewInstance = Vtiger_Edit_Js.getInstance();

						// because container of Edit view has been reload to DOM and then we must rewrite the getForm function of Vtiger_Edit_Js instance
						thisInstance.jsViewInstance.getForm = function(){
							this.setForm(jQuery('#EditView'));
							return this.formElement;
						}
					}
					thisInstance.jsViewInstance.registerEvents();
					progressInstance.hide();
					aDeferred.resolve();
				});
			});
			return aDeferred.promise();
		},

		renderScripts : function(data){
			var scripts = '';
			var scriptHolder = jQuery("#scripts");
			for (var i = 0; i < data.length; i++) {
				script = document.createElement('script');
				script.type = 'text/javascript';
				script.src = data[i];
				$('head',document).append( script );
			};
		},

		getScriptsNotIncluded : function(srcs){
			var scripts = document.getElementsByTagName("script");
			var scriptsIncluded = [];
			for(var i = 0; i < scripts.length; i++){
				var src = scripts[i].getAttribute('src');
				if(src != null){
					var splited = src.split("?");
					scriptsIncluded.push(splited[0]);
				}
			}
//			console.log(srcs);
			/*console.log(scriptsIncluded);*/
			ScriptsNotIncluded = srcs.filter( function( el ) {
				return scriptsIncluded.indexOf( el ) < 0;
			});
			return ScriptsNotIncluded;
		},

		setModule : function(value){
			jQuery("#module").val(value);
		},

		setView : function(value){
			jQuery("#view").val(value);
		},

		setRecordId : function(value){
			jQuery("#recordId").val(value);
		},

		//function to prevent default when click to any links in the view and send via Ajax request insteads
		ajaxyTheLinks : function(container){
			dashboardInstance = Dashboard.getInstance();
			//var anchors = container.find('a[href^="index.php"]').not('[href*=ExportPDF]').not('[href*=ExportExcel]');
			var anchors = container.find('a[href^="index.php"]');
			anchors.on('click',function(e){
				//var data_url = (target.length == 1) ? target.attr('href') : jQuery(this).data('recordurl');
				var data_url = jQuery(this).attr('href');
				var url_vars = SalesPanel_Statics_Js.getUrlVars(data_url);
				if(typeof url_vars.action != 'undefined' && (url_vars.action == 'ExportPDF' || url_vars.action == 'ExportExcel')){
					return;
				}
				if(url_vars.module == 'Users'){
					return;
				}
				if(url_vars.view == 'Detail')
					dashboardInstance.detailView.loadDetailView(url_vars);
				else if(url_vars.view == 'Edit')
					dashboardInstance.editView.loadEditView(url_vars);
				e.preventDefault();
				return false;
			});

			//add target blank to PDF and Excel export link
			container.find('a[href*=ExportPDF],a[href*=ExportExcel]').attr('target','_blank');
		}
	},

	//function to rewrite specific functions in detail.js before they are being registed
	rewriteDetailViewFunctions : function(jsViewInstance){
		var thisDashboardInstance = this;
		/**
		 * Function to register event for related list row click
		 */
		jsViewInstance.registerRelatedRowClickEvent = function(){
			var detailContentsHolder = this.getContentHolder();
			detailContentsHolder.on('click','.listViewEntries',function(e){
				var targetElement = jQuery(e.target, jQuery(e.currentTarget));
				if(targetElement.is('td:first-child') && (targetElement.children('input[type="checkbox"]').length > 0)) return;
				if(jQuery(e.target).is('input[type="checkbox"]')) return;
				var elem = jQuery(e.currentTarget);
				var recordUrl = elem.data('recordurl');
				if(typeof recordUrl != "undefined"){
					// window.location.href = recordUrl;
					var url_vars = SalesPanel_Statics_Js.getUrlVars(recordUrl);
					thisDashboardInstance.detailView.loadDetailView(url_vars,true);
				}
			});
		}
		/**
		 * Function to register event for adding related record for module
		 */
		 jsViewInstance.registerEventForAddingRelatedRecord = function(){
		 	var thisInstance = this;
		 	var detailContentsHolder = this.getContentHolder();
		 	detailContentsHolder.on('click','[name="addButton"]',function(e){
		 		var element = jQuery(e.currentTarget);
		 		var selectedTabElement = thisInstance.getSelectedTab();
		 		var relatedModuleName = thisInstance.getRelatedModuleName();
		 		var quickCreateNode = jQuery('#quickCreateModules').find('[data-name="'+ relatedModuleName +'"]');
		 		if(quickCreateNode.length <= 0) {
		 			//window.location.href = element.data('url');
		 			var url_vars = SalesPanel_Statics_Js.getUrlVars(element.data('url'));
		 			thisDashboardInstance.editView.loadEditView(url_vars,true);
		 			return;
		 		}

		 		var relatedController = new Vtiger_RelatedList_Js(thisInstance.getRecordId(), app.getModuleName(), selectedTabElement, relatedModuleName);
		 		relatedController.addRelatedRecord(element);
		 	})
		 }
	},

	registerStateChange : function(){
		var thisInstance = this;
		window.onpopstate = function(event) {
			//alert("location: " + document.location + ", state: " + JSON.stringify(event.state));
			var location = document.location.href;
			var url_vars = SalesPanel_Statics_Js.getUrlVars(location);
			if(url_vars.view == 'Detail')
				thisInstance.detailView.loadDetailView(url_vars,true);
			else if(url_vars.view == 'Edit')
				thisInstance.editView.loadEditView(url_vars,true);
			else if(url_vars.view == 'List')
				thisInstance.listView.loadListView(url_vars,true);
		};
	},

	registerSearchByPhone : function(){
		var thisInstance = this;
		var searchByPhone = jQuery("#searchByPhone");
		var searchByPhoneContainer = searchByPhone.closest('.searchByPhoneContainer');
		var searchByPhoneBtn = jQuery("#searchByPhoneBtn");
		searchByPhone.keypress(function(e) {
			var currentTarget = jQuery(e.currentTarget)
			if (e.which == 13) {
				Vtiger_Header_Js.getInstance().labelSearch(currentTarget);
				var val = currentTarget.val();
				jQuery("#globalSearchValue").val(val).focus();
			}
		});
		searchByPhoneBtn.on('click',function(){
			var currentTarget = jQuery('#searchByPhone');
			var pressEvent = jQuery.Event("keypress");
			pressEvent.which = 13;
			currentTarget.trigger(pressEvent);
		});
	},

	registerEvents : function(){
		var thisInstance = this;
		this.registerCustomizeLabelSearch();
		this.quicklink.registerQuickLinkClick();
		this.registerCloseTooltipClick();
		this.registerStateChange();
		this.listView.registerLinkHeaderClick();
		this.registerSearchByPhone();
		/*this.listView.getCvIds().then(function(data){
			thisInstance.listView.loadList(data);
		});*/
		
		//Focus to #searchByPhone
		jQuery("#searchByPhone").focus();
		
		var captureGlobalSearchCheckboxVal = this.checkBox.getCheckBoxLocalStorage();

		var checkbox_on_off = jQuery("input.checkbox-on-off");
		if(typeof captureGlobalSearchCheckboxVal == 'undefined')
			thisInstance.checkBox.setCheckBoxLocalStorage();
		else{
			if(captureGlobalSearchCheckboxVal == "true")
				checkbox_on_off.attr("checked","checked");
			else{
				checkbox_on_off.removeAttr("checked");
			}
		}

		checkbox_on_off.tzCheckbox({labels:[app.vtranslate('On'),app.vtranslate('Off')]});

		jQuery(".tzCBContent").on('click',function(){
			thisInstance.checkBox.setCheckBoxLocalStorage();
		});
	},
});

jQuery(document).ready(function(){
	var DashboardInstance = Dashboard.getInstance();
	DashboardInstance.registerEvents();
});