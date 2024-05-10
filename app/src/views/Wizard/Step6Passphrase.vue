<script lang="ts" setup>
import { IonPage, IonContent, IonButton, IonList, IonItem, IonInput } from '@ionic/vue';
</script>
<template>
	<ion-page>
		<ion-content :fullscreen="true">
			<div class="wizard">
				<div class="form">
					<h1>{{ $t('wizard.passphrase-title') }}</h1>
					<p class="text">{{ $t('wizard.passphrase-text') }}</p>
					<ion-list class="input">
						<ion-item>
							<ion-input aria-label="Passphrase" :placeholder="$t('wizard.passphrase-placeholder')" />
						</ion-item>
					</ion-list>
				</div>
				<div class="submit right">
					<ion-button :router-link="{ name: 'Wizard7Configuration' }" router-direction="forward">
						{{ $t('wizard.button-next') }}
					</ion-button>
				</div>
			</div>
		</ion-content>
	</ion-page>
</template>
<style lang="scss" scoped>
@import "@scss/wizard.scss";
</style>