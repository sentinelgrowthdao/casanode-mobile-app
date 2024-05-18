<script setup lang="ts">
import { IonToolbar, IonTitle, IonButtons, IonButton } from '@ionic/vue';
import { useRouter } from 'vue-router';
import { useNodeStore } from '@stores/NodeStore';

const router = useRouter();
const nodeStore = useNodeStore();
</script>

<template>
	<ion-toolbar>
		<ion-buttons slot="primary">
			<ion-button fill="clear">
				Status
			</ion-button>
		</ion-buttons>
		<ion-buttons slot="secondary">
			<ion-button fill="outline" class="logo" @click="router.replace({ name: 'Home' })">
				<img class="logo" src="@assets/images/casanode-logo.png" alt="Casanode" />
			</ion-button>
		</ion-buttons>
		<ion-title>{{ nodeStore.moniker }}</ion-title>
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
</style>