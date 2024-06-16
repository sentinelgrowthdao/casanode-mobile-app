<script lang="ts" setup>
import { type Ref, ref } from 'vue';
import {
	IonPage, IonContent,
	IonGrid, IonRow, IonCol,
	IonList, IonItem,
	IonSelect, IonSelectOption
} from '@ionic/vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useWizardStore } from '@stores/WizardStore';
import BluetoothService from '@/services/BluetoothService';
import LoadingButton from '@components/LoadingButton.vue';

// Router
const router = useRouter();
// Import the useI18n composable function.
const { t } = useI18n();

const wizardStore = useWizardStore();
const errorMessage: Ref<string> = ref('');
const nodeType: Ref<string> = ref(wizardStore.nodeType);

const setNodeTypeAndNavigate = async () =>
{
	// Check if the node type is residential or datacenter
	if(nodeType.value === 'residential' || nodeType.value === 'datacenter')
	{
		// Send to the server and apply the value
		if(await BluetoothService.writeNodeType(nodeType.value) && await BluetoothService.writeNodeConfig())
		{
			wizardStore.setNodeType(nodeType.value);
			router.push({ name: 'Wizard4Protocol' });
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
					<h1>{{ $t('wizard.location-title') }}</h1>
					<p class="text">{{ $t('wizard.location-text') }}</p>
					<ul>
						<li>{{ $t('wizard.location-residential-desc') }}</li>
						<li>{{ $t('wizard.location-datacenter-desc') }}</li>
					</ul>
					<ion-list class="input">
						<ion-item>
							<ion-select aria-label="location" :placeholder="$t('wizard.location-placeholder')" v-model="nodeType">
								<ion-select-option value="residential">
									{{ $t('wizard.location-residential') }}
								</ion-select-option>
								<ion-select-option value="datacenter">
									{{ $t('wizard.location-datacenter') }}
								</ion-select-option>
							</ion-select>
						</ion-item>
					</ion-list>
				</div>
				<div class="submit">
					<ion-grid>
						<ion-row>
							<ion-col size="6" offset="6">
								<loading-button :label="$t('wizard.button-next')" :callback="setNodeTypeAndNavigate" />
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