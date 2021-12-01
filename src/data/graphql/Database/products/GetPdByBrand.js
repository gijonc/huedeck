/**
 *	Huedeck, Inc
 */

import { Op } from 'sequelize';
import now from 'performance-now';
import sequelize from '../../../sequelize';
import { Product, Inventory } from '../../../models';
import mappingCategoryOfBrand from '../JSON/categorySchema.json';

export const schema = [
	`
   type CategoryOfPdType {
		name: String!
		products: [DatabaseProductType!]
		tally: Int!
	}

	type CategoryOfBrandSchemaType {
		category2: String!
		category3: String!
		count: Int!
	}

	type CategoryByBrandResult {
		categoryOfBrandSchema: [CategoryOfBrandSchemaType!]
		pdOfCategoryList: [CategoryOfPdType!]
	}

	`,
];

export const queries = [
	`
	getCategoryByBrand (
		brand: String!
	): CategoryByBrandResult

  `,
];

export const resolvers = {
	RootQuery: {
		async getCategoryByBrand(parent, args) {
			const getProductByBrandProm = searches =>
				Product.findAndCountAll({
					attributes: [
						'ProductID',
						'productName',
						'status',
						'topSeller',
						'minPrice',
						'maxPrice',
						'image',
					],
					order: [['topSeller', 'DESC'], ['minPrice', 'ASC']],
					limit: 6,
					distinct: true,
					where: {
						...searches,
						display: true,
						stock: 1,
						manufacturer: {
							[Op.like]: `%${args.brand}%`,
						},
					},
					include: [
						{
							model: Inventory,
							as: 'variants',
							required: true,
							attributes: ['price', 'msrpPrice'],
						},
					],
				}).then(res => ({
					name: searches.category3 || searches.category2,
					tally: res.count,
					products: res.rows,
				}));

			try {
				const t0 = now();
				const fetchingList = mappingCategoryOfBrand[args.brand];

				const getCategoryByBrandQuery = `
				SELECT category2, category3, COUNT(category3) AS count 
				FROM Product WHERE manufacturer LIKE '%${args.brand}%'
				GROUP BY category2, category3
				ORDER BY count DESC;
			`;

				const promises = [sequelize.select(getCategoryByBrandQuery)];

				for (let i = 0, len = fetchingList.length; i < len; i += 1) {
					promises.push(getProductByBrandProm(fetchingList[i]));
				}

				const list = await Promise.all(promises);

				if (__DEV__) {
					// eslint-disable-next-line no-console
					console.log(
						`[GET PRODUCTS BY BRAND]: Fetched FROM ${args.brand} in ${Math.round(
							(now() - t0) * 100,
						) / 100} ms`,
					);
				}

				return {
					categoryOfBrandSchema: list[0],
					pdOfCategoryList: list.slice(1),
				};
			} catch (err) {
				if (__DEV__) console.error(err.message);
				throw err.message;
			}
		},
	},
};
