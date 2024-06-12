<script lang="ts" setup>
import { type Ref, ref } from 'vue';
import {
	IonPage, IonContent, IonButton,
	IonGrid, IonRow, IonCol,
	IonList, IonItem,
	IonSelect, IonSelectOption
} from '@ionic/vue';
import { useRouter } from 'vue-router';
import { useWizardStore } from '@stores/WizardStore';

const wizardStore = useWizardStore();
const router = useRouter();
const nodeType: Ref<string> = ref(wizardStore.nodeType);

const setNodeTypeAndNavigate = () =>
{
	// Check if the node type is residential or datacenter
	if(nodeType.value === 'residential' || nodeType.value === 'datacenter')
	{
		wizardStore.setNodeType(nodeType.value);
		router.push({ name: 'Wizard4Protocol' });
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
								<ion-button expand="block" @click="setNodeTypeAndNavigate">
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