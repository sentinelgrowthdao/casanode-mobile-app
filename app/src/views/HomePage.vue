<script lang="ts" setup>
import { type Ref, ref, onMounted } from 'vue';
import {
	IonPage, IonContent, IonButton, IonIcon,
	IonItem, IonInput, IonSpinner,
	modalController
} from '@ionic/vue';
import {
	closeOutline,
	bluetoothOutline,
	wifiOutline,
} from 'ionicons/icons';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Browser } from '@capacitor/browser';
import ConnectHelpModal from '@components/ConnectHelpModal.vue';
import { installScannerModule, type QRData, scanQrcode } from '@/utils/scan';
import { toggleKeepAwake } from '@/utils/awake';
import { useDeviceStore, type DeviceEntry } from '@stores/DeviceStore';
import NetworkService from '@/services/NetworkService';
import NodeService from '@/services/NodeService';

// Router
const router = useRouter();
// Import the useI18n composable function.
const { t } = useI18n();
// Device Store
const deviceStore = useDeviceStore();
// Device Ref
const deviceRef: Ref<DeviceEntry | null> = ref(null);
// QR Code data
const deviceQrcodeData: Ref<QRData | null> = ref(null);

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
// Find QR Code in progress
const findQRCodeLoader: Ref<boolean> = ref(false);
// Choose connection method open
const chooseConnectionMethodOpen: Ref<boolean> = ref(false);

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
	// Check if the device is available
	if(deviceRef.value?.uuid)
	{
		// Keep the device awake
		await toggleKeepAwake(true);
		// Check if the device is ble
		if(deviceRef.value.connector === 'ble')
		{
			// Connect to the device
			await NetworkService.connect('bluetooth', {seed: deviceRef.value.bleUuid});
		}
		else
		{
			// Connect to the device
			await NetworkService.connect('api', {
				ip: deviceRef.value.apiIp,
				port: deviceRef.value.apiPort,
				token: deviceRef.value.apiToken,
			});
		}
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
	// Clear the messages
	connectingMessage.value = '';
	errorMessage.value = '';
	passphraseErrorMessage.value = '';
	
	// Keep the device awake
	await toggleKeepAwake(true);
	// Install the scanner if required
	await installScannerModule();
	// Scan the QR code
	const qrcodeData : QRData | undefined = await scanQrcode();
	
	// If the QR code data is available
	if(qrcodeData)
	{
		deviceQrcodeData.value = qrcodeData;
		// If attribut bluetooth exists and is not null
		if(qrcodeData.bluetooth)
		{
			// Open the choose method box
			chooseConnectionMethodOpen.value = true;
		}
		else
		{
			// Connect to the device
			await connectLocalNetwork();
		}
	}
	else
	{
		// Disable the keep awake
		await toggleKeepAwake(false);
	}
	
};

/**
 * Connect to the device using TCP
 * @returns {Promise<void>}
 */
const connectLocalNetwork = async (): Promise<void> =>
{
	// Get the IP, Port and Token
	const ip = deviceQrcodeData.value?.ip || null;
	const port = deviceQrcodeData.value?.apiPort || null;
	const token = deviceQrcodeData.value?.authToken || null;
	// Connect to the device using the IP, Port and Token
	const connected = await NetworkService.connect('api', {
		ip: ip,
		port: port,
		token: token,
	});
	
	// If connected to the device
	if(connected)
	{
		// Close the choose connection method
		chooseConnectionMethodOpen.value = false;
		// Continue the connection process
		await connectionToNode();
		// Disable the keep awake
		await toggleKeepAwake(false);
	}
	else
	{
		// Set the connecting message
		errorMessage.value = t('loading.error-message') as string;
	}
}

/**
 * Connect to the device using Bluetooth
 * @returns {Promise<void>}
 */
const connectBluetooth = async (): Promise<void> =>
{
	// Get the seed
	const seed = deviceQrcodeData.value?.bluetooth?.seed || null;
	// Connect to the device using the seed
	const connected = await NetworkService.connect('bluetooth', {seed: seed});
	
	// If connected to the device
	if(connected)
	{
		// Close the choose connection method
		chooseConnectionMethodOpen.value = false;
		// Continue the connection process
		await connectionToNode();
		// Disable the keep awake
		await toggleKeepAwake(false);
	}
	else
	{
		// Set the connecting message
		errorMessage.value = t('loading.error-message') as string;
	}
}

/**
 * Cancel the connection
 * @returns {Promise<void>}
 */
const cancelConnection = async (): Promise<void> => 
{
	// Disable the keep awake
	await toggleKeepAwake(false);
	// Clear the error message
	errorMessage.value = '';
	passphraseErrorMessage.value = '';
	// Close the passphrase form
	passphraseFormOpen.value = false;
	// Close the choose connection method
	chooseConnectionMethodOpen.value = false;
};

