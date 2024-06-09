// src/services/BluetoothService.ts
import { BleClient } from '@capacitor-community/bluetooth-le';
import { type BandwidthSpeed } from '@stores/NodeStore';

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
const CHAR_NODE_LOCATION_UUID = '0000180d-0000-1000-8000-00805f9b3505';
const CHAR_CERT_EXPIRITY_UUID = '0000180d-0000-1000-8000-00805f9b3506';
const CHAR_BANDWIDTH_SPEED_UUID = '0000180d-0000-1000-8000-00805f9b3507';
const CHAR_SYSTEM_UPTIME_UUID = '0000180d-0000-1000-8000-00805f9b3508';
const CHAR_CASANODE_VERSION_UUID = '0000180d-0000-1000-8000-00805f9b3509';
const CHAR_DOCKER_IMAGE_UUID = '0000180d-0000-1000-8000-00805f9b350a';
const CHAR_SYSTEM_OS_UUID = '0000180d-0000-1000-8000-00805f9b350b';
const CHAR_SYSTEM_ARCH_UUID = '0000180d-0000-1000-8000-00805f9b350c';
const CHAR_SYSTEM_KERNEL_UUID = '0000180d-0000-1000-8000-00805f9b350d';
const CHAR_NODE_PASSPHRASE_UUID = '0000180d-0000-1000-8000-00805f9b350e';
const CHAR_PUBLIC_ADDRESS_UUID = '0000180d-0000-1000-8000-00805f9b350f';

/**
 * Encode a string into a DataView
 * @param data string to encode
 * @returns 
 */
function encodeDataView(data: string): DataView
{
	const encoder = new TextEncoder();
	const encodedData = encoder.encode(data);
	const buffer = new ArrayBuffer(encodedData.length);
	const view = new DataView(buffer);
	
	for (let i = 0; i < encodedData.length; i++)
	{
		view.setUint8(i, encodedData[i]);
	}
	
	return view;
}

/**
 * Decode a DataView into a string
 * @param value DataView to decode
 * @returns string
 */
