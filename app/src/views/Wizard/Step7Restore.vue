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
					<h1>{{ $t('wizard.wallet-restore-title') }}</h1>
					<p class="text">{{ $t('wizard.wallet-restore-text') }}</p>
					<div class="mnemonic">
						<ion-textarea aria-label="Mnemonic" fill="outline"
							:placeholder="$t('wizard.wallet-restore-placeholder')" class="mnemonic"></ion-textarea>
					</div>
					<p class="caption">{{ $t('wizard.wallet-restore-warning') }}</p>
				</div>
				<div class="submit">
					<ion-grid>
						<ion-row>
							<ion-col size="6" offset="6">
								<ion-button expand="block" :router-link="{ name: 'Wizard8Fund' }"
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