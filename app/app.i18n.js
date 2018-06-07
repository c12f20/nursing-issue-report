'use strict';

nirApp.config(['$translateProvider',
  function($translateProvider) {
    let chinese = {
      CAPTION_YES: "是",
      CAPTION_NO: "否",
      CAPTION_NONE: "无",
      CAPTION_INDEX: "序号",
      CAPTION_ADD: "添加",
      CAPTION_UPDATE: "更新",
      CAPTION_SAVE: "保存",
      CAPTION_CANCEL: "取消",
      CAPTION_EDIT: "编辑",
      CAPTION_VIEW: "查看",
      CAPTION_CHECKED: "选中",
      CAPTION_CLOSE: "关闭",
      CAPTION_CLEAR: "清除",
      CAPTION_DELETE: "删除",
      CAPTION_DELETE_SELECTED: "删除选中",
      CAPTION_ACTION: "操作",
      CAPTION_NEXT_PAGE: "下一页",
      CAPTION_PREV_PAGE: "上一页",
      CAPTION_MOVE_UP: "上移",
      CAPTION_MOVE_DOWN: "下移",
      CAPTION_DATE: "日期",
      CAPTION_TODAY: "今天",
      // APP
      TITLE_APP: "护理不良事件报告工具",
      // Home UI
      TITLE_HOME: "开始",
      // Report List UI
      TITLE_REPORT_LIST: "事件报告列表",
      CAPTION_SELECT_DATE_RANGE: "请选择事件报告的日期范围：",
      CAPTION_START_DATE: "开始日期",
      CAPTION_END_DATE: "结束日期",
      MSG_NO_REPORT_DATA_FOUND: "没有找到符合条件的报告",
      CAPTION_DELETE_REPORT: "删除报告",
      MSG_REMOVE_REPORT_CONFIRM:"请确认是否删除如下报告：",
      // Report Detail UI
      CAPTION_EDIT_REPORT: "编辑报告",
      CAPTION_NEW_REPORT: "新建报告",
      TITLE_REPORT_BASIC: "事件基本信息：",
      CAPTION_CREATION_DATE: "创建日期",
      CAPTION_CREATION_TIME: "创建时间",
      CAPTION_REPORT_DEPARTMENT: "所属部门",
      CAPTION_REPORT_ISSUE: "事件类型",
      TITLE_REPORT_OPTIONS: "事件统计项：",
      // Report Generator UI
      CAPTION_GENERATE_REPORT: "生成报告",
      CAPTION_SELECT_GENERATE_DATE_RANGE: "请选择生成报告的日期范围：",
      CAPTION_GENERATE: "生成",
      CAPTION_REPORT_TITLE: "报告标题",
      HINT_INPUT_REPORT_TITLE: "请输入报告标题",
      CAPTION_REPORT_AUTHOR: "报告作者",
      HINT_INPUT_REPORT_AUTHOR: "请输入报告作者",
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
      MSG_REMOVE_ISSUE_CONFIRM: "删除事件会同时删除相关事件的报告，请确认是否删除如下事件：",
      // Issue Detail UI
      HINT_INPUT_ISSUE_NAME: "请输入事件名称",
      CAPTION_OPTIONS_LIST: "统计项目列表",
      CAPTION_ADD_OPTION: "添加统计项目",
      CAPTION_EDIT_OPTION: "编辑统计项目",
      CAPTION_OPTION_NAME: "统计项目名称",
      CAPTION_DELETE_OPTION: "删除统计项目",
      MSG_REMOVE_OPTIONS_CONFIRM: "删除统计项目会同时删除相关内容的统计报告，请确认是否删除如下统计项目：",
      // Option Detail UI
      HINT_INPUT_OPTION_NAME: "请输入统计项目名称",
      CAPTION_OPTION_PARENT: "该统计项目从属于：",
      CAPTION_OPTION_VALUE_NAME: "统计项目可选值",
      HINT_INPUT_OPTION_VALUE_NAME: "请输入统计项目可选值名称",
      CAPTION_ADD_OPTION_VALUE: "添加统计项目可选值",
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
