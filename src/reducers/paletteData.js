/**
 *	Huedeck, Inc
 */

import { SET_PALETTE_DATA } from '../constants';

const initState = {
	paletteHexArr: [],
	itemListArr: [],
};

export default function paletteData(state = initState, action) {
	switch (action.type) {
		case SET_PALETTE_DATA: {
			return Object.assign({}, state, {
				paletteHexArr: action.payload.paletteHexArr || state.paletteHexArr,
				itemListArr: action.payload.itemListArr,
				view: action.payload.view || 'all', // determine current view of products room/all
			});
		}
		default:
			return state;
	}
}
