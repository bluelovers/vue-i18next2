# @shellyBits/vue-i18next

## Why

"Why? There are already two other packages by that name..so?"

We wanted an i18next integration that fulfills these criteria:

* As small as possible
* Integrates well with Rails, i.e. make it possible to re-use i18n YML files
* Load on demand using webpack's code splitting
* Reactive in Vue


## Usage example

For a Rails application with webpack, Vue, code splitting, dynamically loaded
locales.


  * Dependencies in `package.json`

	```json
	"@shellyBits/vue-i18next": "^0.1.0",
	"i18next": "^8.4.3",
	"yml-loader": "^2.1.0"
	```

	This package has only peer dependencies von Vue and i18next, so you have to
	include those yourself.

  * In `webpack.conf.js`:

	```js
	...
	module: {
		rules: [
			{
				test: /\.ya?ml$/,
				loader: 'yml-loader'
			},

			...
		]
	}
	...
	```

  * In the entry or commons file

	```js
	import Vue from 'vue'
	import VueI18Next from 'vue-i18next'

	VueI18Next(Vue).init({
		fallbackLng: 'en',
		interpolation: {
			prefix: "${",
			suffix: "}"
		},
		backend: {
			load(language, ns) {
				// delete if you don't have namespaces
				if (ns != 'translation')
					return import(`../../../config/locales/${ns}/${language}.yml`)
				return import(`../../../config/locales/${language}.yml`)
			}
		}
	})
	```

	VueI18Next is just a function, exported by this module. It takes Vue as its
	single arument and returns the `i18next`, set up with a `Promise` based
	backend. This backend needs a `load()` function supplied that returns a
	`Promise`.

	When using the webpack `import` function, the limitations described in the
	webpack documentation apply. Namely it's a string, not an expression. During
	compile time, the above example is basically interpreted as a glob pattern
	`../../../config/locales/*.yml`. For this reason, it's not (easily) possible
	to use a configuration option pointing at the files.

	An alternative to use webpack code splitting and the `yml-loader` is to load
	JSON files by other means like, e.g. using Axios.

  * Translation in Vue components

	In any Vue template, the function `i18next.t` is available as `$t`, and it's
	reactive when the language is changed:

	```vue
	<p>{{ $t('rails.key') }}</p>
	```

	This kinda implies that in Vue JS code, it's accessible as `this.$t`.

  * Loading an additional namespace

	Namespaces can be dynamically loaded. Whenever a translation from a
	namespace is needed:

	```js
	...
	beforeMount() {
		this.$i18n.loadNamespaces('name')
	}
	...
	```

	When executed, the backend will automatically fetch the translation (if
	required) by triggering the supplied `load()` function.

	This also shows that the `i18next` instance is available in each Vue
	instance as `$i18n`.


## License

This project is released under the [MIT license](LICENSE).
