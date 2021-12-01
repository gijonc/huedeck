/* eslint-disable prefer-const */
/* eslint-disable camelcase */

/**
 *	Huedeck, Inc
 */

import now from 'performance-now';
import { Product, Inventory, Color } from '../../../models';
import { to } from '../../utils';

import colorSearch from './colorSearch';
import colorUtils from './colorUtils';
import filterHelper from './filterHelper';

export const schema = [
	`
	type ProductByCatalogResult {
		tally: Int!
		filterState: String!
		products: [DatabaseProductType!]
	}

	input filterType {
		key: String!
		value: String!
	}

	`,
];

export const queries = [
	`
	getPdByCatalog (
		keySearch: filterType!
		filters: [filterType!]
	): ProductByCatalogResult
  `,
];

function getRangeInput(rangeStr) {
	const rawStr = rangeStr.split('-');
	let min = -1;
	let max = 0;
	if (rawStr.length === 3 && rawStr[1] === 'to') {
		if (Number(rawStr[0]) >= 0 && Number(rawStr[2]) > Number(rawStr[0])) {
			min = Number(rawStr[0]);
			max = Number(rawStr[2]);
		}
	} else if (rawStr.length === 2) {
		if (rawStr[0] === 'under' && Number(rawStr[1]) > 0) {
			max = Number(rawStr[1]);
		} else if (rawStr[0] === 'above' && Number(rawStr[1]) >= 0) {
			min = Number(rawStr[1]);
		}
	}
	return [min, max];
}

function getFilteredQueryObj(rawQueryList) {
	const queryObj = {
		fitlerObj: {},
		page: 1,
	};
	const userEnterKeyNames = ['price', 'width', 'height', 'length'];
	const { fitlerObj } = queryObj;

	for (let i = 0, len = rawQueryList.length; i < len; i += 1) {
		const { key, value } = rawQueryList[i];
		if (userEnterKeyNames.indexOf(key) !== -1) {
			fitlerObj[`${key}Range`] = getRangeInput(value);
		} else if (key === 'styles') {
			fitlerObj[key] = value
				.trim()
				.split(' ')
				.map(val => val.split('-').join(' '));
		} else if (key === 'page') {
			const num = Math.floor(Number(value));
			if (!Number.isNaN(num) && num > 0) {
				queryObj.page = parseInt(value, 10);
			}
		} else if (key === 'color') {
			if (/^[0-9A-F]{6}$/i.test(value)) {
				const hexCode = `#${value}`;
				fitlerObj[key] = hexCode;
			}
		} else {
			fitlerObj[key] = value.trim();
		}
	}
	return queryObj;
}

export const resolvers = {
	RootQuery: {
		async getPdByCatalog(parent, args) {
			const t0 = now();
			const { keySearch, filters } = args;

			const noResult = {
				products: [],
				tally: 0,
			};

			if (!Object.keys(keySearch).length) return noResult;

			// get readable filter query for database
			const { fitlerObj, page } = getFilteredQueryObj(filters);
			Object.assign(fitlerObj, {
				page,
			});

			// get filter queries
			const { productQuery, variantQuery, orderQuery } = await filterHelper.getFilterQuery(
				fitlerObj,
			);

			// assign key search to the filter condition
			Object.assign(productQuery, {
				[keySearch.key]: keySearch.value,
			});

			// define standand included table for prodcut fetching result
			const standardFetchInclude = [
				{
					model: Inventory,
					as: 'variants',
					required: true,
					attributes: ['price', 'msrpPrice'],
					where: variantQuery,
				},
			];

			// color fitler
			if (fitlerObj.color) {
				const hsl = colorUtils.hexToHsl(fitlerObj.color);
				// generate searching query
				const colorQuery = colorSearch.getColorQueryFromHsl(hsl);
				standardFetchInclude.push({
					model: Color,
					as: 'colors',
					attributes: [],
					where: colorQuery,
				});
			}

			const limit = 30;
			const offset = (page - 1) * limit;

			const [err, { rows, count }] = await to(
				Product.findAndCountAll({
					offset, // starting point (e.g., page = 1 indicates starting from 0)
					limit,
					distinct: true,
					attributes: [
						'ProductID',
						'productName',
						'status',
						'topSeller',
						'minPrice',
						'maxPrice',
						'image',
					],
					include: standardFetchInclude,
					order: orderQuery,
					where: productQuery,
				}),
			);

			if (err) throw err.message;

			if (__DEV__) {
				// eslint-disable-next-line no-console
				console.log(
					`[GET PRODUCT BY CATALOG]: Fetched ${offset} ~ ${offset +
						count} out of ${count} in ${Math.round((now() - t0) * 100) / 100} ms`,
				);
			}

			return {
				products: rows,
				tally: count,
				filterState: JSON.stringify(fitlerObj),
			};
		},
	},
};
