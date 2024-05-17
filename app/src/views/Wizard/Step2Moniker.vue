<script lang="ts" setup>
import { type Ref, ref } from 'vue';
import
{
	IonPage, IonContent, IonButton,
	IonGrid, IonRow, IonCol,
	IonList, IonItem,
	IonInput
} from '@ionic/vue';
import { useRouter } from 'vue-router';
import { useWizardStore } from '@stores/WizardStore';

const wizardStore = useWizardStore();
const router = useRouter();
const moniker: Ref<string> = ref('');

const setMonikerAndNavigate = () =>
{
	wizardStore.setMoniker(moniker.value);
	router.push({ name: 'Wizard3Location' });
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
						<ion-item>
							<ion-input aria-label="Moniker" :placeholder="$t('wizard.moniker-placeholder')"
								v-model="moniker" />
						</ion-item>
					</ion-list>
				</div>
				<div class="submit">
					<ion-grid>
						<ion-row>
							<ion-col size="6" offset="6">
								<ion-button expand="block" @click="setMonikerAndNavigate">
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