<script setup lang="ts">
import { IonTabs, IonRouterOutlet, IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/vue';
import { shieldHalf, settings, wallet, power, helpCircle } from 'ionicons/icons';
</script>

<template>
	<ion-tabs>
		<ion-router-outlet></ion-router-outlet>
		<ion-tab-bar slot="bottom">
			<ion-tab-button tab="Dashboard" href="/dashboard">
				<ion-icon :icon="shieldHalf" />
				<ion-label>{{ $t('app.tab-dashboard') }}</ion-label>
			</ion-tab-button>

			<ion-tab-button tab="Settings" href="/settings">
				<ion-icon :icon="settings" />
				<ion-label>{{ $t('app.tab-settings') }}</ion-label>
			</ion-tab-button>

			<ion-tab-button tab="Wallet" href="/wallet">
				<ion-icon :icon="wallet" />
				<ion-label>{{ $t('app.tab-wallet') }}</ion-label>
			</ion-tab-button>

			<ion-tab-button tab="Actions" href="/actions">
				<ion-icon :icon="power" />
				<ion-label>{{ $t('app.tab-actions') }}</ion-label>
			</ion-tab-button>

			<ion-tab-button tab="About" href="/about">
				<ion-icon :icon="helpCircle" />
				<ion-label>{{ $t('app.tab-about') }}</ion-label>
			</ion-tab-button>
		</ion-tab-bar>
	</ion-tabs>
</template>