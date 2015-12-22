/*
 * by haidang009
 * Class SalesPanel_DetailView_js extends Vtiger_List_Js
 * To load list of specific module to Variable tmp
 */

Vtiger_Detail_Js('SalesPanel_DetailView_Js',{
	self : false,
	getInstance : function(){
		if(!this.self)
			this.self = new SalesPanel_DetailView_Js();
		return this.self;
	},
},{});