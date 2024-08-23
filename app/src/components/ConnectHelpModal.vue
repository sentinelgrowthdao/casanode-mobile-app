<script setup lang="ts">
import { defineEmits } from 'vue';
import {
	IonContent, IonButton,
	modalController
} from '@ionic/vue';

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
		<p class="text">{{ $t('welcome.help-instruction') }}</p>
		<p class="picture"><img src="@assets/images/browser.svg" alt="" /></p>
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
		
		&.picture
		{
			margin:0 0 1rem;
			padding: 0 2rem;
			text-align:center;
			
			&> img
			{
				display:inline-block;
				width:100%;
			}
		}

		&.close
		{
			margin:0;
			text-align:right;
		}
	}
}
</style>
