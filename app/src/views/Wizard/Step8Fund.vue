<script lang="ts" setup>
import {
	IonPage, IonContent, IonButton,
	IonGrid, IonCol, IonRow
} from '@ionic/vue';
import { useI18n } from 'vue-i18n';
import { copyToClipboard } from '@/utils/clipboard';

// Import the useI18n composable function.
const { t } = useI18n();

// The public address to fund.
const address_public = "sent1gml0h2eavhrqcwz8u5h0s8f8mds67f0gvtmsnw";

</script>
<template>
	<ion-page>
		<ion-content :fullscreen="true">
			<div class="wizard">
				<div class="form">
					<h1>{{ $t('wizard.wallet-fund-title') }}</h1>
					<p class="text">{{ $t('wizard.wallet-fund-text') }}</p>
					<p class="address" @click="copyToClipboard(t('wizard.wallet-fund-copied'), address_public)">
						{{ address_public }}
					</p>
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