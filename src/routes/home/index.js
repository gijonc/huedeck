/**
 *	Huedeck, Inc
 */

import React from 'react';
import Layout from '../../components/Layout';
import Home from './Home';
import notFound from '../not-found';

const title = 'Huedeck | Your home stylist, for FREE!';
const description =
	'Furnish your home with Artificial Intelligence. We are the ONLY marketplace that truly cares about the harmony of your home.';

async function action() {
	let data = null;
	const res = await fetch('https://huedeck.storage.googleapis.com/others/homepage.json');
	if (res.status === 200) {
		data = await res.json();
	} else {
		return notFound();
	}

	return {
		chunks: ['home'],
		description,
		title,

		component: (
			<Layout>
				<Home {...data} />
			</Layout>
		),
	};
}

export default action;
