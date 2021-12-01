import { CONFIRM_DIALOG } from '../constants';

const initState = {
	open: false,
};

export default function confirmDialog(state = initState, action) {
	switch (action.type) {
		case CONFIRM_DIALOG:
			// reset state when close
			if (action.payload.open === false) {
				return Object.assign({}, state, initState);
			}

			return Object.assign({}, state, {
				confirmKey: action.payload.confirmKey,
				type: action.payload.type,
				query: action.payload.query,
				open: action.payload.open,
			});

		default:
			return state;
	}
}
