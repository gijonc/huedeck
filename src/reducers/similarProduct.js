import { FETCH_SIMILAR_PRODUCT } from '../constants';

const initState = {
	loading: false,
	data: {},
	error: null,
};

export default function similarProduct(state = initState, action) {
	const { loading, success, failure, reset } = FETCH_SIMILAR_PRODUCT;
	switch (action.type) {
		case loading:
			return {
				...state,
				loading: true,
			};

		case success:
			return {
				...state,
				data: action.payload.data,
				loading: false,
			};

		case failure:
			return {
				...state,
				loading: false,
				error: action.payload.error,
			};

		case reset:
			return initState;

		default:
			return state;
	}
}
