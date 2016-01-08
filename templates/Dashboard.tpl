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
	.selected2{
		text-decoration: underline;
	}
	.intro{
		text-align: center;
	}
	.intro strong{
		color: #ccc;
		font-size: 50px;
		padding-top: 50px;
		user-select: none;
		-webkit-user-select: none;
		-moz-user-select: none;
		cursor: default;
	}
	div.horizon-related ul li {
		float: left;
	}
	.horizolRelatedMenu .horizon-details,
	.detailViewInfo .span12 {
		/* border-right: 4px solid #1560bd; */
		border-right: 0px;
	}
	.clearBoth{
		float: none !important;
	}
	span.hd-dropdown{
		margin-top: 14px;
		top: 10px;
	}
	span.hd-dropdown a{
		padding: 8px 8px;
		margin-top: 2px;
		margin-bottom: 2px;
		-webkit-border-radius: 5px;
		-moz-border-radius: 5px;
		border-radius: 5px;
	}
	.horizon-related ul {
		border-bottom: 1px solid #ccc;
	}
	.horizon-related .nav-pills .active > a,
	.horizon-related .nav-pills .active > a:hover{
		margin-top: 2px !important;
	}
	.detailViewInfo{
		box-shadow :none;
	}
	.nav.massEditTabs li a:hover {
		 border-bottom: 0px;
	}
</style>

<div class="container-fluid">
	<div class="row-fluid">
		<div class="span8">
			<div class="widget_header row-fluid">
				<div>
					<!-- <span class="sp_title">{vtranslate('Sales Panel',$MODULE_NAME)}</span>  -->
					<span class="titleViewHolder"></span> 
					<!-- <span class="searchByPhoneHolder hide"></span> -->
				</div>
			</div>
			<div id="account_hard_info_holder"></div>
		</div>
		<div class="span4">
			<span class="widget_header pull-right" id="actionsHolder">
			</span>
		</div>
	</div>
	<div class="clearfix"></div>
	<!-- BLOCK 1 -->
	<div class="row-fluid">
		<!-- <div id="contentViewHolder"></div> -->
		<div class="listViewPageDiv">
			<div class="intro">
				<div class="row-fluid" style="margin-bottom: 20px;margin-top:50px">
					<strong>{vtranslate('SALES PANEL DASHBOARD',$MODULE_NAME)}</strong>
				</div>
				<div class="row-fluid">
					<span class="searchByPhoneContainer">
						<input type="text" id="searchByPhone" class="form-control" placeholder="{vtranslate('Search by phone',$MODULE_NAME)}" aria-describedby="basic-addon1" style="margin-bottom: 0;">
						<span id="searchByPhoneBtn" class="btn btn-primary add-on search-icon">{vtranslate('Search',$MODULE_NAME)}</span>
					</span>
				</div>
			</div>
		</div>
		<!-- <div class="detailHorizolRelatedViewContainer horizolRelatedMenu"></div> -->
		<input id="recordId" type="hidden">
		<div class="detailViewContainer" style="padding:0px"></div>
		<div class="editViewPagDiv" style="padding:0px"></div>
		<div class="jsHolder"></div>
	</div>
</div>

<div class="hide" id="horizonRelatedMenuClone">
	
</div>

<div class="hide" id="detailViewInfoHidden_withHorizolRelatedMenu">
	<div class="detailViewInfo horizolRelatedMenu row-fluid">
		<div class="related horizon-related span12 marginLeftZero">{vtranslate('Loading',$MODULE_NAME)}...</div>
		<div class="layoutContent span12 marginLeftZero"></div>
		<div class="span12 details horizon-details marginLeftZero">
			<form id="detailView">
				<input type="hidden" name="picklistDependency" value="[]">
				<div class="contents"></div>
			</form>
		</div>
	</div>
</div>

<div class="hide" id="detailViewInfoHidden">
	<div class="detailViewInfo row-fluid">
		<div class="layoutContent span12 marginLeftZero"></div>
		<div class="span10 details marginLeftZero">
			<form id="detailView">
				<input type="hidden" name="picklistDependency" value="[]">
				<div class="contents">
					<div class="secondTitleViewHolder"></div>
				</div>
			</form>
		</div>
		<div class="related span2 marginLeftZero">{vtranslate('Loading',$MODULE_NAME)}...</div>
	</div>
</div>

<script type="text/template" class="detailViewActionsTemplate">
	<div>
		<div class="pull-right detailViewButtoncontainer">
			<div class="btn-toolbar">
				<div class="preloadEditViewBtnsHolder">
				<% if(typeof rc.PRELOAD_BTNS[rc.MODULE] != 'undefined') { %>
					<% _.each(rc.PRELOAD_BTNS[rc.MODULE],function(PRELOAD_BTN,key,list){ %>
					<span class="btn-group" data-module="<%= PRELOAD_BTN.module %>" data-name="<%= PRELOAD_BTN.name %>">
						<a class="btn btn-default preload_<%= PRELOAD_BTN.module %>" disabled="disabled"
							href='javascript:;'>
							<strong>{vtranslate('Add',$MODULE_NAME)} <%= app.vtranslate(PRELOAD_BTN.module) %></strong>
						</a>
					</span>
					<% }) %>
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
							<a href="<%= DETAIL_VIEW_LINK.linkurl %>" ><%= DETAIL_VIEW_LINK.linkLabelTrans %></a>
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

<script type="text/template" class="titleTemplate">
	<br>
	<div class="row-fluid" style="line-height:25px">
		<span class="span1">
			<img src="<%= rc.image %>" class="summaryImg">
		</span>
		<span class="span11">
			<span class="account_name" style="font-size:18px;font-weight:700"><%= rc.primary %></span>
			<% if(Object.keys(rc.sub_title).length > 0){ %>
			<hr>
			<% } %>
			<span class="row-fluid">
				<table>
					<tbody>
					<% _.each(rc.sub_title,function(item,key,list){ %>
						<tr class="<%= key %>">
							<td style="vertical-align: initial;"> <strong><%= item.fieldLabel %></strong></td>
							<td style="padding-left: 5px"> <%= item.fieldValue %></td>
						</tr>
					<% }); %>
					</tbody>
				</table>
			</span>
		</span>
	</div>
	
</script>

<div id="scripts"></div>