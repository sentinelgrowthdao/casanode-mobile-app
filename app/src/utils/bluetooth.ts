
/**
 * Encode a string into a DataView
 * @param data string to encode
 * @returns 
 */
export function encodeDataView(data: string): DataView
{
	const buffer = new ArrayBuffer(data.length);
	const view = new DataView(buffer);
	for (let i = 0; i < data.length; i++)
	{
		view.setUint8(i, data.charCodeAt(i));
	}
	return view;
}

/**
 * Decode a DataView into a string
 * @param value DataView to decode
 * @returns string
 */
export function decodeDataView(value: DataView): string
{
	return new TextDecoder().decode(value);
}
