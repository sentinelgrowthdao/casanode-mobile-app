import BluetoothService from '@services/BluetoothService';
import ApiService from '@services/ApiService';
import {
	type NetworkStatus,
	type NetworkConfiguration,
	type CertificateInfo,
	type NodeStatus,
	type NetworkInstallationCheck,
	type NetworkInstallConfiguration,
	type NodeConfigResults,
} from '@interfaces/network';
import { type NodeBalance } from '@stores/NodeStore';

class NetworkService
{
	private static instance: NetworkService;
	private useApi: boolean = true; // Switch between API and Bluetooth mode
	
	private constructor() {}
	
	public static getInstance(): NetworkService
	{
		if (!NetworkService.instance)
		{
			NetworkService.instance = new NetworkService();
		}
		return NetworkService.instance;
	}
	
	/**
	 * Connect to the network
	 * @param mode 'api' | 'bluetooth'
	 * @param data any
	 * @returns Promise<boolean>
	 */
	public async connect(mode: 'api' | 'bluetooth', data: any): Promise<boolean>
	{
		// Define the mode of connection
		this.useApi = mode === 'api';
		// Connect to the network (API or Bluetooth)
		if(this.useApi)
		{
			// Get the API token, IP, and port
			const ip = data.ip ?? '';
			const port = data.port ?? 0;
			const token = data.token ?? '';
			// Initialize the API service
			return ApiService.connect(ip, port, token);
		}
		else
		{
			// Get the Bluetooth characteristic seed
			const bleCharacteristicSeed = data.seed ?? '';
			// Connect to the Bluetooth device
			return await BluetoothService.connect(bleCharacteristicSeed);
		}
	}
	
	/**
	 * Disconnect from the network
	 * @returns Promise<void>
	 */
	public async disconnect(): Promise<void>
	{
		if(this.useApi)
		{
			// Remove the API token and URL
			await ApiService.disconnect();
		}
		else
		{
			// Disconnect from the Bluetooth device
			await BluetoothService.disconnect();
		}
	}
	
	/**
	 * Check if the user is connected to the network
	 * @returns boolean
	 */
	public isConnected(): boolean
	{
		return this.useApi ? ApiService.isConnected() : BluetoothService.isConnected();
	}
	
	/**
	 * Read the discovery information from the BLE device.
	 * @returns Promise<string | null>
	 */
	public async readDiscoveryInfos(): Promise<string | null>
	{
		return this.useApi === false ? await BluetoothService.readDiscoveryInfos() : null;
	}
	
	/**
	 * Get the bluetooth UUID.
	 * @returns Promise<string | null>
	 */
	public async getBleUuid(): Promise<string | null>
	{
		return this.useApi === false ? BluetoothService.getBleUuid() : null;
	}
	
	/**
	 * Get network status either via API
	 * @returns Promise<string>
	 */
	public async getNodeStatus(): Promise<string>
	{
		if(this.useApi)
			return await ApiService.getNodeStatus();
		else
		{
			return await BluetoothService.readNodeStatus() ?? 'unknown';
		}
	}
	
	/**
	 * Get node status either via API or Bluetooth
	 * @returns Promise<any>
	 */
	public async getStatus(): Promise<NetworkStatus>
	{
		if(this.useApi)
		{
			return await ApiService.getStatus();
		}
		else
		{
			const systemUptime = await BluetoothService.readSystemUptime();
			const casanodeVersion = await BluetoothService.readCasanodeVersion();
			const systemOs = await BluetoothService.readSystemOs();
			const systemArch = await BluetoothService.readSystemArch();
			const systemKernel = await BluetoothService.readSystemKernel();
			const nodeLocation = await BluetoothService.readNodeLocation();
			const certExpiry = await BluetoothService.readCertExpirity();
			const nodeType = await BluetoothService.readNodeType();
			const bandwidthSpeed = await BluetoothService.readBandwidthSpeed();
			const onlineUsers = await BluetoothService.readOnlineUsers();
			const maximumPeers = await BluetoothService.readMaximumPeers();
			
			return {
				version: casanodeVersion ?? null,
				uptime: systemUptime ?? null,
				nodeLocation: nodeLocation ?? null,
				systemArch: systemArch ?? null,
				systemKernel: systemKernel ?? null,
				systemOs: systemOs ?? null,
				status:
				{
					type: isNaN(Number(nodeType)) ? null : Number(nodeType),
					version: null,
					bandwidth: {
						download: bandwidthSpeed?.download || 'N/A',
						upload: bandwidthSpeed?.upload || 'N/A',
					},
					handshake: {
						enable: null,
						peers: null,
					},
					location: {
						city: null,
						country: null,
						latitude: null,
						longitude: null,
					},
					peers: onlineUsers ?? null,
					max_peers: maximumPeers ?? null,
				},
				certificate:
				{
					creationDate: null,
					expirationDate: certExpiry ?? null,
					issuer: null,
					subject: null,
				},
			};
		}
	}
	
