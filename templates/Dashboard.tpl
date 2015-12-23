<style type="text/css">
	.sp_title{
		padding: 5px 5px 5px 5px;
		font-weight: bold;
		background-color: #EBEBEB;
		border-radius: 5px 5px 5px 5px;
		-webkit-border-radius: 5px 5px 5px 5px;
    	border: 1px solid #CCC;
    	-webkit-box-shadow: 0 2px 3px rgba(0, 0, 0, 0.1);
		-moz-box-shadow: 0 2px 3px rgba(0, 0, 0, 0.1);
		box-shadow: 0 2px 3px rgba(0, 0, 0, 0.1);
	}
</style>
<div class="container-fluid">
	<div class="row-fluid">
		<div class="span8">
			<div class="widget_header row-fluid">
				<h1><span class="sp_title">{vtranslate('Sales Panel',$MODULE_NAME)}</span> <span class="titleViewHolder"></span></h1>
			</div>
		</div>
		<div class="span4">
			<span class="widget_header pull-right" id="actionsHolder">
				<button class="btn" onclick="javascript:Dashboard.triggerRemoveAllTooltip();">{vtranslate('Remove trash tooltip',$MODULE_NAME)}</button>
			</span>
		</div>
	</div>
	<div class="clearfix"></div>
	<!-- BLOCK 1 -->
	<div class="row-fluid">
		<!-- <div id="contentViewHolder"></div> -->
		<div class="listViewPageDiv"></div>
		<div class="detailViewContainer" style="padding:0px"></div>
		<div class="editViewPagDiv" style="padding:0px"></div>
		<div class="jsHolder"></div>
	</div>
</div>

<div class="hide" id="PagingTemplateHidden">
	
</div>

<div class="hide" id="detailViewInfoHidden">
	<input id="recordId" type="hidden">
	<div class="detailViewInfo row-fluid">
		<div class="span10 details">
			<form id="detailView">
				<input type="hidden" name="picklistDependency" value="[]">
				<div class="contents"></div>
			</form>
		</div>
		<div class="related span2 marginLeftZero">{vtranslate('Loading',$MODULE_NAME)}...</div>
	</div>
</div>

<script type="text/template" class="detailViewActionsTemplate">
	<div class="span7">
		<div class="pull-right detailViewButtoncontainer">
			<div class="btn-toolbar">
				<div class="preloadEditViewBtnsHolder">
				<% if(rc.MODULE == 'Accounts' || rc.MODULE == 'Contacts') { %>
					<span class="btn-group" data-module="SalesOrder" data-name="account_id">
						<a class="btn btn-default preload_SalesOrder" disabled="disabled"
							href='javascript:;'>
							<strong>{vtranslate('Add',$MODULE_NAME)} {vtranslate('SalesOrder',$MODULE_NAME)|lower}</strong>
						</a>
					</span>
					<span class="btn-group" data-module="Quotes" data-name="account_id">
						<a class="btn btn-default preload_Quotes" disabled="disabled"
							href='javascript:;'>
							<strong>{vtranslate('Add',$MODULE_NAME)} {vtranslate('Quotes',$MODULE_NAME)|lower}</strong>
						</a>
					</span>
					<span class="btn-group" data-module="HelpDesk" data-name="parent_id">
						<a class="btn btn-default preload_HelpDesk" disabled="disabled"
							href='javascript:;'>
							<strong>{vtranslate('Add',$MODULE_NAME)} {vtranslate('Ticket',$MODULE_NAME)|lower}</strong>
						</a>
					</span>
				<% }else if(rc.MODULE == 'SalesOrder'){ %>
					<span class="btn-group" data-module="Coupons" data-name="salesorderid">
						<a class="btn btn-default preload_Coupons" disabled="disabled"
							href='javascript:;'>
							<strong>{vtranslate('Add',$MODULE_NAME)} {vtranslate('Coupons',$MODULE_NAME)|lower}</strong>
						</a>
					</span>
				<% } %>
				</div>
				<% _.each(rc.DETAILVIEWBASIC,function(DETAIL_VIEW_BASIC_LINK,key,list){ %>
				<span class="btn-group">
					<a class="btn" id=""
						href='<%= DETAIL_VIEW_BASIC_LINK.linkurl %>'>
						<strong><%= DETAIL_VIEW_BASIC_LINK.linkLabelTrans %></strong>
					</a>
				</span>
				<%});%>
				<% if (Object.keys(rc.DETAILVIEW).length > 0){ %>
				<span class="btn-group">
					<button class="btn dropdown-toggle" data-toggle="dropdown" href="javascript:void(0);">
						<strong>{vtranslate('LBL_MORE', $MODULE_NAME)}</strong>&nbsp;&nbsp;<i class="caret"></i>
					</button>
					<ul class="dropdown-menu pull-right">
						<% _.each(rc.DETAILVIEW,function(DETAIL_VIEW_LINK,key,list){ %>
						<% if (DETAIL_VIEW_LINK.linklabel == ""){ %>
							<li class="divider"></li>
						<% }else{ %>
						<li id="">
							<a href='<%= DETAIL_VIEW_LINK.linkurl%>' ><%= DETAIL_VIEW_LINK.linkLabelTrans %></a>
						</li>
						<% } %>
						<% }); %>
					</ul>
				</span>
				<% } %>
			</div>
		</div>
	</div>
</script>

<div id="scripts"></div>