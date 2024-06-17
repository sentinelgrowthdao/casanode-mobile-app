<script lang="ts" setup>
import {
	IonPage, IonContent, IonButton,
	IonGrid, IonCol, IonRow
} from '@ionic/vue';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useNodeStore } from '@/stores/NodeStore';

// Router
const router = useRouter();
// Node store
const nodeStore = useNodeStore();

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

const mnemonic_words = [
	"upper", "quarter", "grape", "wise",
	"just", "used", "victory", "bird",
	"evil", "setup", "ozone", "cat",
	"assume", "carpet", "sing", "relief",
	"surprise", "human", "blame", "this",
	"dizzy", "save", "apology", "quiz",
];

</script>
<template>
	<ion-page>
		<ion-content :fullscreen="true">
			<div class="wizard">
				<div class="form">
					<h1>{{ $t('wizard.wallet-create-title') }}</h1>
					<p class="text">{{ $t('wizard.wallet-create-text') }}</p>
					<ul class="mnemonic word-list">
						<li v-for="(word, index) in mnemonic_words" :key="word">{{ index +1 }}. {{ word }}</li>
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
								<ion-button expand="block" :router-link="{ name: 'Wizard8Fund' }"
									router-direction="forward">
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