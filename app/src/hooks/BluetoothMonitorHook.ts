import { onMounted, onUnmounted } from 'vue';
import { App } from '@capacitor/app';
import { useRouter } from 'vue-router';
import { requiresConnection } from '@/router';
import NetworkService from '@/services/NetworkService';
import { refreshNodeStatus } from '@/utils/node';

export function startNetworkMonitorHook() 
{
	const router = useRouter();
	let intervalId: number | null = null;
	let appStateChangeListener: any = null;
	
	/**
	 * Check the current Network status and redirect to the Home page if the user is not connected
	 * @returns {Promise<void>}
	 */
	const checkNetworkStatus = async () => 
	{
		// Check if the current route requires connection to the Network device
		if(!requiresConnection.includes(router.currentRoute.value.name as string))
			return;
		
		// Check if the user is connected to the device
		const connected = await NetworkService.isConnected();
		
		// Initialize the status variable
		let status = null;
		// If the user is connected, read the node status
		if(connected)
			status = await refreshNodeStatus();
		
		// If the user is not connected or the status is null, redirect to the Home page
		if (!connected || status === null)
		{
			// Disconnect the user from the Network device
			await NetworkService.disconnect();
			// Redirect to the Home page
			router.replace({ name: 'Home' });
		}
	};
	
	/**
	 * Handle the app state change event
	 * @param state
	 * @returns {Promise<void>}
	 */
	const handleAppStateChange = async (state: { isActive: boolean }) => 
	{
		if (state.isActive) 
		{
			await checkNetworkStatus();
		}
	};
	
	/**
	 * On mounted hook
	 */
	onMounted(async () => 
	{
		intervalId = window.setInterval(checkNetworkStatus, 15000);
		await checkNetworkStatus();
		
		// Add the listener to the app state change event
		appStateChangeListener = await App.addListener('appStateChange', handleAppStateChange);
	});
	
	/**
	 * On unmounted hook
	 */
	onUnmounted(() => 
	{
		// Clear the interval if it exists
		if (intervalId !== null) 
			clearInterval(intervalId);
		
		// Remove the listener if it exists
		if (appStateChangeListener && appStateChangeListener.remove) 
			appStateChangeListener.remove();
	});
	
}
