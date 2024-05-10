import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';

import HomePage from '@views/HomePage.vue';
import Wizard1Page from '@views/Wizard/Step1Welcome.vue';
import Wizard2Page from '@views/Wizard/Step2Moniker.vue';
import Wizard3Page from '@views/Wizard/Step3Location.vue';

const routes: Array<RouteRecordRaw> = [
	{
		path: '/',
		name: 'Home',
		component: HomePage
	},
	{
		path: '/wizard/welcome',
		name: 'Wizard1Welcome',
		component: Wizard1Page
	},
	{
		path: '/wizard/moniker',
		name: 'Wizard2Moniker',
		component: Wizard2Page
	},
	{
		path: '/wizard/location',
		name: 'Wizard3Location',
		component: Wizard3Page
	}
]

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes
})

export default router