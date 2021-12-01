/* eslint-disable prefer-const */
/* eslint-disable camelcase */

/**
 *	Huedeck, Inc
 */
import { Op } from 'sequelize';
import {
	Inventory,
	CartItem,
	Media,
	Product,
	Option,
	UserCart,
	CartItemPalette,
	User,
} from '../../../models';
import shopify from '../../Api/shopify/buySdk';
import { to, getValidGuest } from '../../utils';

export const schema = [
	`
	type UserCartType {
		id: String
		checkoutId: String
		checkoutURL: String
	}

	type CartItemType {
		id: Int
		inStock: Boolean
		variant: ProductVariantType
		shopifyLineId: String
		quantity: Int
		palette: [String!]
		createdAt: String
	}

	# this type is for returning a list of palette (currently not in use)
	type CartItemPalette {
		palette: [String!]
		createdAt: String
	}

	type getCheckoutType {
		url: String!
	}

	type CartInfoType {
		cartId: String
		count: Int
	}

	input LineItems {
		variant_id: String!
		quantity: Int!
	}
	`,
];

export const queries = [
	`
	getUserCartItems: [CartItemType]

	getUserCartInfo: CartInfoType

	getGuestCartInfo: CartInfoType

	getCheckout(
		checkoutId: String!
	): getCheckoutType

	`,
];

