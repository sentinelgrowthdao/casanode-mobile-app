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

/**
 * Interface WalletNotification
 */
interface WalletNotification
{
	status: 'in_progress' | 'success' | 'error'
	mnemonic?: string			// only present if success
	message? : string			// only present if error
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
	 * Reconnect to the BLE server.
	 * @returns boolean
	 */
	public async reconnect(): Promise<boolean>
	{
		console.log("Reconnecting to BLE device...");
		return this.connect(this.BLE_CHARACTERISTIC_SEED!);
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
				for (const charId of [
					'install-configs',
					'install-docker-image',
					'node-balance',
					'system-actions',
					'certificate-actions',
					'check-port',
				])
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
			console.error('disconnect(): BLE error:', error);
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
			console.error('readNodeStatus(): BLE error:', error);
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
			console.error('readMoniker(): BLE error:', error);
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
			console.error('writeMoniker(): BLE error:', error);
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
			console.error('readNodeType(): BLE error:', error);
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
			console.error('writeNodeType(): BLE error:', error);
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
			console.error('readNodeIp(): BLE error:', error);
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
			console.error('writeNodeIp(): BLE error:', error);
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
			console.error('readNodePort(): BLE error:', error);
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
			console.error('writeNodePort(): BLE error:', error);
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
			console.error('readVpnType(): BLE error:', error);
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
			console.error('writeVpnType(): BLE error:', error);
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
			console.error('readVpnPort(): BLE error:', error);
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
			console.error('writeVpnPort(): BLE error:', error);
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
			console.error('readMaximumPeers(): BLE error:', error);
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
			console.error('writeMaximumPeers(): BLE error:', error);
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
			console.error('readNodeLocation(): BLE error:', error);
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
			console.error('readCertExpirity(): BLE error:', error);
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
			console.error('readOnlineUsers(): BLE error:', error);
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
			console.error('readBandwidthSpeed(): BLE error:', error);
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
			console.error('readSystemUptime(): BLE error:', error);
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
			console.error('readCasanodeVersion(): BLE error:', error);
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
			console.error('readDockerImage(): BLE error:', error);
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
			console.error('readSystemOs(): BLE error:', error);
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
			console.error('readSystemArch(): BLE error:', error);
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
			console.error('readSystemKernel(): BLE error:', error);
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
			console.error('readNodePassphrase(): BLE error:', error);
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
			console.error('writeNodePassphrase(): BLE error:', error);
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
			console.error('readWalletAddress(): BLE error:', error);
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
			console.error('readNodeAddress(): BLE error:', error);
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
		
		try
		{
			// Start notifications for the node balance characteristic
			await BleClient.startNotifications(this.deviceId, BLE_UUID, uuid, () => {});
			// Wait for the notification to be ready
			const resultPromise = this.waitForNotification(
				charId,
				s => /^-1$/.test(s) || /^\d+(\.\d+)?\s[A-Za-z]+$/.test(s),
				120000
			);
			// Send the command to fetch the balance
			await BleClient.write(this.deviceId, BLE_UUID, uuid, encodeDataView('udvpn'));
			// Wait for either '-1' or a valid balance
			const result = await resultPromise;
			return result === '-1' ? null : result;
		}
		catch
		{
			console.error('Balance fetch timed out');
			return null;
		}
		finally
		{
			await BleClient.stopNotifications(this.deviceId, BLE_UUID, uuid);
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
			console.error('readCheckInstallation(): BLE error:', error);
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
		
		try
		{
			// Start notifications for the installation characteristic
			await BleClient.startNotifications(this.deviceId, BLE_UUID, uuid, () => {});
			// Wait for the notification to be ready
			const resultPromise = this.waitForNotification(
				charId,
				s => s === '2' || s === '-1',
				300000
			);
			// Send the command to install the Docker image
			await BleClient.write(this.deviceId, BLE_UUID, uuid, encodeDataView('install'), { timeout: 30000 });
			// Wait for either '-1' or a valid balance
			const result = await resultPromise;
			return result === '2' ? 1 : -1;
		}
		catch (error)
		{
			console.error('Docker image installation timed out');
			return -1;
		}
		finally
		{
			await BleClient.stopNotifications(this.deviceId, BLE_UUID, uuid);
		}
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
		
		try
		{
			// Start notifications for the installation characteristic
			await BleClient.startNotifications(this.deviceId, BLE_UUID, uuid, () => {});
			// Wait for the notification to be ready
			const resultPromise = this.waitForNotification(
				charId,
				s => s !== '0' && s !== '1',
				180000
			);
			// Send the command to create config files
			await BleClient.write(this.deviceId, BLE_UUID, uuid, encodeDataView('create'), { timeout: 30000 });
			// Wait for either '2' or '-1'
			const result = await resultPromise;
			return result === '-1' ? '000' : result;
		}
		catch (error)
		{
			console.error('Config files installation timed out');
			return '000';
		}
		finally
		{
			await BleClient.stopNotifications(this.deviceId, BLE_UUID, uuid);
		}
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
			console.error('startNode(): BLE error:', error);
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
			console.error('stopNode(): BLE error:', error);
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
			console.error('restartNode(): BLE error:', error);
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
			console.error('removeNode(): BLE error:', error);
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
		
		
		try
		{
			// Start notifications for update system characteristic
			await BleClient.startNotifications(this.deviceId, BLE_UUID, uuid, () => {});
			// Wait for the notification to be ready
			const resultPromise = this.waitForNotification(
				charId,
				s => s === '2' || s === '-1',
				300000
			);
			// Send the command to update the system
			await BleClient.write(this.deviceId, BLE_UUID, uuid, encodeDataView('update-system'), {timeout: 30000});
			// Wait for either '2' or '-1'
			const result = await resultPromise;
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
		
		
		try
		{
			// Start notifications for update sentinel characteristic
			await BleClient.startNotifications(this.deviceId, BLE_UUID, uuid, () => {});
			// Wait for the notification to be ready
			const resultPromise = this.waitForNotification(
				charId,
				s => s === '2' || s === '-1',
				120000
			);
			// Send the command to update the sentinel
			await BleClient.write(this.deviceId, BLE_UUID, uuid, encodeDataView('update-sentinel'), {timeout: 30000});
			// Wait for either '2' or '-1'
			const result = await resultPromise;
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
			console.error('resetSystem(): BLE error:', error);
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
			console.error('rebootSystem(): BLE error:', error);
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
			console.error('shutdownSystem(): BLE error:', error);
		}
		
		return false;
	}
	
	/**
	 * Send renew certificate command to the BLE server and wait for completion.
	 * @returns Promise<boolean>
	 */
	public async renewCertificate(): Promise<boolean>
	{
		if (!this.deviceId) 
			return false;
		
		const charId = 'certificate-actions';
		const uuid   = this.generateUUIDFromSeed(charId);
		
		try
		{
			// Start notifications for renew certificate characteristic
			await BleClient.startNotifications(this.deviceId, BLE_UUID, uuid, () => {});
			// Wait for the notification to be ready
			const resultPromise = this.waitForNotification(
				charId,
				s => s === '2' || s === '-1',
				180000
			);
			// Send the command to renew the certificate
			await BleClient.write(this.deviceId, BLE_UUID, uuid, encodeDataView('renew'), { timeout: 30000 });
			// Wait for either '2' or '-1'
			const result = await resultPromise;
			return result === '2';
		}
		catch
		{
			console.error('Certificate renewal timed out');
			return false;
		}
		finally
		{
			await BleClient.stopNotifications(this.deviceId, BLE_UUID, uuid);
		}
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
			console.error('writeWalletMnemonic(): BLE error:', error);
		}
		
		// Return false if there was an error
		return false;
	}
	
	/**
	 * Create or remove the wallet through BLE.
	 * @param action 'create' | 'remove'
	 * @returns - `create` Promise<string|null>  (mnemonic ou null)
	 *          - `remove` Promise<boolean> (succès)
	 */
	public async performWalletAction(action: 'create' | 'remove'): Promise<string | boolean | null>
	{
		if(!this.deviceId) return null

		const charId = 'wallet-actions';
		const uuid   = this.generateUUIDFromSeed(charId);
		
		if(action === 'create')
		{
			try
			{
				// Start notifications for the wallet actions characteristic
				await BleClient.startNotifications(this.deviceId, BLE_UUID, uuid, () => {})
				// Wait for the notification to be ready
				const resultPromise = this.waitForNotification(
					charId,
					(jsonStr: string) =>
					{
						const data = JSON.parse(jsonStr) as WalletNotification
						return data.status === 'success' || data.status === 'error'
					},
					180000
				)
				// Send the command to create the wallet
				await BleClient.write(this.deviceId, BLE_UUID, uuid, encodeDataView('create'), { timeout: 30000 })
				// Wait for the result
				const result = await resultPromise;
				const data = JSON.parse(result) as WalletNotification
				if(data.status === 'success' && data.mnemonic)
					return data.mnemonic
				
				console.error('Wallet creation error:', data.message ?? 'unknown')
				return null
			}
			catch(e)
			{
				console.error('Wallet creation BLE timeout/error:', e)
				return null
			}
			finally
			{
				await BleClient.stopNotifications(this.deviceId, BLE_UUID, uuid)
			}
		}
		else if(action === 'remove')
		{
			try
			{
				await BleClient.write(this.deviceId, BLE_UUID, uuid, encodeDataView('remove'), { timeout: 30000 })
				return true
			}
			catch(e)
			{
				console.error('Wallet remove BLE error:', e)
				return false
			}
		}

		return null
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
			console.error('readKeyringBackend(): BLE error:', error);
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
			console.error('writeKeyringBackend(): BLE error:', error);
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
		if (!this.deviceId)
			return null;
			
		const charId = 'check-port';
		const uuid   = this.generateUUIDFromSeed(charId);
		
		
		try 
		{
			// Start notifications for the check port characteristic
			await BleClient.startNotifications(this.deviceId, BLE_UUID, uuid, () => {});
			// Wait for the notification to be ready
			const resultPromise = this.waitForNotification(
				charId,
				s => s === '2' || s === '3' || s === '-1',
				120000
			);
			// Send the command to check the port
			await BleClient.write(this.deviceId, BLE_UUID, uuid, encodeDataView(portType), { timeout: 30000 });
			
			// Wait for the result
			const result = await resultPromise;
			
			if (result === '2')
				return 'open';
			if (result === '3')
				return 'closed';
			
			return null;
		}
		catch
		{
			console.error('Port check timed out');
			return null;
		}
		finally
		{
			await BleClient.stopNotifications(this.deviceId, BLE_UUID, uuid);
		}
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
