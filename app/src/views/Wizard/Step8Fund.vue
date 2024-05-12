<script lang="ts" setup>
import {
	IonPage, IonContent, IonButton,
	IonGrid, IonCol, IonRow,
	toastController
} from '@ionic/vue';
import { useI18n } from 'vue-i18n';

// Import the useI18n composable function.
const { t } = useI18n();

// The public address to fund.
const address_public = "sent1gml0h2eavhrqcwz8u5h0s8f8mds67f0gvtmsnw";

/**
 * Copy the given address to the clipboard.
 */
async function copyToClipboard(address: string)
{
	if (navigator.clipboard)
	{
		try
		{
			await navigator.clipboard.writeText(address);
			const toast = await toastController.create({
				message: t('wizard.wallet-fund-copied'),
				duration: 1500,
				position: 'top',
			});
			await toast.present();
		}
		catch (err)
		{
			console.error("Failed to copy text to clipboard:", err)
		}
	}
}

</script>
<template>
	<ion-page>
		<ion-content :fullscreen="true">
			<div class="wizard">
				<div class="form">
					<h1>{{ $t('wizard.wallet-fund-title') }}</h1>
					<p class="text">{{ $t('wizard.wallet-fund-text') }}</p>
					<p class="address" @click="copyToClipboard(address_public)">{{ address_public }}</p>
					<p class="text">{{ $t('wizard.wallet-fund-next') }}</p>
				</div>
				<div class="submit">
					<ion-grid>
						<ion-row>
							<ion-col size="6" offset="6">
								<ion-button expand="block" :router-link="{ name: 'Wizard9Ports' }"
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