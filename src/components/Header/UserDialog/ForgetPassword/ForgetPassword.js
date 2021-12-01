/**
 * Huedeck, Inc
 */

import React from 'react';
import PropTypes from 'prop-types';
import constants from 'routes/constants';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { setAlertbar } from 'actions/alertbar';
import gql from 'graphql-tag';
import { FormHelperText, Zoom } from '@material-ui/core';
import s from './ForgetPassword.css';

const FORGOT_PSW_REQUEST_QUERY = gql`
	mutation sendForgetPasswordReq($emailAddress: String!) {
		sendForgetPasswordReq(emailAddress: $emailAddress) {
			errMsg
		}
	}
`;

class ForgetPassword extends React.Component {
	static contextTypes = {
		store: PropTypes.object.isRequired,
		client: PropTypes.object.isRequired,
	};

	state = {
		loading: false,
		errMsg: null,
		emailSentSuccess: false,
	};

	handleSubmit = async e => {
		e.preventDefault();
		const { value } = e.target.email;
		if (!value) {
			this.setState({
				errMsg: 'Please enter your email address',
			});
		} else {
			this.setState({ loading: true });
			const { store, client } = this.context;
			try {
				const res = await client.mutate({
					mutation: FORGOT_PSW_REQUEST_QUERY,
					variables: { emailAddress: value },
				});
				const { sendForgetPasswordReq } = res.data;
				this.setState({
					emailSentSuccess: !sendForgetPasswordReq.errMsg,
					errMsg: sendForgetPasswordReq.errMsg,
					loading: false,
				});
			} catch (err) {
				store.dispatch(
					setAlertbar({
						status: 'error',
						message: __DEV__ ? `[ForgetPassword dialog] -> ${err}` : constants.errMsg,
						open: true,
					}),
				);
			}
		}
	};

	render() {
		const { errMsg, loading, emailSentSuccess } = this.state;

		return (
			<div className={s.formContainer}>
				{errMsg && (
					<FormHelperText error style={{ fontSize: '1.2rem' }}>
						<i className="fa fa-exclamation-circle" />
						{` ${errMsg}`}
					</FormHelperText>
				)}

				{emailSentSuccess ? (
					<Zoom in timeout={500}>
						<div className={s.description}>
							<i className="fa fa-check-circle" />
							<p>An email for reset your password has been sent to your inbox!</p>
						</div>
					</Zoom>
				) : (
					<div>
						<div className={s.description}>
							Enter your Huedeck email address below and we will send you a link to reset
							your password.
						</div>
						<form onSubmit={this.handleSubmit}>
							<div className={s.formGroup}>
								<label className={s.label} htmlFor="emailAddress">
									<span>Email</span>
									<input
										className={s.input}
										type="email"
										name="email"
										autoFocus // eslint-disable-line jsx-a11y/no-autofocus
									/>
								</label>
							</div>

							<div className={s.formGroup}>
								<button className={s.submitBtn} type="submit" disabled={loading}>
									{loading ? <i className="fa fa-spinner fa-spin" /> : 'send'}
								</button>
							</div>
						</form>
					</div>
				)}
			</div>
		);
	}
}

export default withStyles(s)(ForgetPassword);
