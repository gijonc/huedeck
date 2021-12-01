/* eslint-disable import/prefer-default-export */

import { CONFIRM_DIALOG } from '../constants';

export function setConfirmDialog({ confirmKey, type, query, open }) {
	return {
		type: CONFIRM_DIALOG,
		payload: {
			confirmKey,
			type,
			query,
			open,
		},
	};
}
