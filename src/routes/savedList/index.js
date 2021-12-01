/**
 *	Huedeck, Inc
 */

import React from 'react';
import Layout from '../../components/Layout';
import SavedList from './SavedList';

const title = 'Saved Collections';

function action() {
	return {
		chunks: ['savedList'],
		title,

		component: (
			<Layout>
				<SavedList />
			</Layout>
		),
	};
}

export default action;
