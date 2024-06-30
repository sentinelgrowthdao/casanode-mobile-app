<script lang="ts" setup>
import {
	IonPage, IonContent,
	IonGrid, IonCol, IonRow
} from '@ionic/vue';
import { useRouter } from 'vue-router';
import NodeService from '@/services/NodeService';
import LoadingButton from '@components/LoadingButton.vue';

// Router
const router = useRouter();

/**
 * Refresh the store and navigate to the next step
 */
const refreshStoreAndNavigate = async () =>
{
	// Load the node configuration
	await NodeService.loadNodeConfiguration();
	// Navigate to the next step
	router.push({ name: 'NodeDashboard' });
};

</script>
<template>
	<ion-page>
		<ion-content :fullscreen="true">
			<div class="wizard">
				<div class="form">
					<h1>{{ $t('wizard.congratulations-title') }}</h1>
					<p class="text">{{ $t('wizard.congratulations-text') }}</p>
					<p class="text">{{ $t('wizard.congratulations-next') }}</p>
				</div>
				<div class="submit">
					<ion-grid>
						<ion-row>
							<ion-col size="6" offset="6">
								<loading-button :label="$t('wizard.button-finish')" :callback="refreshStoreAndNavigate" />
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