/* eslint-disable prefer-const */
/* eslint-disable camelcase */

/**
 *	Huedeck, Inc
 */

import { Op } from 'sequelize';
import now from 'performance-now';

import { Product, Color, Inventory } from 'data/models/product';
import { to } from '../../utils';
import colorSearch from './colorSearch';
import filterHelper from './filterHelper';
import fetchAIColor from './fetchAIColor';

export const schema = [
	`
	# A product found in the local database

	type ProductColorType {
		ProductID: ID
		hslHue: Int
		hslSaturation: Int
		hslLightness: Int
		hslWeight: Int
		colorIndex: Int
		hexCode: String
		pantoneCode: String
		colorName: String
	}

	type ProductVariantType {
		VariantID: ID
		ProductID: ID
		MediaID: ID
		price: Float
		msrpPrice: Float
		sku: String
		upc: String
		inventoryQty: Int
		variantPosition: Int
		variantOption1: String
		variantOption2: String
		variantOption3: String
		weightLb: Float
		heightInch: Float
		widthInch: Float
		lengthInch: Float
		shape: String

		shipping: InventoryShippingType
		variantImage: ProductMediaType
		product: DatabaseProductType
	}

	type InventoryShippingType {
		shippingMethod: String
	}

	type ProductMediaType {
		MediaID: ID
		mediaType: String
		src: String
		miniPic: String
		position: Int
		alt: String
		width: Int
		height: Int
		ProductID: String
	}

	type ProductOptionType {
		optionName: String
		optionPosition: Int
		values: [String!]
	}

	type DatabaseProductType {
		ProductID: ID
		productName: String
		vendorCollection: String
		material: String
		description: String
		style: String
		manufacturer: String
		shopifyURL: String
		designName: String
		countryOfOrigin: String
		keyword: String
		status: String
		display: Boolean

		category1: String
		category2: String
		category3: String
		category4: String

		score: Float
		topSeller: Float
		pdpImpressions: Float
		saleImpressionsRate: Float
		dataQuality: Float
		deliverySpeed: Float
		random: Float
		stock: Float
		minPrice: Float
		maxPrice: Float
		image: String
		updatedAt: String
		
		variants: [ProductVariantType]
		medias: [ProductMediaType]
		colors: [ProductColorType]
		options: [ProductOptionType]
	}

	type ProductTypeForReturn {
		ProductID: ID
		variants: [ProductVariantType]
		medias: [ProductMediaType]
		colors: [ProductColorType]
		options: [ProductOptionType]
	}


	#
	#########################################################
	#

	type MatchedProducts {
		products: [DatabaseProductType]!
		rgb: [[Int]]
		activePage: Int
		totalCount: Int
	}

	type SimilarProducts {
		products: [DatabaseProductType]!
		newOffset: Int!
		totalCount: Int!
	}

	type AIcolors {
		rgb: [[Int]!]!
	}

	input PaletteInput {
		rgbArr: [[Int!]!]!
		getAI: Boolean!
		setFuzzy: Boolean
	}

	input CategoryFilterInput {
		cat1List: [String!]
		cat2List: [String!]
	}


	input FilterInput {
		order: String
		priceRange: [Float!]
		heightRange: [Float!]
		widthRange: [Float!]
		lengthRange: [Float!]
		styles: [String]
		categories: [String]
		activeColors: [[Int]]
		getBWG: Boolean
		brand: String
		category: CategoryFilterInput
	}

	`,
];

export const queries = [
	`
	getProductByPalette (
		color: PaletteInput
		filters: FilterInput
		page: Int
		limit: Int
	): MatchedProducts

	getSimilarProducts (
		activeColors: [[Int!]!]!
		excludeProductIds: [String!]
		filters: String!
		lastOffset: Int!
	): SimilarProducts

	getAIColor (
		lockedArr: [[Int]!]
		setFuzzy: Boolean
	): AIcolors

	`,
];

/**
 *  GraphqlQL Resolvers
 */

const SIMILAR_ITEM_PER_PAGE = 40;
const GET_ITEM_WITH_BWG_COLOR = false;

