import { defineStore } from 'pinia';

export interface DeviceEntry
{
	uuid: string;
	name: string;
	address: string;
	connector: string;
	bleUuid: string | null;
	apiIp: string | null;
	apiPort: number | null;
	apiToken: string | null;
}

export const useDeviceStore = defineStore('device',
{
	persist: true,

	state: () => ({
		aDevices: <DeviceEntry[]>[],
	}),
	
	actions:
	{
		/**
		 * Add a device to the store
		 * @param device DeviceEntry
		 * @returns void
		 */
		addDevice(device: DeviceEntry): void
		{
			// Check if device already exists
			const existing = this.aDevices.find((d) => d.uuid === device.uuid);
			// If it does, remove it
			if (existing)
				this.removeDevice(existing);
			// Add the device at the end of the list
			this.aDevices.push(device);
		},
		
		/**
		 * Remove a device from the store
		 * @param device DeviceEntry
		 * @returns void
		 */
		removeDevice(device: DeviceEntry): void
		{
			this.aDevices = this.aDevices.filter((d) => d.uuid !== device.uuid);
		},
		
		/**
		 * Remove a device from the store by UUID
		 * @param uuid string
		 * @returns void
		 */
		removeDeviceByUuid(uuid: string): void
		{
			this.aDevices = this.aDevices.filter((d) => d.uuid !== uuid);
		},
		
		/**
		 * Get last device in the store
		 * @returns DeviceEntry | null
		 */
		getLastDevice(): DeviceEntry | null
		{
			return this.aDevices.length > 0 ? this.aDevices[this.aDevices.length - 1] : null;
		},
		
		/**
		 * Get all devices in the store
		 * @returns number
		 */
		countDevices(): number
		{
			return this.aDevices.length;
		}
	}
});