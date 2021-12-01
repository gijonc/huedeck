/**
 *	Huedeck, Inc
 */

import React from 'react';
import Layout from '../../components/Layout/Layout';
import Demo from './Demo';
import notFound from '../not-found';

async function action({ store }) {
	const { loggedIn } = store.getState();
	if (!loggedIn || loggedIn.profile.roleType !== 'admin') return notFound();

	return {
		chunks: ['demo'],
		title: 'Demo | Huedeck',

		component: (
			<Layout>
				<Demo />
			</Layout>
		),
	};
}

export default action;