export const resolvers = {
	RootQuery: {
		async getAIColor(parent, args) {
			try {
				let input = [];
				if (args && args.lockedArr) {
					input = args.lockedArr;
				}

				const rgbArrForReturn = await fetchAIColor(input, args.setFuzzy);
				return { rgb: rgbArrForReturn };
			} catch (err) {
				throw err.message;
			}
		},

		async getSimilarProducts(parent, args) {
			const t0 = now();

			try {
				const filters = JSON.parse(args.filters);
				const paletteMatchQuery = colorSearch.matchQuery(
					args.activeColors,
					GET_ITEM_WITH_BWG_COLOR,
				);
				const result = await Product.findAndCountAll({
					where: {
						ProductID: {
							[Op.notIn]: args.excludeProductIds,
						},
						...filters,
						display: true,
						stock: 1,
					},
					offset: args.lastOffset, // fetch start from
					limit: SIMILAR_ITEM_PER_PAGE,
					distinct: true,

					include: [
						{
							model: Color,
							as: 'colors',
							required: true,
							attributes: [],
							where: paletteMatchQuery,
						},
						{
							model: Inventory,
							as: 'variants',
							required: true,
							attributes: ['price', 'msrpPrice'],
						},
					],
				}).then(res => {
					let newOffset = args.lastOffset + SIMILAR_ITEM_PER_PAGE;
					if (newOffset > res.count) newOffset = -1;

					return {
						products: res.rows,
						totalCount: res.count,
						newOffset,
					};
				});

				if (__DEV__) {
					// eslint-disable-next-line no-console
					console.log(
						`[GET SIMILAR PRODUCT]: Fetched ${args.lastOffset || 0} ~ ${(args.lastOffset ||
							0) + result.products.length} out of ${result.totalCount} in ${Math.round(
							(now() - t0) * 100,
						) / 100} ms`,
					);
				}

				return result;
			} catch (err) {
				if (__DEV__) console.error(err);
				throw err.message;
			}
		},

		async getProductByPalette(parent, args) {
			const t0 = now();
			let filterOrder = [['style', 'DESC']];
			let filter = {};
			let rgbArrForReturn = [];
			let GET_WITH_BWG = GET_ITEM_WITH_BWG_COLOR;

			if (args.color) {
				const { getAI, rgbArr, setFuzzy } = args.color;
				rgbArrForReturn = getAI ? await fetchAIColor(rgbArr, setFuzzy) : rgbArr;
			}

			if (args.filters && Object.keys(args.filters).length) {
				const filterInput = args.filters;

				// set color to current active color if no any input color
				if (!args.color) {
					rgbArrForReturn = filterInput.activeColors;
				}

				// check if apply black/white/grey color filter to palette search
				if (GET_WITH_BWG && Object.prototype.hasOwnProperty.call(filterInput, 'getBWG')) {
					GET_WITH_BWG = filterInput.getBWG;
				}

				// sorting by price
				if (Object.prototype.hasOwnProperty.call(filterInput, 'order')) {
					if (filterInput.order === 'topseller') {
						filterOrder = [['topseller', 'DESC']];
					} else if (filterInput.order === 'price-ltoh') {
						filterOrder = [['minPrice', 'ASC']];
					} else if (filterInput.order === 'price-htol') {
						filterOrder = [['maxPrice', 'DESC']];
					}
				}

				filter = filterHelper.getFilterQuery(filterInput);
			}

			let paletteMatchQuery = colorSearch.matchQuery(rgbArrForReturn, GET_WITH_BWG);

			const limit = 30;
			const page = args.page || 1;
			const offset = (page - 1) * limit;

			const [err, products] = await to(
				Product.findAndCountAll({
					include: [
						{
							model: Inventory,
							as: 'variants',
							required: true,
							attributes: ['price', 'msrpPrice'],
							where: filter.variantQuery,
						},
						{
							model: Color,
							as: 'colors',
							required: true,
							attributes: [],
							where: paletteMatchQuery,
						},
					],

					attributes: [
						'ProductID',
						'productName',
						'status',
						'topSeller',
						'minPrice',
						'maxPrice',
						'style',
						'image',
					],
					where: filter.productQuery,
					order: filterOrder,
					distinct: true,
					offset,
					limit,
				}),
			);

			if (err) throw err.message;

			if (__DEV__) {
				// eslint-disable-next-line no-console
				console.log(
					`[GET RANDOM PRODUCT]: Fetched ${offset} ~ ${offset + products.rows.length} out of ${
						products.count
					} in ${Math.round((now() - t0) * 100) / 100} ms`,
				);
			}

			return {
				rgb: rgbArrForReturn,
				products: products.rows,
				totalCount: products.count,
				activePage: page,
			};
		},
	},
};
