import { BleClient } from '@capacitor-community/bluetooth-le';
import type { Callback } from '@capacitor-community/bluetooth-le';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';
import { Buffer } from 'buffer';
import * as cryptoJs from 'crypto-js';
import { v5 as uuidv5 } from 'uuid';
import { type BandwidthSpeed } from '@stores/NodeStore';

const BLE_UUID = '00001820-0000-1000-8000-00805f9b34fb';
const CHAR_DISCOVERY_UUID = '0000a2d4-0000-1000-8000-00805f9b34fb';

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
	private BLE_CHARACTERISTIC_SEED: string | null = null;
	
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
	 * Generate a UUID from a seed and a characteristic ID
	 * @param characteristicId string
	 * @returns string
	 */
	private generateUUIDFromSeed(characteristicId: string) : string
	{
		return uuidv5(`${this.BLE_CHARACTERISTIC_SEED}+${characteristicId}`, uuidv5.URL);
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
	 * @param bleCharacteristicSeed string
	 * @returns boolean
	 */
	public async connect(bleCharacteristicSeed: string): Promise<boolean>
	{
		if(this.connected)
			await this.disconnect();
		
		// Set the BLE UUID
		this.BLE_CHARACTERISTIC_SEED = bleCharacteristicSeed;
		
		try
		{
			console.log("Requesting BLE device...", {
				services: [BLE_UUID],
			});
			const device = await BleClient.requestDevice({
				name: "Casanode",
				optionalServices: [BLE_UUID],
			});
			console.log("Device found:", device);
			
			console.log("Connecting to device...");
			await BleClient.connect(device.deviceId);
			console.log("Connected to device");
			
			await BleClient.getServices(device.deviceId);
			console.log("GATT services discovered");
			
			this.deviceId = device.deviceId;
			this.connected = true;
			console.log('Connected to the BLE device!');
		}
		catch (error)
		{
			console.error('BLE connect (2) error:', error);
			this.deviceId = null;
			this.BLE_CHARACTERISTIC_SEED = null;
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
				for (const charId of ['install-configs', 'install-docker-image'])
				{
					const uuid = this.generateUUIDFromSeed(charId);
					await BleClient.stopNotifications(this.deviceId, BLE_UUID, uuid).catch(() => {});
				}
				// Disconnect from the BLE server
				await BleClient.disconnect(this.deviceId);
				this.deviceId = null;
				this.BLE_CHARACTERISTIC_SEED = null;
				this.connected = false;
			}
		}
		catch (error)
		{
			console.error('BLE error:', error);
		}
	}
	
	/**
	 * Delay function to wait for a specified time.
	 * @param charId 
	 * @param isDone 
	 * @param timeout 
	 * @returns 
	 */
	private async waitForNotification(
		charId: string,
		isDone: (s: string) => boolean,
		timeout = 180000
	): Promise<string> 
	{
		if (!this.deviceId)
			throw new Error('No device');
		
		const uuid = this.generateUUIDFromSeed(charId);
		
		return new Promise<string>(async (resolve, reject) => 
		{
			const timer = setTimeout(async () => 
			{
				await BleClient.stopNotifications(this.deviceId!, BLE_UUID, uuid).catch(() => {});
				reject(new Error('timeout'));
			}, timeout);
			
			const callback: Callback = (value: any) => 
			{
				const status = decodeDataView(value);
				if (isDone(status)) 
				{
					clearTimeout(timer);
					BleClient.stopNotifications(this.deviceId!, BLE_UUID, uuid).catch(() => {});
					resolve(status);
				}
			};
			
			try 
			{
				await BleClient.startNotifications(this.deviceId!, BLE_UUID, uuid, callback);
			}
			catch (err) 
			{
				clearTimeout(timer);
				reject(err);
			}
		});
	}
	
	/**
	 * Get the bluetooth UUID.
	 * @returns string | undefined
	 */
	public getDeviceUuid(): string | undefined
	{
		return this.BLE_CHARACTERISTIC_SEED ?? undefined;
	}
	
	/**
	 * Get the BLE characteristic discovery UUID.
	 * @returns string
	 */
	public getBleCharacteristicDiscoveryUuid(): string
	{
		return CHAR_DISCOVERY_UUID;
	}
	
	/**
	 * Get the BLE characteristic seed.
	 * @returns string|null
	 */
	public getBleCharacteristicSeedUuid(): string|null
	{
		return this.BLE_CHARACTERISTIC_SEED;
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
	 * Read the discovery information from the BLE device.
	 * @returns Promise<string | null>
	 */
	public async readDiscoveryInfos(): Promise<string | null>
	{
		try
		{
			if(!this.deviceId)
			{
				console.error('Device not connected');
				return null;
			}
			const value = await BleClient.read(this.deviceId, BLE_UUID, CHAR_DISCOVERY_UUID);
			return decodeDataView(value);
		}
		catch(error)
		{
			console.error('Failed to read IP and port', error);
			return null;
		}
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
				const value = await BleClient.read(this.deviceId, BLE_UUID, this.generateUUIDFromSeed('node-status'), {timeout: 30000});
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
				const value = await BleClient.read(this.deviceId, BLE_UUID, this.generateUUIDFromSeed('moniker'), {timeout: 30000});
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
				await BleClient.write(this.deviceId, BLE_UUID, this.generateUUIDFromSeed('moniker'), encodeDataView(data), {timeout: 30000});
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
				const value = await BleClient.read(this.deviceId, BLE_UUID, this.generateUUIDFromSeed('node-type'), {timeout: 30000});
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
				await BleClient.write(this.deviceId, BLE_UUID, this.generateUUIDFromSeed('node-type'), encodeDataView(data), {timeout: 30000});
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
				const value = await BleClient.read(this.deviceId, BLE_UUID, this.generateUUIDFromSeed('node-ip'), {timeout: 30000});
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
				await BleClient.write(this.deviceId, BLE_UUID, this.generateUUIDFromSeed('node-ip'), encodeDataView(data), {timeout: 30000});
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
				const value = await BleClient.read(this.deviceId, BLE_UUID, this.generateUUIDFromSeed('node-port'), {timeout: 30000});
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
				await BleClient.write(this.deviceId, BLE_UUID, this.generateUUIDFromSeed('node-port'), encodeDataView(data), {timeout: 30000});
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
				const value = await BleClient.read(this.deviceId, BLE_UUID, this.generateUUIDFromSeed('vpn-type'), {timeout: 30000});
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
				await BleClient.write(this.deviceId, BLE_UUID, this.generateUUIDFromSeed('vpn-type'), encodeDataView(data), {timeout: 30000});
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
				const value = await BleClient.read(this.deviceId, BLE_UUID, this.generateUUIDFromSeed('vpn-port'), {timeout: 30000});
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
				await BleClient.write(this.deviceId, BLE_UUID, this.generateUUIDFromSeed('vpn-port'), encodeDataView(data), {timeout: 30000});
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
				const value = await BleClient.read(this.deviceId, BLE_UUID, this.generateUUIDFromSeed('max-peers'), {timeout: 30000});
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
				await BleClient.write(this.deviceId, BLE_UUID, this.generateUUIDFromSeed('max-peers'), encodeDataView(data), {timeout: 30000});
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
				const value = await BleClient.read(this.deviceId, BLE_UUID, this.generateUUIDFromSeed('node-location'), {timeout: 30000});
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
	 * Read certificate expirity from the BLE server.
	 * @returns Promise<string|null>
	 */
	public async readCertExpirity(): Promise<string|null>
	{
		try
		{
			if(this.deviceId)
			{
				const value = await BleClient.read(this.deviceId, BLE_UUID, this.generateUUIDFromSeed('cert-expirity'), {timeout: 30000});
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
				const value = await BleClient.read(this.deviceId, BLE_UUID, this.generateUUIDFromSeed('online-users'), {timeout: 30000});
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
				const value = await BleClient.read(this.deviceId, BLE_UUID, this.generateUUIDFromSeed('bandwidth-speed'), {timeout: 30000});
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
				const value = await BleClient.read(this.deviceId, BLE_UUID, this.generateUUIDFromSeed('system-uptime'), {timeout: 30000});
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
				const value = await BleClient.read(this.deviceId, BLE_UUID, this.generateUUIDFromSeed('casanode-version'), {timeout: 30000});
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
				const value = await BleClient.read(this.deviceId, BLE_UUID, this.generateUUIDFromSeed('docker-image'), {timeout: 30000});
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
				const value = await BleClient.read(this.deviceId, BLE_UUID, this.generateUUIDFromSeed('system-os'), {timeout: 30000});
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
				const value = await BleClient.read(this.deviceId, BLE_UUID, this.generateUUIDFromSeed('system-arch'), {timeout: 30000});
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
				const value = await BleClient.read(this.deviceId, BLE_UUID, this.generateUUIDFromSeed('system-kernel'), {timeout: 30000});
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
	public async readNodePassphrase(): Promise<string>
	{
		try
		{
			if(this.deviceId)
			{
				const value = await BleClient.read(this.deviceId, BLE_UUID, this.generateUUIDFromSeed('node-passphrase'), {timeout: 30000});
				return decodeDataView(value);
			}
		}
		catch (error)
		{
			console.error('BLE error:', error);
		}
		// enabled: false, available: false
		return "00";
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
				await BleClient.write(this.deviceId, BLE_UUID, this.generateUUIDFromSeed('node-passphrase'), encodeDataView(data), {timeout: 30000});
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
	 * Read wallet address from the BLE server.
	 * @returns Promise<string|null>
	 */
	public async readWalletAddress(): Promise<string|null>
	{
		try
		{
			if(this.deviceId)
			{
				const value = await BleClient.read(this.deviceId, BLE_UUID, this.generateUUIDFromSeed('wallet-address'), {timeout: 30000});
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
				const value = await BleClient.read(this.deviceId, BLE_UUID, this.generateUUIDFromSeed('node-address'), {timeout: 30000});
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
	 * @returns Promise<string|null>
	 */
	public async fetchNodeBalance(): Promise<string|null> 
	{
		if (!this.deviceId)
			return null;
		
		const charId = 'node-balance';
		const uuid = this.generateUUIDFromSeed(charId);
		
		await BleClient.startNotifications(this.deviceId, BLE_UUID, uuid, () => {});
		await BleClient.write(this.deviceId, BLE_UUID, uuid, encodeDataView('udvpn'));
		try
		{
			const result = await this.waitForNotification(
				charId,
				s => /^-1$/.test(s) || /^\d+(\.\d+)?\s[A-Za-z]+$/.test(s)
			);
			return result === '-1' ? null : result;
		}
		catch
		{
			console.error('Balance fetch timed out');
			return null;
		}
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
				const value = await BleClient.read(this.deviceId, BLE_UUID, this.generateUUIDFromSeed('check-installation'), {timeout: 30000});
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
		if (!this.deviceId)
			return -1;
		
		const charId = 'install-docker-image';
		const uuid   = this.generateUUIDFromSeed(charId);
		
		await BleClient.startNotifications(this.deviceId, BLE_UUID, uuid, () => {});
		await BleClient.write(this.deviceId, BLE_UUID, uuid, encodeDataView('install'), { timeout: 30000 });
		
		const result = await this.waitForNotification(
			charId,
			s => s === '2' || s === '-1',
			300000
		);
		
		return result === '2' ? 1 : -1;
	}
	
	/**
	 * Send create config files to the BLE server and wait for completion.
	 * @returns Promise<string>
	 */
	public async installConfigs(): Promise<string> 
	{
		if (!this.deviceId)
			return '000';

		const charId = 'install-configs';
		const uuid   = this.generateUUIDFromSeed(charId);
		
		await BleClient.startNotifications(this.deviceId, BLE_UUID, uuid, () => {});
		await BleClient.write(this.deviceId, BLE_UUID, uuid, encodeDataView('create'), { timeout: 30000 });
		
		const result = await this.waitForNotification(
			charId,
			s => s !== '0' && s !== '1',
			180000
		);
		
		return result === '-1' ? '000' : result;
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
				await BleClient.write(this.deviceId, BLE_UUID, this.generateUUIDFromSeed('node-actions'), encodeDataView('start'), {timeout: 30000});
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
				await BleClient.write(this.deviceId, BLE_UUID, this.generateUUIDFromSeed('node-actions'), encodeDataView('stop'), {timeout: 30000});
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
				await BleClient.write(this.deviceId, BLE_UUID, this.generateUUIDFromSeed('node-actions'), encodeDataView('restart'), {timeout: 30000});
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
				await BleClient.write(this.deviceId, BLE_UUID, this.generateUUIDFromSeed('node-actions'), encodeDataView('remove'), {timeout: 30000});
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
	 * Send update system command to the BLE server and wait for completion.
	 * @returns Promise<boolean>
	 */
	public async updateSystem(): Promise<boolean>
	{
		const charId = 'system-actions';
		const uuid   = this.generateUUIDFromSeed(charId);
		
		if (!this.deviceId)
			return false;
		
		await BleClient.startNotifications(this.deviceId, BLE_UUID, uuid, () => {});
		await BleClient.write(this.deviceId, BLE_UUID, uuid, encodeDataView('update-system'), {timeout: 30000});
		
		// wait for either '2' or '-1'
		try
		{
			const result = await this.waitForNotification(
				charId,
				s => s === '2' || s === '-1',
				300000
			);
			return result === '2';
		}
		catch
		{
			console.error('System update timed out');
			return false;
		}
		finally
		{
			await BleClient.stopNotifications(this.deviceId, BLE_UUID, uuid);
		}
	}
	
	/**
	 * Send update sentinel command to the BLE server and wait for completion.
	 * @returns Promise<boolean>
	 */
	public async updateSentinel(): Promise<boolean>
	{
		const charId = 'system-actions';
		const uuid   = this.generateUUIDFromSeed(charId);
		
		if (!this.deviceId)
			return false;
		
		await BleClient.startNotifications(this.deviceId, BLE_UUID, uuid, () => {});
		await BleClient.write(this.deviceId, BLE_UUID, uuid, encodeDataView('update-sentinel'), {timeout: 30000});
		
		try
		{
			const result = await this.waitForNotification(
				charId,
				s => s === '2' || s === '-1',
				120000
			);
			return result === '2';
		}
		catch
		{
			console.error('Sentinel update timed out');
			return false;
		}
		finally
		{
			await BleClient.stopNotifications(this.deviceId, BLE_UUID, uuid);
		}
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
				await BleClient.write(this.deviceId, BLE_UUID, this.generateUUIDFromSeed('system-actions'), encodeDataView('reset'), {timeout: 30000});
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
				await BleClient.write(this.deviceId, BLE_UUID, this.generateUUIDFromSeed('system-actions'), encodeDataView('reboot'), {timeout: 30000});
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
				await BleClient.write(this.deviceId, BLE_UUID, this.generateUUIDFromSeed('system-actions'), encodeDataView('halt'), {timeout: 30000});
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
	 * Send renew certificate command to the BLE server and wait for completion.
	 * @returns Promise<boolean>
	 */
	public async renewCertificate(): Promise<boolean>
	{
		try
		{
			if (this.deviceId)
			{
				// Start the certificate renewal process by writing to the characteristic
				await BleClient.write(this.deviceId, BLE_UUID, this.generateUUIDFromSeed('certificate-actions'), encodeDataView('renew'), {timeout: 30000});
				
				let status = '0';
				// Check the certificate status every 500ms
				const interval = 500;
				// Timeout after 3 minutes
				const timeout = 180000;
				const startTime = Date.now();
				
				while (status === '0' || status === '1')
				{
					if ((Date.now() - startTime) > timeout)
					{
						console.error('Certificate renewal timed out.');
						return false;
					}
					
					// Read the status from the BLE server
					const value = await BleClient.read(this.deviceId, BLE_UUID, this.generateUUIDFromSeed('certificate-actions'), {timeout: 30000});
					status = decodeDataView(value);

					// Check if the status indicates an error
					if (status === '-1')
					{
						console.error('Certificate renewal failed.');
						return false;
					}
					
					// Wait before checking again
					await this.delay(interval);
				}
				
				// If the status is '2', it means the certificate renewal was successful
				return status === '2';
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
	 * Create a wallet and return the mnemonic.
	 * The process is as follows:
	 *  1. Read the first 4 bytes to get the total length (in bytes) of the mnemonic data.
	 *  2. Read successive chunks until the accumulated length equals the expected total length.
	 *  3. Convert the received data to a string, split it into the mnemonic and the hash, and verify integrity.
	 *  4. Return the mnemonic if the hash matches; otherwise, return null.
	 *
	 * @returns Promise<string | null> The wallet mnemonic or null in case of an error.
	 */
	public async readWalletMnemonic(): Promise<string | null> 
	{
		try 
		{
			if (!this.deviceId) 
			{
				console.error('No device id available');
				return null;
			}
			
			// Step 1: Read the initial 4 bytes which represent the total data length (little-endian)
			const lengthBuffer = await BleClient.read(
				this.deviceId,
				BLE_UUID,
				this.generateUUIDFromSeed('wallet-mnemonic'),
				{ timeout: 30000 }
			);
			const expectedLength = lengthBuffer.getUint32(0, true);
			
			// Step 2: Accumulate data chunks until the total received length matches the expected length
			let dataBuffer = Buffer.alloc(0);
			while (dataBuffer.length < expectedLength) 
			{
				const chunkView = await BleClient.read(
				this.deviceId,
				BLE_UUID,
				this.generateUUIDFromSeed('wallet-mnemonic'), { timeout: 30000 });
				const chunkBuffer = Buffer.from(chunkView.buffer);
				dataBuffer = Buffer.concat([dataBuffer, chunkBuffer]);
			}
			
			// Convert the complete data to a UTF-8 string
			const receivedStr = dataBuffer.toString('utf-8');
			
			// Step 3: If the received string is "error", log and return null
			if (receivedStr === 'error') 
			{
				console.error('Received error from BLE characteristic');
				return null;
			}
			
			// The expected format is "<mnemonic> <hash>"
			// Split the string into parts and separate the hash from the mnemonic
			const parts = receivedStr.split(' ');
			const receivedHash = parts.pop() as string;
			const mnemonic = parts.join(' ');
			
			// Step 4: Verify the mnemonic's integrity by comparing the SHA256 hash
			const calculatedHash = cryptoJs.SHA256(mnemonic).toString();
			if (calculatedHash === receivedHash) 
			{
				return mnemonic;
			}
			else
			{
				console.error('Hash mismatch for received mnemonic');
				return null;
			}
		}
		catch (error) 
		{
			console.error('BLE error:', error);
			return null;
		}
	}
	
	
	/**
	 * Send mnemonic to the BLE server.
	 * @param data string
	 * @returns Promise<boolean>
	 */
	public async writeWalletMnemonic(data: string): Promise<boolean>
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
				await BleClient.write(this.deviceId, BLE_UUID, this.generateUUIDFromSeed('wallet-mnemonic'), new DataView(lengthBuffer.buffer), {timeout: 30000});
				
				// Send the data in chunks
				const chunks = this.splitIntoChunks(dataBuffer, 20);
				for (const chunk of chunks)
				{
					// console.log(`Sending chunk: ${chunk.toString('utf-8')} (${chunk.length} bytes)`)
					await BleClient.write(this.deviceId, BLE_UUID, this.generateUUIDFromSeed('wallet-mnemonic'), new DataView(chunk.buffer), {timeout: 30000});
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
		if(action !== 'remove')
			return false;
		
		try
		{
			if(this.deviceId)
			{
				await BleClient.write(this.deviceId, BLE_UUID, this.generateUUIDFromSeed('wallet-actions'), encodeDataView(action), {timeout: 30000});
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
				const value = await BleClient.read(this.deviceId, BLE_UUID, this.generateUUIDFromSeed('node-keyring-backend'), {timeout: 30000});
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
				await BleClient.write(this.deviceId, BLE_UUID, this.generateUUIDFromSeed('node-keyring-backend'), encodeDataView(data), {timeout: 30000});
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
	 * Send a check port command to the BLE server and wait for completion.
	 * @param portType 'node' or 'vpn'
	 * @returns Promise<string> - 'open' or 'closed'
	 */
	public async checkPort(portType: 'node' | 'vpn'): Promise<string | null>
	{
		try
		{
			if (this.deviceId)
			{
				// Start the port check process by writing to the characteristic
				await BleClient.write(this.deviceId, BLE_UUID, this.generateUUIDFromSeed('check-port'), encodeDataView(portType), {timeout: 30000});
				
				let status = '0';
				// Check the certificate status every 500ms
				const interval = 500;
				// 2 minutes timeout
				const timeout = 120000;
				const startTime = Date.now();
				
				// While NOT_STARTED or IN_PROGRESS
				while (status === '0' || status === '1')
				{
					if ((Date.now() - startTime) > timeout)
					{
						console.error('Port check timed out.');
						return null;
					}
					
					// Read the status from the BLE server
					const value = await BleClient.read(this.deviceId, BLE_UUID, this.generateUUIDFromSeed('check-port'), {timeout: 30000});
					status = decodeDataView(value);
					
					// Check if the status indicates an error
					if (status === '-1')
					{
						console.error('Port check failed.');
						return 'closed';
					}
					
					// Wait before checking again
					await this.delay(interval);
				}
				
				// Return the result based on the final status
				if (status === '2')
					return 'open';
				else if (status === '3')
					return 'closed';
			}
		}
		catch (error)
		{
			console.error('BLE error:', error);
		}
		
		return null;
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
