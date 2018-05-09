'use strict';

nirApp.config(['$translateProvider',
  function($translateProvider) {
    let chinese = {
      CAPTION_YES: "是",
      CAPTION_NO: "否",
      CAPTION_INDEX: "序号",
      CAPTION_ADD: "添加",
      CAPTION_UPDATE: "更新",
      CAPTION_SAVE: "保存",
      CAPTION_CANCEL: "取消",
      CAPTION_EDIT: "编辑",
      CAPTION_VIEW: "查看",
      CAPTION_CHECKED: "选中",
      CAPTION_DELETE: "删除",
      CAPTION_DELETE_SELECTED: "删除选中",
      CAPTION_ACTION: "操作",
      CAPTION_NEXT_PAGE: "下一页",
      CAPTION_PREV_PAGE: "上一页",
      CAPTION_MOVE_UP: "上移",
      CAPTION_MOVE_DOWN: "下移",
      // Config UI
      TITLE_CONFIG: "配置",
      CAPTION_DEPARTMENT_LIST: "部门列表",
      CAPTION_DEPARTMENT_NAME: "部门名称",
      MSG_NO_DEPARTMENT_DATA: "未添加任何部门，请添加！",
      CAPTION_ADD_DEPARTMENT: "添加部门",
      CAPTION_EDIT_DEPARTMENT: "编辑部门",
      CAPTION_DELETE_DEPARTMENT: "删除部门",
      HINT_INPUT_DEPARTMENT_NAME: "请输入部门名称",
      MSG_REMOVE_DEPARTMENTS_CONFIRM: "请确认是否删除如下部门：",
      CAPTION_ISSUE_LIST: "不良事件列表",
      CAPTION_ISSUE_NAME: "事件名称",
      MSG_NO_ISSUE_DATA: "未定义任何不良事件，请添加！",
      CAPTION_ADD_ISSUE: "添加事件",
      CAPTION_EDIT_ISSUE: "编辑事件",
      CAPTION_DELETE_ISSUE: "删除事件",
      HINT_INPUT_ISSUE_NAME: "请输入事件名称",
      MSG_REMOVE_ISSUE_CONFIRM: "请确认是否删除如下事件：",
      // Issue Detail UI
      HINT_INPUT_ISSUE_NAME: "请输入事件名称",
      CAPTION_OPTIONS_LIST: "统计项目列表",
      CAPTION_ADD_OPTION: "添加统计项目",
      CAPTION_OPTION_NAME: "统计项名称",

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
