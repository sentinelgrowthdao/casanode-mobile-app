<script lang="ts" setup>
import {
	IonPage, IonContent, IonHeader, IonItem, IonNote,
	IonCard, IonCardHeader, IonCardTitle, IonCardContent,
	IonLabel, IonSelect, IonSelectOption, IonInput,
	toastController
} from '@ionic/vue';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useNodeStore } from '@stores/NodeStore';
import NetworkService from '@/services/NetworkService';
import AppToolbar from '@/components/AppToolbar.vue';
import LoadingButton from '@components/LoadingButton.vue';
import { refreshNodeStatus } from '@/utils/node';

// Import the useNodeStore composable function.
const nodeStore = useNodeStore();
// Import the useI18n composable function.
const { t } = useI18n();

// Error class
const savingError = ref<string|null>(null);

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
	
	// Reset the error class
	savingError.value = null;
	
	// Lock the save button
	saveInProgress.value = true;
	
	try
	{
		
		// Save the node settings
		const result = await NetworkService.setNodeConfiguration({
			moniker: nodeSettings.value.moniker,
			nodeType: nodeSettings.value.nodeType,
			nodeIp: nodeSettings.value.nodeIp,
			nodePort: nodeSettings.value.nodePort,
			vpnPort: nodeSettings.value.vpnPort,
			maximumPeers: nodeSettings.value.maximumPeers,
			vpnType: nodeSettings.value.vpnType,
		});
		
		// Update the moniker
		if(result.moniker === false)
			throw new Error('moniker');
		nodeStore.setMoniker(nodeSettings.value.moniker);
		
		// Update the node settings
		if(result.nodeType === false)
			throw new Error('nodeType');
		nodeStore.setNodeType(nodeSettings.value.nodeType);
		
		// Update the node IP
		if(result.nodeIp === false)
			throw new Error('nodeIp');
		nodeStore.setNodeIp(nodeSettings.value.nodeIp);
		
		// Update the node port
		if(result.nodePort === false)
			throw new Error('nodePort');
		nodeStore.setNodePort(nodeSettings.value.nodePort);
		
		// Update the VPN port
		if(result.vpnPort === false)
			throw new Error('vpnPort');
		nodeStore.setVpnPort(nodeSettings.value.vpnPort);
		
		// Update the maximum peers
		if(result.maximumPeers === false)
			throw new Error('maximumPeers');
		nodeStore.setMaximumPeers(nodeSettings.value.maximumPeers);
		
		// Update the VPN type
		if(result.vpnType === false)
			throw new Error('vpnType');
		nodeStore.setVpnType(nodeSettings.value.vpnType);
		
		// Save success
		saveSuccess = true;
	}
	catch(error: any)
	{
		console.error('Failed to save settings:', error);
		// Set the error message
		savingError.value = error?.message;
	}
	
	// Show a toast message
	const toastSave = await toastController.create({
				message: t(saveSuccess ? 'settings.save-success' : 'settings.save-failed'),
				duration: 1500,
				position: 'bottom',
			});
	// Wait for the toast to be dismissed
	await toastSave.present();
	
	// If node is already running
	if(nodeStore.status === 'running')
	{
		try
		{
			// Restart the node
			restartSuccess = await NetworkService.restartNode();
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
	}
	
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
						<ion-input
							v-model="nodeSettings.moniker"
							placeholder=""
							:error-text="$t('settings.moniker-error')"
							:class="{ 'ion-touched ion-invalid': savingError === 'moniker' }">
						</ion-input>
					</ion-item>
					<ion-item>
						<ion-label position="stacked">{{ $t('settings.type-label') }}</ion-label>
						<ion-select v-model="nodeSettings.nodeType">
							<ion-select-option value="residential">{{ $t('settings.type-residential') }}</ion-select-option>
							<ion-select-option value="datacenter">{{ $t('settings.type-datacenter') }}</ion-select-option>
						</ion-select>
						<ion-note v-if="savingError === 'nodeType'" color="danger">{{ $t('settings.type-error') }}</ion-note>
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
						<ion-input
							v-model="nodeSettings.nodeIp"
							placeholder=""
							:error-text="$t('settings.ip-address-error')"
							:class="{ 'ion-touched ion-invalid': savingError === 'nodeIp' }" />
					</ion-item>
					<ion-item>
						<ion-label position="stacked">{{ $t('settings.node-port-label') }}</ion-label>
						<ion-input
							v-model="nodeSettings.nodePort"
							type="number"
							placeholder=""
							:error-text="$t('settings.node-port-error')"
							:class="{ 'ion-touched ion-invalid': savingError === 'nodePort' }" />
					</ion-item>
					<ion-item v-if="nodeSettings.vpnType === 'wireguard'">
						<ion-label position="stacked">{{ $t('settings.wireguard-port-label') }}</ion-label>
						<ion-input
							v-model="nodeSettings.vpnPort"
							type="number"
							placeholder=""
							:error-text="$t('settings.wireguard-port-error')"
							:class="{ 'ion-touched ion-invalid': savingError === 'vpnPort' }" />
					</ion-item>
					<ion-item v-if="nodeSettings.vpnType === 'v2ray'">
						<ion-label position="stacked">{{ $t('settings.v2ray-port-label') }}</ion-label>
						<ion-input
							v-model="nodeSettings.vpnPort"
							type="number"
							placeholder=""
							:error-text="$t('settings.v2ray-port-error')"
							:class="{ 'ion-touched ion-invalid': savingError === 'vpnPort' }" />
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
						<ion-input
							v-model="nodeSettings.maximumPeers"
							type="number"
							placeholder="250"
							:error-text="$t('settings.maximum-peers-error')"
							:class="{ 'ion-touched ion-invalid': savingError === 'maximumPeers' }" />
					</ion-item>
					<ion-item>
						<ion-label position="stacked">{{ $t('settings.vpn-type-label') }}</ion-label>
						<ion-select v-model="nodeSettings.vpnType">
								<ion-select-option value="wireguard">Wireguard</ion-select-option>
								<ion-select-option value="v2ray">V2Ray</ion-select-option>
						</ion-select>
						<ion-note v-if="savingError === 'vpnType'" color="danger">{{ $t('settings.vpn-type-error') }}</ion-note>
					</ion-item>
				</ion-card-content>
			</ion-card>
			
			<!-- Save Button -->
			<ion-card class="container nobg">
				<ion-card-content>
					<loading-button :label="$t(nodeStore.status === 'running' ? 'settings.save-restart-button' : 'settings.save-button')" :callback="saveSettings" :disabled="saveInProgress" />
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
	--border-color: transparent;
}
</style>
