<script lang="ts" setup>
import {
	IonPage, IonContent, IonHeader,
	IonGrid, IonRow, IonCol,
	IonCard, IonCardHeader, IonCardTitle, IonCardContent
} from '@ionic/vue';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import AppToolbar from '@/components/AppToolbar.vue';
import { useNodeStore } from '@stores/NodeStore';

// Import the useI18n composable function.
const { t } = useI18n();

// Import the useNodeStore composable function.
const nodeStore = useNodeStore();

// Define the node status text
const nodeStatus = computed(() =>
{
	return t(`dashboard.status-${nodeStore.status}`);
});

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
									<p class="value">{{ nodeStore.connectedUsers }}</p>
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
			</div>
		</ion-content>
	</ion-page>
</template>
<style lang="scss" scoped>
@import "@scss/container.scss";
</style>
