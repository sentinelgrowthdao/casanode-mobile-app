<script lang="ts" setup>
import { type Ref, ref } from 'vue';
import {
	IonPage, IonContent,
	IonGrid, IonCol, IonRow,
	IonTextarea, IonText, IonItem,
} from '@ionic/vue';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useNodeStore } from '@/stores/NodeStore';
import BluetoothService from '@/services/BluetoothService';
import LoadingButton from '@components/LoadingButton.vue';

// Router
const router = useRouter();
// Import the useI18n composable function.
const { t } = useI18n();

const nodeStore = useNodeStore();
const errorMessage: Ref<string> = ref('');
const mnemonic: Ref<string> = ref('');

// On mounted
onMounted(async () =>
{
	// Check if public address is already exist
	if(nodeStore.publicAddress.length > 0)
	{
		// Navigate to the next step
		router.replace({ name: 'Wizard8Fund' });
	}
});

// Send a request to restore a wallet
const requestRestoreWallet = async () =>
{
	// Mnemonic regex
	const mnemonicRegex = /^(\b\w+\b\s*){24}$/;
	// Trim the mnemonic value
	const mnemonicValue = mnemonic.value.trim();
	// If mnemonic is not empty
	if(mnemonicRegex.test(mnemonicValue))
	{
		// Send mnemonic and request to restore a wallet
		if(await BluetoothService.writeMnemonic(mnemonicValue) && await BluetoothService.performWalletAction('restore'))
		{
			// Read public address
			const publicAddress: string|null = await BluetoothService.readPublicAddress();
			// Read node address
			const nodeAddress: string|null = await BluetoothService.readNodeAddress();
			// If all values are not null
			if(publicAddress !== null && nodeAddress !== null)
			{
				// Set the public address
				nodeStore.setPublicAddress(publicAddress);
				// Set the node address
				nodeStore.setNodeAddress(nodeAddress);
				
				// Navigate to the next step
				router.push({ name: 'Wizard8Fund' });
			}
			else
			{
				// Show an error message
				errorMessage.value = t('wizard.error-occurred') as string;
			}
		}
		else
		{
			// Show an error message
			errorMessage.value = t('wizard.error-wallet-restore') as string;
		}
	}
	else
	{
		// Show an error message
		errorMessage.value = t('wizard.error-mnemonic-format') as string;
	}
};

</script>
<template>
	<ion-page>
		<ion-content :fullscreen="true">
			<div class="wizard">
				<div class="form">
					<h1>{{ $t('wizard.wallet-restore-title') }}</h1>
					<p class="text">{{ $t('wizard.wallet-restore-text') }}</p>
					<div class="mnemonic">
						<ion-textarea v-model="mnemonic" aria-label="Mnemonic" fill="outline"
							:placeholder="$t('wizard.wallet-restore-placeholder')" class="mnemonic"></ion-textarea>
					</div>
					<p class="caption">{{ $t('wizard.wallet-restore-warning') }}</p>
				</div>
				<div class="submit">
					<ion-grid>
						<ion-row v-if="errorMessage">
							<ion-item lines="none">
								<ion-text color="danger">{{ errorMessage }}</ion-text>
							</ion-item>
						</ion-row>
						<ion-row>
							<ion-col size="6" offset="6">
								<loading-button :label="$t('wizard.button-next')" :callback="requestRestoreWallet" />
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