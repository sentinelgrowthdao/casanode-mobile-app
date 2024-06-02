<script setup lang="ts">
import { ref } from 'vue';
import {
	IonButton, IonContent, IonHeader,
	IonItem, IonList, IonPage,
	IonTitle, IonToolbar,
	IonInput, IonSelect,
} from '@ionic/vue';
import { BleClient } from '@capacitor-community/bluetooth-le';
import { encodeDataView, decodeDataView } from '@/utils/bluetooth';
import { useNodeStore } from '@stores/NodeStore';


const NODE_BLE_UUID = '0000180d-0000-1000-8000-00805f9b34fb';
const CHAR_HELLO_UUID = '0000180d-0000-1000-8000-00805f9b34fc';
const CHAR_MONIKER_UUID = '0000180d-0000-1000-8000-00805f9b34fd';
const CHAR_NODE_TYPE_UUID = '0000180d-0000-1000-8000-00805f9b34fe';
const CHAR_NODE_IP_UUID = '0000180d-0000-1000-8000-00805f9b34ff';
const CHAR_NODE_PORT_UUID = '0000180d-0000-1000-8000-00805f9b3500';
const CHAR_VPN_TYPE_UUID = '0000180d-0000-1000-8000-00805f9b3501';

const isConnected = ref(false);
const deviceId = ref('');
const messages = ref<{ text: string; time: number }[]>([]);

// Initialize the node store
const nodeStore = useNodeStore();

const connectToBLE = async () =>
{
	try
	{
		// Initialize the BLE client
		await BleClient.initialize();
		const device = await BleClient.requestDevice({
			services: [NODE_BLE_UUID]
		});

		// Connect to the device
		await BleClient.connect(device.deviceId);
		deviceId.value = device.deviceId;
		isConnected.value = true;
		console.log('Connected to the BLE device!');
	}
	catch (error)
	{
		console.error('BLE error:', error);
	}
};

const disconnectFromBLE = async () =>
{
	try
	{
		await BleClient.disconnect(deviceId.value);
		isConnected.value = false;
		console.log('Disconnected from the BLE device!');
	}
	catch (error)
	{
		console.error('BLE error:', error);
	}
};

const sendMessage = async () =>
{
	try
	{
		const message = 'Hello from client';
		await BleClient.write(deviceId.value, NODE_BLE_UUID, CHAR_HELLO_UUID, encodeDataView(message));
		messages.value.push({ text: `Sent: ${message}`, time: Date.now() });
		console.log('Message sent to the BLE server.');
	}
	catch (error)
	{
		console.error('BLE error:', error);
	}
};

const readFromServer = async () =>
{
	try
	{
		const value = await BleClient.read(deviceId.value, NODE_BLE_UUID, CHAR_HELLO_UUID);
		const message = `Received: ${new TextDecoder().decode(value)}`;
		messages.value.push({ text: message, time: Date.now() });
		console.log(message);
	}
	catch (error)
	{
		console.error('BLE error:', error);
	}
};

const subscribeToServer = async () =>
{
	try
	{
		await BleClient.startNotifications(deviceId.value, NODE_BLE_UUID, CHAR_HELLO_UUID, (value) =>
		{
			const message = `Received (subscription): ${new TextDecoder().decode(value)}`;
			messages.value.push({ text: message, time: Date.now() });
			console.log(message);
		});
		console.log('Subscribed to the BLE server.');
	}
	catch (error)
	{
		console.error('BLE error:', error);
	}
};

/** MONIKER **/
const moniker = ref(nodeStore.moniker || '');
const monikerResponse = ref<string | null>(null);
const monikerResponseClass = ref<string | null>(null);
const sendMoniker = async () =>
{
	try
	{
		// Send to the server
		await BleClient.write(deviceId.value, NODE_BLE_UUID, CHAR_MONIKER_UUID, encodeDataView(moniker.value));
		monikerResponse.value = `Moniker set to: ${moniker.value}`;
		monikerResponseClass.value = 'success';
		// Update in the store
		nodeStore.setMoniker(moniker.value);
	}
	catch (error)
	{
		monikerResponse.value = `Error: ${error}`;
		monikerResponseClass.value = 'error';
	}
};

/** NODE TYPE **/
const nodeType = ref(nodeStore.nodeType || '');
const nodeTypeResponse = ref<string | null>(null);
const nodeTypeResponseClass = ref<string | null>(null);
const sendNodeType = async () =>
{
	try
	{
		// Send to the server
		await BleClient.write(deviceId.value, NODE_BLE_UUID, CHAR_NODE_TYPE_UUID, encodeDataView(nodeType.value));
		nodeTypeResponse.value = `Moniker set to: ${nodeType.value}`;
		nodeTypeResponseClass.value = 'success';
		// Update in the store
		nodeStore.setNodeType(nodeType.value);
	}
	catch (error)
	{
		nodeTypeResponse.value = `Error: ${error}`;
		nodeTypeResponseClass.value = 'error';
	}
};

/** IP ADDRESS */
const nodeIp = ref(nodeStore.nodeIp || '');
const nodeIpResponse = ref<string | null>(null);
const nodeIpResponseClass = ref<string | null>(null);
const sendNodeIp = async () =>
{
	try
	{
		// Send to the server
		await BleClient.write(deviceId.value, NODE_BLE_UUID, CHAR_NODE_IP_UUID, encodeDataView(nodeIp.value));
		nodeIpResponse.value = `IP Address set to: ${nodeIp.value}`;
		nodeIpResponseClass.value = 'success';
		// Update in the store
		nodeStore.setNodeIp(nodeIp.value);
	}
	catch (error)
	{
		nodeIpResponse.value = `Error: ${error}`;
		nodeIpResponseClass.value = 'error';
	}
};