/**
 * Open the help modal
 * @returns {Promise<void>}
*/
const openHelpModal = async () =>
{
	// Show the find QR code loader
	findQRCodeLoader.value = true;
	// Connect to the device
	const connected = await NetworkService.connect('bluetooth', {seed: ''});
	// If connected to the device
	if(connected)
	{
		// Read the IP and Port
		const ipPort = await NetworkService.readDiscoveryInfos();
		// Disconnect from the device
		await NetworkService.disconnect();
		
		// Create the modal
		const modal = await modalController.create({
			component: ConnectHelpModal,
			componentProps: {
				ipPort
			}
		});
		
		// Present the modal
		modal.present();
	}
	// Hide the find QR code loader
	findQRCodeLoader.value = false;
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
	if(await NetworkService.isConnected())
	{
		try
		{
			// Get installation status
			const checkInstallation = await NetworkService.checkInstallation();
			
			// Parse the installation status
			const imageAvailable = checkInstallation.image;
			const nodeConfig = checkInstallation.nodeConfig;
			const vpnConfig = checkInstallation.vpnConfig;
			const certificateKey = checkInstallation.certificateKey;
			const walletAvailable = checkInstallation.wallet;
			
			// If the image is unavailable
			if(!imageAvailable)
			{
				// Set the waiting message
				connectingMessage.value = t('loading.wait-docker') as string;
				// Request to install the image
				const installImage = await NetworkService.installDockerImage();
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
				const installConfigs = await NetworkService.installNodeConfiguration();
				// If an error occurred
				if(!installConfigs.nodeConfig || !installConfigs.vpnConfig || !installConfigs.certificate)
				{
					// Set the connecting message
					errorMessage.value = t('loading.error-message-config') as string;
					return;
				}
			}
			
			// Get the node passphrase status
			const nodePassphrase = await NetworkService.nodePassphrase();
			// If passphrase is needed and wallet already exists
			if (nodePassphrase.required && !nodePassphrase.available && walletAvailable === true)
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
		catch(e)
		{
			// Set the connecting message
			errorMessage.value = t('loading.error-message') as string;
			return;
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
	const checkInstallation = await NetworkService.checkInstallation();
	
	// Parse the installation status
	const imageAvailable = checkInstallation.image;
	const walletAvailable = checkInstallation.wallet;
	
	// Clear error messages
	connectingMessage.value = '';
	errorMessage.value = '';
	passphraseErrorMessage.value = '';
	
	// Disable the keep awake
	await toggleKeepAwake(false);
	
	// If the container does not exist or the wallet is not available
	if(!imageAvailable || !walletAvailable)
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
	const passphraseValid = await NetworkService.setNodePassphrase(passphrase);
	
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
				<div v-if="!isLoading() && chooseConnectionMethodOpen === false" class="welcome">
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
							<ion-button size="small" fill="clear" :disabled="findQRCodeLoader" @click="openHelpModal">
								<ion-spinner name="crescent" v-if="findQRCodeLoader" />
								{{ $t('welcome.start-help-button') }}
							</ion-button>
						</p>
					</div>
				</div>
				<div v-else-if="!isLoading() && chooseConnectionMethodOpen === true" class="welcome methods">
					<h2 v-html="t('welcome.method-title')" />
					<ion-grid>
						<ion-row>
							<ion-col size="6">
								<ion-button expand="block" color="none" @click="connectBluetooth">
									<div class="content">
										<div class="button">
											<ion-icon :icon="bluetoothOutline" />
											<p class="name">{{ $t('welcome.method-ble-name') }}</p>
										</div>
										<p class="desc">{{ $t('welcome.method-ble-desc') }}</p>
									</div>
								</ion-button>
							</ion-col>
							<ion-col size="6">
								<ion-button expand="block" color="none" @click="connectLocalNetwork">
									<div class="content">
											<div class="button">
											<ion-icon :icon="wifiOutline" />
											<p class="name">{{ $t('welcome.method-lan-name') }}</p>
										</div>
										<p class="desc">{{ $t('welcome.method-lan-desc') }}</p>
									</div>
								</ion-button>
							</ion-col>
						</ion-row>
					</ion-grid>
				</div>
				<div v-else class="loading">
					<div v-if="errorMessage.length === 0 && passphraseFormOpen === false && chooseConnectionMethodOpen === false" class="connecting">
						<p class="spinner"><ion-spinner name="crescent" /></p>
						<p class="message">{{ connectingMessage }}</p>
					</div>
					<div v-else-if="errorMessage.length === 0 && passphraseFormOpen === true && chooseConnectionMethodOpen === false" class="passphrase">
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
				<div v-else-if="chooseConnectionMethodOpen === true" class="footer">
					<p class="button">
						<ion-button size="small" fill="clear" @click="cancelConnection">
							{{ $t('welcome.method-cancel') }}
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
