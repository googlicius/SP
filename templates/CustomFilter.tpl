<!-- FILTER -->
<span class="customFilterMainSpan btn-group">
	{if $CUSTOM_VIEWS|@count gt 0}
		<select id="customFilter" name="account_fiter_id" class="select2" style="width:350px;">
			{foreach key=GROUP_LABEL item=GROUP_CUSTOM_VIEWS from=$CUSTOM_VIEWS}
			<optgroup label=' {if $GROUP_LABEL eq 'Mine'} &nbsp; {else if} {vtranslate($GROUP_LABEL)} {/if}' >
					{foreach item="CUSTOM_VIEW" from=$GROUP_CUSTOM_VIEWS}
						<option  data-editurl="{$CUSTOM_VIEW->getEditUrl()}" data-deleteurl="{$CUSTOM_VIEW->getDeleteUrl()}" data-approveurl="{$CUSTOM_VIEW->getApproveUrl()}" data-denyurl="{$CUSTOM_VIEW->getDenyUrl()}" data-editable="{$CUSTOM_VIEW->isEditable()}" data-deletable="{$CUSTOM_VIEW->isDeletable()}" data-pending="{$CUSTOM_VIEW->isPending()}" data-public="{$CUSTOM_VIEW->isPublic() && $CURRENT_USER_MODEL->isAdminUser()}" id="filterOptionId_{$CUSTOM_VIEW->get('cvid')}" value="{$CUSTOM_VIEW->get('cvid')}" data-id="{$CUSTOM_VIEW->get('cvid')}" {if $VIEWID neq '' && $VIEWID neq '0'  && $VIEWID == $CUSTOM_VIEW->getId()} selected="selected" {elseif ($VIEWID == '' or $VIEWID == '0')&& $CUSTOM_VIEW->isDefault() eq 'true'} selected="selected" {/if} class="filterOptionId_{$CUSTOM_VIEW->get('cvid')}">{if $CUSTOM_VIEW->get('viewname') eq 'All'}{vtranslate($CUSTOM_VIEW->get('viewname'), $MODULE)} {vtranslate($MODULE, $MODULE)}{else}{vtranslate($CUSTOM_VIEW->get('viewname'), $MODULE)}{/if}{if $GROUP_LABEL neq 'Mine'} [ {$CUSTOM_VIEW->getOwnerName()} ]  {/if}</option>
					{/foreach}
				</optgroup>
			{/foreach}
			{if $FOLDERS neq ''}
				<optgroup id="foldersBlock" label='{vtranslate('LBL_FOLDERS', $MODULE)}' >
					{foreach item=FOLDER from=$FOLDERS}
						<option data-foldername="{$FOLDER->getName()}" {if decode_html($FOLDER->getName()) eq $FOLDER_NAME} selected=""{/if} data-folderid="{$FOLDER->get('folderid')}" data-deletable="{!($FOLDER->hasDocuments())}" class="filterOptionId_folder{$FOLDER->get('folderid')} folderOption{if $FOLDER->getName() eq 'Default'} defaultFolder {/if}" id="filterOptionId_folder{$FOLDER->get('folderid')}" data-id="{$DEFAULT_CUSTOM_FILTER_ID}">{$FOLDER->getName()}</option>
					{/foreach}
				</optgroup>
			{/if}
		</select>
		<span class="filterActionsDiv hide">
			<hr>
			<ul class="filterActions">
				<li data-value="create" id="createFilter" data-createurl="{$CUSTOM_VIEW->getCreateUrl()}"><i class="icon-plus-sign"></i> {vtranslate('LBL_CREATE_NEW_FILTER')}</li>
			</ul>
		</span>
		<img class="filterImage" src="{'filter.png'|vimage_path}" style="display:none;height:13px;margin-right:2px;vertical-align: middle;">
	{else}
		<input type="hidden" value="0" id="customFilter" />
	{/if}
</span>
<!-- END FILTER -->

<!-- PAGING -->
<span class="pull-right span4 btn-toolbar">
	<div class="listViewActions pull-right">
		<div class="pageNumbers alignTop">
			<span>
				<span class="pageNumbersText" style="padding-right:5px"></span>
				<span class="icon-refresh pull-right totalNumberOfRecords cursorPointer"></span>
			</span>
		</div>
		<div class="btn-group alignTop margin0px">
			<span class="pull-right">
				<span class="btn-group">
					<button class="btn" id="listViewPreviousPageButton" type="button"><span class="icon-chevron-left"></span></button>
					<button class="btn dropdown-toggle" type="button" id="listViewPageJump" data-toggle="dropdown">
						<i class="vtGlyph vticon-pageJump" title=""></i>
					</button>
					<ul class="listViewBasicAction dropdown-menu" id="listViewPageJumpDropDown">
						<li>
							<span class="row-fluid">
								<span class="span3 pushUpandDown2per"><span class="pull-right">Page</span></span>
								<span class="span4">
									<input type="text" id="pageToJump" class="listViewPagingInput" value=""/>
								</span>
								<span class="span2 textAlignCenter pushUpandDown2per">
									Of&nbsp;
								</span>
								<span class="span2 pushUpandDown2per" id="totalPageCount"></span>
							</span>
						</li>
					</ul>
					<button class="btn" id="listViewNextPageButton" type="button"><span class="icon-chevron-right"></span></button>
				</span>
			</span>	
		</div>
	</div>
	<div class="clearfix"></div>
	<input type="hidden" id="recordsCount" value=""/>
	<input type="hidden" id="selectedIds" name="selectedIds" />
	<input type="hidden" id="excludedIds" name="excludedIds" />
</span>
<!-- END PAGING -->