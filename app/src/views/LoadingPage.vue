<script lang="ts" setup>
import {
	IonPage, IonContent, IonButton,
	IonSpinner,
	IonItem, IonInput
} from '@ionic/vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ref, type Ref, onMounted } from 'vue';
import BluetoothService from '@/services/BluetoothService';
import NodeService from '@/services/NodeService';
import { refreshPublicAddress } from '@/utils/node';
import { scanAndConnect } from '@/utils/scan';

// Router
const router = useRouter();
// Import the useI18n composable function.
const { t } = useI18n();
// Connecting message
const connectingMessage: Ref<string> = ref('');
// Error message
const errorMessage: Ref<string> = ref('');
// Passphrase form open
const passphraseFormOpen: Ref<boolean> = ref(false);
// Passphrase input value
const passphraseInputValue: Ref<string> = ref('');
// Passphrase loading
const passphraseLoading: Ref<boolean> = ref(false);
// Passphrase error message
const passphraseErrorMessage: Ref<string> = ref('');

// On mounted
onMounted(async () =>
{
	connectionToNode();
});

/**
 * Try to connect to the Bluetooth device
 */
const tryConnection = async () =>
{
	await scanAndConnect();
	// Continue the connection process
	await connectionToNode();
};

/**
 * Process the connection to the Bluetooth device
 */
const connectionToNode = async () =>
{
	// Set the connecting message
	connectingMessage.value = t('loading.wait-connection') as string;
	// Clear the error message
	errorMessage.value = '';
	passphraseErrorMessage.value = '';
	
	// If the device is connected
	if(await BluetoothService.isConnected())
	{
		// Get installation status
		const checkInstallation = await BluetoothService.readCheckInstallation();
		
		// Parse the installation status
		const imageAvailable = checkInstallation[0] === '1';
		const nodeConfig = checkInstallation[2] === '1';
		const vpnConfig = checkInstallation[3] === '1';
		const certificateKey = checkInstallation[4] === '1';
		
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
				connectingMessage.value = t('loading.error-message-docker') as string;
				return;
			}
		}
		
		// If the node or VPN configuration does not exist
		if(!nodeConfig || !vpnConfig || !certificateKey)
		{
			// Set the waiting message
			connectingMessage.value = t('loading.wait-config') as string;
			// Request to install the node configuration
			const installConfigs = await BluetoothService.readInstallConfigs();
			
			// If an error occurred
			if(installConfigs !== '111')
			{
				// Set the connecting message
				connectingMessage.value = t('loading.error-message-config') as string;
				return;
			}
		}
		
		// Check if passphrase is needed
		const keyringBackend = await BluetoothService.readKeyringBackend();
		const publicAddress = await refreshPublicAddress();
		
		// If passphrase is needed and wallet already exists
		if(keyringBackend === 'file' && publicAddress !== null)
		{
			errorMessage.value = '';
			// Open the passphrase form
			passphraseFormOpen.value = true;
		}
		else
		{
			// Finish the connection process
			await finishConnection();
		}
		
	}
	else
	{
		// Set the connecting message
		errorMessage.value = t('loading.error-message') as string;
	}
};

/**
 * Finish the connection process
 */
const finishConnection = async () =>
{
	// Load the node configuration
	await NodeService.loadNodeConfiguration();
	
	// Get installation status
	const checkInstallation = await BluetoothService.readCheckInstallation();
	
	// 
	const containerExists = checkInstallation[0] === '1';
	const walletAvailable = checkInstallation[5] === '1';
	// If the container does not exist or the wallet is not available
	if(!containerExists || !walletAvailable)
	{
		// Launch the wizard
		router.replace({ name: 'Wizard1Welcome' });
	}
	else
	{
		// Redirect to the dashboard
		router.replace({ name: 'NodeDashboard' });
	}
};

/**
 * Submit the passphrase
 */
const submitPassphrase = async () => 
{
	// Clear the error message
	passphraseErrorMessage.value = '';
	// Show loading
	passphraseLoading.value = true;
	// Get the passphrase
	const passphrase = passphraseInputValue.value.trim();
	const passphraseValid = await BluetoothService.writeNodePassphrase(passphrase);
	
	// Send the passphrase to the BLE device
	if(passphraseValid)
	{
		// Hide the loading
		passphraseLoading.value = false;
		// Close the passphrase form
		passphraseFormOpen.value = false;
		// Finish the connection process
		await finishConnection();
	}
	else
	{
		// Hide the loading
		passphraseLoading.value = false;
		// Set the error message
		passphraseErrorMessage.value = t('loading.passphrase-error') as string;
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
				<div v-if="errorMessage.length === 0 && passphraseFormOpen === false" class="connecting">
					<p class="spinner"><ion-spinner name="crescent" /></p>
					<p class="message">{{ connectingMessage }}</p>
				</div>
				<div v-else-if="errorMessage.length === 0 && passphraseFormOpen === true" class="passphrase">
					<p v-if="passphraseErrorMessage.length > 0" class="error">{{ passphraseErrorMessage }}</p>
					<p v-else class="message">{{ $t('loading.passphrase-message') }}</p>
					<ion-item>
						<ion-input v-model="passphraseInputValue" type="password" :placeholder="t('loading.passphrase-placeholder')"></ion-input>
					</ion-item>
					<p class="button">
						<ion-button @click="submitPassphrase" :disabled="passphraseLoading">
							<ion-spinner name="crescent" v-if="passphraseLoading" />
							{{ $t('loading.passphrase-button') }}
						</ion-button>
					</p>
				</div>
				<div v-else class="error">
					<p class="message">{{ errorMessage }}</p>
					<p class="button"><ion-button @click="tryConnection">{{ $t('loading.retry') }}</ion-button></p>
				</div>
			</div>
		</ion-content>
	</ion-page>
</template>
<style lang="scss" scoped>
@import "@scss/loading.scss";
</style>
