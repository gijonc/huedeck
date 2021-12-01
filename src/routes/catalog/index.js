/**
 * Huedeck, Inc
 */

import React from 'react';
import Layout from '../../components/Layout';
import notFound from '../not-found';
import Catalog from './Catalog';
import gqlType from '../gqlType';
import { setProgressBar } from '../../actions/progressBar';
import categorySchema from '../home/AllCategoryList/category.json';

function searchCategorySchema(keyword) {
	const value = keyword
		.trim()
		.split('-')
		.join(' ');

	// check category1
	if (categorySchema[value]) {
		return {
			key: 'category1',
			value,
			catalog: [value],
			nextLevelCatList: Object.keys(categorySchema[value]),
		};
	}

	// check category2
	const cat1KeyList = Object.keys(categorySchema);
	for (let i = 0, iLen = cat1KeyList.length; i < iLen; i += 1) {
		const cat1Key = cat1KeyList[i];
		const cat2List = categorySchema[cat1Key];
		if (cat2List[value]) {
			return {
				key: 'category2',
				value,
				catalog: [cat1Key, value],
				nextLevelCatList: categorySchema[cat1Key][value],
			};
		}
		const cat2KeyList = Object.keys(cat2List);
		for (let j = 0, jLen = cat2KeyList.length; j < jLen; j += 1) {
			const cat2Key = cat2KeyList[j];
			const cat3List = cat2List[cat2Key];
			if (cat3List.indexOf(value) !== -1) {
				return {
					key: 'category3',
					value,
					catalog: [cat1Key, cat2Key, value],
					nextLevelCatList: [],
				};
			}
		}
	}

	return {};
}

function isEmptyOrSpaces(str) {
	return !str || str.match(/^\*$/) !== null;
}

async function action({ params, query, client, store }) {
	// search for query
	if (!params.search) return { redirect: '/shop' };

	store.dispatch(setProgressBar({ start: true }));

	const searchResult = await searchCategorySchema(params.search);

	let titleKey = 'Products';
	let result = {};

	if (searchResult.key) {
		const titleStr = searchResult.catalog[searchResult.catalog.length - 1];
		titleKey = titleStr.charAt(0).toUpperCase() + titleStr.slice(1);

		try {
			const variables = {
				keySearch: {
					key: searchResult.key,
					value: searchResult.value,
				},
				filters: [],
			};

			const searchList = Object.keys(query);
			for (let i = 0, len = searchList.length; i < len; i += 1) {
				const key = searchList[i];
				const rawValue = query[key];
				// not allowing duplicate key (take the first one as valid)
				const value = Array.isArray(rawValue) ? rawValue[0] : rawValue;

				// check and remove any useless spaces
				if (!isEmptyOrSpaces(key) && !isEmptyOrSpaces(value)) {
					variables.filters.push({
						key: key.trim(),
						value: value.trim(),
					});
				}
			}

			result = await client
				.query({
					query: gqlType.getPdByCatalog,
					fetchPolicy: 'network-only',
					variables,
				})
				.then(res => {
					const data = res.data.getPdByCatalog;
					const filterState = JSON.parse(data.filterState);
					Object.assign(filterState, { nextLevelCatList: searchResult.nextLevelCatList });
					return {
						filterState,
						tally: data.tally || 0,
						products: data.products || [],
						catalog: searchResult.catalog || [],
					};
				});

			store.dispatch(setProgressBar({ start: false }));
		} catch (err) {
			store.dispatch(setProgressBar({ start: false }));
			return notFound();
		}
	}

	return {
		title: `${titleKey} | Huedeck`,
		chunks: ['catalog'],
		component: (
			<Layout>
				<Catalog {...result} />
			</Layout>
		),
	};
}

export default action;
