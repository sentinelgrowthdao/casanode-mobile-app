import { defineStore } from 'pinia';

export const useNodeStore = defineStore('node',
{
	state: () => ({
		
		// Counter of modified configurations to be applied
		applyCounter: 0,
		
		// Node Status
		status: 'running',
		connectedUsers: 16,
		
		// Node Information
		nodeIp: '',
		nodeLocation: '',
		nodePort: -1,
		vpnPort: -1,
		certExpiry: '',
		uploadSpeed: '18,3 MB',
		downloadSpeed: '87,19 MB',
		
		// Node Settings
		moniker: '',
		nodeType: '',
		
		// VPN Settings
		vpnType: 'wireguard',
		maximumPeers: 250,
		
		// Wallet
		nodeBalance: '1,432.45 DVPN',
		publicAddress: 'sent1gml0h2eavhrqcwz8u5h0s8f8mds67f0gvtmsnw',
		nodeAddress: 'sentnode1gml0h2eavhrqcwz8u5h0s8f8mds67f0g6a6fkc',
		transactions: [
			{ type: 'update-status', amount: '-0.009535 DVPN', hash: '3C83865A883865A883865A883865A83865A3865A9A6' },
			{ type: 'update-status', amount: '-0.01 DVPN', hash: '3C83883865A65A883865A883865A88386583865AA9A6' },
			{ type: 'update-status', amount: '-0.009645 DVPN', hash: '3C8386583A883865A883865A883865A883865865A83865AA9A6' },
			{ type: 'update-status', amount: '-0.01 DVPN', hash: '3C838658386A883865A883865A8838655AA9A6' },
			{ type: 'update-details', amount: '-0.009542 DVPN', hash: '3C83883865A83865A83A883865A883865865A65A9A6' },
			{ type: 'update-status', amount: '-0.009531 DVPN', hash: '3C8386583865A83A883865A883865A883865865A83865AA9A6' },
			{ type: 'update-status', amount: '-0.009742 DVPN', hash: '3C83865838683865A883865A883865A883865A83865A5AA9A6' },
			{ type: 'update-details', amount: '-0.009804 DVPN', hash: '3C83865A9A83A883865A883865A883865865A83865A83865A6' },
			{ type: 'receive', amount: '+50 DVPN', hash: '3C65A65A9838665A65A965A883865A883865A883865A65A95A9A6' }
		],
		
		// System Information
		casanodeVersion: '1.0.0',
		operatingSystem: 'Debian 12',
		kernelVersion: '6.6.28+rpt-rpi-2712',
		architecture: 'aarch64',
		dockerImage: 'wajatmaka/sentinel-aarch64-alpine:v0.7.1',
		uptime: 1714514400
	}),
	
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
		
		// Set the node status
		setNodeStatus(status: string)
		{
			this.status = status;
		},
		// Set the number of connected users
		setConnectedUsers(users: number)
		{
			this.connectedUsers = users;
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
	}
});
