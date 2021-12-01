/* eslint-disable import/prefer-default-export */

import { SET_PALETTE_DATA } from '../constants';

export function setPaletteData({ paletteHexArr, itemListArr, view }) {
	return {
		type: SET_PALETTE_DATA,
		payload: {
			paletteHexArr,
			itemListArr,
			view,
		},
	};
}
