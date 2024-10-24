<script setup lang="ts">
import {
	IonPage, IonTabs, IonRouterOutlet,
	IonTabBar, IonTabButton, IonIcon, IonLabel
} from '@ionic/vue';
import { shieldHalf, settings, wallet, power, helpCircle } from 'ionicons/icons';
import { startNetworkMonitorHook } from '@/hooks/BluetoothMonitorHook';

// Start the Bluetooth monitor hook
startNetworkMonitorHook();
</script>

<template>
	<ion-page>
		<ion-tabs>
			<ion-router-outlet></ion-router-outlet>
			<ion-tabs>
				<ion-router-outlet></ion-router-outlet>
				<ion-tab-bar slot="bottom">
					<ion-tab-button tab="Dashboard" href="/node/dashboard">
						<ion-icon :icon="shieldHalf" />
						<ion-label>{{ $t('app.tab-dashboard') }}</ion-label>
					</ion-tab-button>

					<ion-tab-button tab="Settings" href="/node/settings">
						<ion-icon :icon="settings" />
						<ion-label>{{ $t('app.tab-settings') }}</ion-label>
					</ion-tab-button>

					<ion-tab-button tab="Wallet" href="/node/wallet">
						<ion-icon :icon="wallet" />
						<ion-label>{{ $t('app.tab-wallet') }}</ion-label>
					</ion-tab-button>

					<ion-tab-button tab="Actions" href="/node/actions">
						<ion-icon :icon="power" />
						<ion-label>{{ $t('app.tab-actions') }}</ion-label>
					</ion-tab-button>

					<ion-tab-button tab="About" href="/node/about">
						<ion-icon :icon="helpCircle" />
						<ion-label>{{ $t('app.tab-about') }}</ion-label>
					</ion-tab-button>
				</ion-tab-bar>
			</ion-tabs>
		</ion-tabs>
	</ion-page>
</template>
