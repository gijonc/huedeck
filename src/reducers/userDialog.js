// const initState = '/'

import { SET_USER_DIALOG, RESET_USER_DIALOG } from '../constants';

const initState = {
	toggle: false,
	target: null,
	redirect: null,
};

export default function userDialog(state = initState, action) {
	switch (action.type) {
		case SET_USER_DIALOG:
			return Object.assign({}, state, {
				target: action.payload.target,
				toggle: action.payload.toggle,
				redirect: action.payload.redirect,
			});

		case RESET_USER_DIALOG:
			return initState;

		default:
			return state;
	}
}
