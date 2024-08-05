<script lang="ts" setup>
import {
	IonPage, IonContent,
	IonGrid, IonRow, IonCol
} from '@ionic/vue';
import { useRouter } from 'vue-router';
import { useNodeStore } from '@stores/NodeStore';
import LoadingButton from '@components/LoadingButton.vue';

// Router
const router = useRouter();

// Node store
const nodeStore = useNodeStore();

/**
 * Check the node configuration
 */
const checkNodeConfiguration = async () =>
{
	// If node already configured, go to the reset page
	if(nodeStore.moniker.length > 0
		|| nodeStore.nodeType.length > 0
		|| nodeStore.nodeAddress.length > 0
		|| nodeStore.publicAddress.length > 0)
	{
		// Go to the reset page
		router.push({ name: 'Wizard1Reset' });
	}
	else
	{
		// Go to the next step
		router.push({ name: 'Wizard2Moniker' });
	}
}

</script>

<template>
	<ion-page>
		<ion-content :fullscreen="true">
			<div class="wizard">
				<div class="form">
					<h1>{{ $t('wizard.welcome-title') }}</h1>
					<p class="text">{{ $t('wizard.welcome-text') }}</p>
					<p class="text">{{ $t('wizard.welcome-next') }}</p>
				</div>
				<div class="submit">
					<ion-grid>
						<ion-row>
							<ion-col size="6" offset="6">
								<loading-button :label="$t('wizard.button-next')" :callback="checkNodeConfiguration" />
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