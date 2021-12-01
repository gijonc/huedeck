/*
	Huedeck
*/

import { SET_PALETTE_HISTORY, SET_PREV_INDEX, SET_NEXT_INDEX } from '../constants';

const MAX_PALETTE_HISTORY = 5;

const initState = {
	history: [],
	index: -1, // index = history.length - 1
};

function differentPalettes(arr1, arr2) {
	for (let i = 0; i < arr1.length; i += 1) {
		if (arr1[i] !== arr2[i]) return true;
	}
	return false;
}

export default function paletteHistory(state = initState, action) {
	const { history } = state;
	switch (action.type) {
		case SET_PALETTE_HISTORY: {
			const newHistory = history;

			if (!newHistory.length) {
				// push it if nothing in history
				newHistory.push(action.payload.palette);
			} else if (
				action.payload.palette &&
				differentPalettes(newHistory[newHistory.length - 1], action.payload.palette)
			) {
				// else check if getting a same palette
				newHistory.push(action.payload.palette);
			}

			if (newHistory.length > MAX_PALETTE_HISTORY) {
				newHistory.shift();
			}
			return Object.assign({}, state, {
				history: newHistory,
				index: newHistory.length - 1,
				max: MAX_PALETTE_HISTORY,
			});
		}

		case SET_PREV_INDEX: {
			const prevIndex = state.index - 1;
			return Object.assign({}, state, {
				index: prevIndex,
			});
		}

		case SET_NEXT_INDEX: {
			const nextIndex = state.index + 1;
			return Object.assign({}, state, {
				index: nextIndex,
			});
		}

		default:
			return state;
	}
}
