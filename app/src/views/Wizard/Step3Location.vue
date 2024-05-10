<script lang="ts" setup>
import { IonPage, IonContent, IonButton, IonList, IonItem, IonSelect, IonSelectOption } from '@ionic/vue';
</script>
<template>
	<ion-page>
		<ion-content :fullscreen="true">
			<div class="wizard">
				<h1>{{ $t('wizard.location-title') }}</h1>
				<p class="text">{{ $t('wizard.location-text') }}</p>
				<ul>
					<li>{{ $t('wizard.location-residential-desc') }}</li>
					<li>{{ $t('wizard.location-datacenter-desc') }}</li>
				</ul>
				<ion-list class="input">
					<ion-item>
						<ion-select aria-label="location" :placeholder="$t('wizard.location-placeholder')" value="">
							<ion-select-option value="residential">
								{{ $t('wizard.location-residential') }}
							</ion-select-option>
							<ion-select-option value="datacenter">
								{{ $t('wizard.location-datacenter') }}
							</ion-select-option>
						</ion-select>
					</ion-item>
				</ion-list>
				<p class="nav-buttons right">
					<ion-button :router-link="{ name: 'Wizard4Protocol' }" router-direction="forward">
						{{ $t('wizard.button-next') }}
					</ion-button>
				</p>
			</div>
		</ion-content>
	</ion-page>
</template>
<style lang="scss" scoped>
@import "@scss/wizard.scss";
</style>