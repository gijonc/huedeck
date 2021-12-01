/* eslint-disable import/prefer-default-export */

import {
	// FETCH_SIMILAR_PRODUCT,
	SET_ALERTBAR,
} from '../constants';
import utils from '../routes/utils';
import gqlQuery from '../routes/gqlType';

// const {loading, success, failure, reset} = FETCH_SIMILAR_PRODUCT;

export function fetchSimilarProduct(variables) {
	return async (dispatch, getState, { client }) => {
		//  // fetching data
		//  dispatch({
		// 	 type: loading,
		// 	 payload: {}
		//  });

		try {
			const data = await client
				.query({
					query: gqlQuery.getSimilarProducts,
					variables,
				})
				.then(res => res.data.getSimilarProducts);
			// dispatch({
			// 	type: success,
			// 	payload: { data }
			// });
			return data;
		} catch (err) {
			dispatch({
				type: SET_ALERTBAR,
				payload: {
					status: 'error',
					message: utils.getGraphQLError(err, 'fetchSimilarItems'),
					open: true,
				},
			});
		}
		return false;
	};
}
