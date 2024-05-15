import { toastController } from '@ionic/vue';


/**
 * Copy the given address to the clipboard.
 * 
 * @param message The message to display in the toast.
 * @param data The data to copy to the clipboard.
 */
export async function copyToClipboard(message: string, data: string)
{
	if (navigator.clipboard)
	{
		try
		{
			await navigator.clipboard.writeText(data);
			const toast = await toastController.create({
				message: message,
				duration: 1500,
				position: 'top',
			});
			await toast.present();
		}
		catch (err)
		{
			console.error("Failed to copy text to clipboard:", err)
		}
	}
}
