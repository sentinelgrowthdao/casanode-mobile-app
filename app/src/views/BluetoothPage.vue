<script setup lang="ts">
import { ref, computed } from 'vue';
import {
	IonButton, IonContent, IonHeader,
	IonItem, IonPage, IonIcon,
	IonTitle, IonToolbar,
	IonInput, IonSelect,
	IonSpinner, IonLabel,
	IonGrid, IonCol, IonRow,
} from '@ionic/vue';
import { shieldHalf } from 'ionicons/icons';
import { useNodeStore, type BandwidthSpeed } from '@stores/NodeStore';
import BluetoothService from '@/services/BluetoothService';
import {
	refreshNodeStatus,
	refreshNodeBalance,
	refreshNodeAddress,
	refreshPublicAddress,
} from '@/utils/node';
import LoadingButton from '@components/LoadingButton.vue';

const isConnected = ref(BluetoothService.isConnected());
const messages = ref<{ text: string; time: number }[]>([]);
const passphraseFormOpen = ref(false);
const passphraseInputValue = ref('');
const passphraseErrorMessage = ref('');
const isPassphraseLoading = ref(false);

// Initialize the node store
const nodeStore = useNodeStore();

// Initialize the loading state
const isLoading = ref(false);

/**
 * Function to load the node informations
 * @returns void
 */
async function loadNodeInformations(): Promise<void>
{
	// Get the public address
	await refreshPublicAddress();
	// Get the node address
	await refreshNodeAddress();
	// Get the node status
	await refreshNodeStatus();
	// Get the node balance
	await refreshNodeBalance();
}

/**
 * Function to send the passphrase to the BLE device
 * @returns void
 */
const sendPassphrase = async () =>
{
	// Reset the error message
	passphraseErrorMessage.value = '';
	// Update the loading state
	isPassphraseLoading.value = true;
	// Get the passphrase
	const passphrase = passphraseInputValue.value.trim();
	// Send the passphrase to the BLE device
	if(await BluetoothService.writeNodePassphrase(passphrase))
	{
		// Load the node informations
		await loadNodeInformations();
		// Stop the passphrase loading
		isPassphraseLoading.value = false;
		// Close the passphrase form
		passphraseFormOpen.value = false;
		// Update the connected status
		isConnected.value = true;
	}
	else
	{
		// Stop the passphrase loading
		isPassphraseLoading.value = false;
		// Show the error message
		passphraseErrorMessage.value = 'Passphrase is incorrect.';
	}
};

/**
 * Function to connect to the BLE device
 * @returns void
 */
const connectToBLE = async () =>
{
	if(isConnected.value)
	{
		console.log('Already connected to the BLE device.');
		return;
	}
	
	// Update the loading state
	isLoading.value = true;

	// Default Bluetooth ID
	const defaultBluetoothId = "0000180d-0000-1000-8000";
	
	// Connect to the BLE device
	if(await BluetoothService.connect(defaultBluetoothId))
	{
		// Load the node status
		const nodeStatus = await BluetoothService.readNodeStatus();
		// Load the node configuration
		const moniker = await BluetoothService.readMoniker();
		const nodeType = await BluetoothService.readNodeType();
		const nodeIp = await BluetoothService.readNodeIp();
		const nodePort = await BluetoothService.readNodePort();
		const vpnType = await BluetoothService.readVpnType();
		const vpnPort = await BluetoothService.readVpnPort();
		const maximumPeers = await BluetoothService.readMaximumPeers();
		const nodeLocation = await BluetoothService.readNodeLocation();
		const certExpiry = await BluetoothService.readCertExpiry();
		const onlineUsers = await BluetoothService.readOnlineUsers();
		const bandwidthSpeed: BandwidthSpeed|null = await BluetoothService.readBandwidthSpeed();
		const systemUptime = await BluetoothService.readSystemUptime();
		const casanodeVersion = await BluetoothService.readCasanodeVersion();
		const dockerImage = await BluetoothService.readDockerImage();
		const systemOs = await BluetoothService.readSystemOs();
		const systemArch = await BluetoothService.readSystemArch();
		const systemKernel = await BluetoothService.readSystemKernel();
		
		// Get if passphrase is required/set
		const passphraseAvailable = await BluetoothService.readNodePassphrase();
		
		// If all the passphrase is already available
		if(passphraseAvailable)
		{
			console.log('Passphrase is already available.');
			// Close the passphrase form
			passphraseFormOpen.value = false;
			// Load the node informations
			loadNodeInformations();
			// Update the connected status
			isConnected.value = true;
		}
		else
		{
			console.log('Passphrase is required before loading the node informations.');
			// Open the passphrase form
			passphraseFormOpen.value = true;
		}
		
		// Update the loading state
		isLoading.value = false;
		
		// Update the store
		nodeStore.setNodeStatus(nodeStatus || '');
		nodeStore.setMoniker(moniker || '');
		nodeStore.setNodeType(nodeType || '');
		nodeStore.setNodeIp(nodeIp || '');
		nodeStore.setNodePort(nodePort || 0);
		nodeStore.setVpnType(vpnType || '');
		nodeStore.setVpnPort(vpnPort || 0);
		nodeStore.setMaximumPeers(maximumPeers || 0);
		nodeStore.setNodeLocation(nodeLocation || '');
		nodeStore.setCertExpiry(certExpiry || '');
		nodeStore.setOnlineUsers(onlineUsers || 0);
		nodeStore.setBandwidthSpeed(bandwidthSpeed?.upload || 'N/A', bandwidthSpeed?.download || 'N/A');
		nodeStore.setSystemUptime(systemUptime || -1);
		nodeStore.setCasanodeVersion(casanodeVersion || '');
		nodeStore.setDockerImage(dockerImage || '');
		nodeStore.setSystemOs(systemOs || '');
		nodeStore.setSystemArch(systemArch || '');
		nodeStore.setSystemKernel(systemKernel || '');
	}
	else
	{
		// Update the loading state
		isLoading.value = false;
		console.error('Failed to connect to the BLE device.');
	}
};

