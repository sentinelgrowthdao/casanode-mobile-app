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
import BluetoothService from '@/services/BluetoothService';
import LoadingButton from '@components/LoadingButton.vue';
import { refreshPublicAddress, refreshNodeAddress } from '@/utils/node';

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
 * Send a request to create a wallet
 * @returns void
 */
const requestCreateWallet = async () =>
{
	// Create a new wallet
	if(await BluetoothService.performWalletAction('create'))
	{
		// Read mnemonic
		const mnemonic: string|null = await BluetoothService.readMnemonic();
		// Read public address
		const publicAddress: string|null = await refreshPublicAddress();
		// Read node address
		const nodeAddress: string|null = await refreshNodeAddress();
		// If all values are not null
		if(mnemonic !== null && publicAddress !== null && nodeAddress !== null)
		{
			// Set the mnemonic
			nodeStore.setMnemonic(mnemonic.split(' '));
			
			// Navigate to the next step
			router.push({ name: 'Wizard7Create' });
		}
		else
		{
			// Show an error message
			errorMessage.value = t('wizard.error-wallet-creation') as string;
		}
	}
	else
	{
		// Show an error message
		errorMessage.value = t('wizard.error-wallet-creation') as string;
	}
};

</script>
<template>
	<ion-page>
		<ion-content :fullscreen="true">
			<div class="wizard">
				<div class="form">
					<h1>{{ $t('wizard.wallet-title') }}</h1>
					<p class="text">{{ $t('wizard.wallet-text') }}</p>
				</div>
				<div class="submit">
					<ion-grid>
						<ion-row v-if="errorMessage">
							<ion-item lines="none">
								<ion-text color="danger">{{ errorMessage }}</ion-text>
							</ion-item>
						</ion-row>
						<ion-row>
							<ion-col size="6">
								<loading-button :label="$t('wizard.button-create')" :callback="requestCreateWallet" />
							</ion-col>
							<ion-col size="6">
								<ion-button expand="block" :router-link="{ name: 'Wizard7Restore' }"
									router-direction="forward" fill="outline">
									{{ $t('wizard.button-restore') }}
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