/**
 * Huedeck, Inc
 */

import React from 'react';
import Layout from '../../components/Layout';
import utils from '../utils';
import Room from './Room';

function action({ query }) {
	let palette = [];

	// check url palette
	if (query.pl) palette = utils.getValidHexArr(query.pl);
	if (!palette) palette = [];

	return {
		title: 'Room | Huedeck',
		chunks: ['room'],
		component: (
			<Layout>
				<Room palette={palette} />
			</Layout>
		),
	};
}

export default action;
