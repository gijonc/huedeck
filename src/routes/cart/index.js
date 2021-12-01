/**
 *	Huedeck, Inc
 */
import React from 'react';
import Layout from '../../components/Layout';
import Cart from './Cart';

const title = 'Shopping Cart';

async function action() {
	return {
		chunks: ['cart'],
		title,
		component: (
			<Layout>
				<Cart />
			</Layout>
		),
	};
}

export default action;
