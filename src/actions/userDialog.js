/* eslint-disable import/prefer-default-export */

import { SET_USER_DIALOG } from '../constants';

export function setUserDialog({ toggle, target, redirect }) {
	return {
		type: SET_USER_DIALOG,
		payload: {
			redirect,
			target,
			toggle,
		},
	};
}
