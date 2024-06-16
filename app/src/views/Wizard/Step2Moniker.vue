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
import { useWizardStore } from '@stores/WizardStore';
import BluetoothService from '@/services/BluetoothService';
import AppInput from '@components/AppInput.vue';
import LoadingButton from '@components/LoadingButton.vue';

// Router
const router = useRouter();
// Import the useI18n composable function.
const { t } = useI18n();

const wizardStore = useWizardStore();
const errorMessage: Ref<string> = ref('');
const moniker: Ref<string> = ref(wizardStore.moniker);

const setValueAndNavigate = async () =>
{
	// Clear the error message
	errorMessage.value = '';
	// Trim the moniker value
	const monikerValue = moniker.value.trim();
	
	// Check if the moniker is not empty and at least 4 characters
	if(monikerValue !== '' && monikerValue.length >= 4)
	{
		// Send to the server and apply the value
		if(await BluetoothService.writeMoniker(moniker.value) && await BluetoothService.writeNodeConfig())
		{
			// Set the moniker value
			wizardStore.setMoniker(monikerValue);
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