	/**
	 * Get node configuration
	 * @returns Promise<any>
	 */
	public async getNodeConfiguration(): Promise<NetworkConfiguration>
	{
		if(this.useApi)
		{
			return await ApiService.getNodeConfiguration();
		}
		else
		{
			const moniker = await BluetoothService.readMoniker();
			const backend = await BluetoothService.readKeyringBackend();
			const nodeType = await BluetoothService.readNodeType();
			const nodeIp = await BluetoothService.readNodeIp();
			const nodePort = await BluetoothService.readNodePort();
			const vpnType = await BluetoothService.readVpnType();
			const vpnPort = await BluetoothService.readVpnPort();
			const maximumPeers = await BluetoothService.readMaximumPeers();
			const dockerImage = await BluetoothService.readDockerImage();
			
			return {
				moniker: moniker ?? null,
				backend: backend ?? null,
				nodeType: nodeType ?? null,
				nodeIp: nodeIp ?? null,
				nodePort: nodePort ?? null,
				vpnType: vpnType ?? null,
				vpnPort: vpnPort ?? null,
				maximumPeers: maximumPeers ?? null,
				dockerImage: dockerImage ?? null,
			} as NetworkConfiguration;
		}
	}
	
	
	
	/**
	 * Set the node configuration
	 * @param configData any
	 * @returns Promise<NodeConfigResults>
	 */
	public async setNodeConfiguration(configData: any): Promise<NodeConfigResults>
	{
		if(this.useApi)
		{
			// Apply the configuration via the API
			return await ApiService.setNodeConfiguration(configData);
		}
		else
		{
			const results: NodeConfigResults = {};
			
			// Check if moniker is set then write it to the device
			if(configData.moniker)
				results['moniker'] = await BluetoothService.writeMoniker(configData.moniker);
			
			// Check if keyring backend is set then write it to the device
			if(configData.backend)
				results['backend'] = await BluetoothService.writeKeyringBackend(configData.backend);
			
			// Check if node type is set then write it to the device
			if(configData.nodeType)
				results['nodeType'] = await BluetoothService.writeNodeType(configData.nodeType);
			
			// Check if node IP is set then write it to the device
			if(configData.nodeIp)
				results['nodeIp'] = await BluetoothService.writeNodeIp(configData.nodeIp);
			
			// Check if node port is set then write it to the device
			if(configData.nodePort)
				results['nodePort'] = await BluetoothService.writeNodePort(configData.nodePort);
			
			// Check if VPN type is set then write it to the device
			if(configData.vpnType)
				results['vpnType'] = await BluetoothService.writeVpnType(configData.vpnType);
			
			// Check if VPN port is set then write it to the device
			if(configData.vpnPort)
				results['vpnPort'] = await BluetoothService.writeVpnPort(configData.vpnPort);
			
			// Check if maximum peers is set then write it to the device
			if(configData.maximumPeers)
				results['maximumPeers'] = await BluetoothService.writeMaximumPeers(configData.maximumPeers);
			
			// Apply the configuration
			await BluetoothService.writeNodeConfig();
			
			// If vpnType changed
			if(typeof(results['vpnType']) !== 'undefined' && results['vpnType'])
			{
				// Apply the VPN configuration
				await BluetoothService.readChangeVpnType();
			}
			
			// Return the results
			return results;
		}
	}
	
	
	/**
	 * Get the node address
	 * @returns Promise<string|null>
	 */
	public async getNodeAddress(): Promise<string|null>
	{
		if(this.useApi)
		{
			return await ApiService.getNodeAddress();
		}
		else
		{
			const address = await BluetoothService.readNodeAddress();
			return address ?? null;
		}
	}
	
