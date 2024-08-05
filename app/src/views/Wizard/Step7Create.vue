<script lang="ts" setup>
import {
	IonPage, IonContent,
	IonGrid, IonCol, IonRow
} from '@ionic/vue';
import { useRouter } from 'vue-router';
import { useNodeStore } from '@/stores/NodeStore';
import LoadingButton from '@components/LoadingButton.vue';

// Router
const router = useRouter();
// Node store
const nodeStore = useNodeStore();

/**
 * Remove mnemonic store
 * @returns void
 */
const removeMnemonicStore = async () =>
{
	// Clear the store
	nodeStore.clearMnemonic();
	// Navigate to the next step
	router.push({ name: 'Wizard8Fund' });
};

</script>
<template>
	<ion-page>
		<ion-content :fullscreen="true">
			<div class="wizard">
				<div class="form">
					<h1>{{ $t('wizard.wallet-create-title') }}</h1>
					<p class="text">{{ $t('wizard.wallet-create-text') }}</p>
					<ul class="mnemonic word-list">
						<li v-for="(word, index) in nodeStore.mnemonic" :key="word">{{ index +1 }}. {{ word }}</li>
					</ul>
					<div class="backup-alert">
						<h2>{{ $t('wizard.wallet-create-backup-title') }}</h2>
						<p>{{ $t('wizard.wallet-create-backup-text') }}</p>
					</div>
				</div>
				<div class=" submit">
					<ion-grid>
						<ion-row>
							<ion-col size="6" offset="6">
								<loading-button :label="$t('wizard.button-next')" :callback="removeMnemonicStore" />
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