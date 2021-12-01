/**
 * Huedeck, Inc
 */

import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import constants from 'routes/constants';
import s from './ThirdPatyLogInForm.css';

class ThirdPatyLogInForm extends React.Component {
	static propTypes = {
		success: PropTypes.func.isRequired,
	};

	static contextTypes = {
		store: PropTypes.object.isRequired,
	};

	componentWillUnmount() {
		window.removeEventListener('storage', this.localStorageUpdated);
	}

	handleThirdPartyLogin = () => {
		if (typeof window !== 'undefined') {
			localStorage.setItem(constants.OauthLoginKey, 'pending');
			window.addEventListener('storage', this.localStorageUpdated);
		}
	};

	localStorageUpdated = async e => {
		// listen on third party login success on other window
		const loginData = localStorage.getItem(constants.OauthLoginKey);
		if (e.isTrusted && loginData) {
			localStorage.removeItem(constants.OauthLoginKey);
			this.updateStoreUserState(loginData);
		}
	};

	updateStoreUserState = dataStr => {
		try {
			// update LoginData to current Redux Store
			window.removeEventListener('storage', this.localStorageUpdated);
			this.props.success(JSON.parse(dataStr));
		} catch (e) {
			return true;
		}
		return true;
	};

	render() {
		return (
			<div className={s.container}>
				<form action="/auth/facebook" method="POST" target="_blank">
					<button type="submit" onClick={this.handleThirdPartyLogin} className={s.facebook}>
						<i className="fa fa-facebook-f" />
						<span>with Facebook</span>
					</button>
				</form>

				<form action="/auth/google" method="POST" target="_blank">
					<button onClick={this.handleThirdPartyLogin} className={s.google}>
						<i className="fa fa-google" />
						<span>with Google</span>
					</button>
				</form>
			</div>
		);
	}
}

export default withStyles(s)(ThirdPatyLogInForm);
