import express from 'express';
import { Op } from 'sequelize';
import { UserCart, UserOrder } from './data/models';
import { to } from './data/graphql/utils';
import shopify from './data/graphql/Api/shopify/buySdk';
import sequelize from './data/sequelize';

const router = express.Router();

router.post('/webhook/order-create', async (req, res) => {
	if (req.get('x-shopify-topic') !== 'orders/create') {
		return res.sendStatus(400);
	}
	// better solution ?
	// this will always admit webhook is received from shopify correctly
	res.sendStatus(200);

	let success = false;
	let err = null;
	const order = req.body;

	if (order.id && order.note_attributes.length >= 2) {
		// seperate out webhook request between prod and dev mode
		// see buysdk.js for detailed note_attributes definition
		// A key of the note_attributes array names "test" will be received for dev mode

		let userId;
		let completedCheckoutId;
		let forDevMode = false;

		for (let i = 0, len = order.note_attributes.length; i < len; i += 1) {
			const { name, value } = order.note_attributes[i];
			if (name === 'userId') {
				userId = value;
			} else if (name === 'checkoutId') {
				completedCheckoutId = value;
			} else if (name === 'test_order') {
				if (!__DEV__) return success; // dev webhook ignore in production mode
				forDevMode = true;
			}
		}

		if (__DEV__ && !forDevMode) {
			// eslint-disable-next-line no-console
			console.log('webhook request ignored from Production');
			return success;
		}

		[err, success] = await to(
			UserCart.destroy({
				where: {
					UserID: userId,
					checkoutId: completedCheckoutId,
					completedAt: {
						[Op.eq]: null,
					},
				},
			}).then(async deleted => {
				let result = false;
				if (deleted) {
					const checkout = await shopify.createCheckout();
					result = await sequelize
						.transaction(t => {
							const newCart = UserCart.create(
								{
									UserID: userId,
									checkoutId: checkout.id,
								},
								{
									transaction: t,
								},
							);

							const newOrder = UserOrder.create(
								{
									id: order.id,
									createdAt: order.created_at,
									orderNumber: order.name,
									orderStatusUrl: order.order_status_url,
									UserID: userId,
									CartID: completedCheckoutId,
								},
								{
									transaction: t,
								},
							);

							return Promise.all([newCart, newOrder]);
						})
						.then(() => true)
						.catch(error => {
							// TODO: return valid errors
							err = error;
							return false;
						});
				}
				return result;
			}),
		);
	}

	if (err) {
		console.error('[shopiyf-webhook:order-create]:', err.message);
	}
	return success;
});

/*
router.post('/webhook/checkout-create', (req, res) => {

  if (req.get('x-shopify-topic') !== 'checkouts/create') {
    return res.sendStatus(400);
  }

  res.sendStatus(200);
  return true;
});
*/

export default router;