export const resolvers = {
	RootQuery: {
		async getGuestCartInfo(parent, args, context) {
			const clientId = getValidGuest(context);
			if (clientId) {
				const [err, cart] = await to(
					UserCart.findOne({
						where: {
							UserID: clientId,
							completedAt: {
								[Op.eq]: null,
							},
						},
						include: [{ model: CartItem, as: 'cartItems' }],
					}).then(async result => {
						// no cart found for this client
						if (result) {
							const isValid = await shopify.checkValidCheckout(result.checkoutId);
							if (isValid) {
								let tally = 0;
								for (let i = 0, len = result.cartItems.length; i < len; i += 1) {
									const { quantity, inStock } = result.cartItems[i];
									if (inStock) tally += quantity;
								}
								return {
									cartId: result.checkoutId,
									count: tally,
								};
							}
						}

						return {
							cartId: '',
							count: 0,
						};
					}),
				);

				if (err) {
					throw err.message;
				}

				return cart;
			}

			return null;
		},

		async getUserCartInfo(parent, args, context) {
			if (!context.user) return null;

			const [err, cart] = await to(
				UserCart.findOne({
					where: {
						UserID: context.user.id,
						completedAt: {
							[Op.eq]: null,
						},
					},
					include: [{ model: CartItem, as: 'cartItems' }],
				}).then(async result => {
					// check if the checkoutId valid for this user
					const isValid = await shopify.checkValidCheckout(result.checkoutId);
					if (!isValid) {
						const user = await User.findOne({
							attributes: ['emailAddress'],
							where: {
								id: context.user.id,
							},
						});

						let tally = 0;
						const input = {
							email: user.emailAddress,
						};
						const itemLength = result.cartItems.length;

						if (itemLength > 0) {
							input.lineItems = [];
							for (let i = 0; i < itemLength; i += 1) {
								const { quantity, ItemID, inStock } = result.cartItems[i];
								if (inStock) {
									tally += result.cartItems[i].quantity;
									input.lineItems.push({
										variantId: shopify.encodeId(ItemID),
										quantity,
									});
								}
							}
						}

						// reassign a new shopify checkoutId to user
						const newCheckout = await shopify.createCheckout(input);

						// update Cart with the new Id
						await UserCart.update(
							{
								checkoutId: newCheckout.id,
							},
							{
								where: {
									checkoutId: result.checkoutId,
								},
							},
						);

						// update cartItems with new ItemLineIds
						const updatePromises = [];

						for (let i = 0, len = newCheckout.lineItems.length; i < len; i += 1) {
							const newLineItem = newCheckout.lineItems[i];
							const prom = CartItem.update(
								{
									shopifyLineId: newLineItem.id,
								},
								{
									where: {
										ItemID: shopify.decodeId(newLineItem.variant.id),
										CartID: newCheckout.id,
									},
								},
							);
							updatePromises.push(prom);
						}
						await Promise.all(updatePromises);

						return {
							cartId: newCheckout.id,
							count: tally,
						};
					}
					let tally = 0;
					for (let i = 0, len = result.cartItems.length; i < len; i += 1) {
						const { quantity, inStock } = result.cartItems[i];
						if (inStock) tally += quantity;
					}
					return {
						cartId: result.checkoutId,
						count: tally,
					};
				}),
			);

			if (err) {
				throw err.message;
			}

			return cart;
		},

		async getUserCartItems(parent, args, context) {
			const UserID = getValidGuest(context) || context.user.id;

			const [err, cart] = await to(
				UserCart.findOne({
					attributes: [],
					where: {
						UserID,
						completedAt: {
							[Op.eq]: null, // select cart is not the completed one
						},
					},
					include: [
						{
							model: CartItem,
							as: 'cartItems',
							include: [
								{
									model: Inventory,
									as: 'variant',
									include: [
										{
											model: Media,
											as: 'variantImage',
										},
										{
											model: Product,
											as: 'product',
											attributes: ['productName'],
											include: [
												{
													model: Option,
													as: 'options',
												},
											],
										},
									],
								},
								{
									model: CartItemPalette,
									as: 'paletteList',
									attributes: ['palette', 'createdAt'],
								},
							],
						},
					],
				}).then(async res => {
					// no exist cart for the user
					if (!res) return [];

					const { cartItems } = res;
					const outOfStockItems = [];
					const recoverdItems = [];
					const recoverdItemIds = [];

					for (let i = 0, iLen = cartItems.length; i < iLen; i += 1) {
						const {
							paletteList,
							variant,
							shopifyLineId,
							inStock,
							quantity,
							ItemID,
						} = cartItems[i];

						if (variant.inventoryQty === 0 && inStock) {
							// handle case when item is out of stock but still in cart
							outOfStockItems.push(shopifyLineId);
							cartItems[i].inStock = false;
						} else if (variant.inventoryQty > 0 && !inStock) {
							// item was out of stock and been removed from shopify, recover it
							recoverdItems.push({
								variantId: shopify.encodeId(ItemID),
								quantity,
							});
							recoverdItemIds.push(shopifyLineId);
							cartItems[i].inStock = true;
						}

						// get the most recent created palette
						const plObj = paletteList.reduce((prev, current) =>
							prev.createdAt > current.createdAt ? prev : current,
						);
						cartItems[i].palette = plObj.palette.split(',');
						delete cartItems[i].paletteList;
					}

					// remove outofstocked items from shopify checkout
					if (outOfStockItems.length) {
						const updateDb = CartItem.update(
							{
								inStock: false,
							},
							{
								where: {
									shopifyLineId: outOfStockItems,
								},
							},
						);
						const updateSpf = shopify.removeLineItems(outOfStockItems, cartItems[0].CartID);
						await Promise.all([updateDb, updateSpf]);
					}

					// recover item to shopify checkout
					if (recoverdItems.length) {
						const updateDb = CartItem.update(
							{
								inStock: true,
							},
							{
								where: {
									shopifyLineId: recoverdItemIds,
								},
							},
						);
						const updateSpf = shopify.addLineItems(recoverdItems, cartItems[0].CartID);
						await Promise.all([updateDb, updateSpf]);
					}

					return cartItems;
				}),
			);

			if (err) {
				throw err.message;
			}

			return cart;
		},

		async getCheckout(parent, args, context) {
			const UserID = getValidGuest(context) || context.user.id;
			if (!UserID) return null;

			try {
				// TODO: check with shopify checkout lineitems before checkout
				const checkoutURL = await shopify.getCheckout([], {
					id: args.checkoutId,
					userId: UserID,
				});
				const url = checkoutURL.replace('huedeck.myshopify', 'store.huedeck');
				return { url };
			} catch (err) {
				throw err.message;
			}
		},
	},
};
