
/**
 * Encode a string into a DataView
 * @param data string to encode
 * @returns 
 */
export function encodeDataView(data: string): DataView
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
export function decodeDataView(value: DataView): string
{
	return new TextDecoder('utf-8').decode(value);
}