function decodeDataView(value: DataView): string
{
	return new TextDecoder('utf-8').decode(value);
}

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
	 * Read moniker from the BLE server.
	 * @returns Promise<string|null>
	 */
	public async readMoniker(): Promise<string|null>
	{
		try
		{
			if(this.deviceId)
			{
				const value = await BleClient.read(this.deviceId, NODE_BLE_UUID, CHAR_MONIKER_UUID);
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
	 * Read node type from the BLE server.
	 * @returns Promise<string|null>
	 */
	public async readNodeType(): Promise<string|null>
	{
		try
		{
			if(this.deviceId)
			{
				const value = await BleClient.read(this.deviceId, NODE_BLE_UUID, CHAR_NODE_TYPE_UUID);
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
	 * Read node IP from the BLE server.
	 * @returns Promise<string|null>
	 */
	public async readNodeIp(): Promise<string|null>
	{
		try
		{
			if(this.deviceId)
			{
				const value = await BleClient.read(this.deviceId, NODE_BLE_UUID, CHAR_NODE_IP_UUID);
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
	 * Read node port from the BLE server.
	 * @returns Promise<number|null>
	 */
	public async readNodePort(): Promise<number|null>
	{
		try
		{
			if(this.deviceId)
			{
				const value = await BleClient.read(this.deviceId, NODE_BLE_UUID, CHAR_NODE_PORT_UUID);
				return parseInt(decodeDataView(value));
			}
		}
		catch (error)
		{
			console.error('BLE error:', error);
		}
		
		return null;
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
	 * Read VPN type from the BLE server.
	 * @returns Promise<string|null>
	 */
	public async readVpnType(): Promise<string|null>
	{
		try
		{
			if(this.deviceId)
			{
				const value = await BleClient.read(this.deviceId, NODE_BLE_UUID, CHAR_VPN_TYPE_UUID);
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
	 * Read VPN port from the BLE server.
	 * @returns Promise<number|null>
	 */
	public async readVpnPort(): Promise<number|null>
	{
		try
		{
			if(this.deviceId)
			{
				const value = await BleClient.read(this.deviceId, NODE_BLE_UUID, CHAR_VPN_PORT_UUID);
				return parseInt(decodeDataView(value));
			}
		}
		catch (error)
		{
			console.error('BLE error:', error);
		}
		
		return null;
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
	 * Read maximum peers from the BLE server.
	 * @returns Promise<number|null>
	 */
	public async readMaximumPeers(): Promise<number|null>
	{
		try
		{
			if(this.deviceId)
			{
				const value = await BleClient.read(this.deviceId, NODE_BLE_UUID, CHAR_MAX_PEERS_UUID);
				return parseInt(decodeDataView(value));
			}
		}
		catch (error)
		{
			console.error('BLE error:', error);
		}
		
		return null;
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
	
	/**
	 * Read node location from the BLE server.
	 * @returns Promise<string|null>
	 */
	public async readNodeLocation(): Promise<string|null>
	{
		try
		{
			if(this.deviceId)
			{
				const value = await BleClient.read(this.deviceId, NODE_BLE_UUID, CHAR_NODE_LOCATION_UUID);
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
	 * Read certificate expiry from the BLE server.
	 * @returns Promise<string|null>
	 */
	public async readCertExpiry(): Promise<string|null>
	{
		try
		{
			if(this.deviceId)
			{
				const value = await BleClient.read(this.deviceId, NODE_BLE_UUID, CHAR_CERT_EXPIRITY_UUID);
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
	 * Read bandwidth speed from the BLE server.
	 * @returns Promise<BandwidthSpeed|null>
	 */
	public async readBandwidthSpeed(): Promise<BandwidthSpeed|null>
	{
		try
		{
			if(this.deviceId)
			{
				const value = await BleClient.read(this.deviceId, NODE_BLE_UUID, CHAR_BANDWIDTH_SPEED_UUID);
				const data = JSON.parse(decodeDataView(value)) as BandwidthSpeed;
				return data;
			}
		}
		catch (error)
		{
			console.error('BLE error:', error);
		}
		
		return null;
	}
	
	/**
	 * Read system uptime from the BLE server.
	 * @returns Promise<number|null>
	 */
	public async readSystemUptime(): Promise<number|null>
	{
		try
		{
			if(this.deviceId)
			{
				const value = await BleClient.read(this.deviceId, NODE_BLE_UUID, CHAR_SYSTEM_UPTIME_UUID);
				return parseInt(decodeDataView(value));
			}
		}
		catch (error)
		{
			console.error('BLE error:', error);
		}
		
		return null;
	}
	
	/**
	 * Read system infos from the BLE server.
	 * @returns Promise<string|null>
	 */
	public async readCasanodeVersion(): Promise<string|null>
	{
		try
		{
			if(this.deviceId)
			{
				const value = await BleClient.read(this.deviceId, NODE_BLE_UUID, CHAR_CASANODE_VERSION_UUID);
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
	 * Read docker image from the BLE server.
	 * @returns Promise<string|null>
	 */
	public async readDockerImage(): Promise<string|null>
	{
		try
		{
			if(this.deviceId)
			{
				const value = await BleClient.read(this.deviceId, NODE_BLE_UUID, CHAR_DOCKER_IMAGE_UUID);
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
	 * Read system arch from the BLE server.
	 * @returns Promise<string|null>
	 */
	public async readSystemOs(): Promise<string|null>
	{
		try
		{
			if(this.deviceId)
			{
				const value = await BleClient.read(this.deviceId, NODE_BLE_UUID, CHAR_SYSTEM_OS_UUID);
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
	 * Read system arch from the BLE server.
	 * @returns Promise<string|null>
	 */
	public async readSystemArch(): Promise<string|null>
	{
		try
		{
			if(this.deviceId)
			{
				const value = await BleClient.read(this.deviceId, NODE_BLE_UUID, CHAR_SYSTEM_ARCH_UUID);
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
	 * Read system kernel from the BLE server.
	 * @returns Promise<string|null>
	 */
	public async readSystemKernel(): Promise<string|null>
	{
		try
		{
			if(this.deviceId)
			{
				const value = await BleClient.read(this.deviceId, NODE_BLE_UUID, CHAR_SYSTEM_KERNEL_UUID);
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
	 * Read node passphrase from the BLE server.
	 */
	public async readNodePassphrase(): Promise<boolean>
	{
		try
		{
			if(this.deviceId)
			{
				const value = await BleClient.read(this.deviceId, NODE_BLE_UUID, CHAR_NODE_PASSPHRASE_UUID);
				return decodeDataView(value) === 'true';
			}
		}
		catch (error)
		{
			console.error('BLE error:', error);
		}
		
		return false;
	}
	
	/**
	 * Send node passphrase to the BLE server.
	 * @param data string
	 * @returns Promise<boolean>
	 */
	public async writeNodePassphrase(data: string): Promise<boolean>
	{
		try
		{
			if(this.deviceId)
			{
				await BleClient.write(this.deviceId, NODE_BLE_UUID, CHAR_NODE_PASSPHRASE_UUID, encodeDataView(data));
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
	 * Read public address from the BLE server.
	 * @returns Promise<string|null>
	 */
	public async readPublicAddress(): Promise<string|null>
	{
		try
		{
			if(this.deviceId)
			{
				const value = await BleClient.read(this.deviceId, NODE_BLE_UUID, CHAR_PUBLIC_ADDRESS_UUID);
				return decodeDataView(value);
			}
		}
		catch (error)
		{
			console.error('BLE error:', error);
		}
		
		return null;
	}
}

export default BluetoothService.getInstance();
