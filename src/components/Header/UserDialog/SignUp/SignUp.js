/**
 * Huedeck, Inc
 */

import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { FormControlLabel, Checkbox } from '@material-ui/core';
import cx from 'classnames';
import gqlQuery from 'routes/gqlType';
import utils from 'routes/utils';
import { setAlertbar } from 'actions/alertbar';
import { setUserState } from 'actions/userState';
import s from './SignUp.css';

class SignUp extends React.Component {
	static contextTypes = {
		store: PropTypes.object.isRequired,
		client: PropTypes.object.isRequired,
		fetch: PropTypes.func.isRequired,
	};

	state = {
		hasEmptyInput: false, // init should be true
		errMsg: {},
		loading: false,
		checked: false,

		userInput: {
			displayName: '',
			emailAddress: '',
			password: '',
			confirmPassword: '',
		},
	};

	resetUserInput = field => {
		// TODO: if field is defined, clear that particular field
		const { userInput } = this.state;
		if (field) {
			userInput[field] = '';
		}

		userInput.password = '';
		userInput.confirmPassword = '';
		this.setState({
			userInput,
			loading: false,
		});
	};

	handleSubmit = async e => {
		e.preventDefault();
		const { userInput } = this.state;
		const { store, client } = this.context;
		this.setState({
			errMsg: {},
			loading: true,
		});

		try {
			const variables = {
				emailAddress: userInput.emailAddress,
				password: userInput.password,
				confirmPassword: userInput.confirmPassword,
			};

			const displayName = userInput.displayName.trim();
			if (displayName) {
				variables.profile = { displayName };
			}

			const res = await client.mutate({
				mutation: gqlQuery.createUserMutation,
				variables,
			});
			const { databaseCreateUser } = await res.data;

			// handle register error
			if (databaseCreateUser.error) {
				this.setState({
					errMsg: databaseCreateUser.error,
				});
				this.resetUserInput();
				return true;
			}

			// auto login after account successfully created
			const loginRes = await this.context.fetch('/auth/local', {
				body: JSON.stringify({
					email: userInput.emailAddress.toLowerCase().trim(),
					password: userInput.password,
				}),
			});

			const login = await loginRes.json();
			if (login.success) {
				const { user } = login;
				this.context.store.dispatch(setUserState({ user }));
			} else {
				this.setState({
					errMsg: {
						key: 'sysError',
						message: 'Auto login failed, try to mannually log in to your account',
					},
				});
				this.resetUserInput();
				return true;
			}
		} catch (err) {
			store.dispatch(
				setAlertbar({
					status: 'error',
					message: utils.getGraphQLError(err, 'sign up'),
					open: true,
				}),
			);
		}
		return true;
	};

	handleInputChange = e => {
		const { userInput } = this.state;
		const { value, name } = e.target;
		userInput[name] = value;
		this.setState({
			userInput,
			errMsg: {},
		});
	};

	render() {
		const { userInput, loading, errMsg, checked } = this.state;

		return (
			<div className={cx(s.formContainer, loading && s.loading)}>
				<form onSubmit={this.handleSubmit}>
					<div className={s.formGroup}>
						<label className={s.label} htmlFor="emailAddress">
							<span>Email Address</span>
							<input
								autoFocus // eslint-disable-line jsx-a11y/no-autofocus
								className={s.input}
								type="email"
								name="emailAddress"
								value={userInput.emailAddress}
								onChange={this.handleInputChange}
								autoComplete="email"
							/>
						</label>
						{errMsg.key === 'emailAddress' && (
							<div className={s.errMsg}>
								<i className="fa fa-exclamation-circle" />
								{errMsg.message}
							</div>
						)}
					</div>

					<div className={s.formGroup}>
						<label className={s.label} htmlFor="password">
							<span>Password</span>
							<input
								className={s.input}
								type="password"
								name="password"
								placeholder="minimum 8 characters"
								value={userInput.password}
								onChange={this.handleInputChange}
								autoComplete="new-password"
							/>
						</label>
						{errMsg.key === 'password' && (
							<div className={s.errMsg}>
								<i className="fa fa-exclamation-circle" />
								{errMsg.message}
							</div>
						)}
					</div>

					<div className={s.formGroup}>
						<label className={s.label} htmlFor="confirmPassword">
							<span>Confirm Password</span>
							<input
								className={s.input}
								type="password"
								name="confirmPassword"
								value={userInput.confirmPassword}
								onChange={this.handleInputChange}
								autoComplete="new-password"
							/>
						</label>
					</div>

					<div className={s.formGroup}>
						<label className={s.label} htmlFor="displayName">
							<span>Username</span>
							<input
								className={s.input}
								type="text"
								name="displayName"
								placeholder="optional"
								value={userInput.displayName}
								onChange={this.handleInputChange}
								autoComplete="username"
							/>
						</label>
					</div>

					<div className={s.formGroup}>
						<FormControlLabel
							label={
								<span className={s.agreeTerm}>
									<a
										href="/docs/huedeck_terms_of_service"
										target="_blank"
										rel="noopener noreferrer"
									>
										Terms of Service
									</a>
									.
								</span>
							}
							control={
								<Checkbox
									checked={checked}
									color="default"
									onChange={() => {
										this.setState({ checked: !checked });
									}}
								/>
							}
						/>
					</div>

					<div className={s.formGroup}>
						<button
							disabled={this.state.hasEmptyInput || !checked}
							className={s.submitBtn}
							type="submit"
						>
							{loading ? <i className="fa fa-spinner fa-spin" /> : 'complete'}
						</button>
						{errMsg.key === 'sysError' && (
							<div className={s.errMsg}>
								<i className="fa fa-exclamation-circle" />
								{errMsg.message}
							</div>
						)}
					</div>
				</form>
			</div>
		);
	}
}

export default withStyles(s)(SignUp);
