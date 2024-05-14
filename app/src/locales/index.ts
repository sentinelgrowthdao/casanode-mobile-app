import { createI18n } from 'vue-i18n';
import { Device } from '@capacitor/device';

// English
import AppEn from '@locales/en/app.json';
import WelcomeEn from '@locales/en/welcome.json';
import WizardEn from '@locales/en/wizard.json';
import DashboardEn from '@locales/en/dashboard.json';

// French
import AppFr from '@locales/fr/app.json';
import WelcomeFr from '@locales/fr/welcome.json';
import WizardFr from '@locales/fr/wizard.json';
import DashboardFr from '@locales/fr/dashboard.json';

interface Option
{
	libelle: string;
	value: string;
}

interface MessageFile
{
	[key: string]:
	{
		[key: string]:
		{
			[key: string]: string | Option[];
		} | Option[];
	};
}

const messages : MessageFile =
{
	en:
	{
		"app": AppEn,
		"welcome": WelcomeEn,
		"wizard": WizardEn,
		"dashboard": DashboardEn,
	},
	fr:
	{
		"app": AppFr,
		"welcome": WelcomeFr,
		"wizard": WizardFr,
		"dashboard": DashboardFr,
	},
};


/**
 * Get the locale language
 * @returns {string}
 */
async function localeLanguage() : Promise<string>
{
	const systemLocale = await Device.getLanguageCode();
	return systemLocale.value || 'en';
}

// Create a new i18n instance
const i18n = createI18n({
	locale: await localeLanguage(),
	fallbackLocale: 'en',
	messages: messages
});

export default i18n;
