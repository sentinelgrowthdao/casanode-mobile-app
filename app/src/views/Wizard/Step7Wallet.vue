<script lang="ts" setup>
import {
	IonPage, IonContent, IonButton,
	IonGrid, IonCol, IonRow
} from '@ionic/vue';
</script>
<template>
	<ion-page>
		<ion-content :fullscreen="true">
			<div class="wizard">
				<div class="form">
					<h1>{{ $t('wizard.wallet-title') }}</h1>
					<p class="text">{{ $t('wizard.wallet-text') }}</p>
				</div>
				<div class="submit">
					<ion-grid>
						<ion-row>
							<ion-col size="6">
								<ion-button expand="block" :router-link="{ name: 'Wizard7Create' }"
									router-direction="forward" fill="outline">
									{{ $t('wizard.button-create') }}
								</ion-button>
							</ion-col>
							<ion-col size="6">
								<ion-button expand="block" :router-link="{ name: 'Wizard7Restore' }"
									router-direction="forward" fill="outline">
									{{ $t('wizard.button-restore') }}
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