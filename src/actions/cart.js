/* eslint-disable import/prefer-default-export */

import { SET_CART, ADJUST_CART_INFO, SET_ALERTBAR } from '../constants';

import utils from '../routes/utils';
import gqlQuery from '../routes/gqlType';

export function setUserCart({ cartId, cartItemCount }) {
	return {
		type: SET_CART,
		payload: {
			cartId,
			cartItemCount,
		},
	};
}

export function adjustCartInfo({ number }) {
	return {
		type: ADJUST_CART_INFO,
		payload: {
			number,
		},
	};
}

export function addToCart(variables) {
	return async (dispatch, getState, { client }) => {
		try {
			const added = await client
				.mutate({
					mutation: gqlQuery.addCartItem,
					variables,
				})
				.then(res => res.data.addCartItem);
			if (added.success) {
				if (added.cartId !== getState().cart.cartId) {
					// first time add to cart (for guest only)
					setUserCart({
						cartId: added.cartId,
						cartItemCount: variables.quantity,
					});
				} else {
					adjustCartInfo({ number: variables.quantity });
				}
				return true;
			}
		} catch (err) {
			dispatch({
				type: SET_ALERTBAR,
				payload: {
					status: 'error',
					message: utils.getGraphQLError(err, 'addToCart'),
					open: true,
				},
			});
		}
		return false;
	};
}
