/**
 * Huedeck, Inc.
 */

/* eslint-disable no-prefer-destructuring */
import { Op } from 'sequelize';
import colorUtils from './colorUtils';

const MAX_H_DIFF = 15;
const MAX_S_DIFF = 15;
const MAX_L_DIFF = 10;

function isBlack(hslArr) {
	const S = hslArr[1];
	const L = hslArr[2];
	if (L < 10) {
		return true;
	} else if (L < 20 && S < 10) {
		return true;
	}
	return false;
}

function isWhite(hslArr) {
	const L = hslArr[2];
	return L > 95;
}

function isGrey(hslArr) {
	const S = hslArr[1];
	const L = hslArr[2];
	return S <= 10 && L >= 80 && L <= 95;
}

const FETCH_WHITE = {
	hslLightness: {
		[Op.gt]: 95, // L >95
	},
};

const FETCH_BLACK = {
	[Op.or]: [
		{
			hslLightness: {
				[Op.lt]: 10, // L < 10
			},
		},
		{
			[Op.and]: [
				{
					hslLightness: {
						[Op.lt]: 20, // L < 20
					},
				},
				{
					hslSaturation: {
						[Op.lt]: 10, // S < 10
					},
				},
			],
		},
	],
};

const FETCH_GREY = {
	[Op.and]: [
		{
			hslSaturation: {
				[Op.lte]: 10, // S <= 10
			},
		},
		{
			hslLightness: {
				[Op.between]: [80, 95], // L >= 80 && L <= 95
			},
		},
	],
};

function getSearchPdQuery(hsl, maxColorIdx) {
	const [palH, palS, palL] = hsl;

	const queryObj = {
		colorIndex: {
			[Op.lte]: maxColorIdx || 4,
		},

		[Op.and]: [
			{
				hslHue: {
					[Op.between]: [palH - MAX_H_DIFF, palH + MAX_H_DIFF],
				},
			},
			{
				hslSaturation: {
					[Op.between]: [palS - MAX_S_DIFF, palS + MAX_S_DIFF],
				},
			},
			{
				hslLightness: {
					[Op.between]: [palL - MAX_L_DIFF, palL + MAX_L_DIFF],
				},
			},
		],
	};

	return queryObj;
}

function getColorQueryFromHsl(hsl, maxColorIdx) {
	const [palH, palS, palL] = hsl;

	const queryObj = {
		colorIndex: {
			[Op.lte]: maxColorIdx || 4,
		},
	};

	if (isBlack(hsl)) {
		Object.assign(queryObj, FETCH_BLACK);
	} else if (isWhite(hsl)) {
		Object.assign(queryObj, FETCH_WHITE);
	} else if (isGrey(hsl)) {
		Object.assign(queryObj, FETCH_GREY);
	} else {
		Object.assign(queryObj, {
			[Op.and]: [
				{
					hslHue: {
						[Op.between]: [palH - MAX_H_DIFF, palH + MAX_H_DIFF],
					},
				},
				{
					hslSaturation: {
						[Op.between]: [palS - MAX_S_DIFF, palS + MAX_S_DIFF],
					},
				},
				{
					hslLightness: {
						[Op.between]: [palL - MAX_L_DIFF, palL + MAX_L_DIFF],
					},
				},
			],
		});
	}
	return queryObj;
}

function matchQuery(inputRgbArr, GET_WITH_BWG) {
	const palHSL = colorUtils.rgb2HslArr(inputRgbArr);

	const paletteMatchQuery = [];

	let getWhite = false;
	let getBlack = false;
	let getGrey = false;

	// search for input color
	for (let i = 0, len = palHSL.length; i < len; i += 1) {
		if (!getWhite) {
			getWhite = GET_WITH_BWG || isWhite(palHSL[i]);
			if (getWhite) {
				paletteMatchQuery.push(FETCH_WHITE);
			}
		}

		if (!getBlack) {
			getBlack = GET_WITH_BWG || isBlack(palHSL[i]);
			if (getBlack) {
				paletteMatchQuery.push(FETCH_BLACK);
			}
		}

		if (!getGrey) {
			getGrey = GET_WITH_BWG || isGrey(palHSL[i]);
			if (getGrey) {
				paletteMatchQuery.push(FETCH_GREY);
			}
		}
		paletteMatchQuery.push(getSearchPdQuery(palHSL[i]));
	}

	return {
		[Op.or]: paletteMatchQuery,

		// determine which color index to display (no means to show all)
		// colorIndex: 0
	};
}

export default {
	getSearchPdQuery,
	matchQuery,
	getColorQueryFromHsl,
};
