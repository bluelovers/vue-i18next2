/**
 * Created by user on 2017/12/3/003.
 */

import { relative, expect } from './_local-dev';
import * as i18next from 'i18next';
import * as Vue from 'vue';
import * as VueParams from 'vue-params';
import VueI18Next from '..';
import { locales } from './res/locales';

describe(relative(__filename), () =>
{
	let i18n;

	beforeEach(() =>
	{
		i18n = i18next;
	});

	describe(`i18next`, () =>
	{
		it(`label`, function (done)
		{
			let o = VueI18Next.create(Vue, i18n);

			o.init({
				//lng: 'en',
				fallbackLng: 'en',
				resources: {
					en: { translation: locales.en },
					de: { translation: locales.de },
				},
			});

			expect(i18next).to.equal(i18n);
			expect(i18n).to.equal(o.i18n);
			expect(i18n).to.equal(VueI18Next.i18n);

			expect(o.t('tos')).to.equal(i18n.t('tos'));

			done();
		});
	});
});
