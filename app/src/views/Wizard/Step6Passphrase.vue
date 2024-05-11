<script lang="ts" setup>
import {
	IonPage, IonContent, IonButton,
	IonGrid, IonRow, IonCol,
	IonList, IonItem,
	IonInput
} from '@ionic/vue';
</script>
<template>
	<ion-page>
		<ion-content :fullscreen="true">
			<div class="wizard">
				<div class="form">
					<h1>{{ $t('wizard.passphrase-title') }}</h1>
					<p class="text">{{ $t('wizard.passphrase-text') }}</p>
					<ion-list class="input">
						<ion-item>
							<ion-input aria-label="Passphrase" type="password"
								:placeholder="$t('wizard.passphrase-placeholder')" />
						</ion-item>
					</ion-list>
				</div>
				<div class="submit">
					<ion-grid>
						<ion-row>
							<ion-col size="6" offset="6">
								<ion-button expand="block" :router-link="{ name: 'Wizard7Wallet' }"
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