/**
 * Function to disconnect from the BLE device
 * @returns void
 */
const disconnectFromBLE = async () =>
{
	await BluetoothService.disconnect();
	isConnected.value = BluetoothService.isConnected();
	passphraseFormOpen.value = false;
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

// Define computed properties and methods for the node configuration
const moniker = computed({
	get: () => nodeStore.moniker,
set: (value: string) => nodeStore.setMoniker(value),
});
const nodeType = computed({
	get: () => nodeStore.nodeType,
	set: (value: string) => nodeStore.setNodeType(value),
});

const nodeIp = computed({
	get: () => nodeStore.nodeIp,
	set: (value: string) => nodeStore.setNodeIp(value),
});

const nodePort = computed({
	get: () => nodeStore.nodePort,
	set: (value: number) => nodeStore.setNodePort(value),
});

const vpnType = computed({
	get: () => nodeStore.vpnType,
	set: (value: string) => nodeStore.setVpnType(value),
});

const vpnPort = computed({
	get: () => nodeStore.vpnPort,
	set: (value: number) => nodeStore.setVpnPort(value),
});

const maximumPeers = computed({
	get: () => nodeStore.maximumPeers,
	set: (value: number) => nodeStore.setMaximumPeers(value),
});


/** MONIKER **/
const monikerResponse = ref<string | null>(null);
const monikerResponseClass = ref<string | null>(null);
const sendMoniker = async () =>
{
	// Send to the server
	if(await BluetoothService.writeMoniker(moniker.value))
	{
		monikerResponse.value = `Moniker set to: ${moniker.value}`;
		monikerResponseClass.value = 'success';
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
const nodeTypeResponse = ref<string | null>(null);
const nodeTypeResponseClass = ref<string | null>(null);
const sendNodeType = async () =>
{
	if(await BluetoothService.writeNodeType(nodeType.value))
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
const nodeIpResponse = ref<string | null>(null);
const nodeIpResponseClass = ref<string | null>(null);
const sendNodeIp = async () =>
{
	if(await BluetoothService.writeNodeIp(nodeIp.value))
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
const nodePortResponse = ref<string | null>(null);
const nodePortResponseClass = ref<string | null>(null);
const sendNodePort = async () =>
{
	if(await BluetoothService.writeNodePort(nodePort.value.toString()))
	{
		nodePortResponse.value = `Node Port set to: ${nodePort.value}`;
		nodePortResponseClass.value = 'success';
		// Update in the store
		nodeStore.setNodePort(parseInt(nodePort.value.toString()));
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
const vpnTypeResponse = ref<string | null>(null);
const vpnTypeResponseClass = ref<string | null>(null);
const sendVpnType = async () =>
{
	if(await BluetoothService.writeVpnType(vpnType.value))
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
const vpnPortResponse = ref<string | null>(null);
const vpnPortResponseClass = ref<string | null>(null);
const sendVpnPort = async () =>
{
	if(await BluetoothService.writeVpnPort(vpnPort.value.toString()))
	{
		vpnPortResponse.value = `VPN Port set to: ${vpnPort.value}`;
		vpnPortResponseClass.value = 'success';
		// Update in the store
		nodeStore.setVpnPort(parseInt(vpnPort.value.toString()));
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
const maximumPeersResponse = ref<string | null>(null);
const maximumPeersResponseClass = ref<string | null>(null);
const sendMaximumPeers = async () =>
{
	if(await BluetoothService.writeMaximumPeers(maximumPeers.value.toString()))
	{
		maximumPeersResponse.value = `Maximum Peers set to: ${maximumPeers.value.toString()}`;
		maximumPeersResponseClass.value = 'success';
		// Update in the store
		nodeStore.setMaximumPeers(maximumPeers.value);
		// Increase the apply counter to notify user that the changes are not applied
		nodeStore.increaseApplyCounter();
	}
	else
	{
		maximumPeersResponse.value = `Failed to set Maximum Peers to: ${maximumPeers.value.toString()}`;
		maximumPeersResponseClass.value = 'error';
	}
};

/** APPLY NODE CONFIG */
const applyNodeConfig = async () =>
{
	if (isConnected.value && nodeStore.applyCounter > 0)
	{
		if(await BluetoothService.writeNodeConfig())
		{
			console.log('Node configuration applied successfully.');
			// Reset the apply counter
			nodeStore.resetApplyCounter();
			// Remove input responses
			monikerResponse.value = null;
			nodeTypeResponse.value = null;
			nodeIpResponse.value = null;
			nodePortResponse.value = null;
			vpnTypeResponse.value = null;
			vpnPortResponse.value = null;
			maximumPeersResponse.value = null;
		}
		else
		{
			console.error('Failed to apply node configuration.');
		}
	}
};

const sendMnemonic = async () =>
{
	const mnemonic = 'winner note become voice inside number middle insect spy horror churn envelope island sweet hen happy knee interest flame soccer hospital uniform hood ice';
	if(await BluetoothService.writeMnemonic(mnemonic))
	{
		console.log('Mnemonic sent to the BLE server.');
	}
	else
	{
		console.error('Failed to send mnemonic to the BLE server.');
	}
};

const readMnemonic = async () =>
{
	const mnemonic = await BluetoothService.readMnemonic();
	if(mnemonic)
	{
		console.log(`Mnemonic received from the BLE server: ${mnemonic}`);
	}
	else
	{
		console.error('Failed to read mnemonic from the BLE server.');
	}
};

const startNode = async () => 
{
	if(await BluetoothService.startNode())
	{
		console.log('Node started successfully.');
	}
	else
	{
		console.error('Failed to start the node.');
	}
};
const stopNode = async () => 
{
	if(await BluetoothService.stopNode())
	{
		console.log('Node stopped successfully.');
	}
	else
	{
		console.error('Failed to stop the node.');
	}
};
const restartNode = async () => 
{
	if(await BluetoothService.restartNode())
	{
		console.log('Node restarted successfully.');
	}
	else
	{
		console.error('Failed to restart the node.');
	}
};
const removeNode = async () => 
{
	if(await BluetoothService.removeNode())
	{
		console.log('Node removed successfully.');
	}
	else
	{
		console.error('Failed to remove the node.');
	}
};

const updateSystem = async () => 
{
	if(await BluetoothService.updateSystem())
	{
		console.log('System updated successfully.');
	}
	else
	{
		console.error('Failed to update the system.');
	}
};
const resetSystem = async () => 
{
	if(await BluetoothService.resetSystem())
	{
		console.log('System reset successfully.');
	}
	else
	{
		console.error('Failed to reset the system.');
	}
};
const rebootSystem = async () => 
{
	if(await BluetoothService.rebootSystem())
	{
		console.log('System rebooted successfully.');
	}
	else
	{
		console.error('Failed to reboot the system.');
	}
};
const shutdownSystem = async () => 
{
	if(await BluetoothService.shutdownSystem())
	{
		console.log('System shutdown successfully.');
	}
	else
	{
		console.error('Failed to shutdown the system.');
	}
};

const renewCertificate = async () =>
{
	if(await BluetoothService.renewCertificate())
	{
		console.log('Certificate renewed successfully.');
	}
	else
	{
		console.error('Failed to renew the certificate.');
	}
};

const checkPort = (portType: string) => async () =>
{
	if(await BluetoothService.checkPort(portType) === 'open')
	{
		console.log(`Port ${portType} is open.`);
	}
	else
	{
		console.error(`Port ${portType} is closed.`);
	}
};

</script>

<template>
	<ion-page>
		<ion-header>
			<ion-toolbar>
				<ion-title>Connect to BLE</ion-title>
				<ion-buttons slot="start">
					<ion-button expand="block" :router-link="{ name: 'NodeDashboard' }"
						router-direction="forward" fill="clear">
						<ion-icon :icon="shieldHalf" />
					</ion-button>
				</ion-buttons>
				<ion-buttons slot="end">
					<ion-button @click="applyNodeConfig" :disabled="!isConnected || nodeStore.applyCounter === 0">Apply ({{ nodeStore.applyCounter }})</ion-button>
				</ion-buttons>
			</ion-toolbar>
		</ion-header>
		<ion-content class="ion-padding">
			<ion-button @click="connectToBLE" :disabled="isConnected || passphraseFormOpen">
				<ion-spinner name="crescent" v-if="isLoading && !isConnected" />
				Connect
			</ion-button>
			<ion-button @click="disconnectFromBLE" :disabled="!isConnected && !passphraseFormOpen">Disconnect</ion-button>
			<!-- <ion-button @click="sendHelloMessage" :disabled="!isConnected">Send Message</ion-button>
			<ion-button @click="readFromServer" :disabled="!isConnected">Read from Server</ion-button>
			<ion-button @click="subscribeToServer" :disabled="!isConnected">Subscribe to Server</ion-button> -->
			<!-- <ion-list>
				<ion-item v-for="msg in messages" :key="msg.time">
					{{ msg.text }}
				</ion-item>
			</ion-list> -->
			<ion-grid>
				<ion-row v-if="isConnected">
					<ion-col size="12">
						<ion-label>
							<h2>Wallet Mnemonic</h2>
						</ion-label>
						<ion-item>
							<ion-button @click="sendMnemonic">Send Mnemonic</ion-button>
							<ion-button @click="readMnemonic">Read Mnemonic</ion-button>
						</ion-item>
					</ion-col>
					<ion-col size="12">
						<ion-label>
							<h2>Node Actions</h2>
						</ion-label>
						<ion-item>
							<loading-button label="Start" :callback="startNode" />
							<loading-button label="Stop" :callback="stopNode" />
							<loading-button label="Restart" :callback="restartNode" />
							<loading-button label="Remove" :callback="removeNode" />
						</ion-item>
					</ion-col>
					<ion-col size="12">
						<ion-label>
							<h2>System Actions</h2>
						</ion-label>
						<ion-item>
							<loading-button label="Update" :callback="updateSystem" />
							<loading-button label="Reset" :callback="resetSystem" />
							<loading-button label="Reboot" :callback="rebootSystem" />
							<loading-button label="Shutdown" :callback="shutdownSystem" />
						</ion-item>
					</ion-col>
					<ion-col size="12">
						<ion-label>
							<h2>Certificate Actions</h2>
						</ion-label>
						<ion-item>
							<loading-button label="Renew Certificate" :callback="renewCertificate" />
						</ion-item>
					</ion-col>
					<ion-col size="12">
						<ion-label>
							<h2>Check Ports</h2>
						</ion-label>
						<ion-item>
							<loading-button label="Node" :callback="checkPort('node')" />
							<loading-button label="VPN" :callback="checkPort('vpn')" />
						</ion-item>
					</ion-col>
				</ion-row>
				
				<ion-row v-if="passphraseFormOpen">
					<ion-col size="12">
						<ion-item>
							<ion-label position="stacked">Please enter wallet passphrase</ion-label>
							<ion-input type="password" placeholder="Enter passphrase" v-model="passphraseInputValue" />
						</ion-item>
						<div class="input-line">
							<p class="button">
								<ion-button @click="sendPassphrase" :disabled="passphraseInputValue.length === 0">
									<ion-spinner name="crescent" v-if="isPassphraseLoading && !isConnected" />
									Send Passphrase
								</ion-button>
							</p>
							<p v-if="passphraseErrorMessage.length > 0" :class="['label', 'ion-padding', 'error']">{{ passphraseErrorMessage }}</p>
						</div>
					</ion-col>
				</ion-row>
				<ion-row v-if="isConnected">
					<h1>Configuration</h1>
				</ion-row>
				<ion-row v-if="isConnected">
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
				<ion-row v-if="isConnected">
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
				<ion-row v-if="isConnected">
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
				<ion-row v-if="isConnected">
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
				<ion-row v-if="isConnected">
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
				<ion-row v-if="isConnected">
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
				<ion-row v-if="isConnected">
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
ion-spinner
{
	width: 1rem;
	height: 1rem;
	margin-right: 0.5rem;
}
</style>