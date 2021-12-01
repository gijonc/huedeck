/* eslint-disable prefer-const */
/* eslint-disable camelcase */

/**
 *	Huedeck, Inc
 */

// import { Op } from 'sequelize';

import shopify from '../../Api/shopify/config';

import { Product } from '../../../models';
import { to } from '../../utils';

export const schema = [
	`
	type MutateProductResult {
		success: Boolean!
		errors: String
	}

	input ProductInput {
		title: String!
		body_html: String
		vendor: String
		product_type: String
		tags: String
		published: Boolean
	}

	input VariantInput {
		option1: String
		option2: String
		option3: String
		price: Float!
		sku: Int!
	}

	`,
];

export const mutation = [
	`
	createProduct: MutateProductResult
	
	updateProduct(
		defaultImgUrl: String
		productId: String!
	): MutateProductResult

	deleteProduct(
		id: String!
	): MutateProductResult
	
	`,
];

export const resolvers = {
	Mutation: {
		async createProduct(parent, args, context) {
			if (!context.user) return null;
			const { api } = shopify;
			let success = false;

			let dump_product = {
				title: 'dump title',
				body_html: '<h1>dump html</h1>',
				vendor: 'dump company',
				product_type: 'dump type',
				tags: 'dev_test',
				// variants: [{
				// 		option1: "First",
				// 		price: "10.00",
				// 		sku: "123"
				// 	},
				// 	{
				// 		option1: "Second",
				// 		price: "20.00",
				// 		sku: "123"
				// 	}
				// ],
				// options: [{
				// 		name: "Color",
				// 		values: [
				// 			"Blue",
				// 			"Black"
				// 		]
				// 	}, {
				// 		name: "Size",
				// 		values: [
				// 			"155",
				// 			"159"
				// 		]
				// 	}
				// ]
			};

			const res = await api.product.create(dump_product);
			// console.log(res);

			return { success };
		},

		async updateProduct(parent, args, context) {
			if (!context.user) return null;
			if (!context.user.profile.roleType === 'admin') return null;

			const [error, success] = await to(
				Product.update(
					{
						image: args.defaultImgUrl,
					},
					{
						where: {
							ProductID: args.productId,
						},
					},
				).then(res => res[0] === 1),
			);

			if (error) throw error;

			return {
				success,
			};
		},

		async deleteProduct(parent, args, context) {
			if (!context.user) return null;
			const { api } = shopify;

			const result = await api.product.delete(args.id);
			// console.log(result);
			return result;
		},
	},
};
