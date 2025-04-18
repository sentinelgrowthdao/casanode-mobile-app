<script lang="ts" setup>
import { type Ref, ref } from 'vue';
import
{
	IonPage, IonContent,
	IonGrid, IonRow, IonCol,
	IonList, IonItem, IonText,
} from '@ionic/vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useNodeStore } from '@stores/NodeStore';
import NetworkService from '@/services/NetworkService';
import AppInput from '@components/AppInput.vue';
import LoadingButton from '@components/LoadingButton.vue';

// Router
const router = useRouter();
// Import the useI18n composable function.
const { t } = useI18n();

const nodeStore = useNodeStore();
const errorMessage: Ref<string> = ref('');
const moniker: Ref<string> = ref(nodeStore.moniker);

/**
 * Set the moniker value and navigate to the next step
 * @returns void
 */
const setValueAndNavigate = async () =>
{
	// Clear the error message
	errorMessage.value = '';
	// Trim the moniker value
	const monikerValue = moniker.value.trim();
	
	// Check if the moniker is not empty and at least 4 characters
	if(monikerValue !== '' && monikerValue.length >= 4)
	{
		// Set the moniker value
		const result = await NetworkService.setNodeConfiguration({ moniker: monikerValue });
		// Check if the change was successful
		if(result.moniker)
		{
			// Set the moniker value
			nodeStore.setMoniker(monikerValue);
			// Reset input
			moniker.value = '';
			// Navigate to the next step
			router.push({ name: 'Wizard3Location' });
		}
		else
		{
			// Show an error message
			errorMessage.value = t('wizard.error-occurred') as string;
		}
	}
};

</script>
<template>
	<ion-page>
		<ion-content :fullscreen="true">
			<div class="wizard">
				<div class="form">
					<h1>{{ $t('wizard.moniker-title') }}</h1>
					<p class="text">{{ $t('wizard.moniker-text') }}</p>
					<p class="text">{{ $t('wizard.moniker-explain') }}</p>
					<ion-list class="input">
						<ion-item lines="none">
							<app-input
								:placeholder="$t('wizard.moniker-placeholder')"
								:errorMessage="$t('wizard.moniker-error')"
								type="text"
								v-model="moniker"
								aria-label="Moniker"
								:minLength="4"
							/>
						</ion-item>
						<ion-item lines="none" v-if="errorMessage">
							<ion-text color="danger">{{ errorMessage }}</ion-text>
						</ion-item>
					</ion-list>
				</div>
				<div class="submit">
					<ion-grid>
						<ion-row>
							<ion-col size="6" offset="6">
								<loading-button :label="$t('wizard.button-next')" :callback="setValueAndNavigate" />
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