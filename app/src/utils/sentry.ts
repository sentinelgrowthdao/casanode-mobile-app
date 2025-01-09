import { App as VueApp } from 'vue';
import { type Router } from 'vue-router';
import * as Sentry from '@sentry/vue';

export function initSentry(app: VueApp, router: Router)
{
	// Retrieve the DSN from Vite environment variables
	const dsn = import.meta.env.VITE_SENTRY_DSN
	const environment = import.meta.env.MODE;
	
	// Small safeguard if the variable is not defined
	if (!dsn)
	{
		console.log('Sentry DSN not defined, Sentry will not be initialized.')
		return;
	}
	
	// Configure Sentry
	Sentry.init({
		app: app,
		dsn: dsn,
		integrations: [
			Sentry.browserTracingIntegration({
				router: router,
			}),
		],
		tracesSampleRate: 1.0,
		environment: environment || 'development',
	});
}
