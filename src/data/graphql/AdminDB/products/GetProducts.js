/* eslint-disable prefer-const */
/* eslint-disable camelcase */

/**
 *	Huedeck, Inc
 */

// import { Op } from 'sequelize';
import {
	Product,
	Color,
	Media,
	Inventory,
	Option,
	OptionValue,
	InventoryShipping,
} from 'data/models/product';
import now from 'performance-now';

import shopify from '../../Api/shopify/config';
import { to, clearShopifyApiCallTraffic } from '../../utils';
import fetchAIColor from '../../Database/products/fetchAIColor';
import colorUtils from '../../Database/products/colorUtils';

export const schema = [
	`
	type ShopifyVariantType {
		id: String
		title: String
		price: String
		sku: String
		compare_at_price: String
		inventory_quantity: Int
		old_inventory_quantity: Int
		admin_graphql_api_id: String
		option1: String
		option2: String
		option3: String
	}

	type ShopifyImageType {
		id: String
		alt: String
		src: String
		variant_ids: [String]
		width: Int
		height: Int
	}

	type ShopifyProductOption {
		name: String
		values: [String]
	}

	type CategoryType {
		category1: String!
		category2: String!
		category3: String!
	}

	type ShopifyProductType {
		id: String
		body_html: String
		title: String
		vendor: String
		product_type: String
		handle: String
		tags: String
		categories: CategoryType

		variants: [ShopifyVariantType]
		images: [ShopifyImageType]
		options: [ShopifyProductOption]

		rgbArr: [[Int!]!]
	}

	type SingleProductType {
		product: DatabaseProductType,
		rgbArr: [[Int!]!]
	}

	`,
];

export const queries = [
	`
	getProductById (
		id: String!
		getPalette: Boolean!
	): ShopifyProductType

	getSingleProduct (
		id: String!
		getPalette: Boolean!
	): SingleProductType

	`,
];

export const resolvers = {
	RootQuery: {
		async getProductById(parent, args) {
			try {
				const goodTraffic = await clearShopifyApiCallTraffic();
				if (!goodTraffic) {
					throw new Error('Network busy!');
				}

				const getProductPromise = shopify.api.product.get(args.id);
				const getCatPromise = Product.findOne({
					attributes: ['category1', 'category2', 'category3'],
					raw: true,
					where: { ProductID: args.id },
				});

				const promises = [getProductPromise, getCatPromise];

				if (args.getPalette) {
					let getPalettePromise = Color.findAll({
						attributes: ['hslHue', 'hslSaturation', 'hslLightness'],
						raw: true,
						where: {
							ProductID: args.id,
							colorIndex: [1, 2],
						},
					}).then(async res => {
						const { length } = res;
						const rgbArr = [];
						for (let i = 0; i < length; i += 1) {
							const h = res[i].hslHue / 360;
							const s = res[i].hslSaturation / 100;
							const l = res[i].hslLightness / 100;
							rgbArr.push(colorUtils.hsl2Rgb(h, s, l));
						}
						return fetchAIColor(rgbArr);
					});

					promises.push(getPalettePromise);
				}

				const [getProductResult, getCatResult, getPaletteResult] = await Promise.all(promises);

				if (getPaletteResult) {
					Object.assign(getProductResult, { rgbArr: getPaletteResult });
				}

				return Object.assign(getProductResult, { categories: getCatResult });
			} catch (err) {
				console.error('[getProductById]:', err.message);
				return null;
			}
		},

		async getSingleProduct(parent, args) {
			const t0 = now();

			let rgbArr = [];

			const include = [
				{
					model: Inventory,
					as: 'variants',
					include: [
						{
							model: InventoryShipping,
							as: 'shipping',
							attributes: ['shippingMethod'],
						},
					],
				},
				{
					model: Option,
					as: 'options',
					include: [
						{
							model: OptionValue,
							as: 'values',
							attributes: ['value'],
						},
					],
				},
				{
					model: Media,
					as: 'medias',
					where: { mediaType: 'image' },
				},
			];

			if (args.getPalette)
				include.push({
					model: Color,
					as: 'colors',
					attributes: ['hexCode'],
					where: {
						colorIndex: [1, 2],
					},
				});

			const [err, product] = await to(
				Product.findOne({
					where: { ProductID: args.id },
					include,
				}).then(res => {
					if (res) {
						// convert option value objects to an array
						const output = res.get({ plain: true });
						for (let i = 0, len = res.options.length; i < len; i += 1) {
							output.options[i].values = output.options[i].values.map(obj => obj.value);
						}
						return output;
					}
					return null;
				}),
			);

			if (err) {
				console.error('[getSingleProduct]:', err.message);
				return null;
			}

			if (product && args.getPalette) {
				const inputRgbArr = [];
				const { colors } = product;
				let i = 0;
				for (let len = colors.length; i < len; i += 1) {
					inputRgbArr.push(colorUtils.hex2rgb(colors[i].hexCode));
				}
				for (; i < 5; i += 1) {
					/* Fill the blank with "N" for color generator */
					inputRgbArr.push('N');
				}
				/* Shuffle the input array before we feed it so that we may get more palette variants */
				rgbArr = fetchAIColor(colorUtils.shuffle(inputRgbArr));
			}

			if (__DEV__) {
				// eslint-disable-next-line no-console
				console.log(
					`[GET SINGLE PRODUCT]: Fetched in ${Math.round((now() - t0) * 100) / 100} ms`,
				);
			}

			return {
				product,
				rgbArr,
			};
		},
	},
};
