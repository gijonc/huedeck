/* eslint-disable prefer-const */
/* eslint-disable camelcase */

/**
 *	Huedeck, Inc
 */

import { Op, fn } from 'sequelize';
// import sequelize from 'data/sequelize';
import now from 'performance-now';

import { Product, Color, Inventory } from '../../../models';

import colorSearch from '../products/colorSearch';
import fetchAIColor from '../products/fetchAIColor';
import colorUtils from '../products/colorUtils';
import roomsJSON from '../JSON/roomSet.json';
import { getPaletteFromColorMood, colorMoodTuner } from './colorMoodProcessor';

export const schema = [
	`
	type RoomSetCategory {
		products: [DatabaseProductType!]
		key: String!
		values: [String]
		limit: Int
		name: String!
	}

	type FetchRoomResult {
		categorySet: [RoomSetCategory]
		palette: [String!]
	}

	`,
];

export const queries = [
	`
	fetchRoom(
		palette: [String!]
		style: [String]
		colorMood: [String]
		color: [String]
		roomType: String
	): FetchRoomResult
  `,
];

function getRoomFetchingPromise(productGetter, filters) {
	const { key, values, limit } = productGetter;

	const where = {
		display: true,
		[key]: {
			[Op.in]: [...values],
		},
	};
	if (filters.style) {
		where.style = filters.style;
	}

	return Product.findAll({
		limit,
		order: fn('RAND'),
		where,
		attributes: [
			'ProductID',
			'style',
			'productName',
			'category1',
			'category2',
			'category3',
			'minPrice',
			'maxPrice',
			'image',
		],

		include: [
			{
				model: Color,
				as: 'colors',
				required: true,
				attributes: ['hexCode'],
				where: {
					// colorIndex: 1,
					...filters.color,
				},
			},
			{
				model: Inventory,
				as: 'variants',
				required: true,
				attributes: ['price', 'msrpPrice'],
			},
		],
	});
}

export const resolvers = {
	RootQuery: {
		async fetchRoom(parent, args) {
			const scope = {};
			try {
				const t0 = now();
				scope.room = roomsJSON[args.roomType];

				// get filters from user input
				const filters = {};
				// get styles
				if (args.style && args.style.length) {
					filters.style = { [Op.in]: args.style };
				}

				// get color: palette > baseColor
				let rgbArr = [];

				if (args.palette && args.palette.length) {
					rgbArr = args.palette.map(hex => colorUtils.hex2rgb(hex));
				} else {
					let setFuzzy = false;
					if (args.color && args.color.length) {
						setFuzzy = true;
					}

					// Apply colorMood to color searching
					if (args.colorMood && args.colorMood.length) {
						const inputRgbList = await colorMoodTuner(args.color, args.colorMood);
						// rgbArr = [
						// 	[0, 0, 0],
						// 	[0, 0, 0],
						// 	[0, 0, 0],
						// 	[0, 0, 0],
						// 	[0, 0, 0]
						// ];
						// // const inputRgbList = args.color.map(hex => colorUtils.hex2rgb(hex));
						const allSimilarRgbColor = await fetchAIColor(inputRgbList, setFuzzy, true);
						rgbArr = await getPaletteFromColorMood(allSimilarRgbColor, args.colorMood);
					} else {
						const inputRgbList = args.color.map(hex => colorUtils.hex2rgb(hex));
						rgbArr = await fetchAIColor(inputRgbList, setFuzzy);
					}
				}

				filters.color = {
					[Op.or]: colorSearch.matchQuery(rgbArr, false),
					hslWeight: {
						[Op.gte]: 30,
					},
				};

				// get fitlered products
				const promises = [];

				for (let i = 0, len = scope.room.length; i < len; i += 1) {
					promises.push(getRoomFetchingPromise(scope.room[i], filters));
				}

				const products = await Promise.all(promises);

				// assign product needed detail for room
				const categorySet = [];
				for (let i = 0, len = scope.room.length; i < len; i += 1) {
					categorySet.push({
						products: products[i],
						...scope.room[i],
					});
				}

				if (__DEV__) {
					// eslint-disable-next-line no-console
					console.log(`[FETCH ROOM]: Fetched in ${Math.round((now() - t0) * 100) / 100} ms`);
				}

				return {
					categorySet,
					palette: colorUtils.rgbArr2hexArr(rgbArr),
				};
			} catch (err) {
				if (__DEV__) console.error(err);
				throw err.message;
			}
		},
	},
};
