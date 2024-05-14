<script lang="ts" setup>
import { IonPage, IonContent, IonHeader } from '@ionic/vue';
import AppToolbar from '@/components/AppToolbar.vue';
</script>
<template>
	<ion-page>
		<ion-header>
			<app-toolbar />
		</ion-header>
		<ion-content>
			<div class="about">
				About
			</div>
		</ion-content>
	</ion-page>
</template>
<style lang="scss" scoped>
@import "@scss/homepage.scss";
</style>
