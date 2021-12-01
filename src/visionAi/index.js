/**
 *	Huedeck, Inc
 */

import express from 'express';
import { api } from '../config';
import { ReS, ReE } from '../expressHelper';

const router = express.Router();
// const apiUrl = 'http://35.227.159.3:9000/vision-ai';

const apiUrl = `${api.paletteGeneratorIp}/vision-ai`;

router.post('/', async (req, res) => {
	res.setHeader('Content-Type', 'application/json');

	const { imgData, type, productSet } = req.body;

	try {
		const response = await fetch(`${apiUrl}/search`, {
			method: 'POST',
			body: JSON.stringify({
				imgData,
				type,
				productSet,
			}),
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		});

		const data = await response.json();

		return ReS(res, data);
	} catch (err) {
		return ReE(res, err);
	}
});

export default router;
