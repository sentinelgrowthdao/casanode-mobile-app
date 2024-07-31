<script lang="ts" setup>
import {
	IonPage, IonContent, IonHeader, IonItem,
	IonCard, IonCardHeader, IonCardTitle, IonCardContent,
	IonLabel, IonSelect, IonSelectOption, IonInput,
	toastController
} from '@ionic/vue';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useNodeStore } from '@stores/NodeStore';
import BluetoothService from '@/services/BluetoothService';
import AppToolbar from '@/components/AppToolbar.vue';
import LoadingButton from '@components/LoadingButton.vue';
import { refreshNodeStatus } from '@/utils/node';

// Import the useNodeStore composable function.
const nodeStore = useNodeStore();
// Import the useI18n composable function.
const { t } = useI18n();

// Node settings interface
interface NodeSettings
{
	moniker: string;
	nodeType: string;
	nodeIp: string;
	nodePort: number;
	vpnPort: number;
	maximumPeers: number;
	vpnType: string;
}

// Node settings
const nodeSettings = ref<NodeSettings>({
	moniker: nodeStore.moniker,
	nodeType: nodeStore.nodeType,
	nodeIp: nodeStore.nodeIp,
	nodePort: nodeStore.nodePort,
	vpnPort: nodeStore.vpnPort,
	maximumPeers: nodeStore.maximumPeers,
	vpnType: nodeStore.vpnType
});

// Save in progress reference
const saveInProgress = ref<boolean>(false);

// Save function
const saveSettings = async () =>
{
	// Save and restart success flags
	let saveSuccess = false;
	let restartSuccess = false;
	
	// Lock the save button
	saveInProgress.value = true;
	
	try
	{
		// Save the settings
		await BluetoothService.writeMoniker(nodeSettings.value.moniker);
		nodeStore.setMoniker(nodeSettings.value.moniker);
		
		await BluetoothService.writeNodeType(nodeSettings.value.nodeType);
		nodeStore.setNodeType(nodeSettings.value.nodeType);
		
		await BluetoothService.writeNodeIp(nodeSettings.value.nodeIp);
		nodeStore.setNodeIp(nodeSettings.value.nodeIp);
		
		await BluetoothService.writeNodePort(nodeSettings.value.nodePort.toString());
		nodeStore.setNodePort(nodeSettings.value.nodePort);
		
		await BluetoothService.writeVpnPort(nodeSettings.value.vpnPort.toString());
		nodeStore.setVpnPort(nodeSettings.value.vpnPort);
		
		await BluetoothService.writeMaximumPeers(nodeSettings.value.maximumPeers.toString());
		nodeStore.setMaximumPeers(nodeSettings.value.maximumPeers);
		
		await BluetoothService.writeVpnType(nodeSettings.value.vpnType);
		nodeStore.setVpnType(nodeSettings.value.vpnType);
		
		// Save success
		saveSuccess = true;
	}
	catch(error)
	{
		console.error('Failed to save settings:', error);
	}
	
	// Show a toast message
	const toastSave = await toastController.create({
				message: t(saveSuccess ? 'settings.save-success' : 'settings.save-failed'),
				duration: 1500,
				position: 'bottom',
			});
	// Wait for the toast to be dismissed
	await toastSave.present();
	
	try
	{
		// Restart the node
		await BluetoothService.restartNode();
		restartSuccess = true;
	}
	catch(error)
	{
		console.error('Failed to restart the node:', error);
	}
	
	// Show a toast message
	const toastRestart = await toastController.create({
				message: t(restartSuccess ? 'settings.restart-success' : 'settings.restart-failed'),
				duration: 1500,
				position: 'bottom',
			});
	// Wait for the toast to be dismissed
	await toastRestart.present();
	
	// Update the node status
	await refreshNodeStatus();
	
	// Unlock the save button
	saveInProgress.value = false;
};

</script>
<template>
	<ion-page>
		<ion-header>
			<app-toolbar />
		</ion-header>
		<ion-content class="settings">
			<!-- Node Section -->
			<ion-card class="container">
				<ion-card-header>
					<ion-card-title>{{ $t('settings.node-section-title') }}</ion-card-title>
				</ion-card-header>
				<ion-card-content>
					<ion-item>
						<ion-label position="stacked">{{ $t('settings.moniker-label') }}</ion-label>
						<ion-input v-model="nodeSettings.moniker" placeholder=""></ion-input>
					</ion-item>
					<ion-item>
						<ion-label position="stacked">{{ $t('settings.type-label') }}</ion-label>
						<ion-select v-model="nodeSettings.nodeType">
							<ion-select-option value="residential">Residential</ion-select-option>
							<ion-select-option value="datacenter">Datacenter</ion-select-option>
						</ion-select>
					</ion-item>
				</ion-card-content>
			</ion-card>
			
			<!-- Network Section -->
			<ion-card class="container">
				<ion-card-header>
					<ion-card-title>{{ $t('settings.network-section-title') }}</ion-card-title>
				</ion-card-header>
				<ion-card-content>
					<ion-item>
						<ion-label position="stacked">{{ $t('settings.ip-address-label') }}</ion-label>
						<ion-input v-model="nodeSettings.nodeIp" placeholder=""></ion-input>
					</ion-item>
					<ion-item>
						<ion-label position="stacked">{{ $t('settings.node-port-label') }}</ion-label>
						<ion-input v-model="nodeSettings.nodePort" type="number" placeholder=""></ion-input>
					</ion-item>
					<ion-item v-if="nodeSettings.vpnType === 'wireguard'">
						<ion-label position="stacked">{{ $t('settings.wireguard-port-label') }}</ion-label>
						<ion-input v-model="nodeSettings.vpnPort" type="number" placeholder=""></ion-input>
					</ion-item>
					<ion-item v-if="nodeSettings.vpnType === 'v2ray'">
						<ion-label position="stacked">{{ $t('settings.v2ray-port-label') }}</ion-label>
						<ion-input v-model="nodeSettings.vpnPort" type="number" placeholder=""></ion-input>
					</ion-item>
				</ion-card-content>
			</ion-card>
			
			<!-- VPN Section -->
			<ion-card class="container">
				<ion-card-header>
					<ion-card-title>{{ $t('settings.vpn-section-title') }}</ion-card-title>
				</ion-card-header>
				<ion-card-content>
					<ion-item>
						<ion-label position="stacked">{{ $t('settings.maximum-peers-label') }}</ion-label>
						<ion-input v-model="nodeSettings.maximumPeers" type="number" placeholder="250"></ion-input>
					</ion-item>
					<ion-item>
						<ion-label position="stacked">{{ $t('settings.vpn-type-label') }}</ion-label>
						<ion-select v-model="nodeSettings.vpnType">
							<ion-select-option value="wireguard">Wireguard</ion-select-option>
							<ion-select-option value="v2ray">V2Ray</ion-select-option>
						</ion-select>
					</ion-item>
				</ion-card-content>
			</ion-card>
			
			<!-- Save Button -->
			<ion-card class="container nobg">
				<ion-card-content>
					<loading-button :label="$t('settings.save-button')" :callback="saveSettings" :disabled="saveInProgress" />
				</ion-card-content>
			</ion-card>
		</ion-content>
	</ion-page>
</template>
<style lang="scss" scoped>
@import "@scss/container.scss";

ion-item
{
	--background: transparent;
}
</style>
