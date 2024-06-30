<script lang="ts" setup>
import { type Ref, ref } from 'vue';
import {
	IonPage, IonContent, IonHeader,
	IonSegment, IonSegmentButton,
	IonCard, IonCardContent, IonButton
} from '@ionic/vue';
import AppToolbar from '@/components/AppToolbar.vue';
import BluetoothService from '@/services/BluetoothService';
import { useRouter } from 'vue-router';
import { useNodeStore } from '@stores/NodeStore';
import { refreshNodeStatus } from '@/utils/node';

// Variable to store the selected segment
const segmentSelected: Ref<string> = ref('node');

// Router
const router = useRouter();
// Import the useNodeStore composable function.
const nodeStore = useNodeStore();

// Segment change event
const segmentChanged = (event: CustomEvent) =>
{
	segmentSelected.value = event.detail.value;
};

/**
 * Send request to stop the node
 */
const nodeAction = async(action: string) => 
{
	if(action === 'start')
	{
		if(await BluetoothService.startNode())
		{
			console.log('Node started successfully.');
		}
		else
		{
			console.error('Failed to start the node.');
		}
	}
	else if (action === 'stop')
	{
		if(await BluetoothService.stopNode())
		{
			console.log('Node stopped successfully.');
		}
		else
		{
			console.error('Failed to stop the node.');
		}
	}
	else if(action === 'restart')
	{
		if(await BluetoothService.restartNode())
		{
			console.log('Node restarted successfully.');
		}
		else
		{
			console.error('Failed to restart the node.');
		}
	}
	
	// Update the node status
	await refreshNodeStatus();
};

/**
 * Send request to renew the SSL certificate
 */
const certificateAction = async(action: string) =>
{
	if(action === 'renew')
	{
		if(await BluetoothService.renewCertificate())
		{
			console.log('Certificate renewed successfully.');
		}
		else
		{
			console.error('Failed to renew the certificate.');
		}
	}
};

/**
 * Send request to perform system action
 */
const systemAction = async(action: string) =>
{
	if(action === 'update')
	{
		if(await BluetoothService.updateSystem())
		{
			console.log('System updated successfully.');
		}
		else
		{
			console.error('Failed to update the system.');
		}
	}
	else if(action === 'reset')
	{
		if(await BluetoothService.resetSystem())
		{
			console.log('System reset successfully.');
			// Go back to the home page
			router.replace({ name: 'Home' });
		}
		else
		{
			console.error('Failed to reset the system.');
		}
	}
	else if(action === 'reboot')
	{
		if(await BluetoothService.rebootSystem())
		{
			console.log('System rebooted successfully.');
			// Go back to the home page
			router.replace({ name: 'Home' });
		}
		else
		{
			console.error('Failed to reboot the system.');
		}
	}
	else if(action === 'shutdown')
	{
		if(await BluetoothService.shutdownSystem())
		{
			console.log('System shutdown successfully.');
			// Go back to the home page
			router.replace({ name: 'Home' });
		}
		else
		{
			console.error('Failed to shutdown the system.');
		}
	}
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
					<ion-card v-if="nodeStore.status === 'stopped'" class="container">
						<ion-card-content>
							<p>{{ $t('actions.start-node-description') }}</p>
							<ion-button expand="block" color="primary" @click="nodeAction('start')">
								{{ $t('actions.start-node-button') }}
							</ion-button>
						</ion-card-content>
					</ion-card>
					
					<!-- Stop Node -->
					<ion-card v-if="nodeStore.status === 'running'" class="container">
						<ion-card-content>
							<p>{{ $t('actions.stop-node-description') }}</p>
							<ion-button expand="block" color="primary" @click="nodeAction('stop')">
								{{ $t('actions.stop-node-button') }}
							</ion-button>
						</ion-card-content>
					</ion-card>
					
					<!-- Restart Node -->
					<ion-card class="container">
						<ion-card-content>
							<p>{{ $t('actions.restart-node-description') }}</p>
							<ion-button expand="block" color="primary" @click="nodeAction('restart')">
								{{ $t('actions.restart-node-button') }}
							</ion-button>
						</ion-card-content>
					</ion-card>

					<!-- Regenerate SSL Certificate -->
					<ion-card class="container">
						<ion-card-content>
							<p>{{ $t('actions.regenerate-ssl-description') }}</p>
							<ion-button expand="block" color="primary" @click="certificateAction('renew')">
								{{ $t('actions.regenerate-ssl-button') }}
							</ion-button>
						</ion-card-content>
					</ion-card>
				</div>

				<div v-if="segmentSelected === 'maintenance'">
					<!-- Upgrade System -->
					<ion-card class="container">
						<ion-card-content>
							<p>{{ $t('actions.upgrade-system-description') }}</p>
							<ion-button expand="block" color="primary" @click="systemAction('update')">
								{{ $t('actions.upgrade-system-button') }}
							</ion-button>
						</ion-card-content>
					</ion-card>

					<!-- Factory Reset -->
					<ion-card class="container">
						<ion-card-content>
							<p>{{ $t('actions.factory-reset-description') }}</p>
							<ion-button expand="block" color="danger" @click="systemAction('reset')">
								{{ $t('actions.factory-reset-button') }}
							</ion-button>
						</ion-card-content>
					</ion-card>
				</div>

				<div v-if="segmentSelected === 'system'">
					<!-- Hard Reboot -->
					<ion-card class="container">
						<ion-card-content>
							<p>{{ $t('actions.hard-reboot-description') }}</p>
							<ion-button expand="block" color="primary" @click="systemAction('reboot')">
								{{ $t('actions.hard-reboot-button') }}
							</ion-button>
						</ion-card-content>
					</ion-card>

					<!-- Shutdown -->
					<ion-card class="container">
						<ion-card-content>
							<p>{{ $t('actions.shutdown-description') }}</p>
							<ion-button expand="block" color="primary" @click="systemAction('shutdown')">
								{{ $t('actions.shutdown-button') }}
							</ion-button>
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
