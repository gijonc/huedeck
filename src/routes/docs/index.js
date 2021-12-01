/**
 * Huedeck, Inc.
 */

import React from 'react';
import marked from 'marked';
import Layout from '../../components/Layout';
import Page from '../../components/Page';
import NotFound from '../not-found/NotFound';

async function action({ params }) {
	let page = <NotFound />;
	let title = 'Page Not Found';

	const { file } = params;
	const gcsImgUrlRoot = 'https://huedeck.storage.googleapis.com/docs/';

	const res = await fetch(`${gcsImgUrlRoot + file}.md`);
	if (res.status === 200) {
		const data = await res.text();
		const htmlText = marked(data);
		page = <Page html={htmlText} />;
		title = file
			.split('_')
			.map(str => str.charAt(0).toUpperCase() + str.slice(1))
			.join(' ');
	}

	return {
		chunks: ['docs'],
		title,
		component: <Layout>{page}</Layout>,
	};
}

export default action;
