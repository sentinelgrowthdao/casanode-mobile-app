import { defineStore } from 'pinia';

export const useNodeStore = defineStore('node',
{
	state: () => ({
		// Node Status
		status: 'running',
		connectedUsers: 16,
		
		// Node Information
		nodeIp: '194.164.29.195',
		location: 'Slough / United Kingdom',
		nodePort: 16567,
		vpnPort: 16568,
		sslExpiry: 'May 6 19:05:15 2025 GMT',
		uploadSpeed: '18,3 MB',
		downloadSpeed: '87,19 MB',
		
		// Node Settings
		moniker: 'My Residential Node',
		nodeType: 'residential',
		
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
		setNodeStatus(status: string)
		{
			this.status = status;
		},
		setConnectedUsers(users: number)
		{
			this.connectedUsers = users;
		},
		setMoniker(moniker: string)
		{
			this.moniker = moniker;
		},
		setNodeType(type: string): void
		{
			this.nodeType = type;
		},
		setNodeIp(ip: string): void
		{
			this.nodeIp = ip;
		},
	}
});
