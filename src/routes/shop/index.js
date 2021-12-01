/**
 * Huedeck, Inc
 */

import React from 'react';
import utils from '../utils';
import Layout from '../../components/Layout';
// import notFound from '../not-found';
import constants from '../constants';
import Shop from './Shop';

function action({ query }) {
	let hexArr = [];
	const page = Number(query.page) || 0;

	if (query.pl) {
		hexArr = utils.getValidHexArr(query.pl);
	} else {
		hexArr = constants.defaultPalette[utils.getRandomInt(0, constants.defaultPalette.length)];
		return {
			redirect: utils.goToShop(hexArr, page),
		};
	}

	return {
		title: 'Shop | Huedeck',
		chunks: ['shop'],
		component: (
			<Layout>
				<Shop hexArr={hexArr} page={page} />
			</Layout>
		),
	};
}

export default action;
