<script setup lang="ts">
import { ref, computed } from 'vue';
import {
	IonButton, IonContent, IonHeader,
	IonItem, IonPage, IonIcon,
	IonTitle, IonToolbar, IonButtons,
	IonInput, IonSelect, IonSelectOption,
	IonSpinner, IonLabel,
	IonGrid, IonCol, IonRow,
} from '@ionic/vue';
import { shieldHalf } from 'ionicons/icons';
import { useNodeStore, type BandwidthSpeed } from '@stores/NodeStore';
import NetworkService from '@/services/NetworkService';
import {
	type NetworkPassphrase,
} from '@interfaces/network';
import BluetoothService from '@/services/BluetoothService';
import {
	refreshNodeStatus,
	refreshNodeBalance,
	refreshNodeAddress,
	refreshPublicAddress,
} from '@/utils/node';
import LoadingButton from '@components/LoadingButton.vue';

const isConnected = ref(NetworkService.isConnected());
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
 * This method first utilizes NetworkService to properly initialize the connection,
 * and then employs BluetoothService to perform a direct test of the connection.
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
	
	// Default Bluetooth Seed
	const defaultBluetoothSeed = "4580e70c-1dcc-4e46-bd59-33686502314a";
	
	// Connect to the BLE device
	if(await NetworkService.connect('bluetooth', {seed: defaultBluetoothSeed}))
	{
		// Load the node status
		const nodeStatus = await BluetoothService.readNodeStatus();
		console.log(`Node status: ${nodeStatus}`);
		// Load the node configuration
		const moniker = await BluetoothService.readMoniker();
		console.log(`Moniker: ${moniker}`);
		const nodeType = await BluetoothService.readNodeType();
		console.log(`Node Type: ${nodeType}`);
		const nodeIp = await BluetoothService.readNodeIp();
		console.log(`Node IP: ${nodeIp}`);
		const nodePort = await BluetoothService.readNodePort();
		console.log(`Node Port: ${nodePort}`);
		const vpnType = await BluetoothService.readVpnType();
		console.log(`VPN Type: ${vpnType}`);
		const vpnPort = await BluetoothService.readVpnPort();
		console.log(`VPN Port: ${vpnPort}`);
		const maximumPeers = await BluetoothService.readMaximumPeers();
		console.log(`Maximum Peers: ${maximumPeers}`);
		const nodeLocation = await BluetoothService.readNodeLocation();
		console.log(`Node Location: ${nodeLocation}`);
		const certExpiry = await BluetoothService.readCertExpirity();
		console.log(`Cert Expiry: ${certExpiry}`);
		const onlineUsers = await BluetoothService.readOnlineUsers();
		console.log(`Online Users: ${onlineUsers}`);
		const bandwidthSpeed: BandwidthSpeed|null = await BluetoothService.readBandwidthSpeed();
		console.log(`Bandwidth Speed: ${bandwidthSpeed?.upload} / ${bandwidthSpeed?.download}`);
		const systemUptime = await BluetoothService.readSystemUptime();
		console.log(`System Uptime: ${systemUptime}`);
		const casanodeVersion = await BluetoothService.readCasanodeVersion();
		console.log(`Casanode Version: ${casanodeVersion}`);
		const dockerImage = await BluetoothService.readDockerImage();
		console.log(`Docker Image: ${dockerImage}`);
		const systemOs = await BluetoothService.readSystemOs();
		console.log(`System OS: ${systemOs}`);
		const systemArch = await BluetoothService.readSystemArch();
		console.log(`System Arch: ${systemArch}`);
		const systemKernel = await BluetoothService.readSystemKernel();
		console.log(`System Kernel: ${systemKernel}`);
		
		// Get if passphrase is required/set
		const passphraseData: string = await BluetoothService.readNodePassphrase();
		const passphraseAvailable: NetworkPassphrase = {
			required: passphraseData[0] === '1',
			available: passphraseData[1] === '1',
		} as NetworkPassphrase;
		
		// Check if passphrase is required
		if (passphraseAvailable.required && !passphraseAvailable.available)
		{
			console.log('Passphrase is required.');
			passphraseFormOpen.value = true;
		}
		else
		{
			console.log(passphraseAvailable.required ? 'Passphrase is already set.' : 'Passphrase is already available.');
			loadNodeInformations();
			isConnected.value = true;
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
	nodeStore.resetStore();
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
	}
	else
	{
		maximumPeersResponse.value = `Failed to set Maximum Peers to: ${maximumPeers.value.toString()}`;
		maximumPeersResponseClass.value = 'error';
	}
};

