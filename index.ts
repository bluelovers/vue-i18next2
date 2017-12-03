import * as I18next from 'i18next';
import bind from 'bind-decorator';

//import deepmerge from 'deepmerge';

let _this;

Object.defineProperty(exports, 'i18n', {
	get()
	{
		return _this ? _this.i18n : null;
	},
});

export class VueI18Next
{
	public Vue;
	public i18n: I18next.i18n;
	public i18nVm = null;
	public options = {
		bindI18n: 'languageChanged loaded',
		bindStore: 'added removed',
	};

	constructor(Vue, i18next: I18next.i18n = I18next, options = {})
	{
		_this = this;

		this.Vue = Vue;
		this.i18n = i18next;

		Object.assign(this.options, options);
	}

	@bind
	resetVM(data = { tag: 1 })
	{
		const oldVM = this.i18nVm;
		const silent = this.Vue.config.silent;

		this.Vue.config.silent = true;
		this.i18nVm = new this.Vue({ data });
		this.Vue.config.silent = silent;

		if (oldVM)
		{
			this.Vue.nextTick(() => oldVM.$destroy());
		}

		return this.i18nVm;
	}

	@bind
	t(key, options)
	{
		return this.i18n.t(key, options);
	}

	@bind
	onI18nChanged()
	{
		this.i18nVm.tag++;
	}

	@bind
	install(Vue, options)
	{
		let self = this;
		let opts = Object.assign({}, self.options, options);

		self.resetVM();

		if (opts.bindI18n)
		{
			self.i18n.on(opts.bindI18n, self.onI18nChanged);
		}

		{
			// @ts-ignore
			if (opts.bindStore && this.i18n.store)
			{
				// @ts-ignore
				self.i18n.store.on(opts.bindStore, self.onI18nChanged);
			}
		}

		Object.defineProperty(self.i18n, '$_vm', {
			value: self.i18nVm,
			configurable: true,
		});
		Object.defineProperty(self.Vue.prototype, '$i18n', {
			value: self.i18n,
		});
		/*
		Object.defineProperty(self.Vue.prototype, '$t', {
			value: function (key, options)
			{
				let opts = Vue.util.extend({
					lng: Vue.params ? Vue.params.i18nextLanguage : void(0),
					ns: this.$options.i18nextNamespace,
				}, options);

				// this makes the function reactive
				this.$i18n.$_vm.tag;
				return this.$i18n.t(key, opts);
			}
		});
		*/
		self.Vue.mixin({
			computed: {
				$t()
				{
					return function (key, options)
					{
						let opts = self.Vue.util.extend({
							lng: self.Vue.params ? self.Vue.params.i18nextLanguage : void(0),
							ns: this.$options.i18nextNamespace,
						}, options);

						// this makes the function reactive
						this.$i18n.$_vm.tag;
						return this.$i18n.t(key, opts);
					}
				},
			},

			beforeCreate()
			{
				const options = this.$options;

				/*
				try
				{
					if (options.i18n)
					{
						this.$i18n = options.i18n;
					}
					else if (options.parent && options.parent.$i18n)
					{
						this.$i18n = options.parent.$i18n;
					}
				}
				catch (e)
				{}
				*/

				/*
				let inlineTranslations = {};
				if (this.$i18n) {
					const getNamespace = this.$i18n.options.getComponentNamespace || getComponentNamespace;
					const { namespace, loadNamespace } = getNamespace(this);

					if (options.__i18n) {
						options.__i18n.forEach((resource) => {
							inlineTranslations = deepmerge(inlineTranslations, JSON.parse(resource));
						});
					}

					const languages = Object.keys(inlineTranslations);
					languages.forEach((lang) => {
						this.$i18n.i18next.addResourceBundle(
							lang,
							namespace,
							{ ...inlineTranslations[lang] },
							true,
							false,
						);
					});
				}
				*/
			},
		});
	}

	init(...opts)
	{
		this.i18n.init(...opts);

		return this;
	}
}

export namespace VueI18Next
{
	export function create(Vue, i18next?: I18next.i18n)
	{
		return new VueI18Next(Vue, i18next);
	}

	export function backend(_i18next: I18next.i18n = I18next): I18next.i18n
	{
		return _i18next.use({
			type: "backend",

			init: function (services, options, i18nextOpts)
			{
				this.load = options.load;
				if (typeof this.load !== 'function')
				{
					throw "vue-i18next: missing 'load' function in backend options";
				}
			},

			read: function (language, namespace, callback)
			{
				if (language == 'dev')
				{
					callback(null, null);
					return;
				}
				this.load(language, namespace).then(function (module)
				{
					callback(null, module[language]);
				}).catch(function (err)
				{
					callback(err, null);
				})
			}
		});
	}

	export function auto(Vue, _i18next: I18next.i18n | true = I18next, useBackend?: boolean)
	{
		if (_i18next === true)
		{
			_i18next = backend();
		}
		else if (useBackend)
		{
			_i18next = backend(_i18next);
		}

		let i18n = (_i18next || I18next) as I18next.i18n;

		let o = new VueI18Next(Vue, i18n);

		Vue.use(o.install);

		return o;
	}

	export function getComponentNamespace(vm)
	{
		const namespace = vm.$options.name || vm.$options._componentTag;
		if (namespace)
		{
			return {
				namespace,
				loadNamespace: true,
			};
		}

		return {
			namespace: `${Math.random()}`,
		};
	}
}

export function install(Vue, options)
{
	VueI18Next.auto(Vue);
}

export const create = VueI18Next.create;

// @ts-ignore
export default exports;
