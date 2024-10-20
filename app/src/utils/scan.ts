import { BarcodeScanner, BarcodeFormat } from '@capacitor-mlkit/barcode-scanning';
import NetworkService from '@/services/NetworkService';

export interface QRData
{
	device: string;
	os: string;
	kernel: string;
	architecture: string;
	ip: string | null;
	webPort: string | number;
	apiPort: string | number;
	authToken: string;
	bluetooth?: {
		uuid: string;
		discovery: string;
		seed: string;
	};
}

/**
 * Install Google Barcode Scanner module
 * @returns {Promise<void>}
 */
/**
 * Install Google Barcode Scanner module
 * @returns {Promise<void>}
 */
export async function installScannerModule(): Promise<void>
{
	try
	{
		// Check camera permission
		await BarcodeScanner.requestPermissions();
		
		// Check if the Google Barcode Scanner module is available
		const module = await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable();
		// If not available, install the module
		if (!module.available)
		{
			console.log('[SCANNER] Google Barcode Scanner module is not available');
			// Install Google Barcode Scanner module
			await BarcodeScanner.installGoogleBarcodeScannerModule();
			console.log('[SCANNER] Google Barcode Scanner module installed');
		}
		else
			console.log('[SCANNER] Google Barcode Scanner module is available');
	}
	catch (error)
	{
		console.error('[SCANNER] Failed to check or install Google Barcode Scanner module', error);
	}
}


/**
 * Scan a QR code and connect to the device if found
 * @returns {Promise<boolean>}
 */
export async function scanAndConnect(): Promise<boolean>
{
	try
	{
		// Start scanning
		const result = await BarcodeScanner.scan({formats: [BarcodeFormat.QrCode]});
		// Check if the scan was successful and has content
		if(result && result.barcodes.length > 0)
		{
			// Parse the QR code data
			const qrData: QRData = JSON.parse(result.barcodes[0].rawValue) as QRData;
			// Check if the QR code has Bluetooth ID
			if(qrData.bluetooth)
			{
				// Check if the device is connected
				const isConnected = await NetworkService.isConnected();
				// If connected, disconnect
				if (isConnected)
				{
					await NetworkService.disconnect();
				}
				
				console.log('Connecting to Bluetooth device', qrData.bluetooth);
				
				// Connect to the Bluetooth device
				return await NetworkService.connect('bluetooth', {seed: qrData.bluetooth.seed});
			}
			else
			{
				console.error('No Bluetooth ID found in QR Code');
			}
		}
		else
		{
			console.error('Scan failed or no content found');
		}
	}
	catch (error: any)
	{
		if(typeof(error?.code) !== 'undefined' && error?.code === 'UNAVAILABLE')
		{
			console.error('Barcode scanner is not available on this platform, using default Bluetooth ID', error);
			// Default Bluetooth ID
			const defaultBluetoothSeed = "4580e70c-1dcc-4e46-bd59-33686502314a";
			// Check if the device is connected
			const isConnected = await NetworkService.isConnected();
			// If connected, disconnect
			if (isConnected)
				await NetworkService.disconnect();
			
			console.log('Connecting to Bluetooth device', defaultBluetoothSeed);
			// Connect to the Bluetooth device
			return await NetworkService.connect('bluetooth', {seed: defaultBluetoothSeed});
		}
	}
	
	return false;
}
