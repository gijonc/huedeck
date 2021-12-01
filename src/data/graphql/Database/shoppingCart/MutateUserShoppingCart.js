/* eslint-disable prefer-const */
/* eslint-disable camelcase */

/**
 *	Huedeck, Inc
 */
import { CartItem, CartItemPalette, UserCart } from '../../../models/cart';
import shopify from '../../Api/shopify/buySdk';
import sequelize from '../../../sequelize';
import { getValidGuest } from '../../utils';

export const schema = [
	`
	type MutateCartItemSuccess {
		success: Boolean!
		cartId: String
	}

	input CartItemUpdate {
		quantity: Int
		id: String!
	}

	`,
];

export const mutation = [
	`
	addCartItem(
		cartId: String
		itemId: String!
		palette: String!
		quantity: Int
	): MutateCartItemSuccess

	updateCartItem(
		cartId: String!
		items: [CartItemUpdate]!
	): MutateCartItemSuccess

	deleteCartItem(
		cartId: String!
		ids: [String!]!
	): MutateCartItemSuccess

	`,
];

export const resolvers = {
	Mutation: {
		async addCartItem(parent, args, context) {
			try {
				const clientId = getValidGuest(context);
				if (!context.user && !clientId) return null;

				const inputQty = args.quantity || 1; // default quantity to addToCart is 1
				let success = false;
				let { cartId } = args;
				let addedItemLineId;

				const input = {
					lineItems: [
						{
							variantId: shopify.encodeId(args.itemId),
							quantity: Number(inputQty),
						},
					],
				};

				if (clientId && !cartId) {
					// for first time user added item to cart
					// guest has not yet added any item before (no assigned checkoutId)
					const newCheckout = await shopify.createCheckout(input);
					addedItemLineId = newCheckout.lineItems[0].id;
					cartId = newCheckout.id;
					await UserCart.create({
						checkoutId: newCheckout.id,
						UserID: clientId,
						isGuest: true,
					});
				} else {
					addedItemLineId = await shopify.addLineItems(input.lineItems, cartId);
				}

				if (addedItemLineId && cartId) {
					success = await CartItem.findOne({
						where: {
							ItemID: args.itemId,
							CartID: cartId,
						},
					}).then(async existItem => {
						let CartItemID;
						// item doesn't exist, create
						if (!existItem) {
							const created = await CartItem.create({
								CartID: cartId,
								ItemID: args.itemId,
								quantity: inputQty,
								shopifyLineId: addedItemLineId,
							});
							CartItemID = created.id;
						} else {
							// item exists, increment quantity
							const updated = await existItem.increment('quantity', {
								by: inputQty,
							});
							CartItemID = updated.id;
						}

						if (CartItemID) {
							const paletteCreated = await CartItemPalette.findOrCreate({
								where: {
									CartItemID,
									palette: args.palette,
								},
							});
							return Boolean(paletteCreated);
						}
						return false;
					});
				}
				return {
					success,
					cartId,
				};
			} catch (err) {
				throw err.message;
			}
		},

		async updateCartItem(parent, args, context) {
			if (!context.user && !getValidGuest(context)) return null;

			const { items, cartId } = args;
			const transaction = await sequelize.transaction();
			try {
				const promises = [];
				for (let i = 0, len = items.length; i < len; i += 1) {
					promises.push(
						CartItem.update(
							{
								quantity: items[i].quantity,
							},
							{
								where: {
									shopifyLineId: items[i].id,
									CartID: cartId,
								},
								transaction,
							},
						).then(res => res[0]),
					);
				}
				// try update to db
				await Promise.all(promises);
				// try update to shopify
				await shopify.updateLineItems(items, cartId);
				// both get updated
				await transaction.commit();
				return { success: true };
			} catch (err) {
				await transaction.rollback();
				throw err.message;
			}
		},

		async deleteCartItem(parent, args, context) {
			if (!context.user && !getValidGuest(context)) return null;

			const { ids, cartId } = args;
			const transaction = await sequelize.transaction();
			try {
				const promises = [];
				for (let i = 0, len = ids.length; i < len; i += 1) {
					promises.push(
						CartItem.destroy({
							where: {
								shopifyLineId: ids,
								CartID: cartId,
							},
							transaction,
						}),
					);
				}
				// try update to db
				await Promise.all(promises);
				// try update to shopify
				try {
					await shopify.removeLineItems(ids, cartId);
				} catch (spfErr) {
					const errMsg = JSON.parse(spfErr.message)[0].message;
					// item would have been removed from shopify already if it's out of stock, then ignore this error from message
					if (!errMsg.startsWith('could not find Line Item with id')) throw errMsg;
				}
				// both get updated
				await transaction.commit();
				return { success: true };
			} catch (err) {
				await transaction.rollback();
				throw err.message;
			}
		},
	},
};
