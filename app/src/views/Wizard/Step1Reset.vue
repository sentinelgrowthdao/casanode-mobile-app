<script lang="ts" setup>
import { type Ref, ref } from 'vue';
import {
	IonPage, IonContent, IonButton,
	IonGrid, IonCol, IonRow,
	IonItem, IonText,
} from '@ionic/vue';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useNodeStore } from '@/stores/NodeStore';
import NetworkService from '@/services/NetworkService';
import LoadingButton from '@components/LoadingButton.vue';

// Router
const router = useRouter();
// Import the useI18n composable function.
const { t } = useI18n();

const nodeStore = useNodeStore();
const errorMessage: Ref<string> = ref('');

// On mounted
onMounted(async () =>
{
});


// Reset the configuration of the node
const resetConfiguration = async () =>
{
	// Reset the system
	const result = await NetworkService.resetSystem();
	// Check the result
	if(result)
	{
		// Reset the node store
		nodeStore.resetStore();
		// Go to the next step
		router.push({ name: 'Home' });
	}
	else
	{
		errorMessage.value = t('wizard.error-reset');
	}
};

</script>
<template>
	<ion-page>
		<ion-content :fullscreen="true">
			<div class="wizard">
				<div class="form">
					<h1>{{ $t('wizard.reset-title') }}</h1>
					<p class="text">{{ $t('wizard.reset-text') }}</p>
					<p class="text">{{ $t('wizard.reset-question') }}</p>
				</div>
				<div class="submit">
					<ion-grid>
						<ion-row>
							<ion-item lines="none" v-if="errorMessage">
								<ion-text color="danger">{{ errorMessage }}</ion-text>
							</ion-item>
						</ion-row>
						<ion-row>
							<ion-col size="6">
								<loading-button :label="$t('wizard.button-yes')" :callback="resetConfiguration" />
							</ion-col>
							<ion-col size="6">
								<ion-button expand="block" :router-link="{ name: 'Wizard2Moniker' }"
									router-direction="forward">
									{{ $t('wizard.button-no') }}
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