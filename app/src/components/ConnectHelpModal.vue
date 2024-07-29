<script setup lang="ts">
import { defineEmits } from 'vue';
import { IonContent, IonButton, modalController } from '@ionic/vue';

const emit = defineEmits(['dismiss']);

const dismissModal = () =>
{
	modalController.dismiss();
	emit('dismiss');
};
</script>
<template>
	<ion-content>
		<h1>{{ $t('welcome.help-title') }}</h1>
		<p>{{ $t('welcome.help-text') }}</p>
		<p>http://adresse-ip:8080</p>
		<p>
			<ion-button @click="dismissModal">Close</ion-button>
		</p>
	</ion-content>
</template>
<style scoped lang="scss">

</style>
