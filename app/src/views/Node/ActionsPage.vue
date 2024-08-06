<script lang="ts" setup>
import { type Ref, ref } from 'vue';
import {
	IonPage, IonContent, IonHeader,
	IonSegment, IonSegmentButton,
	IonCard, IonCardContent,
	toastController,
} from '@ionic/vue';
import AppToolbar from '@/components/AppToolbar.vue';
import BluetoothService from '@/services/BluetoothService';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useNodeStore } from '@stores/NodeStore';
import { refreshNodeStatus } from '@/utils/node';
import LoadingButton from '@components/LoadingButton.vue';

// Variable to store the selected segment
const segmentSelected: Ref<string> = ref('node');

// Router
const router = useRouter();
// Import the useI18n composable function.
const { t } = useI18n();
// Import the useNodeStore composable function.
const nodeStore = useNodeStore();

// Request in progress reference
const requestInProgress = ref<boolean>(false);

// Segment change event
const segmentChanged = (event: CustomEvent) =>
{
	segmentSelected.value = event.detail.value;
};

/**
 * Show a toast message
 * @param message Message to show
 * @returns Promise<void>
 */
const showToastMessage = async(message: string) =>
{
	// Show a toast message
	const toast = await toastController.create({
				message: message,
				duration: 1500,
				position: 'bottom',
			});
	// Wait for the toast to be dismissed
	await toast.present();
};

/**
 * Redirect to the home page
 * @returns void
 */
const redirectToHome = () =>
{
	// Unlock the buttons
	requestInProgress.value = false;
	// Redirect to the home page
	router.replace({ name: 'Home' });
};

/**
 * Send request to stop the node
 * @param action Action to perform
 * @returns Promise<void>
 */
const nodeAction = async(action: string) => 
{
	// Toast message
	let message = '';
	
	// Lock the buttons
	requestInProgress.value = true;
	
	if(action === 'start')
	{
		// Start the node
		if(await BluetoothService.startNode())
			message = t('actions.start-node-success');
		else
			message = t('actions.start-node-failure');
	}
	else if (action === 'stop')
	{
		// Stop the node
		if(await BluetoothService.stopNode())
			message = t('actions.stop-node-success');
		else
			message = t('actions.stop-node-failure');
	}
	else if(action === 'restart')
	{
		// Restart the node
		if(await BluetoothService.restartNode())
			message = t('actions.restart-node-success');
		else
			message = t('actions.restart-node-failure');
	}
	
	// Show a toast message
	await showToastMessage(message);
	
	// Update the node status
	await refreshNodeStatus();
	
	// Unlock the buttons
	requestInProgress.value = false;
};

/**
 * Send request to renew the SSL certificate
 */
const certificateAction = async(action: string) =>
{
	// Toast message
	let message = '';
	
	// Lock the buttons
	requestInProgress.value = true;
	
	if(action === 'renew')
	{
		// Renew the certificate
		if(await BluetoothService.renewCertificate())
			message = t('actions.regenerate-ssl-success');
		else
			message = t('actions.regenerate-ssl-failure');
	}
	
	// Show a toast message
	await showToastMessage(message);
	
	// Unlock the buttons
	requestInProgress.value = false;
};

/**
 * Send request to perform system action
 */
const systemAction = async(action: string) =>
{
	// Toast message
	let message = '';
	
	// Lock the buttons
	requestInProgress.value = true;
	
	if(action === 'update')
	{
		if(await BluetoothService.updateSystem())
			message = t('actions.upgrade-system-success');
		else
			message = t('actions.upgrade-system-failure');
	}
	else if(action === 'reset')
	{
		if(await BluetoothService.resetSystem())
		{
			// Reset store
			nodeStore.resetStore();
			// Show a toast message
			await showToastMessage(t('actions.factory-reset-success'));
			// Redirect to the home page
			redirectToHome();
			// Exit the function
			return ;
		}
		else
		{
			// Failed to reset the system
			message = t('actions.factory-reset-failure');
		}
	}
	else if(action === 'reboot')
	{
		if(await BluetoothService.rebootSystem())
		{
			// Show a toast message
			await showToastMessage(t('actions.hard-reboot-success'));
			// Redirect to the home page
			redirectToHome();
			// Exit the function
			return ;
		}
		else
		{
			// Failed to reboot the system
			message = t('actions.hard-reboot-failure');
		}
	}
	else if(action === 'shutdown')
	{
		if(await BluetoothService.shutdownSystem())
		{
			// Show a toast message
			await showToastMessage(t('actions.shutdown-success'));
			// Redirect to the home page
			redirectToHome();
			// Exit the function
			return ;
		}
		else
		{
			// Failed to shutdown the system
			message = t('actions.shutdown-failure');
		}
	}
	
	// Show a toast message
	await showToastMessage(message);
	
	// Unlock the buttons
	requestInProgress.value = false;
};

