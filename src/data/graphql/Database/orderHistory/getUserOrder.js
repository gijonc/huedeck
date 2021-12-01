/* eslint-disable prefer-const */
/* eslint-disable camelcase */

/**
 *	Huedeck, Inc
 */
import { Inventory, UserOrder, Media, CartItem, CartItemPalette } from '../../../models';
import shopify from '../../Api/shopify/config';
import { to, ValidationError, clearShopifyApiCallTraffic } from '../../utils';

export const schema = [
	`
  type itemPaletteType {
	palette: [String!]
	createdAt: String!
  }

  type LineItemType {
	 variantId: String!
	 productId: String!
	 quantity: Int!
	 price: Float!
	 name: String!
	 image: ProductMediaType!
	 palette: [String!]
  }

  type AddressType {
	 address1: String!
	 address2: String!
	 city: String!
	 province: String!
	 zip: String!
	 country: String!
	 name: String!
  }

  type paymentDetailType {
	  creditCardNumber: String!
	  creditCardCompany: String!
  }

  type shippingLineType {
	  title: String!
	  price: String
  }

  type fulfillmentType {
	  id: String!
	  status: String!
	  shipmentStatus: String!
	  lastUpdate: String!
	  trackingCompany: String!
	  trackingNumber: String!
	  trackingUrl: String!
	  items: [LineItemType!]
  }

  type UserOrderType {
	  orderId: String!
	  placedAt: String!
	  orderName: String!
	  subTotalPrice: Float!
	  totalTax: Float!
	  totalDiscount: Float!
	  orderStatusUrl: String!

	  contactInfo: String!
	  cancelledAt: String

	  lineItems: [LineItemType!]
	  paymentDetails: paymentDetailType!
	  billingAddress: AddressType!
	  shippingAddress: AddressType!
	  shippingLines: [shippingLineType!]
	  fulfillments: [fulfillmentType!]
  }

  # fullfillment types

  type OrderFulfillmentType {
	  status: String!
  }

	`,
];

export const queries = [
	`
	getUserAllOrder: [UserOrderType!]!

	getOrderFulfillment(
		orderId: String!
	):OrderFulfillmentType

	`,
];

function getVariantImage(idList) {
	return Inventory.findAll({
		where: {
			VariantID: idList,
		},
		attributes: ['VariantID'],
		include: [
			{
				model: Media,
				as: 'variantImage',
				attributes: ['miniPic', 'width', 'height'],
			},
		],
	}).then(res => {
		const imgTable = {};
		for (let i = 0, len = res.length; i < len; i += 1) {
			const { VariantID, variantImage } = res[i].get({ plain: true });
			imgTable[VariantID] = variantImage;
		}
		return imgTable;
	});
}

function getCartItemPalette(CartID) {
	return CartItem.findAll({
		where: { CartID },
		attributes: ['ItemID'],
		include: [
			{
				model: CartItemPalette,
				as: 'paletteList',
				attributes: ['palette', 'createdAt'],
			},
		],
	}).then(res => {
		const paletteTable = {};
		for (let i = 0, iLen = res.length; i < iLen; i += 1) {
			const { ItemID, paletteList } = res[i].get({ plain: true });
			const plObj = paletteList.reduce((prev, current) =>
				prev.createdAt > current.createdAt ? prev : current,
			);
			paletteTable[ItemID] = plObj.palette.split(',');
		}
		return paletteTable;
	});
}

