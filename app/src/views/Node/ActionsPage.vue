<script lang="ts" setup>
import { type Ref, ref } from 'vue';
import {
	IonPage, IonContent, IonHeader,
	IonSegment, IonSegmentButton,
	IonCard, IonCardContent, IonButton
} from '@ionic/vue';
import AppToolbar from '@/components/AppToolbar.vue';

// Variable to store the selected segment
const segmentSelected: Ref<string> = ref('node');

// Segment change event
const segmentChanged = (event: CustomEvent) =>
{
	segmentSelected.value = event.detail.value;
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
					<!-- Stop Node -->
					<ion-card class="container">
						<ion-card-content>
							<p>{{ $t('actions.stop-node-description') }}</p>
							<ion-button expand="block" color="primary">
								{{ $t('actions.stop-node-button') }}
							</ion-button>
						</ion-card-content>
					</ion-card>

					<!-- Restart Node -->
					<ion-card class="container">
						<ion-card-content>
							<p>{{ $t('actions.restart-node-description') }}</p>
							<ion-button expand="block" color="primary">
								{{ $t('actions.restart-node-button') }}
							</ion-button>
						</ion-card-content>
					</ion-card>

					<!-- Regenerate SSL Certificate -->
					<ion-card class="container">
						<ion-card-content>
							<p>{{ $t('actions.regenerate-ssl-description') }}</p>
							<ion-button expand="block" color="primary">
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
							<ion-button expand="block" color="primary">
								{{ $t('actions.upgrade-system-button') }}
							</ion-button>
						</ion-card-content>
					</ion-card>

					<!-- Factory Reset -->
					<ion-card class="container">
						<ion-card-content>
							<p>{{ $t('actions.factory-reset-description') }}</p>
							<ion-button expand="block" color="danger">
								{{ $t('actions.factory-reset-button') }}
							</ion-button>
						</ion-card-content>
					</ion-card>
				</div>

				<div v-if="segmentSelected === 'system'">
					<!-- Soft Reboot -->
					<ion-card class="container">
						<ion-card-content>
							<p>{{ $t('actions.soft-reboot-description') }}</p>
							<ion-button expand="block" color="primary">
								{{ $t('actions.soft-reboot-button') }}
							</ion-button>
						</ion-card-content>
					</ion-card>

					<!-- Hard Reboot -->
					<ion-card class="container">
						<ion-card-content>
							<p>{{ $t('actions.hard-reboot-description') }}</p>
							<ion-button expand="block" color="primary">
								{{ $t('actions.hard-reboot-button') }}
							</ion-button>
						</ion-card-content>
					</ion-card>

					<!-- Shutdown -->
					<ion-card class="container">
						<ion-card-content>
							<p>{{ $t('actions.shutdown-description') }}</p>
							<ion-button expand="block" color="primary">
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
