import { SET_ALERTBAR } from '../constants';

export default function alertbar(state = {}, action) {
	switch (action.type) {
		case SET_ALERTBAR:
			return Object.assign({}, state, {
				status: action.payload.status || state.status,
				message: action.payload.message || state.message,
				open: action.payload.open,
			});

		default:
			return state;
	}
}
