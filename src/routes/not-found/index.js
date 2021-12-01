/**
 *	Huedeck, Inc
 */

import React from 'react';
import Layout from '../../components/Layout';
import NotFound from './NotFound';

const title = 'Page Not Found';

function action() {
	return {
		chunks: ['not-found'],
		title,
		component: (
			<Layout>
				<NotFound />
			</Layout>
		),
		status: 404,
	};
}

export default action;
