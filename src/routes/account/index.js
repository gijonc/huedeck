/**
 *	Huedeck, Inc
 */
import React from 'react';
import Layout from '../../components/Layout';
import NotFound from '../not-found/NotFound';
import PasswordReset from './PasswordReset';
import EmailConfirm from './EmailConfirm';

async function action({ params, query }) {
	let page = null;
	let title = null;

	if (params.action && Object.keys(query).length) {
		if (params.action === 'confirm-email') {
			page = <EmailConfirm {...query} />;
			title = 'Email Confirm';
		} else if (params.action === 'reset-password') {
			page = <PasswordReset {...query} />;
			title = 'Reset Password';
		}
	}

	return {
		chunks: ['account'],
		title,

		component: <Layout>{page || <NotFound />}</Layout>,
	};
}

export default action;
