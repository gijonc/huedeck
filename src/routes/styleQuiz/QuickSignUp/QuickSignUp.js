/**
 *	Huedeck, Inc
 */

import React from 'react';
import PropTypes from 'prop-types';
// import cx from 'classnames';
import { FormControlLabel, Checkbox } from '@material-ui/core';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { setAlertbar } from 'actions/alertbar';
import { setUserState } from 'actions/userState';
import { updatePreference } from 'actions/updateDbUser';
import { LineThrough, ThirdPartyLoginForm } from '../../../components/Utilities';
import gqlQuery from '../../gqlType';
import utils from '../../utils';
import s from './QuickSignUp.css';

class QuickSignUp extends React.Component {
	static propTypes = {
		complete: PropTypes.func.isRequired,
		// eslint-disable-next-line
    preference: PropTypes.object.isRequired,
	};

	static contextTypes = {
		store: PropTypes.object.isRequired,
		client: PropTypes.object.isRequired,
		fetch: PropTypes.func.isRequired,
	};

	state = {
		errMsg: {},
		checked: false,
		loading: false,
		userInput: {
			emailAddress: '',
			password: '',
		},
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

	submit = async e => {
		e.preventDefault();

		const { store, fetch, client } = this.context;
		const { preference } = this.props;
		const { userInput } = this.state;

		this.setState({
			errMsg: {},
			loading: true,
		});

		const variables = {
			emailAddress: userInput.emailAddress,
			password: userInput.password,
			confirmPassword: userInput.password,
			preference,
		};

		try {
			const created = await client
				.mutate({
					mutation: gqlQuery.createUserMutation,
					variables,
				})
				.then(res => res.data.databaseCreateUser);

			if (created.error) {
				userInput.password = '';
				this.setState({
					loading: false,
					errMsg: created.error,
					userInput,
				});
				return true;
			}
			// auto login
			const loginRes = await fetch('/auth/local', {
				body: JSON.stringify({
					email: variables.emailAddress.toLowerCase().trim(),
					password: variables.password,
				}),
			});

			const login = await loginRes.json();
			if (login.success) {
				store.dispatch(setUserState({ user: login.user }));
				this.props.complete('signup');
				return true;
			}
			throw new Error('unauthorized request');
		} catch (err) {
			store.dispatch(
				setAlertbar({
					status: 'error',
					message: utils.getGraphQLError(err, 'complete style quiz'),
					open: true,
				}),
			);
		}
		return true;
	};

	updatePreference = async () => {
		this.setState({ loading: true });
		const success = await this.context.store.dispatch(updatePreference(this.props.preference));
		if (success) this.props.complete('update');
	};

	handleThirdPartyLogin = async user => {
		this.context.store.dispatch(setUserState({ user }));
		this.context.store.dispatch(updatePreference(this.props.preference));
		this.props.complete('signup');
	};

	render() {
		const { userInput, checked, errMsg, loading } = this.state;
		const { loggedIn } = this.context.store.getState();

		if (loggedIn) {
			return (
				<div className={s.container}>
					<div className={s.formGroup}>
						<button
							disabled={loading}
							onClick={this.updatePreference}
							className={s.button}
							style={{ width: '220px', marginTop: '5%' }}
						>
							{loading ? <i className="fa fa-spinner fa-spin" /> : 'save updates'}
						</button>
					</div>
				</div>
			);
		}

		return (
			<div className={s.container}>
				<h1>You are almost done...</h1>
				<h2>Sign up now for your tailored shopping experience</h2>

				<div className={s.formContainer}>
					<ThirdPartyLoginForm success={this.handleThirdPartyLogin} />
					<LineThrough />
				</div>

				<form onSubmit={this.submit} className={s.formContainer}>
					<div className={s.formGroup}>
						<label className={s.label} htmlFor="emailAddress">
							<span>Email Address</span>
							<input
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
						<button disabled={!checked || loading} className={s.submitBtn} type="submit">
							{loading ? <i className="fa fa-spinner fa-spin" /> : 'create'}
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

export default withStyles(s)(QuickSignUp);
