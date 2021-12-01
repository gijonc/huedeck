import { SET_USER_STATE } from '../constants';

export default function loggedIn(state = {}, action) {
	switch (action.type) {
		case SET_USER_STATE:
			return Object.assign({}, state, action.payload.user);

		default:
			return state;
	}
}
