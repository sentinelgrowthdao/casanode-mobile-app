<script lang="ts" setup>
import {
	IonPage, IonContent, IonButton,
	IonGrid, IonCol, IonRow
} from '@ionic/vue';
import { useNodeStore } from '@/stores/NodeStore';

// Node store
const nodeStore = useNodeStore();

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