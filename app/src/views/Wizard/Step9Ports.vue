<script lang="ts" setup>
import {
	IonPage, IonContent, IonButton,
	IonGrid, IonCol, IonRow
} from '@ionic/vue';
import { useWizardStore } from '@stores/WizardStore';

const wizardStore = useWizardStore();
</script>
<template>
	<ion-page>
		<ion-content :fullscreen="true">
			<div class="wizard">
				<div class="form">
					<h1>{{ $t('wizard.ports-title') }}</h1>
					<p class="text">{{ $t('wizard.ports-text') }}</p>
					<ul>
						<li>{{ $t('wizard.ports-node', {port: wizardStore.nodePort }) }}</li>
						<li v-if="wizardStore.vpnType === 'wireguard'">{{ $t('wizard.ports-wireguard', {port: wizardStore.vpnPort }) }}</li>
						<li v-if="wizardStore.vpnType === 'v2ray'">{{ $t('wizard.ports-v2ray', {port: wizardStore.vpnPort }) }}</li>
					</ul>
					<p class="text">{{ $t('wizard.ports-more') }}</p>
				</div>
				<div class="submit">
					<ion-grid>
						<ion-row>
							<ion-col size="6" offset="6">
								<ion-button expand="block" :router-link="{ name: 'Wizard10Congratulations' }"
									router-direction="forward">
									{{ $t('wizard.button-next') }}
								</ion-button>
							</ion-col>
						</ion-row>
					</ion-grid>
				</div>
			</div>
		</ion-content>
	</ion-page>
</template>
<style lang="scss" scoped>
@import "@scss/wizard.scss";
</style>