/* eslint-disable import/prefer-default-export */

import { SET_PALETTE_HISTORY, SET_PREV_INDEX, SET_NEXT_INDEX } from '../constants';

export function setPaletteHistory({ palette }) {
	return {
		type: SET_PALETTE_HISTORY,
		payload: {
			palette,
		},
	};
}

export function setPrevIndex() {
	return { type: SET_PREV_INDEX };
}

export function setNextIndex() {
	return { type: SET_NEXT_INDEX };
}
