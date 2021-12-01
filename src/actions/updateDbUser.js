/* eslint-disable import/prefer-default-export */

import { SET_ALERTBAR, SET_USER_STATE } from '../constants';
import utils from '../routes/utils';
import gqlQuery from '../routes/gqlType';

export function updatePreference(preference) {
	return async (dispatch, getState, { client, fetch }) => {
		try {
			const updatedToDb = await client
				.mutate({
					mutation: gqlQuery.mutateUserPreference,
					variables: {
						preference,
					},
				})
				.then(res => res.data.mutateUserPreference);

			if (updatedToDb) {
				const user = getState().loggedIn;
				Object.assign(user, { preference });
				// update user cookie
				const updateCookie = await fetch('/auth/update-user', {
					body: JSON.stringify({ user }),
				});
				const updateRes = await updateCookie.json();
				if (updateRes.success) {
					// update current user state
					dispatch({
						type: SET_USER_STATE,
						payload: {
							user,
						},
					});
					return true;
				}
			}
			throw new Error('Unrecognized request');
		} catch (err) {
			dispatch({
				type: SET_ALERTBAR,
				payload: {
					status: 'error',
					message: utils.getGraphQLError(err, 'updatePreference'),
					open: true,
				},
			});
		}
		return false;
	};
}
