<script lang="ts" setup>
import { ref, watch } from 'vue';

const props = defineProps({
isCheckMark: String
});

const animationClass = ref('');

watch(
() => props.isCheckMark, (newValue) =>
	{
		if(newValue === 'check')
			animationClass.value = 'animate-check'
		else if(newValue === 'cross')
			animationClass.value = 'animate-cross';
		else
			animationClass.value = '';
	}
);
</script>
<template>
	<div class="checkmarkcross icon-wrapper" :class="animationClass">
		<svg v-if="isCheckMark === 'check'" class="checkmark" width="100%" height="100%" viewBox="0 0 100 100">
			<circle class="checkmark-disc" cx="50" cy="50" r="45" fill="transparent" stroke="#fff" stroke-width="5" />
			<path
					class="checkmark-check" d="M75 33L40 66 25 50"
					fill="none"
					stroke="#28bb50"
					stroke-width="3"
					stroke-linecap="round">
			</path>
		</svg>
		<svg v-else-if="isCheckMark === 'cross'" class="cross" width="100%" height="100%" viewBox="0 0 100 100">
			<circle class="checkmark-disc" cx="50" cy="50" r="45" fill="transparent" stroke="#fff" stroke-width="5" />
			<path
					class="cross-line" d="M65 33L35 66"
					fill="none"
					stroke="#ad000d"
					stroke-width="3"
					stroke-linecap="round">
			</path>
			<path
					class="cross-line" d="M65 66L35 33"
					fill="none"
					stroke="#ad000d"
					stroke-width="3"
					stroke-linecap="round">
			</path>
		</svg>
		<svg v-else class="empty" width="100%" height="100%" viewBox="0 0 100 100">
			<circle class="checkmark-disc" cx="50" cy="50" r="45" fill="transparent" stroke="#fff" stroke-width="5" />
		</svg>
	</div>
</template>
<style scoped>

.checkmark-check
{
	stroke-dasharray: 80px 80px;
	stroke-dashoffset: -80px;
	animation: checkAnimate 1s forwards cubic-bezier(0.895, 0.03, 0.685, 0.22);
}

.cross-line
{
	stroke-dasharray: 80px 80px;
	stroke-dashoffset: -80px;
	animation: checkAnimate 1s forwards cubic-bezier(0.895, 0.03, 0.685, 0.22);
	
	&:nth-child(2)
	{
		animation-delay: 0.25s;
	}
}

@keyframes checkAnimate
{
	0% {
		stroke-dashoffset: -80px;
	}
	100% {
		stroke-dashoffset: 0px;
	}
}
</style>
