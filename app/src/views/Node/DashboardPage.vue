<script lang="ts" setup>
import {
	IonPage, IonContent, IonHeader, IonButton,
	IonGrid, IonRow, IonCol,
	IonCard, IonCardHeader, IonCardTitle, IonCardContent
} from '@ionic/vue';
import { useRouter } from 'vue-router';
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import AppToolbar from '@/components/AppToolbar.vue';
import { useNodeStore } from '@stores/NodeStore';
import { useDeviceStore, type DeviceEntry } from '@stores/DeviceStore';
import NetworkService from '@/services/NetworkService';

// Router
const router = useRouter();
// Import the useI18n composable function.
const { t } = useI18n();

// Node Store
const nodeStore = useNodeStore();
// Device Store
const deviceStore = useDeviceStore();

/**
 * On mounted, get the last device
 */
onMounted(() =>
{
	// Check if the Bluetooth is connected
	if(NetworkService.isConnected())
	{
		// Get the last device
		const deviceUuid = NetworkService.getDeviceUuid();
		if(deviceUuid)
		{
			// Add the device to the store
			deviceStore.addDevice({
				uuid: deviceUuid,
				connector: NetworkService.getConnector(),
				name: nodeStore.moniker,
				address: nodeStore.nodeIp,
			} as DeviceEntry);
		}
	}
});

/**
 * Define the node status text
 * @returns string
 */
const nodeStatus = computed(() =>
{
	return t(`dashboard.status-${nodeStore.status}`);
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
	<ion-page>
		<ion-header>
			<app-toolbar />
		</ion-header>
		<ion-content>
			<div class="dashboard">
				<ion-card class="container bg-blue">
					<ion-card-content>
						<ion-grid>
							<ion-row>
								<ion-col class="item">
									<p class="label">{{ $t('dashboard.status-title') }}</p>
									<p class="value">{{ nodeStatus }}</p>
								</ion-col>
								<ion-col class="item right">
									<p class="label">{{ $t('dashboard.status-users') }}</p>
									<p class="value">{{ nodeStore.onlineUsers }}</p>
								</ion-col>
							</ion-row>
						</ion-grid>
					</ion-card-content>
				</ion-card>
				
				<ion-card class="container">
					<ion-card-header>
						<ion-card-title>{{ $t('dashboard.node-title') }}</ion-card-title>
					</ion-card-header>
					<ion-card-content>
						<p class="item">
							<strong>{{ $t('dashboard.node-address') }}</strong>{{ nodeStore.nodeIp }}
						</p>
						<p class="item">
							<strong>{{ $t('dashboard.node-location') }}</strong>{{ nodeStore.nodeLocation }}
						</p>
						<p class="item">
							<strong>{{ $t('dashboard.node-vpn') }}</strong>{{ nodeStore.vpnType }}
						</p>
						<p class="item">
							<strong>{{ $t('dashboard.node-port') }}</strong>{{ nodeStore.nodePort }}
						</p>
						<p class="item">
							<strong>{{ $t(`dashboard.node-${nodeStore.vpnType}-port`) }}</strong>{{ nodeStore.vpnPort }}
						</p>
						<p class="item">
							<strong>{{ $t('dashboard.node-ssl-expiry') }}</strong>{{ nodeStore.certExpiry }}
						</p>
						<p class="item">
							<strong>{{ $t('dashboard.node-upload-speed') }}</strong>{{ nodeStore.uploadSpeed }}
						</p>
						<p class="item">
							<strong>{{ $t('dashboard.node-download-speed') }}</strong>{{ nodeStore.downloadSpeed }}
						</p>
					</ion-card-content>
				</ion-card>
				
				<ion-card class="container nobg">
					<ion-card-content>
						<ion-button fill="outline" expand="block" @click="nodeDisconnect">
							{{ $t('dashboard.disconnect-button') }}
						</ion-button>
					</ion-card-content>
				</ion-card>
			</div>
		</ion-content>
	</ion-page>
</template>
<style lang="scss" scoped>
@import "@scss/container.scss";
</style>