/** NODE PORT */
const nodePort = ref(nodeStore.nodePort.toString() || '');
const nodePortResponse = ref<string | null>(null);
const nodePortResponseClass = ref<string | null>(null);
const sendNodePort = async () =>
{
	try
	{
		// Send to the server
		await BleClient.write(deviceId.value, NODE_BLE_UUID, CHAR_NODE_PORT_UUID, encodeDataView(nodePort.value));
		nodePortResponse.value = `Node Port set to: ${nodePort.value}`;
		nodePortResponseClass.value = 'success';
		// Update in the store
		nodeStore.setNodePort(parseInt(nodePort.value));
	}
	catch (error)
	{
		nodePortResponse.value = `Error: ${error}`;
		nodePortResponseClass.value = 'error';
	}
};

/** VPN TYPE */
const vpnType = ref(nodeStore.vpnType || '');
const vpnTypeResponse = ref<string | null>(null);
const vpnTypeResponseClass = ref<string | null>(null);
const sendVpnType = async () =>
{
	try
	{
		// Send to the server
		await BleClient.write(deviceId.value, NODE_BLE_UUID, CHAR_VPN_TYPE_UUID, encodeDataView(vpnType.value));
		vpnTypeResponse.value = `VPN Type set to: ${vpnType.value}`;
		vpnTypeResponseClass.value = 'success';
		// Update in the store
		nodeStore.setVpnType(vpnType.value);
	}
	catch (error)
	{
		vpnTypeResponse.value = `Error: ${error}`;
		vpnTypeResponseClass.value = 'error';
	}
};

</script>

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
			<ion-button @click="subscribeToServer" :disabled="!isConnected">Subscribe to Server</ion-button>
			<!-- <ion-list>
				<ion-item v-for="msg in messages" :key="msg.time">
					{{ msg.text }}
				</ion-item>
			</ion-list> -->
			<ion-grid>
				<ion-row>
					<ion-col size="12">
						<ion-item>
						<ion-label position="stacked">Node Moniker</ion-label>
						<ion-input v-model="moniker" placeholder="Enter Moniker" :disabled="!isConnected" />
						</ion-item>
						<div class="input-line">
							<p class="button"><ion-button @click="sendMoniker" :disabled="!isConnected">Set Moniker</ion-button></p>
							<p :class="['label', 'ion-padding', monikerResponseClass]">{{ monikerResponse }}</p>
						</div>
					</ion-col>
				</ion-row>
				<ion-row>
					<ion-col size="12">
						<ion-item>
							<ion-label position="stacked">Node Type</ion-label>
						<ion-select v-model="nodeType">
							<ion-select-option value="residential">Residential</ion-select-option>
							<ion-select-option value="datacenter">Datacenter</ion-select-option>
						</ion-select>
						</ion-item>
						<div class="input-line">
							<p class="button"><ion-button @click="sendNodeType" :disabled="!isConnected">Set Node Type</ion-button></p>
							<p :class="['label', 'ion-padding', nodeTypeResponseClass]">{{ nodeTypeResponse }}</p>
						</div>
					</ion-col>
				</ion-row>
				<ion-row>
					<ion-col size="12">
						<ion-item>
							<ion-label position="stacked">IP Address</ion-label>
							<ion-input v-model="nodeIp" placeholder="Enter IP Address" :disabled="!isConnected" />
						</ion-item>
						<div class="input-line">
							<p class="button"><ion-button @click="sendNodeIp" :disabled="!isConnected">Set IP Address</ion-button></p>
							<p :class="['label', 'ion-padding', nodeIpResponseClass]">{{ nodeIpResponse }}</p>
						</div>
					</ion-col>
				</ion-row>
				<ion-row>
					<ion-col size="12">
						<ion-item>
							<ion-label position="stacked">Node Port</ion-label>
							<ion-input v-model="nodePort" type="number" placeholder="Enter Node Port" :disabled="!isConnected" />
						</ion-item>
						<div class="input-line">
							<p class="button"><ion-button @click="sendNodePort" :disabled="!isConnected">Set Node Port</ion-button></p>
							<p :class="['label', 'ion-padding', nodePortResponseClass]">{{ nodePortResponse }}</p>
						</div>
					</ion-col>
				</ion-row>
				<ion-row>
					<ion-col size="12">
						<ion-item>
							<ion-label position="stacked">VPN Type</ion-label>
							<ion-select v-model="vpnType">
								<ion-select-option value="wireguard">Wireguard</ion-select-option>
								<ion-select-option value="v2ray">V2Ray</ion-select-option>
							</ion-select>
						</ion-item>
						<div class="input-line">
							<p class="button"><ion-button @click="sendVpnType" :disabled="!isConnected">Set VPN Type</ion-button></p>
							<p :class="['label', 'ion-padding', vpnTypeResponseClass]">{{ vpnTypeResponse }}</p>
						</div>
					</ion-col>
				</ion-row>
			</ion-grid>
		</ion-content>
	</ion-page>
</template>

<style scoped lang="scss">
.input-line
{
	display: flex;
	justify-content: space-between;
	align-items: center;
}
.input-line > .button
{
	flex: 1;
	flex-grow: 0;
	flex-shrink: 0;
	flex-basis: auto;
}
.input-line > .label
{
	font-size: 0.8em;
	
	&.error
	{
		color: var(--ion-color-danger);
	}
}
</style>