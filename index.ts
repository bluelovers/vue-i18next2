import * as I18next from 'i18next';
import bind from 'bind-decorator';
import * as deepmerge from 'deepmerge';
import * as shortid from 'shortid';

let current;

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
		current = this;

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

	reactiveVM($_vm)
	{
		$_vm.tag;
	}

	@bind
	onI18nChanged()
	{
		this.i18nVm.tag++;
	}

	@bind
	t(key, options?: I18next.TranslationOptions)
	{
		return this.i18n.t(key, options);
	}

	@bind
	install(Vue, options)
	{
		let self = this;
		let opts = Object.assign({}, self.options, options);

		if (self.Vue.params && !self.Vue.params.i18nextLanguage)
		{
			self.Vue.paramsCreate('i18nextLanguage');
		}

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
				$t(): I18next.TranslationFunction
				{
					return function (key, options?: I18next.TranslationOptions)
					{
						let opts = self.Vue.util.extend({
							lng: self.Vue.params ? self.Vue.params.i18nextLanguage : void(0),
							ns: this.$options.i18nextNamespace,
						}, options);

						// this makes the function reactive
						//this.$i18n.$_vm.tag;
						self.reactiveVM(this.$i18n.$_vm);
						return this.$i18n.t(key, opts);
					}
				},
			},

			beforeCreate()
			{
				let _this = this;
				const options = _this.$options;

				try
				{
					if (options.i18n)
					{
						_this.$i18n = options.i18n;
					}
					else if (options.parent && options.parent.$i18n)
					{
						_this.$i18n = options.parent.$i18n;
					}
				}
				catch (e)
				{}

				let inlineTranslations = {};
				if (_this.$i18n) {
					const getNamespace = _this.$i18n.options.getComponentNamespace || VueI18Next.getComponentNamespace;
					const { namespace, loadNamespace } = getNamespace(_this);

					if (options.__i18n) {
						options.__i18n.forEach((resource) => {
							inlineTranslations = deepmerge(inlineTranslations, JSON.parse(resource));
						});

						//console.log(namespace, inlineTranslations, options);
					}

					if (loadNamespace && _this.$i18n.options.loadComponentNamespace) {
						_this.$i18n.loadNamespaces([namespace]);
					}

					const languages = Object.keys(inlineTranslations);
					languages.forEach((lang) => {

						//console.log(lang, namespace, { ...inlineTranslations[lang] });

						_this.$i18n.addResourceBundle(
							lang,
							namespace,
							{
								...inlineTranslations[lang],
							},
							true,
							false,
						);
					});

					let ns = [namespace];

					if (_this.$i18n.options.defaultNS)
					{
						if (Array.isArray(_this.$i18n.options.defaultNS))
						{
							ns = ns.concat(_this.$i18n.options.defaultNS);
						}
						else
						{
							ns.push(_this.$i18n.options.defaultNS);
						}

						//console.log(ns);
					}

					options.i18nextNamespace = ns;
					//console.log(_this.$i18n.options);
				}
			},
		});
	}

	@bind
	init(...opts)
	{
		this.i18n = this.i18n.init(...opts);

		return this;
	}

	static get i18n()
	{
		return current ? current.i18n : I18next;
	}
}

export namespace VueI18Next
{
	export function create(Vue, i18next?: I18next.i18n, ...argv)
	{
		return new VueI18Next(Vue, i18next, ...argv);
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

	export function install(Vue, options)
	{
		auto(Vue);
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
			namespace: shortid.generate(),
		};
	}

	export function getCurrent()
	{
		return current;
	}
}

// @ts-ignore
VueI18Next.VueI18Next = VueI18Next;

// @ts-ignore
Object.defineProperty(exports, 'i18n', {
	get()
	{
		return current ? current.i18n : I18next;
	},
});

export const install = VueI18Next.install;
export const create = VueI18Next.create;

// @ts-ignore
export default exports;
