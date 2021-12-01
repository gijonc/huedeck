import { SET_SCREEN_SIZE } from '../constants';

const INIT_STATE = {
	// width: undefined,
	// isMobileScreen: undefined
};

export default function screenSize(state = INIT_STATE, action) {
	switch (action.type) {
		case SET_SCREEN_SIZE:
			return Object.assign({}, state, {
				width: action.payload.width,
				height: action.payload.height,
				isMobileScreen: action.payload.width < 720 || false, // default mobile size is defined to be 720px
			});

		default:
			return state;
	}
}
