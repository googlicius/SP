{*<!--
/*********************************************************************************
  ** The contents of this file are subject to the vtiger CRM Public License Version 1.0
   * ("License"); You may not use this file except in compliance with the License
   * The Original Code is:  vtiger CRM Open Source
   * The Initial Developer of the Original Code is vtiger.
   * Portions created by vtiger are Copyright (C) vtiger.
   * All Rights Reserved.
  *
 ********************************************************************************/
-->*}
{strip}
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
        {/if}
	</div>
	<div class="clearfix"></div>
	<input type="hidden" id="recordsCount" value=""/>
	<input type="hidden" id="selectedIds" name="selectedIds" />
	<input type="hidden" id="excludedIds" name="excludedIds" />
{/strip}