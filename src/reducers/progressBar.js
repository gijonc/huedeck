import { SET_PROGRESS_BAR } from '../constants';

const initState = {
	start: false,
};

export default function progressBar(state = initState, action) {
	//   const progressing = state.start;

	switch (action.type) {
		case SET_PROGRESS_BAR:
			return Object.assign({}, state, {
				// ignore incoming signal if already start
				start: action.payload.start,
			});

		default:
			return state;
	}
}
