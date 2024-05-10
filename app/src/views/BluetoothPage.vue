<template>
	<ion-page>
		<ion-header>
			<ion-toolbar>
				<ion-title>Connect to BLE</ion-title>
			</ion-toolbar>
		</ion-header>
		<ion-content class="ion-padding">
			<ion-button @click="connectToBLE">Connect</ion-button>
			<ion-button @click="disconnectFromBLE" :disabled="!isConnected">Disconnect</ion-button>
			<ion-button @click="sendMessage" :disabled="!isConnected">Send Message</ion-button>
			<ion-button @click="readFromServer" :disabled="!isConnected">Read from Server</ion-button>
			<ion-list>
				<ion-item v-for="msg in messages" :key="msg.time">
					{{ msg.text }}
				</ion-item>
			</ion-list>
		</ion-content>
	</ion-page>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue';
import { IonButton, IonContent, IonHeader, IonItem, IonList, IonPage, IonTitle, IonToolbar } from '@ionic/vue';
import { BleClient } from '@capacitor-community/bluetooth-le';

export default defineComponent({
	components: {
		IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonList, IonItem
	},
	setup() {
		const serviceUuid = '0000180d-0000-1000-8000-00805f9b34fb';
		const characteristicUuid = '0000180d-0000-1000-8000-00805f9b34fc';
		const isConnected = ref(false);
		const deviceId = ref('');
		const messages = ref([]);

		const connectToBLE = async () => {
			try {
				await BleClient.initialize();
				const device = await BleClient.requestDevice({
					services: [serviceUuid]
				});
				await BleClient.connect(device.deviceId);
				deviceId.value = device.deviceId;
				isConnected.value = true;
				console.log('Connected to the BLE device!');
			} catch (error) {
				console.error('BLE error:', error);
			}
		};

		const disconnectFromBLE = async () => {
			try {
				await BleClient.disconnect(deviceId.value);
				isConnected.value = false;
				console.log('Disconnected from the BLE device!');
			} catch (error) {
				console.error('BLE error:', error);
			}
		};

		const sendMessage = async () => {
			try {
				const message = 'Hello from client';
				await BleClient.write(deviceId.value, serviceUuid, characteristicUuid, new TextEncoder().encode(message));
				messages.value.push({ text: `Sent: ${message}`, time: Date.now() });
				console.log('Message sent to the BLE server.');
			} catch (error) {
				console.error('BLE error:', error);
			}
		};

		const readFromServer = async () => {
			try {
				const value = await BleClient.read(deviceId.value, serviceUuid, characteristicUuid);
				const message = `Received: ${new TextDecoder().decode(value)}`;
				messages.value.push({ text: message, time: Date.now() });
				console.log(message);
			} catch (error) {
				console.error('BLE error:', error);
			}
		};

		return { connectToBLE, disconnectFromBLE, sendMessage, readFromServer, isConnected, messages };
	}
});
</script>
