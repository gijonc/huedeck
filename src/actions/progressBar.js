/* eslint-disable import/prefer-default-export */

import { SET_PROGRESS_BAR } from '../constants';

export function setProgressBar({ start }) {
	return {
		type: SET_PROGRESS_BAR,
		payload: {
			start,
		},
	};
}
