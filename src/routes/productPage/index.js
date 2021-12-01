/**
 *	Huedeck, Inc
 */

import React from 'react';
import utils from '../utils';
import gqlQuery from '../gqlType';
import Layout from '../../components/Layout';
import ProductPage from './ProductPage';
import notFound from '../not-found';
import colorMath from '../shop/colorMath';
import { setProgressBar } from '../../actions/progressBar';

async function action({ store, params, client, query, path }) {
	let product = null;
	let hexArr = null;

	try {
		store.dispatch(setProgressBar({ start: true }));
		hexArr = await utils.getValidHexArr(query.pl); // check if any input palette query
		const res = await client.query({
			query: gqlQuery.getSingleProduct,
			variables: {
				id: params.pid,
				getPalette: !hexArr,
			},
		});

		const { getSingleProduct } = res.data;

		if (getSingleProduct.product) {
			product = getSingleProduct.product;

			// if no input palette then use the one generate from AI
			if (!hexArr) hexArr = colorMath.rgbArr2hexArr(getSingleProduct.rgbArr);
		} else {
			throw new Error('Product Not Found');
		}

		store.dispatch(setProgressBar({ start: false }));
	} catch (err) {
		store.dispatch(setProgressBar({ start: false }));
		return notFound();
	}

	return {
		chunks: ['productPage'],
		title: product.productName,
		image: product.medias[0].miniPic,
		description: product.category3,
		path,

		component: (
			<Layout>
				<ProductPage product={product} hexArr={hexArr} initVid={query.vid} />
			</Layout>
		),
	};
}

export default action;
