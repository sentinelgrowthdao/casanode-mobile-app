import NetworkService from '@/services/NetworkService';
import { useNodeStore } from '@stores/NodeStore';
import { type NodeBalance } from '@stores/NodeStore';

/**
 * Refresh the node status.
 * @returns string
 */
export async function refreshNodeStatus(): Promise<string | null>
{
	// Create a reference to the node store
	const nodeStore = useNodeStore();
	
	// Read the node status
	const status = await NetworkService.getNodeStatus();
	
	// Update the node status
	if (status)
		nodeStore.setNodeStatus(status);
	else
		console.error('Failed to update the node status.');
	
	// Return the node status
	return status;
}

/**
 * Refresh the node balance.
 * @returns NodeBalance
 */
export async function refreshNodeBalance(): Promise<NodeBalance | null>
{
	// Create a reference to the node store
	const nodeStore = useNodeStore();
	
	// Read the node balance
	const balance = await NetworkService.getNodeBalance();
	
	// Update the node balance
	if (balance)
		nodeStore.setNodeBalance(balance);
	else
		console.error('Failed to update the node balance.');
	
	// Return the node balance
	return balance;
}

/**
 * Refresh the node address.
 * @returns string
 */
export async function refreshNodeAddress(): Promise<string | null>
{
	// Create a reference to the node store
	const nodeStore = useNodeStore();
	
	// Read the node address
	const address = await NetworkService.getNodeAddress();
	
	// Update the node address
	if (address)
		nodeStore.setNodeAddress(address);
	else
		console.error('Failed to update the node address.');
	
	// Return the node address
	return address;
}

/**
 * Refresh the node address.
 * @returns string
 */
export async function refreshPublicAddress(): Promise<string | null>
{
	// Create a reference to the node store
	const nodeStore = useNodeStore();
	
	// Read the public address
	const address = await NetworkService.getWalletAddress();
	
	// Update the public address
	if (address)
		nodeStore.setPublicAddress(address);
	else
		console.error('Failed to update the public address.');
	
	// Return the public address
	return address;
}