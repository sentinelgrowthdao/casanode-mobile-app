<script lang="ts" setup>
import {
	IonPage, IonContent, IonHeader,
	IonCard, IonCardHeader, IonCardTitle, IonCardContent,
	IonIcon, IonButton
} from '@ionic/vue';
import { document } from 'ionicons/icons';
import AppToolbar from '@/components/AppToolbar.vue';
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
							<strong>{{ $t('about.app-version-label') }}</strong> 1.0.0-alpha
						</p>
						<p class="item">
							<strong>{{ $t('about.app-release-date-label') }}</strong> June 5, 2024
						</p>
					</ion-card-content>
				</ion-card>

				<ion-card class="container">
					<ion-card-header>
						<ion-card-title>{{ $t('about.system-information-title') }}</ion-card-title>
					</ion-card-header>
					<ion-card-content>
						<p class="item">
							<strong>{{ $t('about.casanode-version-label') }}</strong> 1.0.0
						</p>
						<p class="item">
							<strong>{{ $t('about.operating-system-label') }}</strong> Debian 12
						</p>
						<p class="item">
							<strong>{{ $t('about.kernel-version-label') }}</strong> 6.6.28+rpt-rpi-2712
						</p>
						<p class="item">
							<strong>{{ $t('about.architecture-label') }}</strong> aarch64
						</p>
						<p class="item">
							<strong>{{ $t('about.docker-image-label') }}</strong>
							wajatmaka/sentinel-aarch64-alpine:v0.7.1
						</p>
						<p class="item">
							<strong>{{ $t('about.uptime-label') }}</strong> 27 days, 11:40
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
