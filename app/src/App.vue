<template>
	<ion-app>
		<ion-router-outlet />
	</ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import { startBluetoothMonitorHook } from '@/hooks/BluetoothMonitorHook';

// Start the Bluetooth monitor hook
startBluetoothMonitorHook();
</script>
