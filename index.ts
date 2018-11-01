import I18next = require('i18next');
import bind from 'bind-decorator';
import deepmerge = require('deepmerge');
import shortid = require('shortid');
import VUE from 'vue';

let current: VueI18Next;

export interface IVueI18NextOptions
{
	bindI18n: string;
	bindStore: string;
	[k: string]: any
}

export class VueI18Next
{
	public Vue: typeof VUE;
	public i18n: I18next.i18n;
	public i18nVm: VUE = null;
	public options: IVueI18NextOptions = {
		bindI18n: 'languageChanged loaded',
		bindStore: 'added removed',
	};

	constructor(Vue: typeof VUE, i18next: I18next.i18n = I18next, options = {})
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
		// @ts-ignore
		this.i18nVm.tag++;
	}

	@bind
	t(key, options?: I18next.TranslationOptions)
	{
		return this.i18n.t(key, options);
	}

	@bind
	install(Vue: typeof VUE, options)
	{
		let self = this;
		let opts = Object.assign({}, self.options, options);

		// @ts-ignore
		if (self.Vue.params && !self.Vue.params.i18nextLanguage)
		{
			// @ts-ignore
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
						// @ts-ignore
						let opts = self.Vue.util.extend({
							// @ts-ignore
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
					// @ts-ignore
					if (options.i18n)
					{
						// @ts-ignore
						_this.$i18n = options.i18n;
					}
					// @ts-ignore
					else if (options.parent && options.parent.$i18n)
					{
						// @ts-ignore
						_this.$i18n = options.parent.$i18n;
					}
				}
				catch (e)
				{}

				let inlineTranslations = {};
				// @ts-ignore
				if (_this.$i18n)
				{
					// @ts-ignore
					const getNamespace = _this.$i18n.options.getComponentNamespace || VueI18Next.getComponentNamespace;
					const { namespace, loadNamespace } = getNamespace(_this);

					// @ts-ignore
					if (options.__i18n)
					{
						// @ts-ignore
						options.__i18n.forEach((resource) =>
						{
							inlineTranslations = deepmerge(inlineTranslations, JSON.parse(resource));
						});

						//console.log(namespace, inlineTranslations, options);
					}

					// @ts-ignore
					if (loadNamespace && _this.$i18n.options.loadComponentNamespace)
					{
						// @ts-ignore
						_this.$i18n.loadNamespaces([namespace]);
					}

					const languages = Object.keys(inlineTranslations);
					languages.forEach((lang) =>
					{

						//console.log(lang, namespace, { ...inlineTranslations[lang] });

						// @ts-ignore
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

					// @ts-ignore
					if (_this.$i18n.options.defaultNS)
					{
						// @ts-ignore
						if (Array.isArray(_this.$i18n.options.defaultNS))
						{
							// @ts-ignore
							ns = ns.concat(_this.$i18n.options.defaultNS);
						}
						else
						{
							// @ts-ignore
							ns.push(_this.$i18n.options.defaultNS);
						}

						//console.log(ns);
					}

					// @ts-ignore
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
	export function create(Vue: typeof VUE, i18next?: I18next.i18n, ...argv)
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
			},
		});
	}

	export function install(Vue: typeof VUE, options?)
	{
		auto(Vue);
	}

	export function auto(Vue: typeof VUE, _i18next: I18next.i18n | true = I18next, useBackend?: boolean)
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

	export function getComponentNamespace(vm: VUE)
	{
		// @ts-ignore
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

import * as self from './index'

export default self;
