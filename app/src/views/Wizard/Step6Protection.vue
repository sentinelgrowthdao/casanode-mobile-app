<script lang="ts" setup>
import { type Ref, ref } from 'vue';
import {
	IonPage, IonContent,
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

/**
 * On mounted
 * @returns void
 */
onMounted(async () =>
{
	// Check if public address is already exist
	if(nodeStore.publicAddress.length > 0)
	{
		// Navigate to the next step
		router.replace({ name: 'Wizard8Fund' });
	}
});


/**
 * Set the keyring backend value and navigate to the next step
 * @param value string
 * @returns void
 */
const setKeyringBackendValue = async (value: string) =>
{
	// Set the keyring backend value
	const result = await NetworkService.setNodeConfiguration({ backend: value });
	// Check if the backend value is set
	if(result.backend)
	{
		// Navigate to the next step
		router.push({ name: value === 'file' ? 'Wizard6Passphrase' : 'Wizard7Wallet' });
	}
	else
	{
		// Show an error message
		errorMessage.value = t('wizard.error-occurred') as string;
	}
};

</script>
<template>
	<ion-page>
		<ion-content :fullscreen="true">
			<div class="wizard">
				<div class="form">
					<h1>{{ $t('wizard.protection-title') }}</h1>
					<p class="text">{{ $t('wizard.protection-text') }}</p>
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
								<loading-button :label="$t('wizard.button-yes')" :callback="async() => await setKeyringBackendValue('file')" />
							</ion-col>
							<ion-col size="6">
								<loading-button :label="$t('wizard.button-no')" :callback="async() => await setKeyringBackendValue('test')" />
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