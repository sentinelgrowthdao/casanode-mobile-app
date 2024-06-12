// src/services/NodeService.ts
import BluetoothService from './BluetoothService';
import { useNodeStore } from '@/stores/NodeStore';
import { useWizardStore } from '@/stores/WizardStore';

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
		const wizardStore = useWizardStore();
		
		// Check if connected to the BLE device
		if(!BluetoothService.isConnected())
		{
			console.log('Not connected to the BLE device.');
			return;
		}
		
		try
		{
			// Load node configuration
			const nodeStatus = await BluetoothService.readNodeStatus();
			const moniker = await BluetoothService.readMoniker();
			const nodeType = await BluetoothService.readNodeType();
			const nodeIp = await BluetoothService.readNodeIp();
			const nodePort = await BluetoothService.readNodePort();
			const vpnType = await BluetoothService.readVpnType();
			const vpnPort = await BluetoothService.readVpnPort();
			const maximumPeers = await BluetoothService.readMaximumPeers();
			const nodeLocation = await BluetoothService.readNodeLocation();
			const certExpiry = await BluetoothService.readCertExpiry();
			const bandwidthSpeed = await BluetoothService.readBandwidthSpeed();
			const systemUptime = await BluetoothService.readSystemUptime();
			const casanodeVersion = await BluetoothService.readCasanodeVersion();
			const dockerImage = await BluetoothService.readDockerImage();
			const systemOs = await BluetoothService.readSystemOs();
			const systemArch = await BluetoothService.readSystemArch();
			const systemKernel = await BluetoothService.readSystemKernel();
			
			// Update the node store
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
			nodeStore.setBandwidthSpeed(bandwidthSpeed?.upload || 'N/A', bandwidthSpeed?.download || 'N/A');
			nodeStore.setSystemUptime(systemUptime || -1);
			nodeStore.setCasanodeVersion(casanodeVersion || '');
			nodeStore.setDockerImage(dockerImage || '');
			nodeStore.setSystemOs(systemOs || '');
			nodeStore.setSystemArch(systemArch || '');
			nodeStore.setSystemKernel(systemKernel || '');
			
			// Duplicate the information to the wizard store
			wizardStore.setMoniker(moniker || '');
			wizardStore.setNodeType(nodeType || '');
			wizardStore.setVpnType(vpnType || '');
			wizardStore.setNodeAddress(nodeIp || '');
			wizardStore.setNodePort(nodePort || 0);
			wizardStore.setVpnPort(vpnPort || 0);
			
			// Check if passphrase is available
			const passphraseAvailable = await BluetoothService.readNodePassphrase();
			// If passphrase is available, load the node address, public address and balance
			if (passphraseAvailable)
			{
				const publicAddress = await BluetoothService.readPublicAddress();
				const nodeAddress = await BluetoothService.readNodeAddress();
				const nodeBalance = await BluetoothService.readNodeBalance();
				
				// Update the node store
				nodeStore.setPublicAddress(publicAddress || '');
				nodeStore.setNodeAddress(nodeAddress || '');
				nodeStore.setNodeBalance(nodeBalance || '');
			}
		
		}
		catch(error)
		{
			console.error('Error loading node configuration:', error);
		}
	}
}

export default NodeService.getInstance();
