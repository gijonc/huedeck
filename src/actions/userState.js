/* eslint-disable import/prefer-default-export */

import { SET_USER_STATE, RESET_USER_DIALOG } from '../constants';

export function setUserState({ user }) {
	return dispatch => {
		if (user.id) {
			// init userDialog when user have logged in
			dispatch({ type: RESET_USER_DIALOG });
			dispatch({
				type: SET_USER_STATE,
				payload: {
					user,
				},
			});
		}
	};
}
