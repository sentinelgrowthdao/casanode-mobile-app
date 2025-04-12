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
		// Reset store
		resetStore(): void
		{
			this.$reset();
		},
		
		// Set the node status
		setNodeStatus(status: string | null): void
		{
			this.status = status ?? 'unknown';
		},
		// Set the number of connected users
		setOnlineUsers(users: number | null): void
		{
			this.onlineUsers = users ?? 0;
		},
		// Set the node balance
		setMoniker(moniker: string | null): void
		{
			this.moniker = moniker ?? '';
		},
		// Set the node balance
		setNodeType(type: string | null): void
		{
			this.nodeType = type ?? '';
		},
		// Set the node balance
		setNodeIp(ip: string | null): void
		{
			this.nodeIp = ip ?? '';
		},
		// Set the node balance
		setNodePort(port: number | null): void
		{
			this.nodePort = port ?? -1;
		},
		// Set the node balance
		setVpnType(type: string | null): void
		{
			this.vpnType = type ?? '';
		},
		// Set the node balance
		setVpnPort(port: number | null): void
		{
			this.vpnPort = port ?? -1;
		},
		// Set the node balance
		setMaximumPeers(peers: number | null): void
		{
			this.maximumPeers = peers ?? 0;
		},
		// Set the node location
		setNodeLocation(nodeLocation: string | null): void
		{
			this.nodeLocation = nodeLocation ?? '';
		},
		// Set certificate expiry
		setCertExpiry(certExpiry: string | null): void
		{
			this.certExpiry = certExpiry ?? '';
		},
		// Set Bandwidth Speed
		setBandwidthSpeed(uploadSpeed: string | null, downloadSpeed: string | null): void
		{
			this.uploadSpeed = uploadSpeed ?? '';
			this.downloadSpeed = downloadSpeed ?? '';
		},
		// Set the system uptime
		setSystemUptime(uptime: number | null): void
		{
			this.uptime = uptime ?? 0;
		},
		// Set the casanode version
		setCasanodeVersion(casanodeVersion: string | null): void
		{
			this.casanodeVersion = casanodeVersion ?? '';
		},
		// Set the docker image
		setDockerImage(dockerImage: string | null): void
		{
			this.dockerImage = dockerImage ?? '';
		},
		// Set the system os
		setSystemOs(systemOs: string | null): void
		{
			this.systemOs = systemOs ?? '';
		},
		// Set the system kernel
		setSystemKernel(systemKernel: string | null): void
		{
			this.systemKernel = systemKernel ?? '';
		},
		// Set the system arch
		setSystemArch(systemArch: string | null): void
		{
			this.systemArch = systemArch ?? '';
		},
		// Set the public address
		setPublicAddress(address: string | null): void
		{
			this.publicAddress = address ?? '';
		},
		// Set the node address
		setNodeAddress(address: string | null): void
		{
			this.nodeAddress = address ?? '';
		},
		// Set the node balance
		setNodeBalance(balance: NodeBalance | null): void
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
