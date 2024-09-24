<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import {
	IonContent, IonButton,
	modalController
} from '@ionic/vue';

// Define the props
const props = defineProps<{ ipPort: string }>();

// Define the emits
const emit = defineEmits(['dismiss']);

const dismissModal = () =>
{
	modalController.dismiss();
	emit('dismiss');
};
</script>
<template>
	<ion-content :fullscreen="true" class="ion-padding">
		<h1>{{ $t('welcome.help-title') }}</h1>
		<p class="text">{{ $t('welcome.help-text') }}</p>
		<p class="address">{{ `http://${props.ipPort}` }}</p>
		<p class="text">{{ $t('welcome.help-instruction') }}</p>
		<p class="close">
			<ion-button @click="dismissModal">{{ $t('welcome.help-close') }}</ion-button>
		</p>
	</ion-content>
</template>
<style scoped lang="scss">
ion-content
{
	&> h1
	{
		font-size:2.5rem;
	}
	
	&> p
	{
		&.text
		{
			margin:0 0 1rem;
			font-size:1.125rem;
			line-height:1.5rem;
		}
		
		&.address
		{
			margin:0 0 1rem;
			padding: .5rem;
			font-size: 1.25rem;
			line-height: 2rem;
			text-align:center;
			border: 2px solid var(--ion-color-primary);
			border-radius: 0.5rem;
		}
		
		&.close
		{
			margin:0;
			text-align:right;
		}
	}
}
</style>
