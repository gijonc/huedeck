/**
 *	Huedeck, Inc
 */

import React from 'react';
import Layout from '../../components/Layout';
import utils from '../utils';
import CollectionList from './CollectionList';
import CollectionListByTag from './CollectionListByTag';
import collectionSchema from './collectionSchema';

async function action({ params }) {
	// decide what tags to show on the page, order matters
	const validCollectionTag = ['color of the year', "editor's choice"].concat(
		collectionSchema['color mood'],
	);

	// default return all collections
	let title = 'Collections | Huedeck';
	let returnComp = <CollectionList displayTags={validCollectionTag} />;

	// this loads specified collection list by tag
	if (params.tagContent) {
		const { tagContent } = params;
		title = `${utils.toCapitalize(tagContent)} | Huedeck Collections `;
		returnComp = <CollectionListByTag displayTag={tagContent} />;
	}

	return {
		chunks: ['collectionList'],
		title,
		component: <Layout>{returnComp}</Layout>,
	};
}

export default action;
