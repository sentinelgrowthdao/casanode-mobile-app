<script lang="ts" setup>
import { type Ref, ref } from 'vue';
import {
	IonPage, IonContent,
	IonGrid, IonRow, IonCol,
	IonList, IonItem,
	IonInput, IonText
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
const passphrase: Ref<string> = ref('');

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

// Set the passphrase and navigate to the next step
const setPassphraseAndNavigate = async () =>
{
	// Trim the passphrase value
	const passphraseValue = passphrase.value.trim();
	// Check if the passphrase is not empty and at least 8 characters
	if(passphraseValue !== '' && passphraseValue.length >= 8)
	{
		// Send to the server and apply the value
		if(await BluetoothService.writeNodePassphrase(passphraseValue))
		{
			// Set the moniker value
			nodeStore.setMoniker(passphraseValue);
			// Navigate to the next step
			router.push({ name: 'Wizard7Wallet' });
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
					<h1>{{ $t('wizard.passphrase-title') }}</h1>
					<p class="text">{{ $t('wizard.passphrase-text') }}</p>
					<ion-list class="input">
						<ion-item>
							<ion-input
								aria-label="Passphrase"
								type="password"
								v-model="passphrase"
								:placeholder="$t('wizard.passphrase-placeholder')" />
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
								<loading-button :label="$t('wizard.button-next')" :callback="setPassphraseAndNavigate" />
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