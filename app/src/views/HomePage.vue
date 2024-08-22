<script lang="ts" setup>
import { type Ref, ref, onMounted } from 'vue';
import { IonPage, IonContent, IonButton, IonIcon, modalController } from '@ionic/vue';
import { closeOutline } from 'ionicons/icons';
import { useRouter } from 'vue-router';
import { Browser } from '@capacitor/browser';
import ConnectHelpModal from '@components/ConnectHelpModal.vue';
import { scanAndConnect } from '@/utils/scan';
import { useDeviceStore, type DeviceEntry } from '@stores/DeviceStore';
import BluetoothService from '@/services/BluetoothService';

// Router
const router = useRouter();
// Device Store
const deviceStore = useDeviceStore();
// Device Ref
const deviceRef: Ref<DeviceEntry | null> = ref(null);

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
		// Connect to the device
		await BluetoothService.connect(deviceRef.value.uuid);
		// Redirect to the loading page
		router.push({ name: 'Loading' });
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
	await scanAndConnect();
	// Redirect to the loading page
	router.push({ name: 'Loading' });
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
				<div class="welcome">
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
