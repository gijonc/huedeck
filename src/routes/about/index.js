/**
 *	Huedeck, Inc
 */

import React from 'react';
import Layout from '../../components/Layout';
import About from './About';

const title = 'About | Huedeck';

function action() {
	return {
		chunks: ['about'],
		title,

		component: (
			<Layout>
				<About />
			</Layout>
		),
	};
}

export default action;
