// src/services/NodeService.ts
import NetworkService from './NetworkService';
import { useNodeStore } from '@/stores/NodeStore';
import {
	refreshPublicAddress,
	refreshNodeAddress,
	refreshNodeBalance
} from '@/utils/node';
import {
	type NetworkStatus,
} from '@interfaces/network';

class NodeService
{
	private static instance: NodeService;
	
	private constructor()
	{
		
	}
	
	public static getInstance(): NodeService
	{
		if(!NodeService.instance)
		{
			NodeService.instance = new NodeService();
		}
		
		return NodeService.instance;
	}
	
	public async loadNodeConfiguration(): Promise<void>
	{
		const nodeStore = useNodeStore();
		
		// Check if connected to the BLE device
		if(!NetworkService.isConnected())
		{
			console.log('Not connected to the BLE device.');
			return;
		}
		
		try
		{
			
			// Get node Configuration
			const configuration = await NetworkService.getNodeConfiguration();
			// Get node status
			const nodeStatus: string = await NetworkService.getNodeStatus();
			const status: NetworkStatus = await NetworkService.getStatus();
			
			// Update the node store
			nodeStore.setMoniker(configuration.moniker);
			nodeStore.setNodeIp(configuration.nodeIp);
			nodeStore.setNodePort(configuration.nodePort);
			nodeStore.setVpnType(configuration.vpnType);
			nodeStore.setVpnPort(configuration.vpnPort);
			nodeStore.setDockerImage(configuration.dockerImage);
			nodeStore.setNodeType(configuration.nodeType);
			nodeStore.setMaximumPeers(configuration.maximumPeers);
			nodeStore.setNodeStatus(nodeStatus);
			nodeStore.setNodeLocation(status.nodeLocation);
			nodeStore.setCertExpiry(status.certificate?.expirationDate ?? null);
			nodeStore.setOnlineUsers(status?.status?.peers ?? null);
			nodeStore.setBandwidthSpeed(status?.status?.bandwidth?.upload ?? null, status?.status?.bandwidth?.download ?? null);
			nodeStore.setSystemUptime(status.uptime);
			nodeStore.setCasanodeVersion(status.version);
			nodeStore.setSystemOs(status.systemOs);
			nodeStore.setSystemArch(status.systemArch);
			nodeStore.setSystemKernel(status.systemKernel);
			
			// Check if passphrase is available
			const passphraseAvailable = await NetworkService.nodePassphrase();
			// If passphrase is available
			if (passphraseAvailable)
			{
				// Load node address, public address and balance
				await refreshNodeAddress();
				await refreshPublicAddress();
				await refreshNodeBalance();
			}
		}
		catch(error)
		{
			console.error('Error loading node configuration:', error);
		}
	}
}

export default NodeService.getInstance();