export const resolvers = {
	RootQuery: {
		async getUserAllOrder(parent, args, context) {
			if (!context.user) {
				return null;
			}

			const [systemError, orders] = await to(
				UserOrder.findAll({
					attributes: ['id', 'CartID'],
					order: [['createdAt', 'DESC']],
					where: {
						UserID: context.user.id,
					},
				}).then(async orderRes => {
					// check shopify API call traffic
					const goodTraffic = await clearShopifyApiCallTraffic();
					if (!goodTraffic) {
						throw new Error('Network busy!');
					}

					// check empty orders
					if (!orderRes.length) {
						return [];
					}

					// get all orders from Shopify API
					const spfOrderProms = orderRes.map(obj => shopify.api.order.get(obj.id));
					const result = await Promise.all(spfOrderProms);

					// get item image url from DB based on variant id
					const variantIdList = [];
					for (let i = 0, iLen = result.length; i < iLen; i += 1) {
						const { line_items } = result[i];
						for (let j = 0, jLen = line_items.length; j < jLen; j += 1) {
							const { variant_id } = line_items[j];
							if (variantIdList.indexOf(variant_id) === -1)
								// not saving duplicate variant
								variantIdList.push(variant_id);
						}
					}

					const getVariantImgProm = getVariantImage(variantIdList);
					const getVariantPaletteProm = getCartItemPalette(orderRes.CartID);
					const [variantImgTable, variantPaletteTable] = await Promise.all([
						getVariantImgProm,
						getVariantPaletteProm,
					]);

					const orderOutput = [];
					for (let i = 0, len = result.length; i < len; i += 1) {
						const spOrder = result[i];

						const {
							payment_details,
							billing_address,
							shipping_address,
							line_items,
							shipping_lines,
							fulfillments,
						} = spOrder;

						// split out fulfilled items (status is "success") and non-fulfilled items
						const fulfillmentList = [];
						for (let j = 0, jLen = fulfillments.length; j < jLen; j += 1) {
							// console.log(fulfillments[j].status);

							if (
								fulfillments[j].status === 'success' &&
								fulfillments[j].line_items.length
							) {
								fulfillmentList.push({
									id: fulfillments[j].id,
									status: fulfillments[j].status,
									lastUpdate: fulfillments[j].updated_at,
									trackingCompany: fulfillments[j].tracking_company,
									shipmentStatus: fulfillments[j].shipment_status || 'confirmed',
									trackingNumber: fulfillments[j].tracking_number,
									trackingUrl: fulfillments[j].tracking_url,
									items: fulfillments[j].line_items.map(obj => ({
										variantId: obj.variant_id,
										productId: obj.product_id,
										quantity: obj.quantity,
										price: Number(obj.price),
										name: obj.name,
										image: variantImgTable[obj.variant_id],
										palette: variantPaletteTable[obj.variant_id],
									})),
								});
							}
						}

						const lineItems = [];
						for (let j = 0, jLen = line_items.length; j < jLen; j += 1) {
							if (line_items[j].fulfillment_status !== 'fulfilled') {
								lineItems.push({
									variantId: line_items[j].variant_id,
									productId: line_items[j].product_id,
									quantity: line_items[j].quantity,
									price: Number(line_items[j].price),
									name: line_items[j].name,
									image: variantImgTable[line_items[j].variant_id],
									palette: variantPaletteTable[line_items[j].variant_id],
								});
							}
						}

						// convert order data to output form
						orderOutput.push({
							orderId: spOrder.id,
							placedAt: spOrder.created_at,
							orderName: spOrder.name,
							subTotalPrice: Number(spOrder.subtotal_price),
							totalTax: Number(spOrder.total_tax),
							orderStatusUrl: spOrder.order_status_url,
							totalDiscount: spOrder.discount_codes.reduce(
								(t, { amount }) => t + Number(amount),
								0,
							),

							contactInfo: spOrder.contact_email || spOrder.phone,
							cancelledAt: spOrder.cancelled_at,

							paymentDetails: {
								creditCardNumber: payment_details.credit_card_number,
								creditCardCompany: payment_details.credit_card_company,
							},

							billingAddress: {
								address1: billing_address.address1,
								address2: billing_address.address2,
								city: billing_address.city,
								province: billing_address.province,
								zip: billing_address.zip,
								country: billing_address.country,
								name: billing_address.name,
							},

							shippingAddress: {
								address1: shipping_address.address1,
								address2: shipping_address.address2,
								city: shipping_address.city,
								province: shipping_address.province,
								zip: shipping_address.zip,
								country: shipping_address.country,
								name: shipping_address.name,
							},

							shippingLines: shipping_lines.map(obj => ({
								title: obj.title,
								price: obj.price,
							})),

							lineItems, // defined above

							fulfillments: fulfillmentList, // defined above
						});
					}
					return orderOutput;
				}),
			);

			if (systemError) {
				console.error(systemError.message);
				throw new ValidationError([systemError.message]);
			}

			return orders;
		},
	},
};
