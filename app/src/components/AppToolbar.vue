<script setup lang="ts">
import { IonToolbar, IonTitle, IonButtons, IonButton } from '@ionic/vue';
import { useRouter } from 'vue-router';
import { useNodeStore } from '@stores/NodeStore';
import { computed } from 'vue';
import NetworkService from '@/services/NetworkService';
import { refreshNodeStatus } from '@/utils/node';

// Import pictures
import statusRunning from '@assets/icons/status-running.svg';
import statusStopped from '@assets/icons/status-stopped.svg';
import statusError from '@assets/icons/status-error.svg';

// Use the router and the node store
const router = useRouter();
const nodeStore = useNodeStore();

// Computed the status image
const statusImage = computed(() =>
{
	switch (nodeStore.status)
	{
		case 'running':
			return statusRunning;
		case 'stopped':
			return statusStopped;
		default:
			return statusError;
	}
});

/**
 * Disconnect the node
 * @returns Promise<void>
 */
const nodeDisconnect = async() =>
{
	// Disconnect the node
	await NetworkService.disconnect();
	// Redirect to the home page
	router.replace({ name: 'Home' });
};

</script>

<template>
	<ion-toolbar>
		<ion-buttons slot="start">
			<ion-button fill="outline" class="logo" @click="nodeDisconnect">
				<img class="logo" src="@assets/images/casanode-logo.png" alt="Casanode" />
			</ion-button>
		</ion-buttons>
		<ion-title>{{ nodeStore.moniker }}</ion-title>
		<ion-buttons slot="end">
			<ion-button fill="clear" @click="refreshNodeStatus">
				<img :src="statusImage" alt="Status" />
			</ion-button>
		</ion-buttons>
	</ion-toolbar>
</template>

<style lang="scss" scoped>
.logo
{
	--border-width: 0;
	--box-shadow: none;
	--background: transparent;
	--background-focused: transparent;
	--background-activated: transparent;

	&>img
	{
		display: inline-block;
		height: 3rem;
	}
}

ion-title
{
	text-align: center;
}

ion-button img
{
	height: 1.5rem;
}
</style>