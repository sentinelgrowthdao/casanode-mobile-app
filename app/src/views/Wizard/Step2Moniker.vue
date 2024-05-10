<script lang="ts" setup>
import { IonPage, IonContent, IonButton, IonList, IonItem, IonInput } from '@ionic/vue';
</script>
<template>
	<ion-page>
		<ion-content :fullscreen="true">
			<div class="wizard">
				<h1>{{ $t('wizard.moniker-title') }}</h1>
				<p class="text">{{ $t('wizard.moniker-text') }}</p>
				<p class="text">{{ $t('wizard.moniker-explain') }}</p>
				<ion-list class="input">
					<ion-item>
						<ion-input aria-label="Moniker" :placeholder="$t('wizard.moniker-placeholder')" />
					</ion-item>
				</ion-list>
				<p class="nav-buttons right">
					<ion-button :router-link="{ name: 'Wizard3Location' }" router-direction="forward">
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