import config from './config';

const { client } = config;

function encodeId(vid) {
	const prefix = 'gid://shopify/ProductVariant/';
	return Buffer.from(prefix + vid).toString('base64');
}

function decodeId(str) {
	// last string after '/'
	return Buffer.from(str, 'base64')
		.toString()
		.split('/')
		.pop();
}

async function createCheckout(props) {
	const checkout = await client.checkout.create(props);
	return checkout;
}

async function getCheckout(itemArr, checkout) {
	// this is important to have, allows to update our database cart with
	// a completed order
	const input = {
		customAttributes: [
			{
				key: 'userId',
				value: checkout.userId,
			},
			{
				key: 'checkoutId',
				value: checkout.id,
			},
		],
	};

	if (__DEV__) input.customAttributes.push({ key: 'test_order', value: 'true' });

	try {
		const result = await client.checkout.updateAttributes(checkout.id, input);
		return result.webUrl;
	} catch (e) {
		throw new Error(e.message);
	}
}

async function addLineItems(itemArr, checkoutId) {
	const result = await client.checkout.addLineItems(checkoutId, itemArr);
	const addedItem = result.lineItems.find(item => item.variant.id === itemArr[0].variantId);

	// TODO: double check added successfully?
	// if result.lineItems....

	return addedItem.id;
}

async function updateLineItems(itemArr, checkoutId) {
	const result = await client.checkout.updateLineItems(checkoutId, itemArr);
	// const result = true;

	// TODO: double check added successfully?
	// if result.lineItems....

	return Boolean(result);
}

async function removeLineItems(itemIdArr, checkoutId) {
	const result = await client.checkout.removeLineItems(checkoutId, itemIdArr);
	// TODO: double check added successfully?
	// if result.lineItems....

	return Boolean(result);
}

async function checkValidCheckout(checkoutId) {
	try {
		const res = await client.checkout.fetch(checkoutId);
		if (res.id === checkoutId) return true;
	} catch (e) {
		return false;
	}
	return false;
}

export default {
	createCheckout,
	addLineItems,
	updateLineItems,
	removeLineItems,
	encodeId,
	decodeId,
	getCheckout,
	checkValidCheckout,
};
