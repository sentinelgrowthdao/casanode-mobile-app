<script lang="ts" setup>
import {
	IonPage, IonContent, IonHeader,
	IonCard, IonCardHeader, IonCardTitle, IonCardContent,
	IonIcon, IonButton
} from '@ionic/vue';
import { document } from 'ionicons/icons';
import AppToolbar from '@/components/AppToolbar.vue';
import { useNodeStore } from '@stores/NodeStore';
import buildInfo from '@/assets/build.json';

// Import the useNodeStore composable function.
const nodeStore = useNodeStore();

</script>
<template>
	<ion-page>
		<ion-header>
			<app-toolbar />
		</ion-header>
		<ion-content>
			<div class="about">
				<ion-card class="container">
					<ion-card-header>
						<ion-card-title>{{ $t('about.app-information-title') }}</ion-card-title>
					</ion-card-header>
					<ion-card-content>
						<p class="item">
							<strong>{{ $t('about.app-version-label') }}</strong>{{ buildInfo.version }}
						</p>
						<p class="item">
							<strong>{{ $t('about.app-release-date-label') }}</strong>{{ buildInfo.buildDate }}
						</p>
					</ion-card-content>
				</ion-card>

				<ion-card class="container">
					<ion-card-header>
						<ion-card-title>{{ $t('about.system-information-title') }}</ion-card-title>
					</ion-card-header>
					<ion-card-content>
						<p class="item">
							<strong>{{ $t('about.casanode-version-label') }}</strong>{{ nodeStore.casanodeVersion }}
						</p>
						<p class="item">
							<strong>{{ $t('about.operating-system-label') }}</strong>{{ nodeStore.operatingSystem }}
						</p>
						<p class="item">
							<strong>{{ $t('about.kernel-version-label') }}</strong>{{ nodeStore.kernelVersion }}
						</p>
						<p class="item">
							<strong>{{ $t('about.architecture-label') }}</strong>{{ nodeStore.architecture }}
						</p>
						<p class="item">
							<strong>{{ $t('about.docker-image-label') }}</strong>{{ nodeStore.dockerImage }}
						</p>
						<p class="item">
							<strong>{{ $t('about.uptime-label') }}</strong>{{ nodeStore.uptime }}
						</p>
					</ion-card-content>
				</ion-card>

				<ion-card class="container">
					<ion-card-header>
						<ion-card-title>{{ $t('about.legal-title') }}</ion-card-title>
					</ion-card-header>
					<ion-card-content>
						<ion-button fill="outline" target="_system" href="https://www.sentinel.co/terms-of-service">
							<ion-icon :icon="document"></ion-icon>
							{{ $t('about.terms-of-service') }}
						</ion-button>
						<ion-button fill="outline" target="_system" href="https://www.sentinel.co/privacy-policy">
							<ion-icon :icon="document"></ion-icon>
							{{ $t('about.privacy-policy') }}
						</ion-button>
					</ion-card-content>
				</ion-card>
			</div>
		</ion-content>
	</ion-page>
</template>
<style lang="scss" scoped>
@import "@scss/container.scss";
</style>
