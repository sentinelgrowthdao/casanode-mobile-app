<script lang="ts" setup>
import { IonPage, IonContent, IonButton } from '@ionic/vue';

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
				<div class="submit right">
					<ion-button :router-link="{ name: 'Wizard2Moniker' }" router-direction="forward">
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