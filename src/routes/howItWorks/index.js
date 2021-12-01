/**
 *	Huedeck
 */

import React from 'react';
import Layout from '../../components/Layout';
import HowItWorks from './HowItWorks';

// const title = 'How It Works | Huedeck';
const title = 'Huedeck | Your home stylist, for FREE!';
const description =
	'Furnish your home with Artificial Intelligence. We are the ONLY marketplace that truly cares about the harmony of your home.';

function action() {
	return {
		chunks: ['howItWorks'],
		title,
		description,
		component: (
			<Layout>
				<HowItWorks />
			</Layout>
		),
	};
}

export default action;
