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
import BluetoothService from '@/services/BluetoothService';


const NODE_BLE_UUID = '0000180d-0000-1000-8000-00805f9b34fb';
const CHAR_HELLO_UUID = '0000180d-0000-1000-8000-00805f9b34fc';
const CHAR_MONIKER_UUID = '0000180d-0000-1000-8000-00805f9b34fd';
const CHAR_NODE_TYPE_UUID = '0000180d-0000-1000-8000-00805f9b34fe';
const CHAR_NODE_IP_UUID = '0000180d-0000-1000-8000-00805f9b34ff';
const CHAR_NODE_PORT_UUID = '0000180d-0000-1000-8000-00805f9b3500';
const CHAR_VPN_TYPE_UUID = '0000180d-0000-1000-8000-00805f9b3501';
const CHAR_VPN_PORT_UUID = '0000180d-0000-1000-8000-00805f9b3502';
const CHAR_MAX_PEERS_UUID = '0000180d-0000-1000-8000-00805f9b3503';

const isConnected = ref(BluetoothService.isConnected());
const deviceId = ref('');
const messages = ref<{ text: string; time: number }[]>([]);

// Initialize the node store
const nodeStore = useNodeStore();


const connectToBLE = async () =>
{
	await BluetoothService.connect();
	isConnected.value = BluetoothService.isConnected();
};

const disconnectFromBLE = async () =>
{
	await BluetoothService.disconnect();
	isConnected.value = BluetoothService.isConnected();
};

const sendHelloMessage = async () =>
{
	const message = 'Hello from client';
	
	if(await BluetoothService.sendHelloMessage(message))
	{
		messages.value.push({ text: `Sent: ${message}`, time: Date.now() });
		console.log('Message sent to the BLE server.');
	}
	else
	{
		console.error('Failed to send message to the BLE server.');
	}
};

const readFromServer = async () =>
{
	const message: string|null = await BluetoothService.readHelloFromServer();
	if(message)
	{
		messages.value.push({ text: `Received: message`, time: Date.now() });
		console.log(`Received: ${message}`);
	}
	else
		console.error('Failed to read message from the BLE server.')
};

const subscribeToServer = async () =>
{
	// Subscribe to the server
	const isSubscribed = await BluetoothService.subscribeToServer((value) =>
	{
		const message = `Received (subscription): ${new TextDecoder().decode(value)}`;
		messages.value.push({ text: message, time: Date.now() });
		console.log(message);
	});
	
	console.log(isSubscribed ? 'Subscribed to the BLE server.' : 'Failed to subscribe to the BLE server.');
};

/** MONIKER **/
const moniker = ref(nodeStore.moniker || '');
const monikerResponse = ref<string | null>(null);
const monikerResponseClass = ref<string | null>(null);
const sendMoniker = async () =>
{
	// Send to the server
	if(await BluetoothService.sendMoniker(moniker.value))
	{
		monikerResponse.value = `Moniker set to: ${moniker.value}`;
		monikerResponseClass.value = 'success';
		// Update in the store
		nodeStore.setMoniker(moniker.value);
		// Increase the apply counter to notify user that the changes are not applied
		nodeStore.increaseApplyCounter();
	}
	else
	{
		monikerResponse.value = `Failed to set moniker to: ${moniker.value}`;
		monikerResponseClass.value = 'error';
	}
};

/** NODE TYPE **/
const nodeType = ref(nodeStore.nodeType || '');
const nodeTypeResponse = ref<string | null>(null);
const nodeTypeResponseClass = ref<string | null>(null);
const sendNodeType = async () =>
{
	if(await BluetoothService.sendNodeType(nodeType.value))
	{
		nodeTypeResponse.value = `Node Type set to: ${nodeType.value}`;
		nodeTypeResponseClass.value = 'success';
		// Update in the store
		nodeStore.setNodeType(nodeType.value);
		// Increase the apply counter to notify user that the changes are not applied
		nodeStore.increaseApplyCounter();
	}
	else
	{
		nodeTypeResponse.value = `Failed to set Node Type to: ${nodeType.value}`;
		nodeTypeResponseClass.value = 'error';
	}
};

/** IP ADDRESS */
const nodeIp = ref(nodeStore.nodeIp || '');
const nodeIpResponse = ref<string | null>(null);
const nodeIpResponseClass = ref<string | null>(null);
const sendNodeIp = async () =>
{
	if(await BluetoothService.sendNodeIp(nodeIp.value))
	{
		nodeIpResponse.value = `IP Address set to: ${nodeIp.value}`;
		nodeIpResponseClass.value = 'success';
		// Update in the store
		nodeStore.setNodeIp(nodeIp.value);
		// Increase the apply counter to notify user that the changes are not applied
		nodeStore.increaseApplyCounter();
	}
	else
	{
		nodeIpResponse.value = `Failed to set IP Address to: ${nodeIp.value}`;
		nodeIpResponseClass.value = 'error';
	}
};

