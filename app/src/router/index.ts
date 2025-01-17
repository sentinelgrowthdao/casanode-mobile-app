import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import NodeManager from '@views/NodePage.vue';
import NetworkService from '@/services/NetworkService';

// List of pages that require connection
export const requiresConnection = [
	'Node', 'NodeDashboard', 'NodeSettings', 'NodeWallet', 'NodeActions', 'NodeAbout',
	'Wizard1Welcome', 'Wizard1Reset', 'Wizard2Moniker', 'Wizard3Location', 'Wizard4Protocol',
	'Wizard5Network', 'Wizard6Protection', 'Wizard6Passphrase', 'Wizard7Wallet', 'Wizard7Restore',
	'Wizard7Create', 'Wizard8Fund', 'Wizard9Ports', 'Wizard10Congratulations',
];

const routes: Array<RouteRecordRaw> = [
	{
		path: '/',
		name: 'Home',
		component: () => import('@views/HomePage.vue')
	},
	{
		path: '/bluetooth',
		name: 'BluetoothTester',
		component: () => import('@views/BluetoothPage.vue')
	},
	{
		path: '/node',
		name: 'Node',
		component: NodeManager,
		children: [
			{
				path: '/node',
				redirect: '/node/dashboard',
			},
			{
				path: '/node/dashboard',
				name: 'NodeDashboard',
				component: () => import('@views/Node/DashboardPage.vue'),
			},
			{
				path: 'settings',
				name: 'NodeSettings',
				component: () => import('@views/Node/SettingsPage.vue'),
			},
			{
				path: 'wallet',
				name: 'NodeWallet',
				component: () => import('@views/Node/WalletPage.vue'),
			},
			{
				path: 'actions',
				name: 'NodeActions',
				component: () => import('@views/Node/ActionsPage.vue'),
			},
			{
				path: 'about',
				name: 'NodeAbout',
				component: () => import('@/views/Node/AboutPage.vue')
			},
		],
	},
	{
		path: '/wizard',
		redirect: '/wizard/welcome',
	},
	{
		path: '/wizard/welcome',
		name: 'Wizard1Welcome',
		component: () => import('@views/Wizard/Step1Welcome.vue')
	},
	{
		path: '/wizard/reset',
		name: 'Wizard1Reset',
		component: () => import('@views/Wizard/Step1Reset.vue')
	},
	{
		path: '/wizard/moniker',
		name: 'Wizard2Moniker',
		component: () => import('@views/Wizard/Step2Moniker.vue')
	},
	{
		path: '/wizard/location',
		name: 'Wizard3Location',
		component: () => import('@views/Wizard/Step3Location.vue')
	},
	{
		path: '/wizard/protocol',
		name: 'Wizard4Protocol',
		component: () => import('@views/Wizard/Step4Protocol.vue')
	},
	{
		path: '/wizard/network',
		name: 'Wizard5Network',
		component: () => import('@views/Wizard/Step5Network.vue')
	},
	{
		path: '/wizard/protection',
		name: 'Wizard6Protection',
		component: () => import('@views/Wizard/Step6Protection.vue')
	},
	{
		path: '/wizard/passphrase',
		name: 'Wizard6Passphrase',
		component: () => import('@views/Wizard/Step6Passphrase.vue')
	},
	{
		path: '/wizard/wallet',
		name: 'Wizard7Wallet',
		component: () => import('@views/Wizard/Step7Wallet.vue')
	},
	{
		path: '/wizard/wallet/recover',
		name: 'Wizard7Restore',
		component: () => import('@views/Wizard/Step7Restore.vue')
	},
	{
		path: '/wizard/wallet/create',
		name: 'Wizard7Create',
		component: () => import('@views/Wizard/Step7Create.vue')
	},
	{
		path: '/wizard/wallet/fund',
		name: 'Wizard8Fund',
		component: () => import('@views/Wizard/Step8Fund.vue')
	},
	{
		path: '/wizard/ports',
		name: 'Wizard9Ports',
		component: () => import('@views/Wizard/Step9Ports.vue')
	},
	{
		path: '/wizard/congratulations',
		name: 'Wizard10Congratulations',
		component: () => import('@views/Wizard/Step10Congratulations.vue')
	}
]

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes
})


router.beforeEach(async (to, from, next) =>
{
	// If the page requires bluetooth connection
	if(requiresConnection.includes(to.name as string))
	{
		// Check if the bluetooth is connected
		const isConnected = await NetworkService.isConnected();
		// If not connected, redirect to home
		if (!isConnected)
		{
			return next({ name: 'Home' });
		}
	}
	
	// Si tout est en ordre, autorise la navigation
	next();
});

export default router
