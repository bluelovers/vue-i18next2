# vue-i18next2

## Usage example

```javascript
const locales = {
	en: {
		message: {
			hello: 'Hello!! - EN',
		},
		tos: 'Term of Service',
		term: 'I accept {{1}} {{0}}.',
		loadbundle: 'Load Bundle {{lang}}',
	},
	de: {
		message: {
			hello: 'Hallo!! - DE',
		},
		tos: 'Nutzungsbedingungen',
		term: 'Ich akzeptiere {{0}}. {{1}}',
		loadbundle: 'Bundle Laden {{lang}}',
	},
};
```

```javascript

const i18next = require("i18next");
const VueParams = require('vue-params');
const VueI18Next = require('vue-i18next2');

Vue.use(VueParams);
Vue.use(VueI18Next);

Vue.params.i18nextLanguage = "en";

i18next.init({
	lng: Vue.params.i18nextLanguage,
	fallbackLng: 'en',
	resources: {
		en: { translation: locales.en },
		de: { translation: locales.de },
	},
});

```

```javascript
const VueParams = require('vue-params');
const VueI18Next = require('vue-i18next2');

Vue.use(VueParams);
Vue.use(VueI18Next);

Vue.params.i18nextLanguage = "en";

VueI18Next.i18n.init({
	lng: Vue.params.i18nextLanguage,
	fallbackLng: 'en',
	resources: {
		en: { translation: locales.en },
		de: { translation: locales.de },
	},
});
```
