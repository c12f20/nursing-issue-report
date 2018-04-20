'use strict';

nirApp.config(['$translateProvider',
  function($translateProvider) {
    let english = {
      CAPTION_YES: "Yes",
      CAPTION_NO: "No",
    };

    $translateProvider
			.useSanitizeValueStrategy('escape')
			.translations('en', english)
			.useStaticFilesLoader({
				prefix: "assets/i18n/",
				suffix: ".json"
			})
			.fallbackLanguage('en')
			.preferredLanguage('en');
  }]);
