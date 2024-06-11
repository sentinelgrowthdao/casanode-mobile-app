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
	tryConnection();
});

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
	await connectToBluetooth();
};


// Connect to the Bluetooth device
const connectToBluetooth = async () =>
{
	// Set the connecting message
	connectingMessage.value = t('loading.wait-connection') as string;
	
	// Connect to the Bluetooth device
	if(await BluetoothService.connect())
	{
		// Get installation status
		const checkInstallation = await BluetoothService.readCheckInstallation();
		
		// Parse the installation status
		const imageAvailable = checkInstallation[0] === '1';
		const containerExists = checkInstallation[1] === '1';
		const nodeConfig = checkInstallation[2] === '1';
		const vpnConfig = checkInstallation[3] === '1';
		
		// If the image is unavailable
		if(!imageAvailable)
		{
			// Set the waiting message
			connectingMessage.value = t('loading.wait-docker') as string;
			// Request to install the image
			const installImage = await BluetoothService.readInstallImage();
			// If an error occurred
			if(installImage !== 1)
			{
				// Set the connecting message
				connectingMessage.value = t('loading.error-message') as string;
				return;
			}
		}
		
		// If the node or VPN configuration does not exist
		if(!nodeConfig || !vpnConfig)
		{
			// Set the waiting message
			connectingMessage.value = t('loading.wait-config') as string;
			// Request to install the node configuration
			const installConfigs = await BluetoothService.readInstallConfigs();
			
			// If an error occurred
			if(installConfigs !== '11')
			{
				// Set the connecting message
				connectingMessage.value = t('loading.error-message') as string;
				return;
			}
		}
		
		// If the container does not exist
		if(!containerExists)
		{
			// Launch the wizard
			router.replace({ name: 'Wizard1Welcome' });
		}
		else
		{
			// Redirect to the dashboard
			router.replace({ name: 'NodeDashboard' });
		}
	}
	else
	{
		// Set the connecting message
		connectingMessage.value = t('loading.error-message') as string;
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
				<p>
					<ion-button @click="tryConnection">connect</ion-button>
					<!-- <ion-button @click="router.replace({ name: 'Home' })">home</ion-button> -->
				</p>
			</div>
		</ion-content>
	</ion-page>
</template>
<style lang="scss" scoped>
@import "@scss/loading.scss";
</style>
