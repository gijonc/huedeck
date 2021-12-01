/**
 *	Huedeck, Inc
 */

import React from 'react';
import Layout from '../../components/Layout';
import notFound from '../not-found';
import gqlType from '../gqlType';
import { setProgressBar } from '../../actions/progressBar';
import Scene from './Scene';

const title = 'Scene | Huedeck';

const LARGE_IMAGE_PATH = 'https://storage.googleapis.com/huedeck/img/roomScene/1024/';

async function action({ params, client, store, path }) {
	let scene = null;
	let image = null;
	const { id } = params;

	if (id) {
		try {
			store.dispatch(setProgressBar({ start: true }));
			scene = await client
				.query({
					query: gqlType.getOneRoomScene,
					variables: { id },
				})
				.then(res => res.data.getOneRoomScene);
			if (!scene) {
				throw new Error(`scene ${id} not found`);
			}

			image = `${LARGE_IMAGE_PATH + scene.name}.jpeg`;
			store.dispatch(setProgressBar({ start: false }));
		} catch (err) {
			store.dispatch(setProgressBar({ start: false }));
			return notFound();
		}
	}

	return {
		chunks: ['scene'],
		title,
		image,
		path,

		component: (
			<Layout hideSubHeader={Boolean(scene)} hideFooter={Boolean(scene)}>
				<Scene scene={scene} />
			</Layout>
		),
	};
}

export default action;
