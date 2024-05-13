<script lang="ts" setup>
import { IonPage, IonContent } from '@ionic/vue';
import AppToolbar from '@/components/AppToolbar.vue';
import AppTabs from '@/components/AppTabs.vue';
</script>
<template>
	<ion-page>
		<app-toolbar />
		<ion-content :fullscreen="true">
			<div class="actions">
				Actions
			</div>
		</ion-content>
		<app-tabs />
	</ion-page>
</template>
<style lang="scss" scoped>
@import "@scss/homepage.scss";
</style>
