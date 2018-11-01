"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const I18next = require("i18next");
const bind_decorator_1 = require("bind-decorator");
const deepmerge = require("deepmerge");
const shortid = require("shortid");
let current;
class VueI18Next {
    constructor(Vue, i18next = I18next, options = {}) {
        this.i18nVm = null;
        this.options = {
            bindI18n: 'languageChanged loaded',
            bindStore: 'added removed',
        };
        current = this;
        this.Vue = Vue;
        this.i18n = i18next;
        Object.assign(this.options, options);
    }
    resetVM(data = { tag: 1 }) {
        const oldVM = this.i18nVm;
        const silent = this.Vue.config.silent;
        this.Vue.config.silent = true;
        this.i18nVm = new this.Vue({ data });
        this.Vue.config.silent = silent;
        if (oldVM) {
            this.Vue.nextTick(() => oldVM.$destroy());
        }
        return this.i18nVm;
    }
    reactiveVM($_vm) {
        $_vm.tag;
    }
    onI18nChanged() {
        this.i18nVm.tag++;
    }
    t(key, options) {
        return this.i18n.t(key, options);
    }
    install(Vue, options) {
        let self = this;
        let opts = Object.assign({}, self.options, options);
        if (self.Vue.params && !self.Vue.params.i18nextLanguage) {
            self.Vue.paramsCreate('i18nextLanguage');
        }
        self.resetVM();
        if (opts.bindI18n) {
            self.i18n.on(opts.bindI18n, self.onI18nChanged);
        }
        {
            if (opts.bindStore && this.i18n.store) {
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
        self.Vue.mixin({
            computed: {
                $t() {
                    return function (key, options) {
                        let opts = self.Vue.util.extend({
                            lng: self.Vue.params ? self.Vue.params.i18nextLanguage : void (0),
                            ns: this.$options.i18nextNamespace,
                        }, options);
                        self.reactiveVM(this.$i18n.$_vm);
                        return this.$i18n.t(key, opts);
                    };
                },
            },
            beforeCreate() {
                let _this = this;
                const options = _this.$options;
                try {
                    if (options.i18n) {
                        _this.$i18n = options.i18n;
                    }
                    else if (options.parent && options.parent.$i18n) {
                        _this.$i18n = options.parent.$i18n;
                    }
                }
                catch (e) { }
                let inlineTranslations = {};
                if (_this.$i18n) {
                    const getNamespace = _this.$i18n.options.getComponentNamespace || VueI18Next.getComponentNamespace;
                    const { namespace, loadNamespace } = getNamespace(_this);
                    if (options.__i18n) {
                        options.__i18n.forEach((resource) => {
                            inlineTranslations = deepmerge(inlineTranslations, JSON.parse(resource));
                        });
                    }
                    if (loadNamespace && _this.$i18n.options.loadComponentNamespace) {
                        _this.$i18n.loadNamespaces([namespace]);
                    }
                    const languages = Object.keys(inlineTranslations);
                    languages.forEach((lang) => {
                        _this.$i18n.addResourceBundle(lang, namespace, Object.assign({}, inlineTranslations[lang]), true, false);
                    });
                    let ns = [namespace];
                    if (_this.$i18n.options.defaultNS) {
                        if (Array.isArray(_this.$i18n.options.defaultNS)) {
                            ns = ns.concat(_this.$i18n.options.defaultNS);
                        }
                        else {
                            ns.push(_this.$i18n.options.defaultNS);
                        }
                    }
                    options.i18nextNamespace = ns;
                }
            },
        });
    }
    init(...opts) {
        this.i18n = this.i18n.init(...opts);
        return this;
    }
    static get i18n() {
        return current ? current.i18n : I18next;
    }
}
__decorate([
    bind_decorator_1.default
], VueI18Next.prototype, "resetVM", null);
__decorate([
    bind_decorator_1.default
], VueI18Next.prototype, "onI18nChanged", null);
__decorate([
    bind_decorator_1.default
], VueI18Next.prototype, "t", null);
__decorate([
    bind_decorator_1.default
], VueI18Next.prototype, "install", null);
__decorate([
    bind_decorator_1.default
], VueI18Next.prototype, "init", null);
exports.VueI18Next = VueI18Next;
(function (VueI18Next) {
    function create(Vue, i18next, ...argv) {
        return new VueI18Next(Vue, i18next, ...argv);
    }
    VueI18Next.create = create;
    function backend(_i18next = I18next) {
        return _i18next.use({
            type: "backend",
            init: function (services, options, i18nextOpts) {
                this.load = options.load;
                if (typeof this.load !== 'function') {
                    throw "vue-i18next: missing 'load' function in backend options";
                }
            },
            read: function (language, namespace, callback) {
                if (language == 'dev') {
                    callback(null, null);
                    return;
                }
                this.load(language, namespace).then(function (module) {
                    callback(null, module[language]);
                }).catch(function (err) {
                    callback(err, null);
                });
            },
        });
    }
    VueI18Next.backend = backend;
    function install(Vue, options) {
        auto(Vue);
    }
    VueI18Next.install = install;
    function auto(Vue, _i18next = I18next, useBackend) {
        if (_i18next === true) {
            _i18next = backend();
        }
        else if (useBackend) {
            _i18next = backend(_i18next);
        }
        let i18n = (_i18next || I18next);
        let o = new VueI18Next(Vue, i18n);
        Vue.use(o.install);
        return o;
    }
    VueI18Next.auto = auto;
    function getComponentNamespace(vm) {
        const namespace = vm.$options.name || vm.$options._componentTag;
        if (namespace) {
            return {
                namespace,
                loadNamespace: true,
            };
        }
        return {
            namespace: shortid.generate(),
        };
    }
    VueI18Next.getComponentNamespace = getComponentNamespace;
    function getCurrent() {
        return current;
    }
    VueI18Next.getCurrent = getCurrent;
})(VueI18Next = exports.VueI18Next || (exports.VueI18Next = {}));
VueI18Next.VueI18Next = VueI18Next;
Object.defineProperty(exports, 'i18n', {
    get() {
        return current ? current.i18n : I18next;
    },
});
exports.install = VueI18Next.install;
exports.create = VueI18Next.create;
const self = require("./index");
exports.default = self;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiLi8iLCJzb3VyY2VzIjpbImluZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUEsbUNBQW9DO0FBQ3BDLG1EQUFrQztBQUNsQyx1Q0FBd0M7QUFDeEMsbUNBQW9DO0FBR3BDLElBQUksT0FBbUIsQ0FBQztBQVN4QixNQUFhLFVBQVU7SUFVdEIsWUFBWSxHQUFlLEVBQUUsVUFBd0IsT0FBTyxFQUFFLE9BQU8sR0FBRyxFQUFFO1FBTm5FLFdBQU0sR0FBUSxJQUFJLENBQUM7UUFDbkIsWUFBTyxHQUF1QjtZQUNwQyxRQUFRLEVBQUUsd0JBQXdCO1lBQ2xDLFNBQVMsRUFBRSxlQUFlO1NBQzFCLENBQUM7UUFJRCxPQUFPLEdBQUcsSUFBSSxDQUFDO1FBRWYsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7UUFDZixJQUFJLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQztRQUVwQixNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDdEMsQ0FBQztJQUdELE9BQU8sQ0FBQyxJQUFJLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFO1FBRXhCLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDMUIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDO1FBRXRDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7UUFDOUIsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQ3JDLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFFaEMsSUFBSSxLQUFLLEVBQ1Q7WUFDQyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEs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TUFBTSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFO0lBQ3RDLEdBQUc7UUFFRixPQUFPLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDO0lBQ3pDLENBQUM7Q0FDRCxDQUFDLENBQUM7QUFFVSxRQUFBLE9BQU8sR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDO0FBQzdCLFFBQUEsTUFBTSxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUM7QUFFeEMsZ0NBQStCO0FBRS9CLGtCQUFlLElBQUksQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBJMThuZXh0ID0gcmVxdWlyZSgnaTE4bmV4dCcpO1xuaW1wb3J0IGJpbmQgZnJvbSAnYmluZC1kZWNvcmF0b3InO1xuaW1wb3J0IGRlZXBtZXJnZSA9IHJlcXVpcmUoJ2RlZXBtZXJnZScpO1xuaW1wb3J0IHNob3J0aWQgPSByZXF1aXJlKCdzaG9ydGlkJyk7XG5pbXBvcnQgVlVFIGZyb20gJ3Z1ZSc7XG5cbmxldCBjdXJyZW50OiBWdWVJMThOZXh0O1xuXG5leHBvcnQgaW50ZXJmYWNlIElWdWVJMThOZXh0T3B0aW9uc1xue1xuXHRiaW5kSTE4bjogc3RyaW5nO1xuXHRiaW5kU3RvcmU6IHN0cmluZztcblx0W2s6IHN0cmluZ106IGFueVxufVxuXG5leHBvcnQgY2xhc3MgVnVlSTE4TmV4dFxue1xuXHRwdWJsaWMgVnVlOiB0eXBlb2YgVlVFO1xuXHRwdWJsaWMgaTE4bjogSTE4bmV4dC5pMThuO1xuXHRwdWJsaWMgaTE4blZtOiBWVUUgPSBudWxsO1xuXHRwdWJsaWMgb3B0aW9uczogSVZ1ZUkxOE5leHRPcHRpb25zID0ge1xuXHRcdGJpbmRJMThuOiAnbGFuZ3VhZ2VDaGFuZ2VkIGxvYWRlZCcsXG5cdFx0YmluZFN0b3JlOiAnYWRkZWQgcmVtb3ZlZCcsXG5cdH07XG5cblx0Y29uc3RydWN0b3IoVnVlOiB0eXBlb2YgVlVFLCBpMThuZXh0OiBJMThuZXh0LmkxOG4gPSBJMThuZXh0LCBvcHRpb25zID0ge30pXG5cdHtcblx0XHRjdXJyZW50ID0gdGhpcztcblxuXHRcdHRoaXMuVnVlID0gVnVlO1xuXHRcdHRoaXMuaTE4biA9IGkxOG5leHQ7XG5cblx0XHRPYmplY3QuYXNzaWduKHRoaXMub3B0aW9ucywgb3B0aW9ucyk7XG5cdH1cblxuXHRAYmluZFxuXHRyZXNldFZNKGRhdGEgPSB7IHRhZzogMSB9KVxuXHR7XG5cdFx0Y29uc3Qgb2xkVk0gPSB0aGlzLmkxOG5WbTtcblx0XHRjb25zdCBzaWxlbnQgPSB0aGlzLlZ1ZS5jb25maWcuc2lsZW50O1xuXG5cdFx0dGhpcy5WdWUuY29uZmlnLnNpbGVudCA9IHRydWU7XG5cdFx0dGhpcy5pMThuVm0gPSBuZXcgdGhpcy5WdWUoeyBkYXRhIH0pO1xuXHRcdHRoaXMuVnVlLmNvbmZpZy5zaWxlbnQgPSBzaWxlbnQ7XG5cblx0XHRpZiAob2xkVk0pXG5cdFx0e1xuXHRcdFx0dGhpcy5WdWUubmV4dFRpY2soKCkgPT4gb2xkVk0uJGRlc3Ryb3koKSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXMuaTE4blZtO1xuXHR9XG5cblx0cmVhY3RpdmVWTSgkX3ZtKVxuXHR7XG5cdFx0JF92bS50YWc7XG5cdH1cblxuXHRAYmluZFxuXHRvbkkxOG5DaGFuZ2VkKClcblx0e1xuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHR0aGlzLmkxOG5WbS50YWcrKztcblx0fVxuXG5cdEBiaW5kXG5cdHQoa2V5LCBvcHRpb25zPzogSTE4bmV4dC5UcmFuc2xhdGlvbk9wdGlvbnMpXG5cdHtcblx0XHRyZXR1cm4gdGhpcy5pMThuLnQoa2V5LCBvcHRpb25zKTtcblx0fVxuXG5cdEBiaW5kXG5cdGluc3RhbGwoVnVlOiB0eXBlb2YgVlVFLCBvcHRpb25zKVxuXHR7XG5cdFx0bGV0IHNlbGYgPSB0aGlzO1xuXHRcdGxldCBvcHRzID0gT2JqZWN0LmFzc2lnbih7fSwgc2VsZi5vcHRpb25zLCBvcHRpb25zKTtcblxuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRpZiAoc2VsZi5WdWUucGFyYW1zICYmICFzZWxmLlZ1ZS5wYXJhbXMuaTE4bmV4dExhbmd1YWdlKVxuXHRcdHtcblx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdHNlbGYuVnVlLnBhcmFtc0NyZWF0ZSgnaTE4bmV4dExhbmd1YWdlJyk7XG5cdFx0fVxuXG5cdFx0c2VsZi5yZXNldFZNKCk7XG5cblx0XHRpZiAob3B0cy5iaW5kSTE4bilcblx0XHR7XG5cdFx0XHRzZWxmLmkxOG4ub24ob3B0cy5iaW5kSTE4biwgc2VsZi5vbkkxOG5DaGFuZ2VkKTtcblx0XHR9XG5cblx0XHR7XG5cdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRpZiAob3B0cy5iaW5kU3RvcmUgJiYgdGhpcy5pMThuLnN0b3JlKVxuXHRcdFx0e1xuXHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdHNlbGYuaTE4bi5zdG9yZS5vbihvcHRzLmJpbmRTdG9yZSwgc2VsZi5vbkkxOG5DaGFuZ2VkKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoc2VsZi5pMThuLCAnJF92bScsIHtcblx0XHRcdHZhbHVlOiBzZWxmLmkxOG5WbSxcblx0XHRcdGNvbmZpZ3VyYWJsZTogdHJ1ZSxcblx0XHR9KTtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoc2VsZi5WdWUucHJvdG90eXBlLCAnJGkxOG4nLCB7XG5cdFx0XHR2YWx1ZTogc2VsZi5pMThuLFxuXHRcdH0pO1xuXHRcdC8qXG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHNlbGYuVnVlLnByb3RvdHlwZSwgJyR0Jywge1xuXHRcdFx0dmFsdWU6IGZ1bmN0aW9uIChrZXksIG9wdGlvbnMpXG5cdFx0XHR7XG5cdFx0XHRcdGxldCBvcHRzID0gVnVlLnV0aWwuZXh0ZW5kKHtcblx0XHRcdFx0XHRsbmc6IFZ1ZS5wYXJhbXMgPyBWdWUucGFyYW1zLmkxOG5leHRMYW5ndWFnZSA6IHZvaWQoMCksXG5cdFx0XHRcdFx0bnM6IHRoaXMuJG9wdGlvbnMuaTE4bmV4dE5hbWVzcGFjZSxcblx0XHRcdFx0fSwgb3B0aW9ucyk7XG5cblx0XHRcdFx0Ly8gdGhpcyBtYWtlcyB0aGUgZnVuY3Rpb24gcmVhY3RpdmVcblx0XHRcdFx0dGhpcy4kaTE4bi4kX3ZtLnRhZztcblx0XHRcdFx0cmV0dXJuIHRoaXMuJGkxOG4udChrZXksIG9wdHMpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdCovXG5cdFx0c2VsZi5WdWUubWl4aW4oe1xuXHRcdFx0Y29tcHV0ZWQ6IHtcblx0XHRcdFx0JHQoKTogSTE4bmV4dC5UcmFuc2xhdGlvbkZ1bmN0aW9uXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXR1cm4gZnVuY3Rpb24gKGtleSwgb3B0aW9ucz86IEkxOG5leHQuVHJhbnNsYXRpb25PcHRpb25zKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRcdGxldCBvcHRzID0gc2VsZi5WdWUudXRpbC5leHRlbmQoe1xuXHRcdFx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0XHRcdGxuZzogc2VsZi5WdWUucGFyYW1zID8gc2VsZi5WdWUucGFyYW1zLmkxOG5leHRMYW5ndWFnZSA6IHZvaWQoMCksXG5cdFx0XHRcdFx0XHRcdG5zOiB0aGlzLiRvcHRpb25zLmkxOG5leHROYW1lc3BhY2UsXG5cdFx0XHRcdFx0XHR9LCBvcHRpb25zKTtcblxuXHRcdFx0XHRcdFx0Ly8gdGhpcyBtYWtlcyB0aGUgZnVuY3Rpb24gcmVhY3RpdmVcblx0XHRcdFx0XHRcdC8vdGhpcy4kaTE4bi4kX3ZtLnRhZztcblx0XHRcdFx0XHRcdHNlbGYucmVhY3RpdmVWTSh0aGlzLiRpMThuLiRfdm0pO1xuXHRcdFx0XHRcdFx0cmV0dXJuIHRoaXMuJGkxOG4udChrZXksIG9wdHMpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdH0sXG5cblx0XHRcdGJlZm9yZUNyZWF0ZSgpXG5cdFx0XHR7XG5cdFx0XHRcdGxldCBfdGhpcyA9IHRoaXM7XG5cdFx0XHRcdGNvbnN0IG9wdGlvbnMgPSBfdGhpcy4kb3B0aW9ucztcblxuXHRcdFx0XHR0cnlcblx0XHRcdFx0e1xuXHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRpZiAob3B0aW9ucy5pMThuKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRcdF90aGlzLiRpMThuID0gb3B0aW9ucy5pMThuO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0ZWxzZSBpZiAob3B0aW9ucy5wYXJlbnQgJiYgb3B0aW9ucy5wYXJlbnQuJGkxOG4pXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRcdFx0X3RoaXMuJGkxOG4gPSBvcHRpb25zLnBhcmVudC4kaTE4bjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0Y2F0Y2ggKGUpXG5cdFx0XHRcdHt9XG5cblx0XHRcdFx0bGV0IGlubGluZVRyYW5zbGF0aW9ucyA9IHt9O1xuXHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdGlmIChfdGhpcy4kaTE4bilcblx0XHRcdFx0e1xuXHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRjb25zdCBnZXROYW1lc3BhY2UgPSBfdGhpcy4kaTE4bi5vcHRpb25zLmdldENvbXBvbmVudE5hbWVzcGFjZSB8fCBWdWVJMThOZXh0LmdldENvbXBvbmVudE5hbWVzcGFjZTtcblx0XHRcdFx0XHRjb25zdCB7IG5hbWVzcGFjZSwgbG9hZE5hbWVzcGFjZSB9ID0gZ2V0TmFtZXNwYWNlKF90aGlzKTtcblxuXHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRpZiAob3B0aW9ucy5fX2kxOG4pXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRcdFx0b3B0aW9ucy5fX2kxOG4uZm9yRWFjaCgocmVzb3VyY2UpID0+XG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGlubGluZVRyYW5zbGF0aW9ucyA9IGRlZXBtZXJnZShpbmxpbmVUcmFuc2xhdGlvbnMsIEpTT04ucGFyc2UocmVzb3VyY2UpKTtcblx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKG5hbWVzcGFjZSwgaW5saW5lVHJhbnNsYXRpb25zLCBvcHRpb25zKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0aWYgKGxvYWROYW1lc3BhY2UgJiYgX3RoaXMuJGkxOG4ub3B0aW9ucy5sb2FkQ29tcG9uZW50TmFtZXNwYWNlKVxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRcdF90aGlzLiRpMThuLmxvYWROYW1lc3BhY2VzKFtuYW1lc3BhY2VdKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRjb25zdCBsYW5ndWFnZXMgPSBPYmplY3Qua2V5cyhpbmxpbmVUcmFuc2xhdGlvbnMpO1xuXHRcdFx0XHRcdGxhbmd1YWdlcy5mb3JFYWNoKChsYW5nKSA9PlxuXHRcdFx0XHRcdHtcblxuXHRcdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhsYW5nLCBuYW1lc3BhY2UsIHsgLi4uaW5saW5lVHJhbnNsYXRpb25zW2xhbmddIH0pO1xuXG5cdFx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0XHRfdGhpcy4kaTE4bi5hZGRSZXNvdXJjZUJ1bmRsZShcblx0XHRcdFx0XHRcdFx0bGFuZyxcblx0XHRcdFx0XHRcdFx0bmFtZXNwYWNlLFxuXHRcdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdFx0Li4uaW5saW5lVHJhbnNsYXRpb25zW2xhbmddLFxuXHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0XHR0cnVlLFxuXHRcdFx0XHRcdFx0XHRmYWxzZSxcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRsZXQgbnMgPSBbbmFtZXNwYWNlXTtcblxuXHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRpZiAoX3RoaXMuJGkxOG4ub3B0aW9ucy5kZWZhdWx0TlMpXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRcdFx0aWYgKEFycmF5LmlzQXJyYXkoX3RoaXMuJGkxOG4ub3B0aW9ucy5kZWZhdWx0TlMpKVxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0XHRcdG5zID0gbnMuY29uY2F0KF90aGlzLiRpMThuLm9wdGlvbnMuZGVmYXVsdE5TKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRcdFx0XHRucy5wdXNoKF90aGlzLiRpMThuLm9wdGlvbnMuZGVmYXVsdE5TKTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhucyk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdFx0XHRcdG9wdGlvbnMuaTE4bmV4dE5hbWVzcGFjZSA9IG5zO1xuXHRcdFx0XHRcdC8vY29uc29sZS5sb2coX3RoaXMuJGkxOG4ub3B0aW9ucyk7XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0fSk7XG5cdH1cblxuXHRAYmluZFxuXHRpbml0KC4uLm9wdHMpXG5cdHtcblx0XHR0aGlzLmkxOG4gPSB0aGlzLmkxOG4uaW5pdCguLi5vcHRzKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cblx0c3RhdGljIGdldCBpMThuKClcblx0e1xuXHRcdHJldHVybiBjdXJyZW50ID8gY3VycmVudC5pMThuIDogSTE4bmV4dDtcblx0fVxufVxuXG5leHBvcnQgbmFtZXNwYWNlIFZ1ZUkxOE5leHRcbntcblx0ZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZShWdWU6IHR5cGVvZiBWVUUsIGkxOG5leHQ/OiBJMThuZXh0LmkxOG4sIC4uLmFyZ3YpXG5cdHtcblx0XHRyZXR1cm4gbmV3IFZ1ZUkxOE5leHQoVnVlLCBpMThuZXh0LCAuLi5hcmd2KTtcblx0fVxuXG5cdGV4cG9ydCBmdW5jdGlvbiBiYWNrZW5kKF9pMThuZXh0OiBJMThuZXh0LmkxOG4gPSBJMThuZXh0KTogSTE4bmV4dC5pMThuXG5cdHtcblx0XHRyZXR1cm4gX2kxOG5leHQudXNlKHtcblx0XHRcdHR5cGU6IFwiYmFja2VuZFwiLFxuXG5cdFx0XHRpbml0OiBmdW5jdGlvbiAoc2VydmljZXMsIG9wdGlvbnMsIGkxOG5leHRPcHRzKVxuXHRcdFx0e1xuXHRcdFx0XHR0aGlzLmxvYWQgPSBvcHRpb25zLmxvYWQ7XG5cdFx0XHRcdGlmICh0eXBlb2YgdGhpcy5sb2FkICE9PSAnZnVuY3Rpb24nKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dGhyb3cgXCJ2dWUtaTE4bmV4dDogbWlzc2luZyAnbG9hZCcgZnVuY3Rpb24gaW4gYmFja2VuZCBvcHRpb25zXCI7XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cblx0XHRcdHJlYWQ6IGZ1bmN0aW9uIChsYW5ndWFnZSwgbmFtZXNwYWNlLCBjYWxsYmFjaylcblx0XHRcdHtcblx0XHRcdFx0aWYgKGxhbmd1YWdlID09ICdkZXYnKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Y2FsbGJhY2sobnVsbCwgbnVsbCk7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHRoaXMubG9hZChsYW5ndWFnZSwgbmFtZXNwYWNlKS50aGVuKGZ1bmN0aW9uIChtb2R1bGUpXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRjYWxsYmFjayhudWxsLCBtb2R1bGVbbGFuZ3VhZ2VdKTtcblx0XHRcdFx0fSkuY2F0Y2goZnVuY3Rpb24gKGVycilcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGNhbGxiYWNrKGVyciwgbnVsbCk7XG5cdFx0XHRcdH0pXG5cdFx0XHR9LFxuXHRcdH0pO1xuXHR9XG5cblx0ZXhwb3J0IGZ1bmN0aW9uIGluc3RhbGwoVnVlOiB0eXBlb2YgVlVFLCBvcHRpb25zPylcblx0e1xuXHRcdGF1dG8oVnVlKTtcblx0fVxuXG5cdGV4cG9ydCBmdW5jdGlvbiBhdXRvKFZ1ZTogdHlwZW9mIFZVRSwgX2kxOG5leHQ6IEkxOG5leHQuaTE4biB8IHRydWUgPSBJMThuZXh0LCB1c2VCYWNrZW5kPzogYm9vbGVhbilcblx0e1xuXHRcdGlmIChfaTE4bmV4dCA9PT0gdHJ1ZSlcblx0XHR7XG5cdFx0XHRfaTE4bmV4dCA9IGJhY2tlbmQoKTtcblx0XHR9XG5cdFx0ZWxzZSBpZiAodXNlQmFja2VuZClcblx0XHR7XG5cdFx0XHRfaTE4bmV4dCA9IGJhY2tlbmQoX2kxOG5leHQpO1xuXHRcdH1cblxuXHRcdGxldCBpMThuID0gKF9pMThuZXh0IHx8IEkxOG5leHQpIGFzIEkxOG5leHQuaTE4bjtcblxuXHRcdGxldCBvID0gbmV3IFZ1ZUkxOE5leHQoVnVlLCBpMThuKTtcblxuXHRcdFZ1ZS51c2Uoby5pbnN0YWxsKTtcblxuXHRcdHJldHVybiBvO1xuXHR9XG5cblx0ZXhwb3J0IGZ1bmN0aW9uIGdldENvbXBvbmVudE5hbWVzcGFjZSh2bTogVlVFKVxuXHR7XG5cdFx0Ly8gQHRzLWlnbm9yZVxuXHRcdGNvbnN0IG5hbWVzcGFjZSA9IHZtLiRvcHRpb25zLm5hbWUgfHwgdm0uJG9wdGlvbnMuX2NvbXBvbmVudFRhZztcblx0XHRpZiAobmFtZXNwYWNlKVxuXHRcdHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdG5hbWVzcGFjZSxcblx0XHRcdFx0bG9hZE5hbWVzcGFjZTogdHJ1ZSxcblx0XHRcdH07XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHtcblx0XHRcdG5hbWVzcGFjZTogc2hvcnRpZC5nZW5lcmF0ZSgpLFxuXHRcdH07XG5cdH1cblxuXHRleHBvcnQgZnVuY3Rpb24gZ2V0Q3VycmVudCgpXG5cdHtcblx0XHRyZXR1cm4gY3VycmVudDtcblx0fVxufVxuXG4vLyBAdHMtaWdub3JlXG5WdWVJMThOZXh0LlZ1ZUkxOE5leHQgPSBWdWVJMThOZXh0O1xuXG4vLyBAdHMtaWdub3JlXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ2kxOG4nLCB7XG5cdGdldCgpXG5cdHtcblx0XHRyZXR1cm4gY3VycmVudCA/IGN1cnJlbnQuaTE4biA6IEkxOG5leHQ7XG5cdH0sXG59KTtcblxuZXhwb3J0IGNvbnN0IGluc3RhbGwgPSBWdWVJMThOZXh0Lmluc3RhbGw7XG5leHBvcnQgY29uc3QgY3JlYXRlID0gVnVlSTE4TmV4dC5jcmVhdGU7XG5cbmltcG9ydCAqIGFzIHNlbGYgZnJvbSAnLi9pbmRleCdcblxuZXhwb3J0IGRlZmF1bHQgc2VsZjtcbiJdfQ==