/**
 *	Huedeck, Inc
 */
import { Op } from 'sequelize';
import now from 'performance-now';
import sequelize from '../../../sequelize';
import { RoomScene, Inventory, Product } from '../../../models';
import { to } from '../../utils';

export const schema = [
	`
  type RoomSceneType {
    id: String
	 productCount: Int
	 name: String
	 products: [DatabaseProductType!]
  }

  type SceneListType {
	  sceneList: [RoomSceneType]
	  newOffset: Int!
  }

  type SceneWithStyleType {
	  id: String!
	  name: String!
	  styles: [String!]!
	  productCount: Int!
  }

	`,
];

export const queries = [
	`
  getAllRoomScene(
	  offset: Int!
  ): SceneListType

  getOneRoomScene(
	  id: String!
  ): RoomSceneType

  getSceneWithStyle: [SceneWithStyleType]

	`,
];

export const resolvers = {
	RootQuery: {
		async getAllRoomScene(parent, args) {
			const t0 = now();
			const { offset } = args;
			const limit = 40;
			const newOffset = offset + limit;
			const result = {
				newOffset,
				sceneList: [],
			};

			try {
				result.sceneList = await RoomScene.findAndCountAll({
					limit,
					offset,
					distinct: true,
					include: [
						{
							model: Product,
							as: 'products',
							attributes: ['productName'],
						},
					],
					order: [[{ model: Product, as: 'products' }, 'productName', 'ASC']],
					where: {
						productCount: {
							[Op.gt]: 1,
						},
					},
				}).then(res => {
					// exceeded amount of items
					if (newOffset >= res.count) {
						result.newOffset = -1;
					}
					return res.rows;
				});
			} catch (err) {
				throw err.message;
			}

			if (__DEV__) {
				// eslint-disable-next-line no-console
				console.log(
					`[GET ROOM SCENE]: Fetched ${offset} ~ ${offset +
						result.sceneList.length} data in ${Math.round((now() - t0) * 10) / 10} ms`,
				);
			}

			return result;
		},

		async getOneRoomScene(parent, args) {
			const [err, result] = await to(
				RoomScene.findOne({
					where: { id: args.id },
					include: [
						{
							model: Product,
							as: 'products',
							attributes: ['ProductID', 'productName', 'minPrice', 'maxPrice', 'image'],
							include: [
								{
									model: Inventory,
									as: 'variants',
									required: true,
									attributes: ['msrpPrice'],
								},
							],
						},
					],
				}),
			);

			if (err) throw err.message;

			return result;
		},

		async getSceneWithStyle() {
			const getSceneStyleQuery = `
				SELECT RS.id, RS.productCount, RS.name, Result.style FROM RoomScene AS RS
				JOIN(
					SELECT RSP_M.RoomSceneID, RSP_M.ProductID, PD.style FROM RoomSceneProduct AS RSP_M JOIN(
						SELECT ProductID, style FROM Product
					) AS PD ON RSP_M.ProductID = PD.ProductID
				) AS Result ON RS.id = Result.RoomSceneID
				GROUP BY RS.id, Result.style;
			`;

			const res = await sequelize.select(getSceneStyleQuery);
			res.sort((a, b) => a.id - b.id);

			const list = [];
			let frontier = list.length - 1;
			for (let i = 0, len = res.length; i < len; i += 1) {
				if (list[frontier] && res[i].id === list[frontier].id) {
					list[frontier].styles.push(res[i].style);
				} else {
					const { style, ...others } = res[i];
					list.push({
						...others,
						styles: [style],
					});
					frontier += 1;
				}
			}

			const ids = [
				'40691553027530143',
				'4321553027530143',
				'42311553027530143',
				'19591553027530143',
				'19241553027530143',
				'16011553027530143',
				'5241553027530143',
				'1641553027530143',
				'1441553027530143',
				'911553027530143',
				'691553027530143',
			];

			const filteredList = list.filter(
				obj => obj.styles.length >= 5 && ids.indexOf(String(obj.id)) !== -1,
			);

			return filteredList;
		},
	},
};
