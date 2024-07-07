<script lang="ts" setup>
import { IonPage, IonContent, IonButton } from '@ionic/vue';
import { useRouter } from 'vue-router';
import { Browser } from '@capacitor/browser';
import BluetoothService from '@/services/BluetoothService';

// Router
const router = useRouter();

// Open the Sentinel website
const openNodeLink = async () =>
{
	await Browser.open({ url: 'https://sentinel.co' });
};

/**
 * Connect to the Bluetooth device
 * @returns {Promise<void>}
 */
const tryConnection = async () =>
{
	// Check if the device is connected
	const isConnected = await BluetoothService.isConnected();
	// If connected, disconnect
	if(isConnected)
	{
		await BluetoothService.disconnect();
	}
	
	// Connect to the Bluetooth device
	await BluetoothService.connect();
	// Redirect to the loading page
	router.replace({ name: 'Loading' });
};

</script>
<template>
	<ion-page>
		<ion-content :fullscreen="true">
			<div class="homepage">
				<div class="header">
					<h1>{{ $t('app.name') }}</h1>
					<p class="logo"><img src="@assets/images/casanode-logo.png" alt="Logo" /></p>
				</div>
				<div class="welcome">
					<h2>{{ $t('welcome.start-title') }}</h2>
					<div class="start">
						<p class="message">{{ $t('welcome.start-text') }}</p>
						<p class="button">
							<ion-button @click="tryConnection">
								{{ $t('welcome.start-button-alt') }}
							</ion-button>
						</p>
					</div>
				</div>
				<div class=" footer">
					<p class="title">{{ $t('welcome.get-node-title') }}</p>
					<p class="message">{{ $t('welcome.get-node-text') }}</p>
					<p class="button">
						<ion-button size="small" fill="clear" @click="openNodeLink">
							{{ $t('welcome.get-node-button') }}
						</ion-button>
					</p>
				</div>
			</div>
		</ion-content>
	</ion-page>
</template>
<style lang="scss" scoped>
@import "@scss/homepage.scss";
</style>
