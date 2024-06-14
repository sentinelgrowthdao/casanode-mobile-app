<script lang="ts" setup>
import { type Ref, ref } from 'vue';
import
{
	IonPage, IonContent,
	IonGrid, IonRow, IonCol,
	IonList, IonItem,
} from '@ionic/vue';
import { useRouter } from 'vue-router';
import { useWizardStore } from '@stores/WizardStore';
import AppInput from '@components/AppInput.vue';
import LoadingButton from '@components/LoadingButton.vue';

const wizardStore = useWizardStore();
const router = useRouter();
const moniker: Ref<string> = ref(wizardStore.moniker);

const setValueAndNavigate = async () =>
{
	const monikerValue = moniker.value.trim();
	
	// Check if the moniker is not empty and at least 4 characters
	if(monikerValue !== '' && monikerValue.length >= 4)
	{
		wizardStore.setMoniker(monikerValue);
		router.push({ name: 'Wizard3Location' });
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