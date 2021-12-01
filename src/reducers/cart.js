import { SET_CART, ADJUST_CART_INFO } from '../constants';

export default function cart(state = {}, action) {
	switch (action.type) {
		case SET_CART:
			return Object.assign({}, state, {
				cartId: action.payload.cartId || state.cartId, // cartId will be init once when
				cartItemCount: action.payload.cartItemCount,
			});

		case ADJUST_CART_INFO:
			return Object.assign({}, state, {
				cartItemCount: state.cartItemCount + action.payload.number,
			});

		default:
			return state;
	}
}
