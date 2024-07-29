import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
	appId: 'co.sentinel.casanode',
	appName: 'Casanode',
	webDir: 'dist',
	plugins:
	{
		CapacitorMLKitBarcodeScanning: {
			cameraPermissionText: "We need camera access to scan QR codes."
		},
		BluetoothLe: {
			bluetoothPermissionText: "We need Bluetooth access to connect to your device."
		}
	}
};

export default config;
