/**
 * Huedeck, Inc
 */

import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { setAlertbar } from 'actions/alertbar';
import gql from 'graphql-tag';
import { TextField, FormHelperText } from '@material-ui/core';
import s from './PasswordReset.css';
import utils from '../../utils';

const RESET_PASSOWRD_QUERY = gql`
	mutation resetPassword(
		$id: String!
		$secret: String!
		$password: String!
		$confirmPassword: String!
	) {
		resetPassword(
			id: $id
			secret: $secret
			password: $password
			confirmPassword: $confirmPassword
		) {
			errMsg
		}
	}
`;

const VERIFY_PSW_RESET_REQUEST = gql`
	mutation verifyPasswordResetReq($id: String!, $secret: String!) {
		verifyPasswordResetReq(id: $id, secret: $secret) {
			errMsg
		}
	}
`;

class PasswordReset extends React.Component {
	static contextTypes = {
		store: PropTypes.object.isRequired,
		client: PropTypes.object.isRequired,
	};

	state = {
		errMsg: null,
		loading: false,
		disabled: true,
		resetSuccess: false,

		userInput: {
			password: '',
			confirmPassword: '',
		},
	};

	componentDidMount() {
		this.validateToken();
		this.PAGE_LOADED = true;
	}

	validateToken = async () => {
		const { store, client } = this.context;
		try {
			const res = await client.mutate({
				mutation: VERIFY_PSW_RESET_REQUEST,
				variables: this.props,
			});
			const { verifyPasswordResetReq } = res.data;
			if (verifyPasswordResetReq.errMsg) {
				this.setState({
					errMsg: verifyPasswordResetReq.errMsg,
				});
			} else {
				const { userInput } = this.state;
				Object.assign(userInput, this.props);
				this.setState({
					userInput,
					disabled: false,
				});
			}
		} catch (err) {
			store.dispatch(
				setAlertbar({
					status: 'error',
					message: utils.getGraphQLError(err),
					open: true,
				}),
			);
		}
	};

	handleSubmit = async e => {
		e.preventDefault();
		const { userInput } = this.state;

		if (!userInput.password || !userInput.confirmPassword) {
			this.setState({
				errMsg: 'Please enter and confirm your password',
			});
		} else {
			this.setState({ loading: true });
			const { store, client } = this.context;
			try {
				const res = await client.mutate({
					mutation: RESET_PASSOWRD_QUERY,
					variables: userInput,
				});
				const { resetPassword } = res.data;
				this.setState({
					errMsg: resetPassword.errMsg,
					resetSuccess: !resetPassword.errMsg,
					loading: false,
				});
			} catch (err) {
				store.dispatch(
					setAlertbar({
						status: 'error',
						message: utils.getGraphQLError(err, 'handleSubmit'),
						open: true,
					}),
				);
			}
		}
	};

	handleInputChange = e => {
		const { userInput } = this.state;
		const { value, name } = e.target;
		userInput[name] = value;
		this.setState({
			errMsg: null,
			userInput,
		});
	};

	render() {
		const { errMsg, loading, userInput, disabled, resetSuccess } = this.state;

		return (
			<div className={s.root}>
				<div className={s.container}>
					<div className={s.submitForm}>
						<h3>Reset Password</h3>

						{this.PAGE_LOADED ? (
							<div>
								{resetSuccess ? (
									<div className={s.successMsg}>
										<i className="fa fa-check-circle" />
										<p>Your password has been reset.</p>
									</div>
								) : (
									<form onSubmit={this.handleSubmit}>
										<TextField
											required
											fullWidth
											margin="normal"
											variant="outlined"
											label="New Password"
											type="password"
											name="password"
											value={userInput.password}
											autoComplete="new-password"
											onChange={this.handleInputChange}
											disabled={disabled}
											helperText="Note: Password must be at least 8 characters"
										/>

										<TextField
											required
											fullWidth
											margin="normal"
											variant="outlined"
											label="Confirm Password"
											type="password"
											name="confirmPassword"
											value={userInput.confirmPassword}
											autoComplete="new-password"
											onChange={this.handleInputChange}
											disabled={disabled}
										/>

										{errMsg && (
											<FormHelperText error style={{ fontSize: '1.2rem' }}>
												<i className="fa fa-exclamation-circle" />
												{` ${errMsg}`}
											</FormHelperText>
										)}

										<button
											disabled={loading || disabled}
											className={s.confirmBtn}
											type="submit"
										>
											{loading ? <i className="fa fa-spinner fa-spin" /> : 'save change'}
										</button>
									</form>
								)}
							</div>
						) : (
							<p>loading...</p>
						)}
					</div>
				</div>
			</div>
		);
	}
}

export default withStyles(s)(PasswordReset);
