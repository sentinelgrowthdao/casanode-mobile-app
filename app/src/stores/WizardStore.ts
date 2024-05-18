import { defineStore } from "pinia";

export const useWizardStore = defineStore("wizard", {
	state: () => ({
		moniker: "",
		nodeType: "",
		vpnType: "",
		nodeAddress: "",
		nodePort: 0,
		vpnPort: 0,
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
		setNodeAddress(nodeAddress: string)
		{
			this.nodeAddress = nodeAddress;
		},
		setNodePort(nodePort: number)
		{
			this.nodePort = nodePort;
		},
		setVpnPort(vpnPort: number)
		{
			this.vpnPort = vpnPort;
		},
	},
});
