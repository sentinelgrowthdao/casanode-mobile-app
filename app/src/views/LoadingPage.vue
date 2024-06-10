<script lang="ts" setup>
import {
	IonPage, IonContent, IonButton,
	IonSpinner,
} from '@ionic/vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ref, type Ref, onMounted } from 'vue';
import BluetoothService from '@/services/BluetoothService';

// Router
const router = useRouter();
// Import the useI18n composable function.
const { t } = useI18n();
// Connecting message
const connectingMessage: Ref<string> = ref('');

// On mounted
onMounted(async () =>
{
	// Check if the device is connected
	const isConnected = await BluetoothService.isConnected();
	
	// If connected, redirect to the home page
	if(isConnected)
	{
		router.replace({ name: 'HomePage' });
	}
	else
	{
		// Connect to the Bluetooth device
		await connectToBluetooth();
	}
});


// Connect to the Bluetooth device
const connectToBluetooth = async () =>
{
	// Set the connecting message
	connectingMessage.value = t('loading.wait-connection') as string;
	
	// Connect to the Bluetooth device
	if(await BluetoothService.connect())
	{
		// Load installation status
		const checkInstall = await BluetoothService.checkInstallation();
		
		console.log(checkInstall);
		
	}
	else
	{
	}
};

</script>
<template>
	<ion-page>
		<ion-content :fullscreen="true">
			<div class="loading">
				<div class="header">
					<h1>{{ $t('app.name') }}</h1>
					<p class="logo"><img src="@assets/images/casanode-logo.png" alt="Logo" /></p>
				</div>
				<div class="connecting">
					<p class="spinner"><ion-spinner name="crescent" /></p>
					<p class="message">{{ connectingMessage }}</p>
				</div>
			</div>
		</ion-content>
	</ion-page>
</template>
<style lang="scss" scoped>
@import "@scss/loading.scss";
</style>
