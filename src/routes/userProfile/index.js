/**
 * Huedeck
 */

import React from 'react';
import Layout from '../../components/Layout';
import UserProfile from './UserProfile';

const title = 'Account Settings';

function action({ params }) {
	return {
		chunks: ['userProfile'],
		title,
		component: (
			<Layout>
				<UserProfile {...params} />
			</Layout>
		),
	};
}

export default action;
