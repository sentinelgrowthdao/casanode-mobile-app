// src/services/BluetoothService.ts
import { BleClient } from '@capacitor-community/bluetooth-le';
import { encodeDataView, decodeDataView } from '@/utils/bluetooth';

const NODE_BLE_UUID = '0000180d-0000-1000-8000-00805f9b34fb';
const CHAR_HELLO_UUID = '0000180d-0000-1000-8000-00805f9b34fc';
const CHAR_MONIKER_UUID = '0000180d-0000-1000-8000-00805f9b34fd';
const CHAR_NODE_TYPE_UUID = '0000180d-0000-1000-8000-00805f9b34fe';
const CHAR_NODE_IP_UUID = '0000180d-0000-1000-8000-00805f9b34ff';
const CHAR_NODE_PORT_UUID = '0000180d-0000-1000-8000-00805f9b3500';
const CHAR_VPN_TYPE_UUID = '0000180d-0000-1000-8000-00805f9b3501';
const CHAR_VPN_PORT_UUID = '0000180d-0000-1000-8000-00805f9b3502';
const CHAR_MAX_PEERS_UUID = '0000180d-0000-1000-8000-00805f9b3503';
const CHAR_NODE_CONFIG_UUID = '0000180d-0000-1000-8000-00805f9b3504';

class BluetoothService
{
	private static instance: BluetoothService;
	private deviceId: string | null = null;
	private connected = false;
	
	private constructor() {}
	
	public static getInstance(): BluetoothService
	{
		if(!BluetoothService.instance)
		{
			BluetoothService.instance = new BluetoothService();
			BluetoothService.instance.initialize();
		}
		return BluetoothService.instance;
	}
	
	/**
	 * Initialize the BLE client.
	 */
	public async initialize()
	{
		await BleClient.initialize();
	}
	
	/**
	 * Connect to the BLE server.
	 * @returns boolean
	 */
	public async connect(): Promise<boolean>
	{
		if(this.connected)
			this.disconnect();
		
		try
		{
			const device = await BleClient.requestDevice({
				services: [NODE_BLE_UUID],
			});
			
			await BleClient.connect(device.deviceId);
			this.deviceId = device.deviceId;
			this.connected = true;
			console.log('Connected to the BLE device!');
		}
		catch (error)
		{
			console.error('BLE error:', error);
		}
		
		return this.connected;
	}
	
	/**
	 * Disconnect from the BLE server.
	 * @returns void
	 */
	public async disconnect(): Promise<void>
	{
		try
		{
			// Check if the device is connected
			if(this.deviceId)
			{
				// Disconnect from the BLE server
				await BleClient.disconnect(this.deviceId);
				this.deviceId = null;
				this.connected = false;
			}
		}
		catch (error)
		{
			console.error('BLE error:', error);
		}
	}
	
	/**
	 * Check if the device is connected to the BLE server.
	 * @returns boolean
	 */
	public isConnected(): boolean
	{
		return this.connected;
	}
	
	/**
	 * Send hello message to the BLE server.
	 * @param message string
	 * @returns Promise<boolean>
	 */
	public async sendHelloMessage(message: string): Promise<boolean>
	{
		try
		{
			if(this.deviceId)
			{
				await BleClient.write(this.deviceId, NODE_BLE_UUID, CHAR_HELLO_UUID, encodeDataView(message));
				return true;
			}
		}
		catch (error)
		{
			console.error('BLE error:', error);
		}

		return false;
	}
	
	/**
	 * Read hello message from the BLE server.
	 * @returns Promise<string|null>
	 */
	public async readHelloFromServer(): Promise<string|null>
	{
		try
		{
			if(this.deviceId)
			{
				const value = await BleClient.read(this.deviceId, NODE_BLE_UUID, CHAR_HELLO_UUID);
				return decodeDataView(value);
			}
		}
		catch (error)
		{
			console.error('BLE error:', error);
		}
		
		return null;
	}
	
	/**
	 * Subscribe to the BLE server.
	 * @param callback 
	 * @returns Promise<boolean>
	 */
	public async subscribeToServer(callback: (value: DataView) => void) : Promise<boolean>
	{
		try
		{
			if(this.deviceId)
			{
				await BleClient.startNotifications(this.deviceId, NODE_BLE_UUID, CHAR_HELLO_UUID, callback);
				console.log('Subscribed to the BLE server.');
				return true;
			}
		}
		catch (error)
		{
			console.error('BLE error:', error);
		}
		
		return false;
	}
	
