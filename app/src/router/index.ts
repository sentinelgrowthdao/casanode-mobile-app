import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
	{
		path: '/',
		name: 'Home',
		component: () => import('@views/HomePage.vue')
	},
	{
		path: '/wizard/welcome',
		name: 'Wizard1Welcome',
		component: () => import('@views/Wizard/Step1Welcome.vue')
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

export default router
