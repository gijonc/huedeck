/**
 *	Huedeck, Inc
 */
import React from 'react';
import PopUpPage from './PopUpPage';

async function action({ store }) {
	const data = store.getState().loggedIn;

	return {
		chunks: ['oauth'],
		title: 'Log In',
		component: <PopUpPage {...data} />,
	};
}

export default action;
