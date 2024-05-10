<script lang="ts" setup>
import { IonPage, IonContent, IonButton, IonList, IonItem, IonInput } from '@ionic/vue';
</script>
<template>
	<ion-page>
		<ion-content :fullscreen="true">
			<div class="wizard">
				<h1>{{ $t('wizard.network-title') }}</h1>
				<p class="text">{{ $t('wizard.network-text') }}</p>
				<ion-list class="input">
					<ion-item>
						<ion-input :label="$t('wizard.network-public-ip')" />
					</ion-item>
					<ion-item>
						<ion-input :label="$t('wizard.network-api-port')" />
					</ion-item>
					<ion-item>
						<ion-input :label="$t('wizard.network-wireguard-port')" />
					</ion-item>
					<ion-item>
						<ion-input :label="$t('wizard.network-v2ray-port')" />
					</ion-item>
				</ion-list>
				<p class="nav-buttons right">
					<ion-button :router-link="{ name: 'Wizard6Protection' }" router-direction="forward">
						{{ $t('wizard.button-next') }}
					</ion-button>
				</p>
			</div>
		</ion-content>
	</ion-page>
</template>
<style lang="scss" scoped>
@import "@scss/wizard.scss";
</style>