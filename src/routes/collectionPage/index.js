/**
 *	Huedeck, Inc
 */

import React from 'react';
import gqlQuery from '../gqlType';
import utils from '../utils';
import Layout from '../../components/Layout';
import { setProgressBar } from '../../actions/progressBar';
import notFound from '../not-found';
import CollectionPage from './CollectionPage';

async function action({ params, store, client }) {
	let result;

	try {
		store.dispatch(setProgressBar({ start: true }));
		const variables = {
			collectionId: params.id,
		};

		const { loggedIn } = store.getState();
		if (loggedIn) {
			Object.assign(variables, {
				userId: loggedIn.id,
			});
		}

		result = await client
			.query({
				query: gqlQuery.getOneCollection,
				fetchPolicy: 'network-only',
				variables,
			})
			.then(res => res.data.getOneCollection);

		if (!result) {
			throw new Error('Product not found');
		}

		store.dispatch(setProgressBar({ start: false }));
	} catch (err) {
		store.dispatch(setProgressBar({ start: false }));
		return notFound();
	}

	return {
		chunks: ['collectionPage'],
		title: `${utils.toCapitalize(result.title)} | Huedeck Collection `,
		description: result.description,
		fbEventCodes: "fbq('track', 'AddToCart');",
		component: (
			<Layout>
				<CollectionPage {...result} />
			</Layout>
		),
	};
}

export default action;
