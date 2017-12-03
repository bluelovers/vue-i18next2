# vue-i18next2

> i18next integration for Vue

`npm install vue-i18next2`

## Usage example

example can work with [vue-hackernews-2.0](https://github.com/vuejs/vue-hackernews-2.0)

### locales

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

### code

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
	fallbackNS: ['translation'],
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
	fallbackNS: ['translation'],
	resources: {
		en: { translation: locales.en },
		de: { translation: locales.de },
	},
});
```

### vue

```vue
{{ $t('tos') }}
{{ $t('tos', { lng: "de" }) }}
{{ $t('tos', { lng: "en" }) }}
```

vueConfig
```json
{
	test: /\.vue$/,
	loader: 'vue-loader',
	options: {
		loaders: {
			i18n: '@kazupon/vue-i18n-loader',
		},
	},
}
```

```vue
<i18n>
  {
  "en": {
  "hello": "hello world!"
  },
  "ja": {
  "hello": "こんにちは、世界!"
  }
  }
</i18n>

<template>
{{ $t('tos') }}
{{ $t('tos', { lng: "de" }) }}
{{ $t('tos', { lng: "en" }) }}

{{ $t('hello') }}
{{ $t('hello', { lng: "ja" }) }}
</template>
```

## others

* [@shellybits/vue-i18next](https://www.npmjs.com/package/@shellybits/vue-i18next)
* [vue-i18next](https://github.com/rse/vue-i18next)
* [@panter/vue-i18next](https://github.com/panter/vue-i18next)