	/**
	 * Send node type to the BLE server.
	 * @param data string
	 * @returns Promise<boolean>
	 */
	public async writeMoniker(data: string): Promise<boolean>
	{
		try
		{
			if(this.deviceId)
			{
				await BleClient.write(this.deviceId, NODE_BLE_UUID, CHAR_MONIKER_UUID, encodeDataView(data));
				return true;
			}
		}
		catch (error)
		{
			console.error('BLE error:', error);
		}
		return false;
	}
	
	/**
	 * Send node type to the BLE server.
	 * @param data string
	 * @returns Promise<boolean>
	 */
	public async writeNodeType(data: string): Promise<boolean>
	{
		try
		{
			if(this.deviceId)
			{
				await BleClient.write(this.deviceId, NODE_BLE_UUID, CHAR_NODE_TYPE_UUID, encodeDataView(data));
				return true;
			}
		}
		catch (error)
		{
			console.error('BLE error:', error);
		}
		return false;
	}
	
	/**
	 * Send node IP to the BLE server.
	 * @param data string
	 * @returns Promise<boolean>
	 */
	public async writeNodeIp(data: string): Promise<boolean>
	{
		try
		{
			if(this.deviceId)
			{
				await BleClient.write(this.deviceId, NODE_BLE_UUID, CHAR_NODE_IP_UUID, encodeDataView(data));
				return true;
			}
		}
		catch (error)
		{
			console.error('BLE error:', error);
		}
		return false;
	}
	
	/**
	 * Send node port to the BLE server.
	 * @param data string
	 * @returns Promise<boolean>
	 */
	public async writeNodePort(data: string): Promise<boolean>
	{
		try
		{
			if(this.deviceId)
			{
				await BleClient.write(this.deviceId, NODE_BLE_UUID, CHAR_NODE_PORT_UUID, encodeDataView(data));
				return true;
			}
		}
		catch (error)
		{
			console.error('BLE error:', error);
		}
		return false;
	}
	
	/**
	 * Send VPN type to the BLE server.
	 * @param data string
	 * @returns Promise<boolean>
	 */
	public async writeVpnType(data: string): Promise<boolean>
	{
		try
		{
			if(this.deviceId)
			{
				await BleClient.write(this.deviceId, NODE_BLE_UUID, CHAR_VPN_TYPE_UUID, encodeDataView(data));
				return true;
			}
		}
		catch (error)
		{
			console.error('BLE error:', error);
		}
		return false;
	}
	
	/**
	 * Send VPN port to the BLE server.
	 * @param data string
	 * @returns Promise<boolean>
	 */
	public async writeVpnPort(data: string): Promise<boolean>
	{
		try
		{
			if(this.deviceId)
			{
				await BleClient.write(this.deviceId, NODE_BLE_UUID, CHAR_VPN_PORT_UUID, encodeDataView(data));
				return true;
			}
		}
		catch (error)
		{
			console.error('BLE error:', error);
		}
		return false;
	}
	
	/**
	 * Send maximum peers to the BLE server.
	 * @param data string
	 * @returns Promise<boolean>
	 */
	public async writeMaximumPeers(data: string): Promise<boolean>
	{
		try
		{
			if(this.deviceId)
			{
				await BleClient.write(this.deviceId, NODE_BLE_UUID, CHAR_MAX_PEERS_UUID, encodeDataView(data));
				return true;
			}
		}
		catch (error)
		{
			console.error('BLE error:', error);
		}
		return false;
	}
	
	/**
	 * Send apply node config to the BLE server.
	 * @returns Promise<boolean>
	 */
	public async writeNodeConfig(): Promise<boolean>
	{
		try
		{
			if(this.deviceId)
			{
				const data: string = 'apply';
				await BleClient.write(this.deviceId, NODE_BLE_UUID, CHAR_NODE_CONFIG_UUID, encodeDataView(data));
				return true;
			}
		}
		catch (error)
		{
			console.error('BLE error:', error);
		}
		return false;
	}
	
}

export default BluetoothService.getInstance();