</script>

<template>
	<ion-page>
		<ion-header>
			<app-toolbar />
		</ion-header>
		<ion-content>
			<div class="actions">
				<div class="segment-container ion-padding-top">
					<ion-segment :value="segmentSelected" @ionChange="segmentChanged">
						<ion-segment-button value="node">
							{{ $t('actions.node-tab') }}
						</ion-segment-button>
						<ion-segment-button value="maintenance">
							{{ $t('actions.maintenance-tab') }}
						</ion-segment-button>
						<ion-segment-button value="system">
							{{ $t('actions.system-tab') }}
						</ion-segment-button>
					</ion-segment>
				</div>
				
				<div v-if="segmentSelected === 'node'">
					<!-- Start Node -->
					<ion-card v-if="nodeStore.status !== 'running'" class="container">
						<ion-card-content>
							<p>{{ $t('actions.start-node-description') }}</p>
							<loading-button :label="$t('actions.start-node-button')" :disabled="requestInProgress" :callback="async() => await nodeAction('start')" />
						</ion-card-content>
					</ion-card>
					
					<!-- Stop Node -->
					<ion-card v-if="nodeStore.status === 'running'" class="container">
						<ion-card-content>
							<p>{{ $t('actions.stop-node-description') }}</p>
							<loading-button :label="$t('actions.stop-node-button')" :disabled="requestInProgress" :callback="async() => await nodeAction('stop')" />
						</ion-card-content>
					</ion-card>
					
					<!-- Restart Node -->
					<ion-card v-if="nodeStore.status === 'running'" class="container">
						<ion-card-content>
							<p>{{ $t('actions.restart-node-description') }}</p>
							<loading-button :label="$t('actions.restart-node-button')" :disabled="requestInProgress" :callback="async() => await nodeAction('restart')" />
						</ion-card-content>
					</ion-card>

					<!-- Regenerate SSL Certificate -->
					<ion-card class="container">
						<ion-card-content>
							<p>{{ $t('actions.regenerate-ssl-description') }}</p>
							<loading-button :label="$t('actions.regenerate-ssl-button')" :disabled="requestInProgress" :callback="async() => await certificateAction('renew')" />
						</ion-card-content>
					</ion-card>
				</div>

				<div v-if="segmentSelected === 'maintenance'">
					<!-- Upgrade System -->
					<ion-card class="container">
						<ion-card-content>
							<p>{{ $t('actions.upgrade-system-description') }}</p>
							<loading-button :label="$t('actions.upgrade-system-button')" :disabled="requestInProgress" :callback="async() => await systemAction('update')" />
						</ion-card-content>
					</ion-card>

					<!-- Factory Reset -->
					<ion-card class="container">
						<ion-card-content>
							<p>{{ $t('actions.factory-reset-description') }}</p>
							<loading-button color="danger" :label="$t('actions.factory-reset-button')" :disabled="requestInProgress" :callback="async() => await systemAction('reset')" />
						</ion-card-content>
					</ion-card>
				</div>

				<div v-if="segmentSelected === 'system'">
					<!-- Hard Reboot -->
					<ion-card class="container">
						<ion-card-content>
							<p>{{ $t('actions.hard-reboot-description') }}</p>
							<loading-button :label="$t('actions.hard-reboot-button')" :disabled="requestInProgress" :callback="async() => await systemAction('reboot')" />
						</ion-card-content>
					</ion-card>

					<!-- Shutdown -->
					<ion-card class="container">
						<ion-card-content>
							<p>{{ $t('actions.shutdown-description') }}</p>
							<loading-button :label="$t('actions.shutdown-button')" :disabled="requestInProgress" :callback="async() => await systemAction('shutdown')" />
						</ion-card-content>
					</ion-card>
				</div>


			</div>
		</ion-content>
	</ion-page>
</template>

<style lang="scss" scoped>
@import "@scss/container.scss";

.actions
{
	.segment-container
	{
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;

		ion-segment
		{
			width: auto;
		}
	}
}
</style>