/** NODE PORT */
const nodePort = ref(nodeStore.nodePort.toString() || '');
const nodePortResponse = ref<string | null>(null);
const nodePortResponseClass = ref<string | null>(null);
const sendNodePort = async () =>
{
	if(await BluetoothService.sendNodePort(nodePort.value))
	{
		nodePortResponse.value = `Node Port set to: ${nodePort.value}`;
		nodePortResponseClass.value = 'success';
		// Update in the store
		nodeStore.setNodePort(parseInt(nodePort.value));
		// Increase the apply counter to notify user that the changes are not applied
		nodeStore.increaseApplyCounter();
	}
	else
	{
		nodePortResponse.value = `Failed to set Node Port to: ${nodePort.value}`;
		nodePortResponseClass.value = 'error';
	}
};

/** VPN TYPE */
const vpnType = ref(nodeStore.vpnType || '');
const vpnTypeResponse = ref<string | null>(null);
const vpnTypeResponseClass = ref<string | null>(null);
const sendVpnType = async () =>
{
	if(await BluetoothService.sendVpnType(vpnType.value))
	{
		vpnTypeResponse.value = `VPN Type set to: ${vpnType.value}`;
		vpnTypeResponseClass.value = 'success';
		// Update in the store
		nodeStore.setVpnType(vpnType.value);
		// Increase the apply counter to notify user that the changes are not applied
		nodeStore.increaseApplyCounter();
	}
	else
	{
		vpnTypeResponse.value = `Failed to set VPN Type to: ${vpnType.value}`;
		vpnTypeResponseClass.value = 'error';
	}
};

/** VPN PORT */
const vpnPort = ref(nodeStore.vpnPort.toString() || '');
const vpnPortResponse = ref<string | null>(null);
const vpnPortResponseClass = ref<string | null>(null);
const sendVpnPort = async () =>
{
	if(await BluetoothService.sendVpnPort(vpnPort.value))
	{
		vpnPortResponse.value = `VPN Port set to: ${vpnPort.value}`;
		vpnPortResponseClass.value = 'success';
		// Update in the store
		nodeStore.setVpnPort(parseInt(vpnPort.value));
		// Increase the apply counter to notify user that the changes are not applied
		nodeStore.increaseApplyCounter();
	}
	else
	{
		vpnPortResponse.value = `Failed to set VPN Port to: ${vpnPort.value}`;
		vpnPortResponseClass.value = 'error';
	}
};

/** MAXIMUM PEERS */
const maximumPeers = ref(nodeStore.maximumPeers.toString() || '');
const maximumPeersResponse = ref<string | null>(null);
const maximumPeersResponseClass = ref<string | null>(null);
const sendMaximumPeers = async () =>
{
	if(await BluetoothService.sendMaximumPeers(maximumPeers.value))
	{
		maximumPeersResponse.value = `Maximum Peers set to: ${maximumPeers.value}`;
		maximumPeersResponseClass.value = 'success';
		// Update in the store
		nodeStore.setMaximumPeers(parseInt(maximumPeers.value));
		// Increase the apply counter to notify user that the changes are not applied
		nodeStore.increaseApplyCounter();
	}
	else
	{
		maximumPeersResponse.value = `Failed to set Maximum Peers to: ${maximumPeers.value}`;
		maximumPeersResponseClass.value = 'error';
	}
};

/** APPLY NODE CONFIG */
const applyNodeConfig = async () =>
{
	if (isConnected.value && nodeStore.applyCounter > 0)
	{
		if(await BluetoothService.sendApplyNodeConfig())
		{
			console.log('Node configuration applied successfully.');
		}
		else
		{
			console.error('Failed to apply node configuration.');
		}
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
			<ion-button @click="connectToBLE" :disabled="isConnected">Connect</ion-button>
			<ion-button @click="disconnectFromBLE" :disabled="!isConnected">Disconnect</ion-button>
			<ion-button @click="sendHelloMessage" :disabled="!isConnected">Send Message</ion-button>
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
						<ion-select v-model="nodeType" :disabled="!isConnected">
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
							<ion-select v-model="vpnType" :disabled="!isConnected">
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
				<ion-row>
					<ion-col size="12">
						<ion-item>
							<ion-label position="stacked">VPN Port</ion-label>
							<ion-input v-model="vpnPort" type="number" placeholder="Enter VPN Port" :disabled="!isConnected" />
						</ion-item>
						<div class="input-line">
							<p class="button"><ion-button @click="sendVpnPort" :disabled="!isConnected">Set VPN Port</ion-button></p>
							<p :class="['label', 'ion-padding', vpnPortResponseClass]">{{ vpnPortResponse }}</p>
						</div>
					</ion-col>
				</ion-row>
				<ion-row>
					<ion-col size="12">
						<ion-item>
							<ion-label position="stacked">Maximum Peers</ion-label>
							<ion-input v-model="maximumPeers" type="number" placeholder="Enter Maximum Peers" :disabled="!isConnected" />
						</ion-item>
						<div class="input-line">
							<p class="button"><ion-button @click="sendMaximumPeers" :disabled="!isConnected">Set Maximum Peers</ion-button></p>
							<p :class="['label', 'ion-padding', maximumPeersResponseClass]">{{ maximumPeersResponse }}</p>
						</div>
					</ion-col>
				</ion-row>
				<ion-row>
					<ion-col size="12">
						<ion-button @click="applyNodeConfig" :disabled="!isConnected || nodeStore.applyCounter === 0">Apply Node Configuration ({{ nodeStore.applyCounter }})</ion-button>
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