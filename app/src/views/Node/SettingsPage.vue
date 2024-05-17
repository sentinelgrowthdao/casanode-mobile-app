<script lang="ts" setup>
import {
	IonPage, IonContent, IonHeader, IonItem,
	IonCard, IonCardHeader, IonCardTitle, IonCardContent,
	IonButton, IonLabel, IonSelect, IonSelectOption, IonInput
} from '@ionic/vue';
import { ref } from 'vue';
import { useNodeStore } from '@stores/NodeStore';
import AppToolbar from '@/components/AppToolbar.vue';

// Import the useNodeStore composable function.
const nodeStore = useNodeStore();

const nodeSettings = ref({
	moniker: nodeStore.moniker,
	nodeType: nodeStore.nodeType,
	ipAddress: nodeStore.ipAddress,
	nodePort: nodeStore.nodePort,
	vpnPort: nodeStore.vpnPort,
	maximumPeers: nodeStore.maximumPeers,
	vpnType: nodeStore.vpnType
});

const saveSettings = () =>
{
	console.log('Settings saved:', nodeSettings.value);
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
							<ion-select-option value="commercial">Commercial</ion-select-option>
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
						<ion-input v-model="nodeSettings.ipAddress" placeholder=""></ion-input>
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
					<ion-button expand="block" color="primary" @click="saveSettings">
						{{ $t('settings.save-button') }}
					</ion-button>
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
