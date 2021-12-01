/* eslint-disable prefer-const */
/* eslint-disable camelcase */

/**
 *	Huedeck, Inc
 */
import { UserOrder } from 'data/models';
import shopify from '../../Api/shopify/config';

// import shopifyClient from 'data/graphql/Api/shopify/buySdk';

import { ValidationError, clearShopifyApiCallTraffic } from '../../utils';

export const schema = [
	`
  type MutateUserOrderResult {
	 success: Boolean!
  }
	`,
];

export const mutation = [
	`
	cancelUserOrder(
		orderId: String!
	): MutateUserOrderResult!
	`,
];

export const resolvers = {
	Mutation: {
		async cancelUserOrder(parent, args, context) {
			if (!context.user) {
				return null;
			}

			let success = true;
			try {
				success = await UserOrder.findOne({
					where: {
						UserID: context.user.id,
						id: args.orderId,
					},
					raw: true,
					attributes: ['createdAt'],
				}).then(async order => {
					if (!order) return false;
					// check if cancellation is expired (calculated in UTC)
					const diff = new Date() - new Date(order.createdAt);
					const orderPlacedAfterMiniute = Math.floor(parseInt(diff, 10) / 60000); // convert seconds to minute
					if (orderPlacedAfterMiniute > 30) return false; // allow to cancel within 30 minites after placement

					// check shopify API call traffic
					const goodTraffic = await clearShopifyApiCallTraffic();
					if (!goodTraffic) throw new Error('Network busy!');

					// call Shopify order cancel API
					const cancelledResult = await shopify.api.order.cancel(args.orderId);

					const { id, cancelled_at } = cancelledResult;
					// check cancelled successfully
					const cancelled = Number(id) === Number(args.orderId) && cancelled_at === null;
					return cancelled;
				});
			} catch (err) {
				console.error('[cancelUserOrder]:', err.message);
				throw new ValidationError([err]);
			}
			return { success };
		},
	},
};
