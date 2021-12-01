import { ADDED_CART_DIALOG } from '../constants';

const initState = {
	open: false,
	item: {},
};

export default function addedCartDialog(state = initState, action) {
	switch (action.type) {
		case ADDED_CART_DIALOG:
			return Object.assign({}, state, {
				open: action.payload.open,
				item: action.payload.item || {},
			});

		default:
			return state;
	}
}
