import BluetoothService from '@/services/BluetoothService';
import { useNodeStore } from '@stores/NodeStore';
import { type NodeBalance } from '@stores/NodeStore';

/**
 * Refresh the node status.
 * @returns string
 */
export async function refreshNodeStatus(): Promise<string | null>
{
	// Import the store
	const nodeStore = useNodeStore();
	// Read the node status
	const status = await BluetoothService.readNodeStatus();

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
	// Import the store
	const nodeStore = useNodeStore();
	// Read the node balance
	const balance = await BluetoothService.readNodeBalance();
	
	// Update the node balance
	if (balance)
		nodeStore.setNodeBalance(balance);
	else
		console.error('Failed to update the node balance.');
	
	// Return the node balance
	return balance;
}