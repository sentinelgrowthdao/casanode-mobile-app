<script lang="ts" setup>
import { type Ref, ref, onMounted } from 'vue';
import { IonPage, IonContent, IonButton, IonIcon, modalController } from '@ionic/vue';
import { closeOutline } from 'ionicons/icons';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Browser } from '@capacitor/browser';
import ConnectHelpModal from '@components/ConnectHelpModal.vue';
import { scanAndConnect } from '@/utils/scan';
import { toggleKeepAwake } from '@/utils/awake';
import { refreshPublicAddress } from '@/utils/node';
import { useDeviceStore, type DeviceEntry } from '@stores/DeviceStore';
import BluetoothService from '@/services/BluetoothService';
import NodeService from '@/services/NodeService';

// Router
const router = useRouter();
// Import the useI18n composable function.
const { t } = useI18n();
// Device Store
const deviceStore = useDeviceStore();
// Device Ref
const deviceRef: Ref<DeviceEntry | null> = ref(null);

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

/**
 * On mounted, get the last device
 */
onMounted(() =>
{
	deviceRef.value = deviceStore.getLastDevice();
});

/**
 * Open the Sentinel website
 * @returns {Promise<void>}
 */
const openNodeLink = async () =>
{
	await Browser.open({ url: 'https://sentinel.co' });
};

/**
 * Open the news link
 * @returns {Promise<void>}
 */
const openNewsLink = async () =>
{
	await Browser.open({ url: 'https://www.dvpn.news' });
};

/**
 * Connect to the device
 */
const deviceConnection = async () =>
{
	console.log('Connecting to device');
	console.log(deviceRef.value);
	// Check if the device is available
	if(deviceRef.value?.uuid)
	{
		// Keep the device awake
		await toggleKeepAwake(true);
		// Connect to the device
		await BluetoothService.connect(deviceRef.value.uuid);
		// Continue the connection process
		await connectionToNode();
	}
};

/**
 * Remove the device from the store
 * @returns {void}
 */
const deviceRemove = () =>
{
	if(deviceRef.value)
	{
		deviceStore.removeDevice(deviceRef.value);
		deviceRef.value = deviceStore.getLastDevice();
	}
};

/**
 * Try to connect to the Bluetooth device using scanned QR code
 * @returns {Promise<void>}
 */
const tryConnection = async () =>
{
	// Keep the device awake
	await toggleKeepAwake(true);
	// Scan and connect to the device
	if(await scanAndConnect())
	{
		// Continue the connection process
		await connectionToNode();
	}
	// Disable the keep awake
	await toggleKeepAwake(false);
};

// Open the help modal
const openHelpModal = async () =>
{
	// Create the modal
	const modal = await modalController.create({
		component: ConnectHelpModal
	});
	
	// Present the modal
	modal.present();
};

/**
 * Check if the app is loading
 * @returns {boolean}
 */
const isLoading = () =>
{
	return connectingMessage.value.length > 0
		|| errorMessage.value.length > 0
		|| passphraseErrorMessage.value.length > 0;
}

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
		const walletAvailable = checkInstallation[5] === '1';
		
		// If the image is unavailable
		if(!imageAvailable)
		{
			// Set the waiting message
			connectingMessage.value = t('loading.wait-docker') as string;
			// Request to install the image
			const installImage = await BluetoothService.installDockerImage();
			// If an error occurred
			if(installImage !== 1)
			{
				// Set the connecting message
				errorMessage.value = t('loading.error-message-docker') as string;
				return;
			}
		}
		
		// If the node or VPN configuration does not exist
		if(!nodeConfig || !vpnConfig || !certificateKey)
		{
			// Set the waiting message
			connectingMessage.value = t('loading.wait-config') as string;
			// Request to install the node configuration
			const installConfigs = await BluetoothService.installConfigs();
			
			// If an error occurred
			if(installConfigs !== '111')
			{
				// Set the connecting message
				errorMessage.value = t('loading.error-message-config') as string;
				return;
			}
		}
		
		// Check if passphrase is needed
		const keyringBackend = await BluetoothService.readKeyringBackend();
		const publicAddress = await refreshPublicAddress();
		
		// If passphrase is needed and wallet already exists
		if(keyringBackend === 'file' && publicAddress === null && walletAvailable === true)
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
	
	// Parse the installation status
	const containerExists = checkInstallation[0] === '1';
	const walletAvailable = checkInstallation[5] === '1';
	
	// Clear error messages
	connectingMessage.value = '';
	errorMessage.value = '';
	passphraseErrorMessage.value = '';
	
	// Disable the keep awake
	await toggleKeepAwake(false);
	
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
		<ion-content class="homepage" :fullscreen="true">
			<div class="content">
				<div class="header">
					<h1>{{ $t('app.name') }}</h1>
					<p class="logo">
						<img src="@assets/images/casanode-logo.png" alt="Logo" />
					</p>
				</div>
				<div v-if="!isLoading()" class="welcome">
					<h2>{{ $t(deviceRef ? 'welcome.start-title-alt' : 'welcome.start-title') }}</h2>
					<div v-if="deviceRef" class="start device">
						<p class="close">
							<ion-button size="small" fill="clear" @click="deviceRemove">
								<ion-icon :icon="closeOutline" />
							</ion-button>
						</p>
						<p class="name">{{ deviceRef.name }}</p>
						<p class="address">{{ deviceRef.address }}</p>
						<p class="button">
							<ion-button expand="block" size="small" @click="deviceConnection">
								{{ $t('welcome.start-button-alt') }}
							</ion-button>
						</p>
						<p class="scan">
							<ion-button size="small" fill="clear" @click="tryConnection">
								{{ $t('welcome.start-scan-button') }}
							</ion-button>
						</p>
					</div>
					<div v-else class="start">
						<p class="message">{{ $t('welcome.start-text') }}</p>
						<p class="button">
							<ion-button @click="tryConnection">
								{{ $t('welcome.start-button') }}
							</ion-button>
						</p>
						<p class="help">
							<ion-button size="small" fill="clear" @click="openHelpModal">
								{{ $t('welcome.start-help-button') }}
							</ion-button>
						</p>
					</div>
				</div>
				<div v-else class="loading">
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
				<div v-if="deviceRef" class="footer">
					<p class="title">{{ $t('welcome.news-title') }}</p>
					<p class="message">{{ $t('welcome.news-text') }}</p>
					<p class="button">
						<ion-button size="small" fill="clear" @click="openNewsLink">
							{{ $t('welcome.news-button') }}
						</ion-button>
					</p>
				</div>
				<div v-else class="footer">
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
