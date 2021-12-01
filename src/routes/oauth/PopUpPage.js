/**
 * Huedeck, Inc
 */

import React from 'react';
import constants from 'routes/constants';

class ThirdPartyLogin extends React.Component {
	componentDidMount() {
		const status = localStorage.getItem(constants.OauthLoginKey);
		if (typeof window !== 'undefined' && status === 'pending') {
			localStorage.setItem(constants.OauthLoginKey, JSON.stringify(this.props));
			window.addEventListener('storage', this.localStorageUpdated);
		}
	}

	componentWillUnmount() {
		window.removeEventListener('storage', this.localStorageUpdated);
	}

	localStorageUpdated = async e => {
		if (
			e.isTrusted &&
			!localStorage.getItem(constants.OauthLoginKey) &&
			typeof window !== 'undefined'
		) {
			window.close();
		}
	};

	render() {
		return null;
	}
}

export default ThirdPartyLogin;
