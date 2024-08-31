import { BarcodeScanner, BarcodeFormat } from '@capacitor-mlkit/barcode-scanning';
import BluetoothService from '@/services/BluetoothService';

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
 * Scan a QR code and connect to the Bluetooth device if found
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
			const qrData = JSON.parse(result.barcodes[0].rawValue);
			// Check if the QR code has Bluetooth ID
			if(qrData.bluetooth)
			{
				// Check if the device is connected
				const isConnected = await BluetoothService.isConnected();
				// If connected, disconnect
				if (isConnected)
				{
					await BluetoothService.disconnect();
				}
				
				console.log('Connecting to Bluetooth device', qrData.bluetooth);
				
				// Connect to the Bluetooth device
				return await BluetoothService.connect(qrData.bluetooth);
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
			const defaultBluetoothId = "0000180d-0000-1000-8000";
			// Check if the device is connected
			const isConnected = await BluetoothService.isConnected();
			// If connected, disconnect
			if (isConnected)
				await BluetoothService.disconnect();
			
			console.log('Connecting to Bluetooth device', defaultBluetoothId);
			// Connect to the Bluetooth device
			return await BluetoothService.connect(defaultBluetoothId);
		}
	}
	
	return false;
}
