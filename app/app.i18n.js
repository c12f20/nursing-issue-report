'use strict';

nirApp.config(['$translateProvider',
  function($translateProvider) {
    let chinese = {
      CAPTION_YES: "是",
      CAPTION_NO: "否",
      CAPTION_INDEX: "序号",
      CAPTION_ADD: "添加",
      CAPTION_VIEW: "查看",
      CAPTION_DELETE: "删除",
      CAPTION_DELETE_SELECTED: "删除选中",
      CAPTION_ACTION: "操作",
      // Config UI
      TITLE_CONFIG: "配置",
      CAPTION_DEPARTMENT_LIST: "部门列表",
      CAPTION_DEPARTMENT_NAME: "部门名称",
      MSG_NO_DEPARTMENT_DATA: "未找到任何部门，请添加！",
      CAPTION_ADD_DEPARTMENT: "添加部门"
    };

    $translateProvider
			.useSanitizeValueStrategy('escape')
			.translations('zh', chinese)
			.useStaticFilesLoader({
				prefix: "assets/i18n/",
				suffix: ".json"
			})
			.fallbackLanguage('zh')
			.preferredLanguage('zh');
  }]);
