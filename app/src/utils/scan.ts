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
 * Scan a QR code and return the data
 * @returns {Promise<QRData|undefined>}
 */
export async function scanQrcode(): Promise<QRData|undefined>
{
	try
	{
		// Start scanning
		const result = await BarcodeScanner.scan({formats: [BarcodeFormat.QrCode]});
		
		// Check if the scan was successful and has content
		if(result && result.barcodes.length > 0)
		{
			// Check if the device is connected
			const isConnected = await NetworkService.isConnected();
			
			// Disconnect if already connected
			if(isConnected)
				await NetworkService.disconnect();
			
			// Parse the QR code data
			const qrData: QRData = JSON.parse(result.barcodes[0].rawValue) as QRData;
			// Return the QR code data
			return qrData;
		}
		else
		{
			console.error('Scan failed or no content found');
		}
	}
	catch (error: any)
	{
		// Check if the error is due to the barcode scanner being unavailable
		if(typeof(error?.code) !== 'undefined' && error?.code === 'UNAVAILABLE')
		{
			// Attempt to load the JSON file in development mode if the scanner is unavailable
			if(process.env.NODE_ENV === 'development')
			{
				try
				{
					// @ts-expect-error Dynamically import the JSON file
					const qrData = await import('@qrcode.json');
					return qrData.default as QRData;
				}
				catch (fileError)
				{
					console.error('The qrdata.json file is not available or could not be loaded');
				}
			}
			else
			{
				console.error('Barcode scanner is unavailable');
			}
		}
		else
		{
			console.error('An unexpected error occurred:', error);
		}
	}
	
	return undefined;
}