	/**
	 * Get the wallet address
	 * @returns Promise<string|null>
	 */
	public async getWalletAddress(): Promise<string|null>
	{
		if(this.useApi)
		{
			return await ApiService.getWalletAddress();
		}
		else
		{
			const address = await BluetoothService.readPublicAddress();
			return address ?? null;
		}
	}
	
	/**
	 * Get the node balance
	 * @returns Promise<NodeBalance|null>
	 */
	public async getNodeBalance(): Promise<NodeBalance|null>
	{
		let balance: string|null = '';
		
		if(this.useApi)
		{
			balance = await ApiService.getNodeBalance();
		}
		else
			balance = await BluetoothService.fetchNodeBalance();
		
		// Check if the balance is valid
		if(balance)
		{
			// Regex to match a string that starts with a number followed by a space and a currency code
			const balanceRegex = /^(\d+(\.\d+)?)\s([A-Za-z]+)$/;
			// Check if the result is a valid balance format
			const match = balance.match(balanceRegex);
			// Check if the match is valid
			if (match)
			{
				// Extract the amount and denom from the match
				const balance = match.slice(1, 3);
				// Return the balance as an object
				return {
					amount: parseFloat(balance[0]),
					denom: balance[2],
				} as NodeBalance;
			}
		}
		
		return null;
	}
	
	/**
	 * Check installation status
	 * @returns Promise<NetworkInstallationCheck>
	 */
	public async checkInstallation(): Promise<NetworkInstallationCheck>
	{
		if(this.useApi)
		{
			return await ApiService.checkInstallation();
		}
		else
		{
			const data = await BluetoothService.readCheckInstallation();
			
			return {
				image: data[0] === '1',
				containerExists: data[1] === '1',
				nodeConfig: data[2] === '1',
				vpnConfig: data[3] === '1',
				certificateKey: data[4] === '1',
				wallet: data[5] === '1',
			} as NetworkInstallationCheck;
		}
	}
	
	/**
	 * Install the docker image
	 * @returns Promise<number>
	 */
	public async installDockerImage(): Promise<number>
	{
		if(this.useApi)
		{
			const data = await ApiService.installDockerImage();
			return data.imagePull ? 1 : -1;
		}
		else
		{
			return await BluetoothService.installDockerImage();
		}
	}
	
	/**
	 * Install the node configuration
	 * @returns Promise<NetworkInstallConfiguration>
	 */
	public async installNodeConfiguration(): Promise<NetworkInstallConfiguration>
	{
		if(this.useApi)
		{
			return await ApiService.installNodeConfiguration();
		}
		else
		{
			const data = await BluetoothService.installConfigs();
			
			return {
				nodeConfig: data[0] === '1',
				vpnConfig: data[1] === '1',
				certificate: data[2] === '1',
			} as NetworkInstallConfiguration;
		}
	}
	
	/**
	 * Check if the node passphrase is available
	 * @returns Promise<boolean>
	 */
	public async nodePassphrase(): Promise<boolean>
	{
		return this.useApi ? await ApiService.nodePassphrase() : BluetoothService.readNodePassphrase();
	}
	
	/**
	 * Set the passphrase
	 * @param passphrase string
	 * @returns Promise<boolean>
	 */
	public async setNodePassphrase(passphrase: string): Promise<boolean>
	{
		if(this.useApi)
		{
			return await ApiService.setPassphrase(passphrase);
		}
		else
		{
			// Bluetooth logic (placeholder)
			return await BluetoothService.writeNodePassphrase(passphrase);
		}
	}
	
	/**
	 * Get the keyring backend
	 * @returns Promise<string|null>
	 */
	public async getKeyringBackend(): Promise<string|null>
	{
		if(this.useApi)
		{
			const data = await ApiService.getNodeConfiguration();
			return data.backend;
		}
		else
		{
			return await BluetoothService.readKeyringBackend();
		}
	}
	
