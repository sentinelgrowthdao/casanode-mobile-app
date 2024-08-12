// src/services/BluetoothService.ts
import { BleClient } from '@capacitor-community/bluetooth-le';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';
import { Buffer } from 'buffer';
import * as cryptoJs from 'crypto-js';
import { type BandwidthSpeed, type NodeBalance } from '@stores/NodeStore';

const NODE_BLE_UUID = '00805f9b34fb';
const CHAR_HELLO_UUID = '00805f9b34fc';
const CHAR_MONIKER_UUID = '00805f9b34fd';
const CHAR_NODE_TYPE_UUID = '00805f9b34fe';
const CHAR_NODE_IP_UUID = '00805f9b34ff';
const CHAR_NODE_PORT_UUID = '00805f9b3500';
const CHAR_VPN_TYPE_UUID = '00805f9b3501';
const CHAR_VPN_PORT_UUID = '00805f9b3502';
const CHAR_MAX_PEERS_UUID = '00805f9b3503';
const CHAR_NODE_CONFIG_UUID = '00805f9b3504';
const CHAR_NODE_LOCATION_UUID = '00805f9b3505';
const CHAR_CERT_EXPIRITY_UUID = '00805f9b3506';
const CHAR_BANDWIDTH_SPEED_UUID = '00805f9b3507';
const CHAR_SYSTEM_UPTIME_UUID = '00805f9b3508';
const CHAR_CASANODE_VERSION_UUID = '00805f9b3509';
const CHAR_DOCKER_IMAGE_UUID = '00805f9b350a';
const CHAR_SYSTEM_OS_UUID = '00805f9b350b';
const CHAR_SYSTEM_ARCH_UUID = '00805f9b350c';
const CHAR_SYSTEM_KERNEL_UUID = '00805f9b350d';
const CHAR_NODE_PASSPHRASE_UUID = '00805f9b350e';
const CHAR_PUBLIC_ADDRESS_UUID = '00805f9b350f';
const CHAR_ADDRESS_NODE_UUID = '00805f9b3510';
const CHAR_NODE_BALANCE_UUID = '00805f9b3511';
const CHAR_NODE_STATUS_UUID = '00805f9b3512';
const CHAR_CHECK_INSTALL_UUID = '00805f9b3513';
const CHAR_INSTALL_IMAGE_UUID = '00805f9b3514';
const CHAR_INSTALL_CONFIGS_UUID = '00805f9b3515';
const CHAR_NODE_ACTIONS_UUID = '00805f9b3516';
const CHAR_SYSTEM_ACTIONS_UUID = '00805f9b3517';
const CHAR_CERTIFICATE_ACTIONS_UUID = '00805f9b3518';
const CHAR_WALLET_MNEMONIC_UUID = '00805f9b3519';
const CHAR_WALLET_ACTIONS_UUID = '00805f9b351a';
const CHAR_NODE_KEYRING_BACKEND_UUID = '00805f9b351b';
const CHAR_ONLINE_USERS_UUID = '00805f9b351c';
const CHAR_CHANGE_VPN_TYPE_UUID = '00805f9b351d';

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
	private BLE_UUID: string | null = null;
	
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
	 * Request permissions for location and Bluetooth.
	 * @returns void
	 */
	private async requestPermissions()
	{
		// Ignore permissions if not running on a native platform
		if(!Capacitor.isNativePlatform())
			return true;
		
		try
		{
			console.log("Requesting location permissions");
			const locationStatus = await Geolocation.requestPermissions();
			if (locationStatus.location !== 'granted' && locationStatus.coarseLocation !== 'granted')
			{
				console.log("Location permissions not granted");
				console.error('Permissions Required: Location permissions are required to use Bluetooth features.');
				return false;
			}
			
			console.log("Checking if location services are enabled");
			const locationEnabled = await BleClient.isLocationEnabled();
			if (!locationEnabled)
			{
				console.error('Location Services Disabled: Please enable location services to use Bluetooth features.');
				await BleClient.openLocationSettings();
				return false;
			}
			else
			{
				console.log("Location services enabled");
			}
			
			return true;
		}
		catch (error)
		{
			console.error("Error requesting permissions:", error);
			return false;
		}
	}
	
	/**
	 * Initialize the BLE client.
	 */
	public async initialize()
	{
		// Request permissions
		const permissionsGranted = await this.requestPermissions();
		if (!permissionsGranted)
		{
			console.error("Permissions not granted or location services not enabled");
			return;
		}
		else
		{
			console.log("Permissions granted");
		}
		
		// Initialize the BLE client
		console.log("Initializing BLE client");
		await BleClient.initialize();
		
		if(Capacitor.isNativePlatform())
		{
			console.log("Checking if Bluetooth is enabled");
			const bluetoothEnabled = await BleClient.isEnabled();
			if (!bluetoothEnabled)
			{
				console.error('Bluetooth Disabled: Please enable Bluetooth to use Bluetooth features.');
				await BleClient.openBluetoothSettings();
			}
			else
			{
				console.log("Bluetooth is enabled");
			}
		}
	}
	
	/**
	 * Connect to the BLE server.
	 * @param bluetoothUuid string
	 * @returns boolean
	 */
	public async connect(bluetoothUuid: string): Promise<boolean>
	{
		if(this.connected)
			this.disconnect();
		
		// Set the BLE UUID
		this.BLE_UUID = bluetoothUuid;
		
		try
		{
			console.log("Requesting BLE device...", {
				services: [`${this.BLE_UUID}-${NODE_BLE_UUID}`],
			});
			const device = await BleClient.requestDevice({
				services: [`${this.BLE_UUID}-${NODE_BLE_UUID}`],
			});
			console.log("Device found:", device);
			
			console.log("Connecting to device...");
			await BleClient.connect(device.deviceId);
			console.log("Connected to device");
			
			this.deviceId = device.deviceId;
			this.connected = true;
			console.log('Connected to the BLE device!');
		}
		catch (error)
		{
			console.error('BLE connect (2) error:', error);
			this.deviceId = null;
			this.BLE_UUID = null;
			this.connected = false;
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
				this.BLE_UUID = null;
				this.connected = false;
			}
		}
		catch (error)
		{
			console.error('BLE error:', error);
		}
	}
	
	/**
	 * Get the bluetooth UUID.
	 * @returns string|null
	 */
	public getBleUuid(): string|null
	{
		return this.BLE_UUID;
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
				await BleClient.write(this.deviceId, `${this.BLE_UUID}-${NODE_BLE_UUID}`, `${this.BLE_UUID}-${CHAR_HELLO_UUID}`, encodeDataView(message), {timeout: 30000});
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
				const value = await BleClient.read(this.deviceId, `${this.BLE_UUID}-${NODE_BLE_UUID}`, `${this.BLE_UUID}-${CHAR_HELLO_UUID}`, {timeout: 30000});
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
				await BleClient.startNotifications(this.deviceId, `${this.BLE_UUID}-${NODE_BLE_UUID}`, `${this.BLE_UUID}-${CHAR_HELLO_UUID}`, callback);
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
	 * Read status from the BLE server.
	 * @returns Promise<string|null>
	 */
	public async readNodeStatus(): Promise<string|null>
	{
		try
		{
			if(this.deviceId)
			{
				const value = await BleClient.read(this.deviceId, `${this.BLE_UUID}-${NODE_BLE_UUID}`, `${this.BLE_UUID}-${CHAR_NODE_STATUS_UUID}`, {timeout: 30000});
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
	 * Read moniker from the BLE server.
	 * @returns Promise<string|null>
	 */
	public async readMoniker(): Promise<string|null>
	{
		try
		{
			if(this.deviceId)
			{
				const value = await BleClient.read(this.deviceId, `${this.BLE_UUID}-${NODE_BLE_UUID}`, `${this.BLE_UUID}-${CHAR_MONIKER_UUID}`, {timeout: 30000});
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
				await BleClient.write(this.deviceId, `${this.BLE_UUID}-${NODE_BLE_UUID}`, `${this.BLE_UUID}-${CHAR_MONIKER_UUID}`, encodeDataView(data), {timeout: 30000});
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
				const value = await BleClient.read(this.deviceId, `${this.BLE_UUID}-${NODE_BLE_UUID}`, `${this.BLE_UUID}-${CHAR_NODE_TYPE_UUID}`, {timeout: 30000});
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
				await BleClient.write(this.deviceId, `${this.BLE_UUID}-${NODE_BLE_UUID}`, `${this.BLE_UUID}-${CHAR_NODE_TYPE_UUID}`, encodeDataView(data), {timeout: 30000});
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
				const value = await BleClient.read(this.deviceId, `${this.BLE_UUID}-${NODE_BLE_UUID}`, `${this.BLE_UUID}-${CHAR_NODE_IP_UUID}`, {timeout: 30000});
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
				await BleClient.write(this.deviceId, `${this.BLE_UUID}-${NODE_BLE_UUID}`, `${this.BLE_UUID}-${CHAR_NODE_IP_UUID}`, encodeDataView(data), {timeout: 30000});
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
				const value = await BleClient.read(this.deviceId, `${this.BLE_UUID}-${NODE_BLE_UUID}`, `${this.BLE_UUID}-${CHAR_NODE_PORT_UUID}`, {timeout: 30000});
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
				await BleClient.write(this.deviceId, `${this.BLE_UUID}-${NODE_BLE_UUID}`, `${this.BLE_UUID}-${CHAR_NODE_PORT_UUID}`, encodeDataView(data), {timeout: 30000});
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
				const value = await BleClient.read(this.deviceId, `${this.BLE_UUID}-${NODE_BLE_UUID}`, `${this.BLE_UUID}-${CHAR_VPN_TYPE_UUID}`, {timeout: 30000});
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
				await BleClient.write(this.deviceId, `${this.BLE_UUID}-${NODE_BLE_UUID}`, `${this.BLE_UUID}-${CHAR_VPN_TYPE_UUID}`, encodeDataView(data), {timeout: 30000});
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
	 * Change VPN configuration file and delete unnecessary one.
	 * @returns Promise<number|null>
	 */
	public async readChangeVpnType(): Promise<number|null>
	{
		try
		{
			if(this.deviceId)
			{
				const value = await BleClient.read(this.deviceId, `${this.BLE_UUID}-${NODE_BLE_UUID}`, `${this.BLE_UUID}-${CHAR_CHANGE_VPN_TYPE_UUID}`, {timeout: 30000});
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
	 * Read VPN port from the BLE server.
	 * @returns Promise<number|null>
	 */
	public async readVpnPort(): Promise<number|null>
	{
		try
		{
			if(this.deviceId)
			{
				const value = await BleClient.read(this.deviceId, `${this.BLE_UUID}-${NODE_BLE_UUID}`, `${this.BLE_UUID}-${CHAR_VPN_PORT_UUID}`, {timeout: 30000});
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
				await BleClient.write(this.deviceId, `${this.BLE_UUID}-${NODE_BLE_UUID}`, `${this.BLE_UUID}-${CHAR_VPN_PORT_UUID}`, encodeDataView(data), {timeout: 30000});
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
				const value = await BleClient.read(this.deviceId, `${this.BLE_UUID}-${NODE_BLE_UUID}`, `${this.BLE_UUID}-${CHAR_MAX_PEERS_UUID}`, {timeout: 30000});
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
				await BleClient.write(this.deviceId, `${this.BLE_UUID}-${NODE_BLE_UUID}`, `${this.BLE_UUID}-${CHAR_MAX_PEERS_UUID}`, encodeDataView(data), {timeout: 30000});
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
				await BleClient.write(this.deviceId, `${this.BLE_UUID}-${NODE_BLE_UUID}`, `${this.BLE_UUID}-${CHAR_NODE_CONFIG_UUID}`, encodeDataView(data), {timeout: 30000});
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
				const value = await BleClient.read(this.deviceId, `${this.BLE_UUID}-${NODE_BLE_UUID}`, `${this.BLE_UUID}-${CHAR_NODE_LOCATION_UUID}`, {timeout: 30000});
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
				const value = await BleClient.read(this.deviceId, `${this.BLE_UUID}-${NODE_BLE_UUID}`, `${this.BLE_UUID}-${CHAR_CERT_EXPIRITY_UUID}`, {timeout: 30000});
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
	 * Read online users from the BLE server.
	 * @returns Promise<number|null>
	 */
	public async readOnlineUsers(): Promise<number | null>
	{
		try
		{
			if(this.deviceId)
			{
				const value = await BleClient.read(this.deviceId, `${this.BLE_UUID}-${NODE_BLE_UUID}`, `${this.BLE_UUID}-${CHAR_ONLINE_USERS_UUID}`, {timeout: 30000});
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
	 * Read bandwidth speed from the BLE server.
	 * @returns Promise<BandwidthSpeed|null>
	 */
	public async readBandwidthSpeed(): Promise<BandwidthSpeed|null>
	{
		try
		{
			if(this.deviceId)
			{
				const value = await BleClient.read(this.deviceId, `${this.BLE_UUID}-${NODE_BLE_UUID}`, `${this.BLE_UUID}-${CHAR_BANDWIDTH_SPEED_UUID}`, {timeout: 30000});
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
				const value = await BleClient.read(this.deviceId, `${this.BLE_UUID}-${NODE_BLE_UUID}`, `${this.BLE_UUID}-${CHAR_SYSTEM_UPTIME_UUID}`, {timeout: 30000});
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
				const value = await BleClient.read(this.deviceId, `${this.BLE_UUID}-${NODE_BLE_UUID}`, `${this.BLE_UUID}-${CHAR_CASANODE_VERSION_UUID}`, {timeout: 30000});
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
				const value = await BleClient.read(this.deviceId, `${this.BLE_UUID}-${NODE_BLE_UUID}`, `${this.BLE_UUID}-${CHAR_DOCKER_IMAGE_UUID}`, {timeout: 30000});
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
				const value = await BleClient.read(this.deviceId, `${this.BLE_UUID}-${NODE_BLE_UUID}`, `${this.BLE_UUID}-${CHAR_SYSTEM_OS_UUID}`, {timeout: 30000});
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
				const value = await BleClient.read(this.deviceId, `${this.BLE_UUID}-${NODE_BLE_UUID}`, `${this.BLE_UUID}-${CHAR_SYSTEM_ARCH_UUID}`, {timeout: 30000});
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
				const value = await BleClient.read(this.deviceId, `${this.BLE_UUID}-${NODE_BLE_UUID}`, `${this.BLE_UUID}-${CHAR_SYSTEM_KERNEL_UUID}`, {timeout: 30000});
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
				const value = await BleClient.read(this.deviceId, `${this.BLE_UUID}-${NODE_BLE_UUID}`, `${this.BLE_UUID}-${CHAR_NODE_PASSPHRASE_UUID}`, {timeout: 30000});
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
				await BleClient.write(this.deviceId, `${this.BLE_UUID}-${NODE_BLE_UUID}`, `${this.BLE_UUID}-${CHAR_NODE_PASSPHRASE_UUID}`, encodeDataView(data), {timeout: 30000});
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
				const value = await BleClient.read(this.deviceId, `${this.BLE_UUID}-${NODE_BLE_UUID}`, `${this.BLE_UUID}-${CHAR_PUBLIC_ADDRESS_UUID}`, {timeout: 30000});
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
	 * Read node address from the BLE server.
	 * @returns Promise<string|null>
	 */
	public async readNodeAddress(): Promise<string|null>
	{
		try
		{
			if(this.deviceId)
			{
				const value = await BleClient.read(this.deviceId, `${this.BLE_UUID}-${NODE_BLE_UUID}`, `${this.BLE_UUID}-${CHAR_ADDRESS_NODE_UUID}`, {timeout: 30000});
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
	 * Start fetching the node balance from the BLE server and wait until it's ready.
	 * @returns Promise<NodeBalance|null>
	 */
	public async fetchNodeBalance(): Promise<NodeBalance|null>
	{
		try
		{
			if (this.deviceId)
			{
				// Start the balance fetching process by writing a command to the characteristic
				await BleClient.write(this.deviceId, `${this.BLE_UUID}-${NODE_BLE_UUID}`, `${this.BLE_UUID}-${CHAR_NODE_BALANCE_UUID}`, encodeDataView('udvpn'), {timeout: 30000});
				
				let status = 0;
				// Check the balance status every 5 seconds
				const interval = 5000;
				// Timeout after 3 minutes
				const timeout = 180000;
				const startTime = Date.now();
				
				while (status !== -1 && (Date.now() - startTime) < timeout)
				{
					const value = await BleClient.read(this.deviceId, `${this.BLE_UUID}-${NODE_BLE_UUID}`, `${this.BLE_UUID}-${CHAR_NODE_BALANCE_UUID}`, {timeout: 30000});
					const valueString = decodeDataView(value);
					
					// Regex to match a string that starts with a number followed by a space and a currency code
					const balanceRegex = /^(\d+(\.\d+)?)\s([A-Za-z]+)$/;
					
					// Check if the result is a valid balance format
					const match = valueString.match(balanceRegex);
					if (match)
					{
						const balance = match.slice(1, 3); // Extract the amount and denom from the match
						return {
							amount: parseFloat(balance[0]),
							denom: balance[2],
						};
					}
					else
					{
						// If the result is a status code (0, 1, -1)
						status = parseInt(valueString);
						
						// Error fetching balance
						if (status === -1)
						{
							console.error('Balance fetch failed.');
							return null;
						}
					}
					
					// Wait before checking again
					await this.delay(interval);
				}
				
				// If the timeout is reached
				console.error('Balance fetch timed out.');
				return null;
			}
		}
		catch (error)
		{
			console.error('BLE error:', error);
		}
		
		return null;
	}
	
	/**
	 * Read check image from the BLE server.
	 * @returns Promise<string>
	 */
	public async readCheckInstallation(): Promise<string>
	{
		try
		{
			if(this.deviceId)
			{
				const value = await BleClient.read(this.deviceId, `${this.BLE_UUID}-${NODE_BLE_UUID}`, `${this.BLE_UUID}-${CHAR_CHECK_INSTALL_UUID}`, {timeout: 30000});
				return decodeDataView(value);
			}
		}
		catch (error)
		{
			console.error('BLE error:', error);
		}
		
		return '0000';
	}
	
	/**
	 * Start the installation of the Docker image and check the status.
	 * @returns Promise<number>
	 */
	public async installDockerImage(): Promise<number>
	{
		try
		{
			if (this.deviceId)
			{
				// Start the installation by writing to the characteristic
				await BleClient.write(this.deviceId, `${this.BLE_UUID}-${NODE_BLE_UUID}`, `${this.BLE_UUID}-${CHAR_INSTALL_IMAGE_UUID}`, encodeDataView('install'), {timeout: 30000});
				
				let status = 0;
				// Check the installation status every 5 seconds
				const interval = 5000;
				// Timeout after 5 minutes
				const timeout = 300000;
				const startTime = Date.now();
				
				// Wait for the installation to complete
				while (status !== 2 && status !== -1 && (Date.now() - startTime) < timeout)
				{
					// Read the status from the BLE server
					const value = await BleClient.read(this.deviceId, `${this.BLE_UUID}-${NODE_BLE_UUID}`, `${this.BLE_UUID}-${CHAR_INSTALL_IMAGE_UUID}`);
					// Parse the status
					status = parseInt(decodeDataView(value));
					// If the installation is successful
					if (status === 2)
					{
						console.log('Installation completed successfully.');
						return 1;
					}
					// If the installation failed
					else if (status === -1)
					{
						console.error('Installation failed.');
						return -1;
					}
					
					// Wait for the next check
					await this.delay(interval);
				}
				
				// If the installation timed out
				if (status !== 2 && status !== -1)
				{
					return -1;
				}
				
				return status;
			}
		}
		catch (error)
		{
			console.error('BLE error:', error);
		}
		
		return -1;
	}
	
	/**
	 * Send create config files to the BLE server and wait for completion.
	 * @returns Promise<string>
	 */
	public async installConfigs(): Promise<string>
	{
		try
		{
			if (this.deviceId)
			{
				// Start the configuration installation process by writing to the characteristic
				await BleClient.write(this.deviceId, `${this.BLE_UUID}-${NODE_BLE_UUID}`, `${this.BLE_UUID}-${CHAR_INSTALL_CONFIGS_UUID}`, encodeDataView('create'), {timeout: 30000});
				
				let status = '0';
				// Check the configuration status every 5 seconds
				const interval = 5000;
				// Timeout after 3 minutes
				const timeout = 180000;
				const startTime = Date.now();
				
				while (status === '0' || status === '1')
				{
					if ((Date.now() - startTime) > timeout)
					{
						console.error('Configuration installation timed out.');
						return '000';
					}
					
					// Read the status from the BLE server
					const value = await BleClient.read(this.deviceId, `${this.BLE_UUID}-${NODE_BLE_UUID}`, `${this.BLE_UUID}-${CHAR_INSTALL_CONFIGS_UUID}`, {timeout: 30000});
					status = decodeDataView(value);
					
					// Check if the status indicates an error
					if (status === '-1')
					{
						console.error('Configuration installation failed.');
						return '000';
					}
					
					// Wait before checking again
					await this.delay(interval);
				}
				
				// Return the final status after the process is complete
				return status;
			}
		}
		catch (error)
		{
			console.error('BLE error:', error);
		}
		
		return '000';
	}
	
	/**
	 * Send start node command to the BLE server.
	 * @returns Promise<boolean>
	 */
	public async startNode(): Promise<boolean>
	{
		try
		{
			if(this.deviceId)
			{
				await BleClient.write(this.deviceId, `${this.BLE_UUID}-${NODE_BLE_UUID}`, `${this.BLE_UUID}-${CHAR_NODE_ACTIONS_UUID}`, encodeDataView('start'), {timeout: 30000});
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
	 * Send stop node command to the BLE server.
	 * @returns Promise<boolean>
	 */
	public async stopNode(): Promise<boolean>
	{
		try
		{
			if(this.deviceId)
			{
				await BleClient.write(this.deviceId, `${this.BLE_UUID}-${NODE_BLE_UUID}`, `${this.BLE_UUID}-${CHAR_NODE_ACTIONS_UUID}`, encodeDataView('stop'), {timeout: 30000});
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
	 * Send restart node command to the BLE server.
	 * @returns Promise<boolean>
	 */
	public async restartNode(): Promise<boolean>
	{
		try
		{
			if(this.deviceId)
			{
				await BleClient.write(this.deviceId, `${this.BLE_UUID}-${NODE_BLE_UUID}`, `${this.BLE_UUID}-${CHAR_NODE_ACTIONS_UUID}`, encodeDataView('restart'), {timeout: 30000});
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
	 * Send remove node command to the BLE server.
	 * @returns Promise<boolean>
	 */
	public async removeNode(): Promise<boolean>
	{
		try
		{
			if(this.deviceId)
			{
				await BleClient.write(this.deviceId, `${this.BLE_UUID}-${NODE_BLE_UUID}`, `${this.BLE_UUID}-${CHAR_NODE_ACTIONS_UUID}`, encodeDataView('remove'), {timeout: 30000});
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
	 * Send update system command to the BLE server.
	 * @returns Promise<boolean>
	 */
	public async updateSystem(): Promise<boolean>
	{
		try
		{
			if(this.deviceId)
			{
				await BleClient.write(this.deviceId, `${this.BLE_UUID}-${NODE_BLE_UUID}`, `${this.BLE_UUID}-${CHAR_SYSTEM_ACTIONS_UUID}`, encodeDataView('update'), {timeout: 900000});
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
	 * Send reset system command to the BLE server.
	 * @returns Promise<boolean>
	 */
	public async resetSystem(): Promise<boolean>
	{
		try
		{
			if(this.deviceId)
			{
				await BleClient.write(this.deviceId, `${this.BLE_UUID}-${NODE_BLE_UUID}`, `${this.BLE_UUID}-${CHAR_SYSTEM_ACTIONS_UUID}`, encodeDataView('reset'), {timeout: 120000});
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
	 * Send reboot system command to the BLE server.
	 * @returns Promise<boolean>
	 */
	public async rebootSystem(): Promise<boolean>
	{
		try
		{
			if(this.deviceId)
			{
				await BleClient.write(this.deviceId, `${this.BLE_UUID}-${NODE_BLE_UUID}`, `${this.BLE_UUID}-${CHAR_SYSTEM_ACTIONS_UUID}`, encodeDataView('reboot'), {timeout: 30000});
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
	 * Send shutdown system command to the BLE server.
	 * @returns Promise<boolean>
	 */
	public async shutdownSystem(): Promise<boolean>
	{
		try
		{
			if(this.deviceId)
			{
				await BleClient.write(this.deviceId, `${this.BLE_UUID}-${NODE_BLE_UUID}`, `${this.BLE_UUID}-${CHAR_SYSTEM_ACTIONS_UUID}`, encodeDataView('halt'), {timeout: 30000});
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
	 * Send renew certificate command to the BLE server.
	 * @returns Promise<boolean>
	 */
	public async renewCertificate(): Promise<boolean>
	{
		try
		{
			if(this.deviceId)
			{
				await BleClient.write(this.deviceId, `${this.BLE_UUID}-${NODE_BLE_UUID}`, `${this.BLE_UUID}-${CHAR_CERTIFICATE_ACTIONS_UUID}`, encodeDataView('renew'), {timeout: 300000});
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
	 * Split the data into chunks.
	 * @param data Buffer
	 * @param chunkSize number
	 * @returns Buffer[]
	 */
	private splitIntoChunks(data: Buffer, chunkSize: number): Buffer[]
	{
		// Create an array to store the chunks
		const chunks: Buffer[] = [];
		
		// Split the data into chunks
		for (let i = 0; i < data.length; i += chunkSize)
		{
			const end = i + chunkSize;
			const chunk = (end < data.length) ? Buffer.alloc(chunkSize) : Buffer.alloc(data.length - i);
			data.copy(chunk, 0, i, end);
			chunks.push(chunk);
		}
		
		// Return the chunks
		return chunks;
	}
	
	
	/**
	 * Read mnemonic from the BLE server.
	 * @returns Promise<string | null>
	 */
	public async readMnemonic(): Promise<string | null>
	{
		try
		{
			if (this.deviceId)
			{
				// Read the length of the data first
				const lengthBuffer = await BleClient.read(this.deviceId, `${this.BLE_UUID}-${NODE_BLE_UUID}`, `${this.BLE_UUID}-${CHAR_WALLET_MNEMONIC_UUID}`, {timeout: 30000});
				const length = lengthBuffer.getUint32(0, true);
				let dataBuffer = Buffer.alloc(0);
				
				do
				{
					// Read the next chunk
					const chunk = await BleClient.read(this.deviceId, `${this.BLE_UUID}-${NODE_BLE_UUID}`, `${this.BLE_UUID}-${CHAR_WALLET_MNEMONIC_UUID}`, {timeout: 30000});
					// console.log(`Received chunk: ${chunk.buffer.toString()} (${chunk.buffer.length} bytes)`);
					dataBuffer = Buffer.concat([dataBuffer, Buffer.from(chunk.buffer)]);
				}
				while(dataBuffer.toString('utf-8').length < length)
				
				// Process the received data
				const receivedStr = dataBuffer.toString('utf-8');
				const parts = receivedStr.split(' ');
				const hash = parts.pop();
				const mnemonic = parts.join(' ');
				
				const calculatedHash = cryptoJs.SHA256(mnemonic).toString();
				if (calculatedHash === hash)
				{
					return mnemonic;
				}
				else
				{
					console.error('Hash mismatch for received mnemonic');
					return null;
				}
			}
		}
		catch (error)
		{
			console.error('BLE error:', error);
		}
		
		return null;
	}
	
	/**
	 * Send mnemonic to the BLE server.
	 * @param data string
	 * @returns Promise<boolean>
	 */
	public async writeMnemonic(data: string): Promise<boolean>
	{
		try
		{
			if(this.deviceId)
			{
				const hash = cryptoJs.SHA256(data).toString();
				const dataToSend = `${data} ${hash}`;
				const dataBuffer = Buffer.from(dataToSend);
				
				// console.log(`Sending mnemonic: ${data} ${hash} (${dataBuffer.length} bytes)`);
				
				// Send the length of the data first
				const lengthBuffer = Buffer.alloc(4);
				lengthBuffer.writeUInt32LE(dataBuffer.length, 0);
				await BleClient.write(this.deviceId, `${this.BLE_UUID}-${NODE_BLE_UUID}`, `${this.BLE_UUID}-${CHAR_WALLET_MNEMONIC_UUID}`, new DataView(lengthBuffer.buffer), {timeout: 30000});
				
				// Send the data in chunks
				const chunks = this.splitIntoChunks(dataBuffer, 20);
				for (const chunk of chunks)
				{
					// console.log(`Sending chunk: ${chunk.toString('utf-8')} (${chunk.length} bytes)`)
					await BleClient.write(this.deviceId, `${this.BLE_UUID}-${NODE_BLE_UUID}`, `${this.BLE_UUID}-${CHAR_WALLET_MNEMONIC_UUID}`, new DataView(chunk.buffer), {timeout: 30000});
				}
				
				// Return true if the mnemonic was sent successfully
				return true;
			}
		}
		catch (error)
		{
			console.error('BLE error:', error);
		}
		
		// Return false if there was an error
		return false;
	}
	
	/**
	 * Perform a wallet action on the BLE server.
	 * @param action string
	 * @returns Promise<boolean>
	 */
	public async performWalletAction(action: string): Promise<boolean>
	{
		// Check if the action is valid
		if(action !== 'create' && action !== 'restore' && action !== 'remove')
			return false;
		
		try
		{
			if(this.deviceId)
			{
				await BleClient.write(this.deviceId, `${this.BLE_UUID}-${NODE_BLE_UUID}`, `${this.BLE_UUID}-${CHAR_WALLET_ACTIONS_UUID}`, encodeDataView(action), {timeout: 30000});
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
	 * Read keyring backend from the BLE server.
	 * @returns Promise<string|null>
	 */
	public async readKeyringBackend(): Promise<string|null>
	{
		try
		{
			if(this.deviceId)
			{
				const value = await BleClient.read(this.deviceId, `${this.BLE_UUID}-${NODE_BLE_UUID}`, `${this.BLE_UUID}-${CHAR_NODE_KEYRING_BACKEND_UUID}`, {timeout: 30000});
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
	 * Send keyring backend to the BLE server.
	 * @param data string
	 * @returns Promise<boolean>
	 */
	public async writeKeyringBackend(data: string): Promise<boolean>
	{
		try
		{
			if(this.deviceId)
			{
				await BleClient.write(this.deviceId, `${this.BLE_UUID}-${NODE_BLE_UUID}`, `${this.BLE_UUID}-${CHAR_NODE_KEYRING_BACKEND_UUID}`, encodeDataView(data), {timeout: 30000});
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
	 * Delay function to wait for a specified amount of time
	 * @param ms number
	 * @returns Promise<void>
	 */
	private delay(ms: number): Promise<void>
	{
		return new Promise(resolve => setTimeout(resolve, ms));
	}
	
}

export default BluetoothService.getInstance();
