/**
 * Huedeck
 */

import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
// import cx from 'classnames';
import { Error } from '@material-ui/icons';
import { setAlertbar } from 'actions/alertbar';
import gqlQuery from '../userGqlType';
import utils from '../../../utils';
import s from '../editSectionStyle.css';

class SecurityPassword extends React.Component {
	static propTypes = {};

	static contextTypes = {
		store: PropTypes.object.isRequired,
		client: PropTypes.object.isRequired,
	};

	state = {
		inputFields: {},
		inputError: {},
		updating: false,
		thirdPartyLogin: this.context.store.getState().loggedIn.thirdPartyLogin,
	};

	updatePassword = async variables => {
		const { store, client } = this.context;
		try {
			const res = await client.mutate({
				mutation: gqlQuery.updateUserPassword,
				variables,
			});
			const { error } = res.data.updateUserPassword;

			if (error) {
				const { inputError, inputFields } = this.state;
				inputError[error.key] = error.message;
				inputFields[error.key] = '';
				this.setState({
					inputError,
					inputFields,
				});
			} else {
				store.dispatch(
					setAlertbar({
						status: error ? 'warning' : 'success',
						message: error ? error.message : 'Your password has been updated!',
						open: true,
					}),
				);
				this.setState({
					inputFields: {},
				});
			}

			this.setState({
				updating: false,
			});
		} catch (err) {
			store.dispatch(
				setAlertbar({
					status: 'error',
					message: utils.getGraphQLError(err, 'updatePassword'),
					open: true,
				}),
			);
		}
	};

	handleInputChange = e => {
		this.setState({ inputError: {} });
		const { name, value } = e.target;
		const { inputFields } = this.state;

		if (inputFields[name] !== value) {
			inputFields[name] = value;
			this.setState({
				inputFields,
			});
		}
	};

	saveChanges = e => {
		e.preventDefault();
		const { inputFields } = this.state;
		this.setState({
			updating: true,
			inputError: {},
		});
		const inputVariables = {
			oldPassword: inputFields['old password'] || '',
			newPassword: inputFields['new password'] || '',
			newPasswordConfirm: inputFields['confirm password'] || '',
		};
		this.updatePassword(inputVariables);
	};

	render() {
		const { inputFields, updating, inputError, thirdPartyLogin } = this.state;
		if (typeof thirdPartyLogin === 'string') {
			return (
				<div className={s.container}>
					<p style={{ color: 'grey', textAlign: 'left' }}>
						<Error fontSize="small" />
						{"You've logged in through "}
						<span style={{ textTransform: 'capitalize', fontStyle: 'italic' }}>
							{thirdPartyLogin}
						</span>
						{', changing password is currently not supported.'}
					</p>
				</div>
			);
		}

		return (
			<div className={s.container}>
				<form onSubmit={this.saveChanges}>
					<div className={s.editBox}>
						<strong>Old password</strong>
						<div className={s.inputWrapper}>
							<input
								id="old password"
								name="old password"
								className={s.input}
								type="password"
								value={inputFields['old password'] || ''}
								autoComplete="current-password"
								onChange={this.handleInputChange}
							/>
							{Boolean(inputError['old password']) && (
								<div className={s.errMsg}>{inputError['old password']}</div>
							)}
						</div>
					</div>

					<div className={s.editBox}>
						<strong>New password</strong>
						<div className={s.inputWrapper}>
							<input
								id="new password"
								name="new password"
								className={s.input}
								type="password"
								value={inputFields['new password'] || ''}
								autoComplete="new-password"
								onChange={this.handleInputChange}
							/>
							{Boolean(inputError['new password']) && (
								<div className={s.errMsg}>{inputError['new password']}</div>
							)}
						</div>
					</div>

					<div className={s.editBox}>
						<strong>Confirm password</strong>
						<div className={s.inputWrapper}>
							<input
								id="confirm password"
								name="confirm password"
								className={s.input}
								type="password"
								value={inputFields['confirm password'] || ''}
								autoComplete="new-password"
								onChange={this.handleInputChange}
							/>
							{Boolean(inputError['confirm password']) && (
								<div className={s.errMsg}>{inputError['confirm password']}</div>
							)}
						</div>
					</div>

					<div className={s.editAction}>
						{Boolean(inputError['email verify']) && (
							<div className={s.errMsg}>
								Your email has not been verified, {inputError['email verify']}
							</div>
						)}
						<button type="submit" disabled={updating} className={s.button}>
							save changes
						</button>
					</div>
				</form>
			</div>
		);
	}
}

export default withStyles(s)(SecurityPassword);
