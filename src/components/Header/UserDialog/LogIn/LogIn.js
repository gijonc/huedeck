/**
 * Huedeck, Inc
 */

import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { FormHelperText } from '@material-ui/core';
import { setUserState } from 'actions/userState';
import ThirdPartyLoginForm from '../../../Utilities/ThirdPartyLoginForm';
import { LineThrough } from '../../../Utilities';
import s from './LogIn.css';

class LogIn extends React.Component {
	static contextTypes = {
		fetch: PropTypes.func.isRequired,
		store: PropTypes.object.isRequired,
	};

	state = {
		errMsg: null,
		loading: false,
		userInput: {
			email: '',
			password: '',
		},
	};

	componentWillUnmount() {
		window.removeEventListener('storage', this.localStorageUpdated);
	}

	logUserIn = user => {
		this.context.store.dispatch(setUserState({ user }));
		const currentPath = window.location.pathname.substring(1);
		if (['style-quiz'].indexOf(currentPath) !== -1) {
			window.location.reload();
		}
	};

	handleSubmit = async e => {
		e.preventDefault();
		const { userInput } = this.state;
		const body = JSON.stringify(userInput);
		userInput.password = '';
		this.setState({ loading: true, userInput });
		const res = await this.context.fetch('/auth/local', { body });
		const login = await res.json();

		if (login.success && typeof login.user === 'object') {
			this.logUserIn(login.user);
		} else if (login.error) {
			this.setState({
				errMsg: login.error,
				loading: false,
			});
		}
		return true;
	};

	handleInputChange = e => {
		// add user input rules/constraints
		this.setState({ errMsg: '' });
		const { userInput } = this.state;
		const { value, name } = e.target;

		userInput[name] = value;
		this.setState({ userInput });
	};

	render() {
		const { errMsg, userInput, loading } = this.state;

		return (
			<div className={s.formContainer}>
				<ThirdPartyLoginForm success={this.logUserIn} />

				<LineThrough />

				<form onSubmit={this.handleSubmit}>
					{errMsg && (
						<FormHelperText error style={{ fontSize: '1.2rem' }}>
							<i className="fa fa-exclamation-circle" />
							{` ${errMsg}`}
						</FormHelperText>
					)}

					<div className={s.formGroup}>
						<label className={s.label} htmlFor="email">
							<span>Email</span>
							<input
								disabled={loading}
								className={s.input}
								id="email"
								type="email"
								name="email"
								value={userInput.email}
								onChange={this.handleInputChange}
								autoComplete="username email"
								autoFocus // eslint-disable-line jsx-a11y/no-autofocus
							/>
						</label>
					</div>

					<div className={s.formGroup}>
						<label className={s.label} htmlFor="password">
							<span>Password</span>
							<input
								disabled={loading}
								className={s.input}
								id="password"
								type="password"
								name="password"
								value={userInput.password}
								onChange={this.handleInputChange}
								autoComplete="new-password"
							/>
						</label>
					</div>

					<div className={s.formGroup}>
						<button
							className={s.submitBtn}
							type="submit"
							disabled={!userInput.email || !userInput.password || loading}
						>
							{loading ? <i className="fa fa-spinner fa-spin" /> : 'log in'}
						</button>
					</div>
				</form>
			</div>
		);
	}
}

export default withStyles(s)(LogIn);
