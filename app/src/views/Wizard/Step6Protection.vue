<script lang="ts" setup>
import { IonPage, IonContent, IonButton, IonGrid, IonCol, IonRow } from '@ionic/vue';
</script>
<template>
	<ion-page>
		<ion-content :fullscreen="true">
			<div class="wizard">
				<h1>{{ $t('wizard.protection-title') }}</h1>
				<p class="text">{{ $t('wizard.protection-text') }}</p>
				<ion-grid>
					<ion-row>
						<ion-col size="6">
							<ion-button expand="block" :router-link="{ name: 'Wizard6Passphrase' }"
								router-direction="forward">{{ $t('wizard.button-yes') }}</ion-button>
						</ion-col>
						<ion-col size="6">
							<ion-button expand="block" :router-link="{ name: 'Wizard7Configuration' }"
								router-direction="forward" fill="outline">{{ $t('wizard.button-no') }}</ion-button>
						</ion-col>
					</ion-row>
				</ion-grid>
			</div>
		</ion-content>
	</ion-page>
</template>
<style lang="scss" scoped>
@import "@scss/wizard.scss";
</style>