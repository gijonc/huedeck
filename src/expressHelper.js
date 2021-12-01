import now from 'performance-now';

// return error
function ReE(res, err, code) {
	// Error Web Response
	let key = '';
	let msg = '';
	if (typeof err === 'object' && typeof err.message !== 'undefined') {
		msg = err.message;

		if (err.key) key = err.key;
	}
	if (typeof code !== 'undefined') res.statusCode = code;
	return res.json({
		success: false,
		key,
		error: msg,
	});
}

// return success
function ReS(res, data, code) {
	// Success Web Response
	let sendData = {
		success: true,
	};

	if (typeof data === 'object') {
		sendData = Object.assign(data, sendData); // merge the objects
	}
	if (typeof code !== 'undefined') res.statusCode = code;
	return res.json(sendData);
}

function generateUUID() {
	// Public Domain/MIT
	let d = new Date().getTime() + now();
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
		const r = (d + Math.random() * 16) % 16 | 0; // eslint-disable-line no-bitwise
		d = Math.floor(d / 16);
		return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16); // eslint-disable-line no-bitwise
	});
}

export { ReE, ReS, generateUUID };
