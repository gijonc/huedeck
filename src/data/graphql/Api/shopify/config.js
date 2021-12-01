// shopify admin API access

import shopifyStorefrontClient from 'shopify-buy';
import ShopifyAPIClient from 'shopify-api-node';
import fetch from 'node-fetch';
import { myShopify } from '../../../../config';

global.fetch = fetch;

const shopify = {
	client: shopifyStorefrontClient.buildClient({
		domain: myShopify.domain,
		storefrontAccessToken: myShopify.storefrontAccessToken,
	}),

	api: new ShopifyAPIClient({
		shopName: myShopify.domain,
		apiKey: myShopify.key,
		password: myShopify.secret,
	}),
};

export default shopify;
