/**
 * Huedeck, Inc
 */

import React from 'react';
import Layout from '../../components/Layout';
import Brand from './Brand';
import notFound from '../not-found';
import gqlType from '../gqlType';
import { setProgressBar } from '../../actions/progressBar';
import json from './brand.json';

function getCategoryList(categoryOfBrandSchema) {
	const schema = {};
	for (let i = 0, len = categoryOfBrandSchema.length; i < len; i += 1) {
		const { category2, category3 } = categoryOfBrandSchema[i];
		if (!schema[category2]) {
			schema[category2] = [];
		}
		schema[category2].push(category3);
	}
	return schema;
}

async function action({ params, client, store }) {
	const brand = params.brand.split('-').join(' ');
	if (json.brands.indexOf(brand) === -1) {
		return notFound();
	}

	store.dispatch(setProgressBar({ start: true }));

	let result = {};
	try {
		result = await client
			.query({
				query: gqlType.getCategoryByBrand,
				variables: { brand },
			})
			.then(res => res.data.getCategoryByBrand);

		store.dispatch(setProgressBar({ start: false }));
	} catch (err) {
		store.dispatch(setProgressBar({ start: false }));
		return notFound();
	}

	return {
		title: `${brand.toUpperCase()} | Huedeck Brand`,
		chunks: ['brand'],
		component: (
			<Layout>
				<Brand
					brand={brand}
					categoryOfBrandSchema={getCategoryList(result.categoryOfBrandSchema)}
					pdOfCategoryList={result.pdOfCategoryList}
				/>
			</Layout>
		),
	};
}

export default action;
