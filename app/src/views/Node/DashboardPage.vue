<script lang="ts" setup>
import {
	IonPage, IonContent, IonHeader,
	IonGrid, IonRow, IonCol,
	IonCard, IonCardHeader, IonCardTitle, IonCardContent
} from '@ionic/vue';
import { ref } from 'vue';
import AppToolbar from '@/components/AppToolbar.vue';

const connectedUsers = ref<number>(0);



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
								<ion-col class="item" size="6">
									<p class="label">{{ $t('dashboard.status-title') }}</p>
									<p class="value"></p>
								</ion-col>
								<ion-col class="item" size="6">
									<p class="label">{{ $t('dashboard.status-users') }}</p>
									<p class="value">{{ connectedUsers }}</p>
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
							<strong>{{ $t('dashboard.node-address') }}</strong> 194.164.29.195
						</p>
						<p class="item">
							<strong>{{ $t('dashboard.node-location') }}</strong> Slough / United Kingdom
						</p>
						<p class="item">
							<strong>{{ $t('dashboard.node-vpn') }}</strong> Wireguard
						</p>
						<p class="item">
							<strong>{{ $t('dashboard.node-port') }}</strong> 16567
						</p>
						<p class="item">
							<strong>{{ $t('dashboard.node-v2ray-port') }}</strong> 16568
						</p>
						<p class="item">
							<strong>{{ $t('dashboard.node-ssl-expiry') }}</strong> May 6 19:05:15 2025 GMT
						</p>
						<p class="item">
							<strong>{{ $t('dashboard.node-upload-speed') }}</strong> 18.3 MB
						</p>
						<p class="item">
							<strong>{{ $t('dashboard.node-download-speed') }}</strong> 87.19 MB
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
