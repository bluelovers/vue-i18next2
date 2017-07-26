import I18next from 'i18next'

const PromiseBackend = {
	type: "backend",

	init(services, options, i18nextOpts) {
		this.load = options.load
		if (typeof this.load !== 'function')
			throw "vue-i18next: missing 'load' function in backend options"
	},

	read(language, namespace, callback) {
		if (language == 'dev') {
			callback(null, null)
			return
		}
		this.load(language, namespace).then((module) => {
			callback(null, module[language])
		}).catch((err) => {
			callback(err, null)
		})
	}
}

export default function (Vue) {
	const i18n = I18next.use(PromiseBackend)

	Vue.use(function (Vue) {
		const i18nVm = new Vue({ data: { tag: 1 } })
		i18n.on('languageChanged loaded', () => {
			// trigger a reactive change
			i18nVm.tag++
		})

		Object.defineProperty(i18n, '$_vm', { value: i18nVm })
		Object.defineProperty(Vue.prototype, '$i18n', { value: i18n })
		Object.defineProperty(Vue.prototype, '$t', {
			value(key, options) {
				this.$i18n.$_vm.tag // this makes the function reactive
				return this.$i18n.t(key, options)
			}
		})
	})

	return i18n
}
