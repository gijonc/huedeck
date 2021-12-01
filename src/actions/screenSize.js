/* eslint-disable import/prefer-default-export */

import { SET_SCREEN_SIZE } from '../constants';

export function setScreenSize({ width, height }) {
	return {
		type: SET_SCREEN_SIZE,
		payload: {
			width,
			height,
		},
	};
}
