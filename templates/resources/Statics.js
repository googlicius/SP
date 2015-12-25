jQuery.Class("SalesPanel_Statics_Js",{
	specific_modules : ['Accounts','Contacts'],
	specific_related_modules : ['Quotes','SalesOrder','Invoice','HelpDesk','Coupons','PBXManager'],

	/**
	 * by haidang009 Function to get variable in url
	 * @return : object - varialble of GET
	 */
	getUrlVars : function(url) {
		if(typeof url === 'undefined')
			var href = window.location.href;
		else{
			var href = url;
			if(href.indexOf('?') == '-1')
				href = "?" + href;
		}

		var vars = {};
		var parts = href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
		vars[key] = value;
		});
		return vars;
	},

	// function to push history from object output from getUrlVars function
	pushHistory : function(url_vars){
		var vars = [];
		jQuery.each(url_vars,function(i,item){
			var url_part = i + "=" + item;
			vars.push(url_part);
		});
		var url = vars.join("&");
		url = "index.php?" + url;
		var obj = {Page: url,Url : url}
		history.pushState(obj,obj.Page,obj.Url);
	},

	checkStorageSupport : function(){
		if( typeof Storage !== 'undefined'){
			return true;
		}
		return false;
	},

	/*getScript : function(view,module){
		var moduleClassName = 'Vtiger_' + view + '_Js';
		if(typeof window[moduleClassName] != 'undefined')
			jQuery.getScript()

	}*/

	displayWindowModal : function(data){
		var thisInstance = this;
		var callBackFunction = function(data){
			jQuery(data).find('.fieldInfo').collapse({
				'parent': '#QuickCreate',
				'toggle' : false
			});
			app.showScrollBar(jQuery(data).find('#QuickCreate'), {'height':'500px'});
		}
		app.showModalWindow(data,function(data){
			if(typeof callBackFunction == 'function'){
				callBackFunction(data);
			}
		},{
			'text-align' : 'left'
		});
	},
	sendRequest : function (data,datatype){
		datatype = ( datatype == '' || typeof(datatype) == 'undefined' ) ? 'html' : datatype;
		var Deferred = jQuery.Deferred();
		var url = "index.php";
		var thisInstance = this;
		if(typeof data == 'undefined'){
			console.log("Input Undefined");
			return;
		}
		var type = (typeof data.type == 'undefined') ? 'POST' : data.type;
		$.ajax({
			url : url,
			type: type,
			data: data,
			datatype: datatype,
			success : function (result){
				Deferred.resolve(data,result);
			},
			error: function (err){
				console.log(err);
			}
		});
		return Deferred.promise();
	},
	sendRequestPjax : function(data,datatype){
		datatype = ( datatype == '' || typeof(datatype) == 'undefined' ) ? 'html' : datatype;
		var Deferred = jQuery.Deferred();
		var url = "index.php";
		var thisInstance = this;
		
		var params = {
			url : url,
			type: 'GET',
			data: data,
			datatype: datatype,
			success : function (result){
				Deferred.resolve(data,result);
			},
			error: function (err){
				console.log(err);
			}
		};
		if(typeof params.container == 'undefined') params.container = '#pjaxContainer';

		var pjaxContainer = jQuery('#pjaxContainer');
		//Clear contents existing before
		if(params.container == '#pjaxContainer') {
			pjaxContainer.html('');
		}

		jQuery(document).on('pjax:success', function(event, data,status,jqXHR){
			pjaxContainer.html('');
		})
		
		jQuery(document).on('pjax:error', function(event, jqXHR, textStatus, errorThrown){
			pjaxContainer.html('');
		})

		$.pjax(params);
		return Deferred.promise();
	}
},{});

jQuery(document).ready(function(){
	$.getMultiScripts = function(arr) {
		var _arr = $.map(arr, function(scr) {
			return $.getScript( scr );
		});
		_arr.push($.Deferred(function( deferred ){
			$( deferred.resolve );
		}));

		return $.when.apply($, _arr);
	}
});