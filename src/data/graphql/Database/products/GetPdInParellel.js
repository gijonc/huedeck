/* eslint-disable prefer-const */
/* eslint-disable camelcase */

/**
 *	Huedeck, Inc
 */
import now from 'performance-now';
import { Op, literal, fn } from 'sequelize';
import { Product, Color, Inventory } from 'data/models/product';
import sequelize from '../../../sequelize';
import { ValidationError } from '../../utils';
import colorSearch from './colorSearch';
import fetchAIColor from './fetchAIColor';
import colorUtils from './colorUtils';

export const schema = [
	`
	type PdInParellelResult {
		products: [DatabaseProductType!]
		tally: Int
	}
	`,
];

export const queries = [
	`
	getProductByColor (
		color: PaletteInput!
		itemNumPerColor: Int!
	): MatchedProducts

	getProductByCateogry (
		seed: String
		productId: String
		rgbArr: [[Int!]!]
	): PdInParellelResult

	getTopSellerProduct (
		priorOrder: [String!]
	): [DatabaseProductType]
  `,
];

/**
 *  GraphqlQL Resolvers
 */

// const RANDOM_ITEM_PER_PAGE = 100;
// const GET_ITEM_WITH_BWG_COLOR = false;

function filterDistinctProducts(twoDList, limit) {
	const existed = {};
	const outputList = [];

	for (let i = 0; i < limit; i += 1) {
		for (let j = 0, len = twoDList.length; j < len; j += 1) {
			const pd = twoDList[j][i];
			if (pd && !existed[pd.ProductID]) {
				existed[pd.ProductID] = true;
				outputList.push(pd);
			}
		}
	}
	return outputList;
}

const HOME_DECOR = [
	'pillows & throws',
	'decorative accents',
	'lamps',
	'rugs',
	'mirrors',
	'wall decor',
	'artwork',
	'window treatments',
	'clocks',
];

const FURNITURE = [
	'living room furniture',
	'kitchen & dining furniture',
	'bedroom furniture',
	'home office furniture',
	'entryway furniture',
];

async function fetchProductByColor(queryList, pdLimPerColor) {
	const queryLen = queryList.length;
	const limit = pdLimPerColor || 1;

	// fetch matched color products
	const products = await sequelize
		.transaction(async t => {
			const promises = [];
			for (let i = 0; i < queryLen; i += 1) {
				const randCatList = HOME_DECOR.sort(() => 0.5 - Math.random())
					.slice(0, 5)
					.concat(FURNITURE);

				const prom = Product.findAll({
					include: [
						{
							model: Color,
							as: 'colors',
							required: true,
							attributes: ['hexCode', 'colorIndex'],
							where: queryList[i],
						},
					],

					where: {
						display: true,
						stock: 1,
						category2: {
							[Op.or]: randCatList,
						},
					},
					order: [[literal('RAND()')]],
					attributes: ['ProductID', 'productName', 'category2', 'image'],
					limit,
					transaction: t,
				});

				promises.push(prom);
			}
			const result = await Promise.all(promises);
			return result;
		})
		.then(res => filterDistinctProducts(res, limit))
		.catch(err => ({
			error: err.message,
		}));

	return products;
}

async function fetchProductByCategory(cateArr, colorSearchQueryArr, productId) {
	const include = [
		{
			model: Inventory,
			as: 'variants',
			required: true,
			attributes: ['price', 'msrpPrice'],
		},
	];

	if (colorSearchQueryArr && colorSearchQueryArr.length) {
		include.push({
			model: Color,
			as: 'colors',
			required: true,
			attributes: [],
			where: {
				[Op.or]: colorSearchQueryArr,
			},
		});
	}

	const otherFilters = {};
	if (productId) {
		otherFilters.ProductID = {
			[Op.ne]: productId,
		};
	}

	const products = await sequelize
		.transaction(async t => {
			const promises = [];
			for (let i = 0, len = cateArr.length; i < len; i += 1) {
				const prom = Product.findAndCountAll({
					subQuery: false,
					distinct: true,
					include,
					where: {
						display: true,
						stock: 1,
						category2: cateArr[i],
						...otherFilters,
					},
					order: [[literal('RAND()')]],
					attributes: [
						'ProductID',
						'productName',
						'category2',
						'minPrice',
						'maxPrice',
						'image',
					],
					transaction: t,
				});

				promises.push(prom);
			}
			const result = await Promise.all(promises);
			return result;
		})
		.then(res => {
			let rowList = [];
			let maxLength = 0;
			let tally = 0;
			for (let i = 0, len = res.length; i < len; i += 1) {
				const { rows, count } = res[i];
				tally += count;
				const { length } = rows;
				if (length) {
					rowList.push(rows);
					if (length > maxLength) {
						maxLength = length;
					}
				}
			}
			return {
				products: filterDistinctProducts(rowList, maxLength),
				tally,
			};
		})
		.catch(err => ({
			error: err.message,
		}));

	return products;
}

