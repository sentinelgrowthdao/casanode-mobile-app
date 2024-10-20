import { defineStore } from 'pinia';


export interface BandwidthSpeed
{
	upload: string;
	download: string;
}

export interface NodeBalance
{
	amount: number;
	denom: string;
}

const initialState = {
	
	// Counter of modified configurations to be applied
	applyCounter: 0,
	
	// Node Status
	status: 'unknown',
	onlineUsers: 0,
	
	// Node Information
	nodeIp: '',
	nodeLocation: '',
	nodePort: -1,
	vpnPort: -1,
	certExpiry: '',
	uploadSpeed: '',
	downloadSpeed: '',
	
	// Node Settings
	moniker: '',
	nodeType: '',
	
	// VPN Settings
	vpnType: '',
	maximumPeers: 0,
	
	// Wallet
	nodeBalance: {
		amount: 0,
		denom: ''
	} as NodeBalance,
	publicAddress: '',
	nodeAddress: '',
	mnemonic: [] as string[],
	transactions: [],
	
	// System Information
	casanodeVersion: '',
	systemOs: '',
	systemKernel: '',
	systemArch: '',
	dockerImage: '',
	uptime: 0
};

export const useNodeStore = defineStore('node',
{
	state: () => ({ ...initialState }),
	
	actions:
	{
		// Increment the counter to be applied
		increaseApplyCounter(): void
		{
			this.applyCounter++;
		},
		// Reset the counter to be applied
		resetApplyCounter(): void
		{
			this.applyCounter = 0;
		},
		
		// Reset store
		resetStore(): void
		{
			this.$reset();
		},
		
		// Set the node status
		setNodeStatus(status: string)
		{
			this.status = status;
		},
		// Set the number of connected users
		setOnlineUsers(users: number)
		{
			this.onlineUsers = users;
		},
		// Set the node balance
		setMoniker(moniker: string)
		{
			this.moniker = moniker;
		},
		// Set the node balance
		setNodeType(type: string): void
		{
			this.nodeType = type;
		},
		// Set the node balance
		setNodeIp(ip: string): void
		{
			this.nodeIp = ip;
		},
		// Set the node balance
		setNodePort(port: number): void
		{
			this.nodePort = port;
		},
		// Set the node balance
		setVpnType(type: string): void
		{
			this.vpnType = type;
		},
		// Set the node balance
		setVpnPort(port: number): void
		{
			this.vpnPort = port;
		},
		// Set the node balance
		setMaximumPeers(peers: number): void
		{
			this.maximumPeers = peers;
		},
		// Set the node location
		setNodeLocation(nodeLocation: string): void
		{
			this.nodeLocation = nodeLocation;
		},
		// Set certificate expiry
		setCertExpiry(certExpiry: string): void
		{
			this.certExpiry = certExpiry;
		},
		// Set Bandwidth Speed
		setBandwidthSpeed(uploadSpeed: string, downloadSpeed: string): void
		{
			this.uploadSpeed = uploadSpeed;
			this.downloadSpeed = downloadSpeed;
		},
		// Set the system uptime
		setSystemUptime(uptime: number): void
		{
			this.uptime = uptime;
		},
		// Set the casanode version
		setCasanodeVersion(casanodeVersion: string): void
		{
			this.casanodeVersion = casanodeVersion;
		},
		// Set the docker image
		setDockerImage(dockerImage: string): void
		{
			this.dockerImage = dockerImage;
		},
		// Set the system os
		setSystemOs(systemOs: string): void
		{
			this.systemOs = systemOs;
		},
		// Set the system kernel
		setSystemKernel(systemKernel: string): void
		{
			this.systemKernel = systemKernel;
		},
		// Set the system arch
		setSystemArch(systemArch: string): void
		{
			this.systemArch = systemArch;
		},
		// Set the public address
		setPublicAddress(address: string): void
		{
			this.publicAddress = address;
		},
		// Set the node address
		setNodeAddress(address: string): void
		{
			this.nodeAddress = address;
		},
		// Set the node balance
		setNodeBalance(balance: NodeBalance|null): void
		{
			if(balance === null)
				this.nodeBalance = { amount: 0, denom: '' };
			else
				this.nodeBalance = balance;
		},
		// Set the mnemonic
		setMnemonic(mnemonic: string[]): void
		{
			this.mnemonic = mnemonic;
		},
		// Clear the mnemonic
		clearMnemonic(): void
		{
			this.mnemonic = [];
		},
	}
});
