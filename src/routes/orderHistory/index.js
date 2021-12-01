/**
 *	Huedeck, Inc
 */

import React from 'react';
import Layout from '../../components/Layout';
import OrderHistory from './OrderHistory';

const title = 'Orders';

function action() {
	return {
		chunks: ['orderHistory'],
		title,

		component: (
			<Layout>
				<OrderHistory />
			</Layout>
		),
	};
}

export default action;
