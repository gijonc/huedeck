/* eslint-disable import/prefer-default-export */

import { SET_ALERTBAR } from '../constants';

export function setAlertbar({ status, message, open }) {
	return {
		type: SET_ALERTBAR,
		payload: {
			status,
			message,
			open,
		},
	};
}
