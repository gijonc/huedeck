import fetch from 'node-fetch';
import config from '../../../../config';

async function fetchAIColor(rgbArr, setFuzzy, fetchingForColorMood) {
	let output = [];
	const url = config.api.paletteGeneratorIp;
	try {
		const resp = await fetch(url, {
			method: 'POST',
			body: JSON.stringify({
				input: rgbArr,
				fuzzy: setFuzzy || false,
				output: fetchingForColorMood ? 32 : null,
			}),
		});

		const res = await resp.json();
		if (res.status === true) {
			output = res.output;
		}
	} catch (err) {
		throw new Error(`[ERROR] function "fetchAIColor" -> ${err}`);
	}
	return output;
}

export default fetchAIColor;
