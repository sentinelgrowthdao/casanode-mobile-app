import { KeepAwake } from '@capacitor-community/keep-awake';

/**
 * Toggle the KeepAwake plugin
 * @param {boolean} enable - Pass true to activate KeepAwake, false to deactivate
 * @returns {Promise<void>}
 */
export async function toggleKeepAwake(enable: boolean): Promise<void>
{
	try
	{
		// Activate or deactivate KeepAwake
		if (enable)
		{
			await KeepAwake.keepAwake();
			console.log('KeepAwake activated, the phone will not sleep.');
		}
		else
		{
			await KeepAwake.allowSleep();
			console.log('KeepAwake deactivated, the phone can sleep now.');
		}
	}
	catch (error)
	{
		console.error(`Error ${enable ? 'activating' : 'deactivating'} KeepAwake:`, error);
	}
}