const dockerInstallImage = async () =>
{
	if(await BluetoothService.installDockerImage() === 2)
	{
		console.log('Docker image installed successfully.');
	}
	else
	{
		console.error('Failed to install Docker image.');
	}
};

const installConfigs = async () =>
{
	if(await BluetoothService.installConfigs() === '111')
	{
		console.log('Docker configs installed successfully.');
	}
	else
	{
		console.error('Failed to install Docker configs.');
	}
};

const walletRestore = async () =>
{
	const mnemonic = 'winner note become voice inside number middle insect spy horror churn envelope island sweet hen happy knee interest flame soccer hospital uniform hood ice';
	if(await BluetoothService.writeWalletMnemonic(mnemonic))
	{
		console.log('Mnemonic sent to the BLE server.');
		// Load the node informations
		loadNodeInformations();
	}
	else
	{
		console.error('Failed to send mnemonic to the BLE server.');
	}
};

const walletRemove = async () =>
{
	if (await BluetoothService.performWalletAction('remove'))
	{
		console.log('Wallet removed successfully.');
		nodeStore.resetStore();
	}
	else 
	{
		console.error('Failed to remove wallet.');
	}
};

const walletKeyringBackend = async () =>
{
	const keyringBackend = await BluetoothService.readKeyringBackend();
	if(keyringBackend)
	{
		console.log(`Keyring backend: ${keyringBackend}`);
	}
	else
	{
		console.error('Failed to read keyring backend.');
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

const nodeBalance = async () =>
{
	const balance = await BluetoothService.fetchNodeBalance();
	if(balance)
	{
		console.log(`Wallet balance: ${balance}`);
	}
	else
	{
		console.error('Failed to read wallet balance.');
	}
};

const nodeLocation = async () =>
{
	const location = await BluetoothService.readNodeLocation();
	if(location)
	{
		console.log(`Node location: ${location}`);
	}
	else
	{
		console.error('Failed to read node location.');
	}
};

const statusNode = async () => 
{
	const status = await BluetoothService.readNodeStatus();
	if(status)
	{
		console.log(`Node status: ${status}`);
	}
	else
	{
		console.error('Failed to read node status.');
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

const checkCertificateExpirity = async () =>
{
	const certExpirity = await BluetoothService.readCertExpirity();
	if(certExpirity)
	{
		console.log(`Certificate expirity: ${certExpirity}`);
	}
	else
	{
		console.error('Failed to read certificate expirity.');
	}
};

const checkPort = (portType: "node" | "vpn") => async () =>
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

const onlineUsers = async () =>
{
	const users = await BluetoothService.readOnlineUsers();
	if(users !== null)
	{
		console.log(`Online users: ${users}`);
	}
	else
	{
		console.error('Failed to read online users.');
	}
};

const bandwidthSpeed = async () =>
{
	const speed = await BluetoothService.readBandwidthSpeed();
	if(speed)
	{
		console.log(`Bandwidth speed: ${speed.upload} / ${speed.download}`);
	}
	else
	{
		console.error('Failed to read bandwidth speed.');
	}
};

const systemUptime = async () =>
{
	const uptime = await BluetoothService.readSystemUptime();
	if(uptime)
	{
		console.log(`System uptime: ${uptime}`);
	}
	else
	{
		console.error('Failed to read system uptime.');
	}
};

const systemOs = async () =>
{
	const os = await BluetoothService.readSystemOs();
	if(os)
	{
		console.log(`System OS: ${os}`);
	}
	else
	{
		console.error('Failed to read system OS.');
	}
};

const systemArch = async () =>
{
	const arch = await BluetoothService.readSystemArch();
	if(arch)
	{
		console.log(`System Arch: ${arch}`);
	}
	else
	{
		console.error('Failed to read system arch.');
	}
};

const systemKernel = async () =>
{
	const kernel = await BluetoothService.readSystemKernel();
	if(kernel)
	{
		console.log(`System Kernel: ${kernel}`);
	}
	else
	{
		console.error('Failed to read system kernel.');
	}
};

const casanodeVersion = async () =>
{
	const version = await BluetoothService.readCasanodeVersion();
	if(version)
	{
		console.log(`Casanode version: ${version}`);
	}
	else
	{
		console.error('Failed to read casanode version.');
	}
};

const checkInstallation = async () =>
{
	const installation = await BluetoothService.readCheckInstallation();
	if(installation)
	{
		console.log(`Installation status: ${installation}`);
	}
	else
	{
		console.error('Failed to check installation status.');
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
			</ion-toolbar>
		</ion-header>
		<ion-content class="ion-padding">
			<ion-button @click="connectToBLE" :disabled="isConnected || passphraseFormOpen">
				<ion-spinner name="crescent" v-if="isLoading && !isConnected" />
				Connect
			</ion-button>
			<ion-button @click="disconnectFromBLE" :disabled="!isConnected && !passphraseFormOpen">Disconnect</ion-button>
			<ion-grid>
				<ion-row v-if="isConnected">
					<h1>Informations</h1>
				</ion-row>
				<ion-row>
					<ion-col size="12">
						<ion-item v-if="nodeStore.publicAddress">
							<ion-label>Public Address: {{ nodeStore.publicAddress }}</ion-label>
						</ion-item>
					</ion-col>
					<ion-col size="12">
						<ion-item v-if="nodeStore.nodeAddress">
							<ion-label>Node Address: {{ nodeStore.nodeAddress }}</ion-label>
						</ion-item>
					</ion-col>
					<ion-col size="12">
						<ion-item v-if="nodeStore.publicAddress">
							<ion-label>Balance: {{ nodeStore.nodeBalance.amount }} {{ nodeStore.nodeBalance.denom }}</ion-label>
						</ion-item>
					</ion-col>
					<ion-col size="12">
						<ion-item v-if="nodeStore.publicAddress">
							<ion-label>Status: {{ nodeStore.status }}</ion-label>
						</ion-item>
					</ion-col>
				</ion-row>
				<ion-row v-if="isConnected">
					<h1>Actions</h1>
				</ion-row>
				<ion-row v-if="isConnected">
					<ion-col size="12">
						<ion-label>
							<h2>Docker</h2>
						</ion-label>
						<ion-grid>
							<ion-row>
								<ion-col size="3">
									<loading-button label="Install Image" :callback="dockerInstallImage" />
								</ion-col>
								<ion-col size="3">
									<loading-button label="Install Config" :callback="installConfigs" />
								</ion-col>
							</ion-row>
						</ion-grid>
					</ion-col>
					<ion-col size="12">
						<ion-label>
							<h2>Wallet</h2>
						</ion-label>
						<ion-grid>
							<ion-row>
								<ion-col size="3">
									<loading-button label="Restore" :callback="walletRestore" />
								</ion-col>
								<ion-col size="3">
									<loading-button label="Remove" :callback="walletRemove" />
								</ion-col>
								<ion-col size="3">
									<loading-button label="Keyring Backend" :callback="walletKeyringBackend" />
								</ion-col>
							</ion-row>
						</ion-grid>
					</ion-col>
					<ion-col size="12">
						<ion-label>
							<h2>Node Actions</h2>
						</ion-label>
						<ion-grid>
							<ion-row>
								<ion-col size="3">
									<loading-button label="Start" :callback="startNode" />
								</ion-col>
								<ion-col size="3">
									<loading-button label="Stop" :callback="stopNode" />
								</ion-col>
								<ion-col size="3">
									<loading-button label="Restart" :callback="restartNode" />
								</ion-col>
								<ion-col size="3">
									<loading-button label="Remove" :callback="removeNode" />
								</ion-col>
							</ion-row>
							<ion-row>
								<ion-col size="3">
									<ion-button expand="block" @click="statusNode">Status</ion-button>
								</ion-col>
								<ion-col size="3">
									<loading-button label="Balance" :callback="nodeBalance" />
								</ion-col>
								<ion-col size="3">
									<loading-button label="Location" :callback="nodeLocation" />
								</ion-col>
							</ion-row>
						</ion-grid>
					</ion-col>
					<ion-col size="12">
						<ion-label>
							<h2>System Actions</h2>
						</ion-label>
						<ion-grid>
							<ion-row>
								<ion-col size="3">
									<loading-button label="Update" :callback="updateSystem" />
								</ion-col>
								<ion-col size="3">
									<loading-button label="Reset" :callback="resetSystem" />
								</ion-col>
								<ion-col size="3">
									<loading-button label="Reboot" :callback="rebootSystem" />
								</ion-col>
								<ion-col size="3">
									<loading-button label="Shutdown" :callback="shutdownSystem" />
								</ion-col>
							</ion-row>
						</ion-grid>
					</ion-col>
					<ion-col size="12">
						<ion-label>
							<h2>Certificate Actions</h2>
						</ion-label>
						<ion-grid>
							<ion-row>
								<ion-col size="3">
									<ion-button expand="block" @click="renewCertificate">Renew Certificate</ion-button>
								</ion-col>
								<ion-col size="3">
									<ion-button expand="block" @click="checkCertificateExpirity">Check Certificate Expirity</ion-button>
								</ion-col>
							</ion-row>
						</ion-grid>
					</ion-col>
					<ion-col size="12">
						<ion-label>
							<h2>Check Ports</h2>
						</ion-label>
						<ion-grid>
							<ion-row>
								<ion-col size="3">
									<ion-button expand="block" @click="checkPort('node')">Node</ion-button>
								</ion-col>
								<ion-col size="3">
									<ion-button expand="block" @click="checkPort('vpn')">VPN</ion-button>
								</ion-col>
							</ion-row>
						</ion-grid>
					</ion-col>
					<ion-col size="12">
						<ion-label>
							<h2>Informations</h2>
						</ion-label>
						<ion-grid>
							<ion-row>
								<ion-col size="3">
									<ion-button expand="block" @click="onlineUsers">Online Users</ion-button>
								</ion-col>
								<ion-col size="3">
									<ion-button expand="block" @click="bandwidthSpeed">Bandwidth Speed</ion-button>
								</ion-col>
								<ion-col size="3">
									<ion-button expand="block" @click="systemUptime">System Uptime</ion-button>
								</ion-col>
								<ion-col size="3">
									<ion-button expand="block" @click="systemOs">System OS</ion-button>
								</ion-col>
							</ion-row>
							<ion-row>
								<ion-col size="3">
									<ion-button expand="block" @click="systemArch">System Arch</ion-button>
								</ion-col>
								<ion-col size="3">
									<ion-button expand="block" @click="systemKernel">System Kernel</ion-button>
								</ion-col>
								<ion-col size="3">
									<ion-button expand="block" @click="casanodeVersion">Casanode Version</ion-button>
								</ion-col>
								<ion-col size="3">
									<ion-button expand="block" @click="checkInstallation">Check Installation</ion-button>
								</ion-col>
							</ion-row>
						</ion-grid>
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
								<ion-button @click="sendPassphrase" :disabled="passphraseInputValue.length < 8">
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
					<ion-col size="6">
						<ion-item>
						<ion-label position="stacked">Node Moniker</ion-label>
						<ion-input v-model="moniker" placeholder="Enter Moniker" :disabled="!isConnected" />
						</ion-item>
						<div class="input-line">
							<p class="button"><ion-button @click="sendMoniker" :disabled="!isConnected">Set Moniker</ion-button></p>
							<p :class="['label', 'ion-padding', monikerResponseClass]">{{ monikerResponse }}</p>
						</div>
					</ion-col>
					<ion-col size="6">
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
					<ion-col size="6">
						<ion-item>
							<ion-label position="stacked">IP Address</ion-label>
							<ion-input v-model="nodeIp" placeholder="Enter IP Address" :disabled="!isConnected" />
						</ion-item>
						<div class="input-line">
							<p class="button"><ion-button @click="sendNodeIp" :disabled="!isConnected">Set IP Address</ion-button></p>
							<p :class="['label', 'ion-padding', nodeIpResponseClass]">{{ nodeIpResponse }}</p>
						</div>
					</ion-col>
					<ion-col size="6">
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
					<ion-col size="6">
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
					<ion-col size="6">
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