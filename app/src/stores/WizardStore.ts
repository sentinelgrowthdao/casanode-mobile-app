import { defineStore } from "pinia";

export const useWizardStore = defineStore("wizard", {
	state: () => ({
		moniker: "",
		nodeType: "",
		vpnType: "",
		ipAddress: "",
		nodePort: 0,
		vpnPort: 0,
		publicAddress: "",
	}),
	
	actions:
	{
		setMoniker(moniker: string)
		{
			this.moniker = moniker;
		},
		setNodeType(nodeType: string)
		{
			this.nodeType = nodeType;
		},
		setVpnType(vpnType: string)
		{
			this.vpnType = vpnType;
		},
		setIpAddress(ipAddress: string)
		{
			this.ipAddress = ipAddress;
		},
		setNodePort(nodePort: number)
		{
			this.nodePort = nodePort;
		},
		setVpnPort(vpnPort: number)
		{
			this.vpnPort = vpnPort;
		},
		setPublicAddress(publicAddress: string)
		{
			this.publicAddress = publicAddress;
		},
	},
});
