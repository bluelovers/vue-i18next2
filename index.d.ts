import I18next = require('i18next');
import VUE from 'vue';
export interface IVueI18NextOptions {
    bindI18n: string;
    bindStore: string;
    [k: string]: any;
}
export declare class VueI18Next {
    Vue: typeof VUE;
    i18n: I18next.i18n;
    i18nVm: VUE;
    options: IVueI18NextOptions;
    constructor(Vue: typeof VUE, i18next?: I18next.i18n, options?: {});
    resetVM(data?: {
        tag: number;
    }): VUE;
    reactiveVM($_vm: any): void;
    onI18nChanged(): void;
    t(key: any, options?: I18next.TranslationOptions): any;
    install(Vue: typeof VUE, options: any): void;
    init(...opts: any[]): this;
    static readonly i18n: I18next.i18n;
}
export declare namespace VueI18Next {
    function create(Vue: typeof VUE, i18next?: I18next.i18n, ...argv: any[]): VueI18Next;
    function backend(_i18next?: I18next.i18n): I18next.i18n;
    function install(Vue: typeof VUE, options?: any): void;
    function auto(Vue: typeof VUE, _i18next?: I18next.i18n | true, useBackend?: boolean): VueI18Next;
    function getComponentNamespace(vm: VUE): {
        namespace: any;
        loadNamespace: boolean;
    } | {
        namespace: any;
        loadNamespace?: undefined;
    };
    function getCurrent(): VueI18Next;
}
export declare const install: typeof VueI18Next.install;
export declare const create: typeof VueI18Next.create;
import * as self from './index';
export default self;
