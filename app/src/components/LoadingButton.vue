<template>
	<ion-button @click="handleClick" :disabled="loading" expand="block" :class="{ loading: loading }">
		<div class="button-content">
			<ion-spinner v-if="loading" name="crescent" slot="start" />
			<span>{{ label }}</span>
		</div>
	</ion-button>
</template>

<script setup lang="ts">
	import { ref } from 'vue';
	import { IonButton, IonSpinner } from '@ionic/vue';
	
	interface Props
	{
		label: string;
		callback: () => Promise<void>;
	}
	
	const props = defineProps<Props>();
	const loading = ref(false);
	
	const handleClick = async () =>
	{
		loading.value = true;
		try
		{
			await props.callback();
		}
		finally
		{
			loading.value = false;
		}
	};
</script>

<style scoped lang="scss">
ion-button
{
	display: flex;
	justify-content: center;
	align-items: center;
	
	&.ion-color-danger
	{
		&> .button-content > span
		{
			color:var(--text-color-normal-light);
		}
	}
	
	.button-content
	{
		display: flex;
		align-items: center;
		
		&> ion-spinner
		{
			margin-right: calc(var(--padding-start) * 0.5);
			width: 1rem;
			height: 1rem;
			margin-right: 0.5rem;
		}
	}
	
	&.loading .button-content
	{
		min-width: 100%;
		justify-content: center;
	}
}
</style>