// RESOLVERS

export const resolvers = {
	RootQuery: {
		async getProductByColor(parent, args) {
			const t0 = now();

			let rgbArrForReturn = [];
			if (args.color) {
				const { getAI, rgbArr, setFuzzy } = args.color;
				rgbArrForReturn = getAI ? await fetchAIColor(rgbArr, setFuzzy) : rgbArr;
			}

			const hslArr = colorUtils.rgb2HslArr(rgbArrForReturn);
			const queryList = hslArr.map(hsl => colorSearch.getSearchPdQuery(hsl, 1));
			const products = await fetchProductByColor(queryList, args.itemNumPerColor);

			if (products.error) {
				console.error(products.error);
				throw new ValidationError([products.error]);
			}

			if (__DEV__) {
				// eslint-disable-next-line no-console
				console.log(
					`[GET PRODUCT BY COLOR]: Fetched ${products.length} products in ${Math.round(
						(now() - t0) * 10,
					) / 10} ms`,
				);
			}

			return {
				products,
				rgb: rgbArrForReturn,
			};
		},

		async getProductByCateogry(parent, args) {
			const t0 = now();

			let colorSearchQueryArr = [];

			// get random related category from a list
			const inputCatArr = [].concat(FURNITURE, HOME_DECOR);
			const index = inputCatArr.indexOf(args.seed);

			if (index > -1) {
				inputCatArr.splice(index, 1);
			}

			if (args.rgbArr && args.rgbArr.length) {
				const hslArrList = colorUtils.rgb2HslArr(args.rgbArr);
				colorSearchQueryArr = hslArrList.map(hsl => colorSearch.getSearchPdQuery(hsl, 1));
			}

			const result = await fetchProductByCategory(
				inputCatArr,
				colorSearchQueryArr,
				args.productId,
			);

			if (result.error) {
				console.error(result.error);
				throw new ValidationError([result.error]);
			}

			if (__DEV__) {
				// eslint-disable-next-line no-console
				console.log(
					`[GET PRODUCT BY CATEGORY]: Fetched ${result.products.length} of ${
						result.tally
					} products in ${Math.round((now() - t0) * 10) / 10} ms`,
				);
			}

			return result;
		},

		async getTopSellerProduct(parent, args) {
			try {
				const t0 = now();
				const { priorOrder } = args;
				let allCat2 = HOME_DECOR.concat(FURNITURE);

				if (priorOrder && priorOrder.length) {
					allCat2 = allCat2.filter(str => priorOrder.indexOf(str) === -1);
					allCat2 = priorOrder.concat(allCat2);
				}

				const standardFetchInclude = [
					{
						model: Inventory,
						as: 'variants',
						required: true,
						attributes: ['price', 'msrpPrice'],
					},
				];
				const promises = [];
				const limit = 2;
				for (let i = 0, len = allCat2.length; i < len; i += 1) {
					promises.push(
						Product.findAll({
							attributes: [
								'ProductID',
								'topSeller',
								'minPrice',
								'maxPrice',
								'image',
								'productName',
							],
							order: fn('RAND'), // randomly order
							limit,
							include: standardFetchInclude,
							where: {
								category2: allCat2[i],
								display: true,
								topSeller: {
									[Op.gte]: 0.85,
								},
								stock: 1, // in stock is required
							},
						}),
					);
				}

				const result = await Promise.all(promises);
				const products = filterDistinctProducts(result, 5);

				if (__DEV__) {
					// eslint-disable-next-line no-console
					console.log(
						`[GET TOP SELLER PRODUCT]: Fetched ${products.length} products in ${Math.round(
							(now() - t0) * 10,
						) / 10} ms`,
					);
				}

				return products;
			} catch (err) {
				throw err.message;
			}
		},
	},
};