	/**
	 * Start the node
	 * @returns Promise<boolean>
	 */
	public async startNode(): Promise<boolean>
	{
		return this.useApi ? await ApiService.startNode() : await BluetoothService.startNode();
	}
	
	/**
	 * Stop the node
	 * @returns Promise<boolean>
	 */
	public async stopNode(): Promise<boolean>
	{
		return this.useApi ? await ApiService.stopNode() : await BluetoothService.stopNode();
	}
	
	/**
	 * Restart the node
	 * @returns Promise<boolean>
	 */
	public async restartNode(): Promise<boolean>
	{
		return this.useApi ? await ApiService.restartNode() : await BluetoothService.restartNode();
	}
	
	/**
	 * Renew SSL certificate
	 * @returns Promise<boolean>
	 */
	public async renewCertificate(): Promise<boolean>
	{
		return this.useApi ? await ApiService.renewCertificate() : await BluetoothService.renewCertificate();
	}
	
	/**
	 * Update system (either 'system' or 'sentinel')
	 * @param target 'system' | 'sentinel'
	 * @returns Promise<boolean>
	 */
	public async updateSystem(target: 'system' | 'sentinel'): Promise<boolean>
	{
		if(this.useApi)
		{
			return await ApiService.updateSystem(target);
		}
		else
		{
			if(target === 'system')
				return await BluetoothService.updateSystem();
			else if(target === 'sentinel')
				return await BluetoothService.updateSentinel();
		}
		
		return false;
	}
	
	/**
	 * Reboot the system
	 * @returns Promise<boolean>
	 */
	public async rebootSystem(): Promise<boolean>
	{
		return this.useApi ? await ApiService.rebootSystem() : await BluetoothService.rebootSystem();
	}
	
	/**
	 * Halt the system
	 * @returns Promise<boolean>
	 */
	public async shutdownSystem(): Promise<boolean>
	{
		return this.useApi ? await ApiService.shutdownSystem() : await BluetoothService.shutdownSystem();
	}
	
	/**
	 * Reset the system
	 * @returns Promise<boolean>
	 */
	public async resetSystem(): Promise<boolean>
	{
		return this.useApi ? await ApiService.resetSystem() : await BluetoothService.resetSystem();
	}
	
	/**
	 * Create a new wallet and return mnemonic
	 * @returns Promise<string|null>
	 */
	public async createWallet(): Promise<string|null>
	{
		if(this.useApi)
		{
			// Create a wallet and return the mnemonic
			return await ApiService.createWallet();
		}
		else
		{
			// Create a wallet via Bluetooth
			if(await BluetoothService.performWalletAction('create'))
			{
				// Read the mnemonic from the Bluetooth device
				return await BluetoothService.readMnemonic();
			}
		}
		// Return null if the wallet creation failed
		return null;
	}
	
	/**
	 * Restore a wallet
	 * @param mnemonic string
	 * @returns Promise<boolean>
	 */
	public async restoreWallet(mnemonic: string): Promise<boolean>
	{
		if(this.useApi)
		{
			return await ApiService.restoreWallet(mnemonic);
		}
		else
		{
			// Write mnemonic to the Bluetooth device and restore the wallet
			return await BluetoothService.writeMnemonic(mnemonic) && await BluetoothService.performWalletAction('restore')
		}
	}
	
	/**
	 * Remove the wallet
	 * @returns Promise<boolean>
	 */
	public async removeWallet(): Promise<boolean>
	{
		return this.useApi ? await ApiService.removeWallet() : await BluetoothService.performWalletAction('remove');
	}
	
	/**
	 * Check the port status (node or vpn)
	 * @param portType 'node' | 'vpn'
	 * @returns Promise<string|null>
	 */
	public async checkPort(portType: 'node' | 'vpn'): Promise<string|null>
	{
		return this.useApi ? await ApiService.checkPort(portType) : await BluetoothService.checkPort(portType);
	}
	
}

export default NetworkService.getInstance();
