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
import SettingsEn from '@locales/en/settings.json';
import LoadingEn from '@locales/en/loading.json';

// French
import AppFr from '@locales/fr/app.json';
import WelcomeFr from '@locales/fr/welcome.json';
import WizardFr from '@locales/fr/wizard.json';
import DashboardFr from '@locales/fr/dashboard.json';
import AboutFr from '@locales/fr/about.json';
import WalletFr from '@locales/fr/wallet.json';
import ActionsFr from '@locales/fr/actions.json';
import SettingsFr from '@locales/fr/settings.json';
import LoadingFr from '@locales/fr/loading.json';

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
		"settings": SettingsEn,
		"loading": LoadingEn,
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
		"settings": SettingsFr,
		"loading": LoadingFr,
	},
};


/**
 * Get the locale language
 * @returns {Promise<string>}
 */
async function localeLanguage(): Promise<string>
{
	const systemLocale = await Device.getLanguageCode();
	return systemLocale.value || 'en';
}

// Create a new i18n instance with a default locale
const i18n = createI18n({
	locale: 'en', // await localeLanguage()
	fallbackLocale: 'en',
	messages: messages
});

export default i18n;
