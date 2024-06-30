<script lang="ts" setup>
import { type Ref, ref } from 'vue';
import {
	IonPage, IonContent,
	IonGrid, IonCol, IonRow,
	IonItem, IonText
} from '@ionic/vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { copyToClipboard } from '@/utils/clipboard';
import { useNodeStore } from '@/stores/NodeStore';
import BluetoothService from '@/services/BluetoothService';
import LoadingButton from '@components/LoadingButton.vue';
import { refreshNodeStatus, refreshNodeBalance } from '@/utils/node';

// Router
const router = useRouter();
// Import the useI18n composable function.
const { t } = useI18n();

const nodeStore = useNodeStore();
const balanceMessage: Ref<string> = ref('');

const checkWalletBalance = async () => 
{
	// Clear the balance message
	balanceMessage.value = '';
	// Get wallet balance
	const balance = await refreshNodeBalance();
	// Check if the balance is not empty
	if(balance && balance.amount >= 10)
	{
		// Start the dvpn node successfully
		if(await BluetoothService.startNode())
		{
			// Get Node status
			const status = await refreshNodeStatus();
			// Check if the status is not null
			if(status !== null)
			{
				// Navigate to the next step
				router.push({ name: 'Wizard9Ports' });
			}
			else
			{
				// Show the error message
				balanceMessage.value = t('wizard.error-start-failed');
			}
		}
		else
		{
			// Show the error message
			balanceMessage.value = t('wizard.error-start-failed');
		}
	}
	else
	{
		// Show the warning message
		balanceMessage.value = t('wizard.warning-wallet-fund');
	}
};

</script>
<template>
	<ion-page>
		<ion-content :fullscreen="true">
			<div class="wizard">
				<div class="form">
					<h1>{{ $t('wizard.wallet-fund-title') }}</h1>
					<p class="text">{{ $t('wizard.wallet-fund-text') }}</p>
					<p class="address" @click="copyToClipboard(t('wizard.wallet-fund-copied'), nodeStore.publicAddress)">
						{{ nodeStore.publicAddress }}
					</p>
					<p class="text">{{ $t('wizard.wallet-fund-next') }}</p>
					<ion-item lines="none" v-if="balanceMessage">
						<ion-text color="warning">{{ balanceMessage }}</ion-text>
					</ion-item>
				</div>
				<div class="submit">
					<ion-grid>
						<ion-row>
							<ion-col size="6" offset="6">
								<loading-button :label="$t('wizard.button-next')" :callback="checkWalletBalance" />
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