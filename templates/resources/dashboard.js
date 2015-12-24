
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

	//Variable storage list of Quotes, SalesOrder, Invoice,... to display immediately for User.
	htmlTemplateFolder : 'layouts/vlayout/modules/SalesPanel/htmlTemplates/',

	// Modify a litle in labelSearch function of Vtiger_Header_Js
	registerCustomizeLabelSearch : function(){
		var thisInstance = this;

		// Function labelSearch of Vtiger_Header_Js
		Vtiger_Header_Js.getInstance().labelSearch = function(currentTarget){
			var val = currentTarget.val();
			if (val == '') {
				alert(app.vtranslate('JS_PLEASE_ENTER_SOME_VALUE'));
				currentTarget.focus();
				return false;
			}
			var basicSearch = new Vtiger_BasicSearch_Js();
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
		loadDetailView : function(url_vars,isAjax){
			var thisInstance = this;
			if(this.pending == true) return;
			this.pending = true;
			var dashboardInstance = Dashboard.getInstance();
			var params = url_vars;
			var progressInstance = jQuery.progressIndicator();
			console.log(params);
			thisInstance.relatedView.resetListOfRelatedListView();

			params.mode = "showDetailViewByMode";
			params.requestMode = "summary";

			//Get detailview content
			var aDeferred = jQuery.Deferred();
			var functionTarget = (typeof isAjax != 'undefined') ? 'sendRequest' : 'sendRequestPjax';
			SalesPanel_Statics_Js[functionTarget](params).then(function(related_params,result){
				thisInstance.detaiViewRender(result,"- " + app.vtranslate('Detail') + " " + app.vtranslate(related_params.module))
				dashboardInstance.view.setModule(related_params.module);
				dashboardInstance.view.setView(related_params.view);
				dashboardInstance.view.setRecordId(related_params.record);
				aDeferred.resolve();
				progressInstance.hide();
				thisInstance.pending = false;

				//Load js files of current view of this view
				dashboardInstance.view.loadJsOfCurrentView(related_params);
			});

			//Get detailview links
			var params2 = {module: 'SalesPanel',action: 'GetDetailViewLinks', relatedModule : params.module, relatedRecord: params.record};
			SalesPanel_Statics_Js.sendRequest(params2).then(function(related_params,result){
				var related_links = [];
				var DETAILVIEWTAB = result.result.DETAILVIEWTAB;
				//console.log(result.result);
				var DETAILVIEWRELATED = result.result.DETAILVIEWRELATED;

				jQuery.each(DETAILVIEWTAB,function(i,item){
					related_links.push(item.linkurl + "&linkId=" + item.linkId);
				});
				if(DETAILVIEWRELATED){
					jQuery.each(DETAILVIEWRELATED,function(i,item){
						related_links.push(item.linkurl  + "&linkId=" + item.linkId);
					});
				}
				aDeferred.promise().then(function(data){
					result.result.MODULE = related_params.relatedModule;
					result.result.PRELOAD_BTNS = {
						Contacts : [
							{module : 'SalesOrder',name : 'contact_id'},
							{module : 'Quotes',name : 'contact_id'},
							{module : 'HelpDesk',name : 'contact_id'}
						],
						Accounts : [
							{module : 'SalesOrder',name : 'account_id'},
							{module : 'Quotes',name : 'account_id'},
							{module : 'HelpDesk',name : 'parent_id'}
						],
						SalesOrder : [
							{module : 'Coupons',name : 'related_orders'}
						],
					};
					//This code is execute after DetailView have been loaded and fill to DOM
					thisInstance.actionsRender(result.result);
					thisInstance.relatedView.relatedListRender(result.result);
				});
				//thisInstance.relatedView.loadList(related_links);
			});
		},

		actionsRender : function(data){
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
				console.log("preloadEditViewBtns clicked");
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
			var titleViewContainer = jQuery(".titleViewHolder");

			dashboardInstance.quicklink.resetAll();
			dashboardInstance.view.resetAll();
			// Render template data
			var detailViewInfo = jQuery('#detailViewInfoHidden').html();
			dashboardInstance.view.render(detailViewInfo,detailViewContainer);
			// Then fill data on the template
			var detailViewContents = jQuery('.contents',detailViewContainer);
			dashboardInstance.view.render(data,detailViewContents);
			dashboardInstance.view.render(title,titleViewContainer);
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
			loadList : function(links){
				var dashboardInstance = Dashboard.getInstance();
				var thisInstance = this;
				for (var i = 0; i < links.length; i++) {
					var params = SalesPanel_Statics_Js.getUrlVars(links[i]);
					params.type = "GET";

					SalesPanel_Statics_Js.sendRequest(params).then(function(related_params,result){
						var detailViewContainer = dashboardInstance.detailview.getDetailViewContainer();
						var relatedContainer = jQuery(".related",detailViewContainer);
						var relatedLink = jQuery('li[id="' + related_params.linkId + '"]', relatedContainer);

						thisInstance.ListOfRelatedListView[related_params.linkId] = result;

						relatedLink.find('.pull-right').remove();
						if(typeof related_params.relatedModule != 'undefined'){
							var tbodyContainer = jQuery(result).find('tbody');
							if(tbodyContainer.length > 0){
								var count = tbodyContainer.children('tr').length;
								relatedLink.find('strong').append(' (' + count + ')');
							}else{
								relatedLink.find('strong').append(' (0)');
							}
						}
					});
				};
			},
			relatedListRender : function(data){
				var dashboardInstance = Dashboard.getInstance();
				var content = '<ul class="nav nav-stacked nav-pills">';
				var DETAILVIEWTAB = data.DETAILVIEWTAB;
				var DETAILVIEWRELATED = data.DETAILVIEWRELATED;

				jQuery.each(DETAILVIEWTAB,function(i,item){
					content += '<li class="" id="'+ item.linkId +'" data-url="'+ item.linkurl +'" data-label-key="'+ item.linklabel +'" data-link-key="'+ item.linkKey +'" >';
					content += '<a href="javascript:void(0);" class="textOverflowEllipsis" style="width:auto" title="'+ item.linkLabelTrans +'"><strong>'+ item.linkLabelTrans +'</strong></a>';
					content += '</li>';
				});
				if(DETAILVIEWRELATED){
					jQuery.each(DETAILVIEWRELATED,function(i,item){
						content += '<li class="" id="'+ item.linkId +'" data-url="'+ item.linkurl +'" data-label-key="'+ item.linklabel +'" data-link-key="'+ item.linkKey +'" >';
						content += '<a href="javascript:void(0);" class="textOverflowEllipsis" style="width:auto" title="'+ item.linkLabelTrans +'"><strong>'+ item.linkLabelTrans +'</strong></a>';
						content += '</li>';
					});
				}
				content += '</ul>';
				var detailViewContainer = dashboardInstance.detailView.getDetailViewContainer();
				var relatedContainer = jQuery(".related",detailViewContainer);
				dashboardInstance.view.render(content,relatedContainer);
				this.registerRelatedLinkClick();
			},
			registerRelatedLinkClick : function(){
				var dashboardInstance = Dashboard.getInstance();
				var thisInstance = this;
				var detailViewContainer = dashboardInstance.detailView.getDetailViewContainer();
				var relatedContainer = jQuery(".related",detailViewContainer);
				var detailViewContents = jQuery('.contents',detailViewContainer);
				jQuery('li', relatedContainer).on('click',function(e){
					var linkId = jQuery(this).attr('id');
					if(typeof thisInstance.ListOfRelatedListView[linkId] != 'undefined'){
						Dashboard.getInstance().view.render(thisInstance.ListOfRelatedListView[linkId],detailViewContents);
						//reload again
						detailViewContainer = dashboardInstance.detailView.getDetailViewContainer();
						dashboardInstance.listView.rowOnclick(jQuery('tr.listViewEntries',detailViewContainer));
					}else{
						//var params = SalesPanel_Statics_Js.getUrlVars(jQuery(this).data('url'));
						Dashboard.getInstance().view.render(app.vtranslate('Loading') + '...',detailViewContents);
						/*AppConnector.request(params).then(
							function(data) {
								Dashboard.getInstance().view.render(data,detailViewContents);
							}
						);*/
					}
					relatedContainer.find('li.active').removeClass('active');
					jQuery(this).addClass('active');
					e.preventDefault();
				});
			}
		},
	},

	editView : {
		pending : false, // prevent double click
		loadEditView : function(url_vars,isAjax){
			console.log(this.pending);
			var thisInstance = this;
			if(this.pending == true) return;
			this.pending = true;
			var dashboardInstance = Dashboard.getInstance();
			var params = url_vars;
			var progressInstance = jQuery.progressIndicator();

			//Get editview content
			var aDeferred = jQuery.Deferred();
			var functionTarget = (typeof isAjax != 'undefined') ? 'sendRequest' : 'sendRequestPjax';
			SalesPanel_Statics_Js[functionTarget](params).then(function(related_params,result){
				thisInstance.editViewRender(result,"- " + app.vtranslate('Edit') + " " + app.vtranslate(related_params.module));
				dashboardInstance.view.setModule(related_params.module);
				dashboardInstance.view.setView(related_params.view);
				dashboardInstance.view.setRecordId(related_params.record);
				progressInstance.hide();
				thisInstance.pending = false;
				//Load js files of current view of this view
				dashboardInstance.view.loadJsOfCurrentView(related_params);
			});
		},
		//Load view from preload storage;
		loadEditViewFromPreloadStorage : function(url_vars){
			if(this.pending == true) return;
			this.pending = true;
			var dashboardInstance = Dashboard.getInstance();
			this.editViewRender(this.editViewsPreloaded[url_vars.module],"- " + app.vtranslate('Create new') + " " + app.vtranslate(url_vars.module));
			dashboardInstance.view.setModule(url_vars.module);
			dashboardInstance.view.setView(url_vars.view);
			//dashboardInstance.view.setRecordId(url_vars.record); // create new, not store record.

			//pushState url
			var vars = [];
			jQuery.each(url_vars,function(i,item){
				var url_part = i + "=" + item;
				vars.push(url_part);
			});
			var url = vars.join("&");
			url = "index.php?" + url;
			var obj = {Page: url,Url : url}
			history.pushState(obj,obj.Page,obj.Url);
			this.pending = false;
			//Load js files of current view of this view
			dashboardInstance.view.loadJsOfCurrentView(url_vars);
		},
		editViewRender : function(data,title){
			var dashboardInstance = Dashboard.getInstance();
			var editViewPagDiv = jQuery(".editViewPagDiv");
			var titleViewContainer = jQuery(".titleViewHolder");

			dashboardInstance.quicklink.resetAll();
			dashboardInstance.view.resetAll();
			
			dashboardInstance.view.render(data,editViewPagDiv);
			dashboardInstance.view.render(title,titleViewContainer);
			app.showSelect2ElementView(editViewPagDiv.find('select.select2'));
			app.changeSelectElementView(editViewPagDiv);

			dashboardInstance.view.ajaxyTheLinks(editViewPagDiv);
			this.registerSubmitForm(editViewPagDiv);
		},
		registerSubmitForm : function(editViewPagDiv){
			editlInstance = Vtiger_Edit_Js.getInstance();
			editlInstance.registerSubmitEvent = function() {
				var editViewForm = jQuery("#EditView",editViewPagDiv);
				//Remove a previously-attached event handler from the editViewForm.
				editViewForm.unbind('submit');
				editViewForm.submit(function(e){
					//Form should submit only once for multiple clicks also
					if(typeof editViewForm.data('submit') != "undefined") {
						return false;
					} else {
						var module = jQuery(e.currentTarget).find('[name="module"]').val();
						if(editViewForm.validationEngine('validate')) {
							//Once the form is submiting add data attribute to that form element
							editViewForm.data('submit', 'true');
							//on submit form trigger the recordPreSave event
							var recordPreSaveEvent = jQuery.Event(Vtiger_Edit_Js.recordPreSave);
							editViewForm.trigger(recordPreSaveEvent, {'value' : 'edit'});
							if(recordPreSaveEvent.isDefaultPrevented()) {
								//If duplicate record validation fails, form should submit again
								editViewForm.removeData('submit');
								e.preventDefault();
							}else{
								//added by haidang009
								var params = editViewForm.serialize();
								AppConnector.request(params).then(function(data){
									alert("done"); //expect never happen
								},function(err,error){
									var parmas_vars = SalesPanel_Statics_Js.getUrlVars(params);
									if(parmas_vars.record != ''){
										detail_params = {module: parmas_vars.module,view: 'Detail',record: parmas_vars.record};
									}else if(typeof parmas_vars.sourceModule != 'undefined' && parmas_vars.sourceModule != ''){
										detail_params = {module: parmas_vars.sourceModule,view: 'Detail',record: parmas_vars.sourceRecord};
									}
									Dashboard.getInstance().detailView.loadDetailView(detail_params);
								});
								e.preventDefault();
								//end added
							}
						} else {
							//If validation fails, form should submit again
							editViewForm.removeData('submit');
							// to avoid hiding of error message under the fixed nav bar
							app.formAlignmentAfterValidation(editViewForm);
						}
					}
				});
			};
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
		// Get current viewname of specific modules
		getCvIds : function(){
			var Deferred = jQuery.Deferred();
			var params = {module: 'SalesPanel',action: 'getViewNames',related_modules: SalesPanel_Statics_Js.specific_related_modules}
			SalesPanel_Statics_Js.sendRequest(params).then(function(cur_params,result){
				Deferred.resolve(result.result);
			},'json');
			return Deferred.promise();
		},
		loadList : function(data){
			var quickLinksContainer = jQuery(".quickLinksDiv");
			var listViewInstance = SalesPanel_ListView_js.getInstance();
			Dashboard.getInstance().quicklink.injectDataAttrib();

			listViewInstance.setCvIds(data);
			jQuery.each(data,function(moduleName,cvId){
				listViewInstance.moduleName = moduleName;
				listViewInstance.cvId = cvId;
				listViewInstance.getListViewRecords2({page:"1"});
			});
		},
		listViewRender : function(data,title){
			var listViewContentsContainer = jQuery('div.listViewPageDiv');
			var titleViewContainer = jQuery(".titleViewHolder");
			var pagingTemplate = jQuery("#PagingTemplate").html();
			var dashboardInstance = Dashboard.getInstance();
			var thisInstance = this;

			dashboardInstance.view.resetAll();
			if(typeof data === 'undefined'){
				data = '<strong>' + app.vtranslate('Loading') + '...</strong>';
				dashboardInstance.view.render(data,listViewContentsContainer);
				dashboardInstance.view.render(title,titleViewContainer);
				return;
			}

			jQuery.get(dashboardInstance.htmlTemplateFolder + 'PagingTemplate.phtml',function(templateData){
				dashboardInstance.view.render(data,listViewContentsContainer);
				dashboardInstance.view.render(title,titleViewContainer);
				dashboardInstance.view.renderActions(templateData);
				thisInstance.rowOnclick(jQuery('tr.listViewEntries',listViewContentsContainer));
				
				SalesPanel_ListView_js.getInstance().registerEventsAfterRenderListViewToDOM(data);
				SalesPanel_ListView_js.getInstance().registerEvents();
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

				Dashboard.getInstance().listView.listViewRender(data,"- " + app.vtranslate('List') + " " + app.vtranslate(moduleName));
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
			container.html(data);
		},
		renderActions : function(data){
			jQuery('#actionsHolder').html(data);
		},
		resetAll : function(){
			jQuery("#actionsHolder,#titleViewHolder,#contentViewHolder,.listViewPageDiv,.detailViewContainer,.editViewContainer").html('');
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
					}else if(related_params.view == 'Edit'){
						Vtiger_Edit_Js.editlInstance = false;
						thisInstance.jsViewInstance = Vtiger_Edit_Js.getInstance();
						// because container of Edit view has been reload to DOM and then we must rewrite the getForm function of Vtiger_Edit_Js instance
						thisInstance.jsViewInstance.getForm = function(){
							this.setForm(jQuery('#EditView'));
							return this.formElement;
						}
					}

					
					thisInstance.jsViewInstance.registerEvents();
					progressInstance.hide();

					//thisInstance.renderScripts(scriptsNotIncluded);
				});
			});
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
			var anchors = container.find('a[href^="index.php"]');
			anchors.on('click',function(e){
				//var data_url = (target.length == 1) ? target.attr('href') : jQuery(this).data('recordurl');
				var data_url = jQuery(this).attr('href');
				var url_vars = SalesPanel_Statics_Js.getUrlVars(data_url);
				if(url_vars.view == 'Detail')
					dashboardInstance.detailView.loadDetailView(url_vars);
				else if(url_vars.view == 'Edit')
					dashboardInstance.editView.loadEditView(url_vars);
				e.preventDefault();
			});
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
		};
	},

	registerEvents : function(){
		var thisInstance = this;
		this.registerCustomizeLabelSearch();
		this.quicklink.registerQuickLinkClick();
		this.registerCloseTooltipClick();
		this.registerStateChange();
	/*	this.listView.getCvIds().then(function(data){
			thisInstance.listView.loadList(data);
		});*/
		
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