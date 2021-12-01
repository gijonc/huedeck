/* eslint-disable import/prefer-default-export */

import { ADDED_CART_DIALOG } from '../constants';

export function toggleAddedCartDialog({ open, item }) {
	return {
		type: ADDED_CART_DIALOG,
		payload: {
			open,
			item,
		},
	};
}
