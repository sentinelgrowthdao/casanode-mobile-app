import { createI18n } from 'vue-i18n';
import { Device } from '@capacitor/device';

// English
import AppEn from '@locales/en/app.json';
import WelcomeEn from '@locales/en/welcome.json';
import WizardEn from '@locales/en/wizard.json';
import DashboardEn from '@locales/en/dashboard.json';
import AboutEn from '@locales/en/about.json';
import WalletEn from '@locales/en/wallet.json';
import ActionsEn from '@locales/en/actions.json';

// French
import AppFr from '@locales/fr/app.json';
import WelcomeFr from '@locales/fr/welcome.json';
import WizardFr from '@locales/fr/wizard.json';
import DashboardFr from '@locales/fr/dashboard.json';
import AboutFr from '@locales/fr/about.json';
import WalletFr from '@locales/fr/wallet.json';
import ActionsFr from '@locales/fr/actions.json';

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
		"about": AboutEn,
		"wallet": WalletEn,
		"actions": ActionsEn,
	},
	fr:
	{
		"app": AppFr,
		"welcome": WelcomeFr,
		"wizard": WizardFr,
		"dashboard": DashboardFr,
		"about": AboutFr,
		"wallet": WalletFr,
		"actions": ActionsFr,
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
