/**
 * Huedeck
 */

import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
// import cx from 'classnames';
import { CheckCircle, Error } from '@material-ui/icons';
import { setAlertbar } from 'actions/alertbar';
import gqlQuery from '../userGqlType';
import utils from '../../../utils';
import s from '../editSectionStyle.css';

class GeneralSettings extends React.Component {
	static propTypes = {};

	static contextTypes = {
		store: PropTypes.object.isRequired,
		client: PropTypes.object.isRequired,
	};

	state = {
		inputFields: null,
		initialData: null,
		inputError: {},
		updated: false, // change if any field updated
		updating: false,
	};

	componentDidMount() {
		this.getUserProfile();
	}

	getUserProfile = async () => {
		const { store, client } = this.context;
		try {
			const res = await client.query({
				query: gqlQuery.getLoggedInUserQuery,
				fetchPolicy: 'network-only',
			});
			const { databaseGetLoggedInUser } = res.data;
			if (databaseGetLoggedInUser) {
				const inputFields = {
					username: databaseGetLoggedInUser.profile.displayName,
					emailAddress: databaseGetLoggedInUser.emailAddress,
					emailVerified: databaseGetLoggedInUser.emailConfirmed,
				};
				this.setState({
					inputFields,
					initialData: Object.assign({}, inputFields),
				});
			}
		} catch (err) {
			store.dispatch(
				setAlertbar({
					status: 'error',
					message: utils.getGraphQLError(err, 'getUserProfile'),
					open: true,
				}),
			);
		}
	};

	updateUserProfile = async variables => {
		const { store, client } = this.context;
		try {
			const res = await client.mutate({
				mutation: gqlQuery.updateUserProfile,
				variables,
			});
			const { error } = res.data.updateUserProfile;

			if (error) {
				const { inputError } = this.state;
				inputError.username = `Username ${error.message}`;
				this.setState({
					inputError,
				});
			} else {
				store.dispatch(
					setAlertbar({
						status: 'success',
						message: 'Change updated!',
						open: true,
					}),
				);
				this.getUserProfile();
			}

			this.setState({
				updating: false,
				updated: false,
			});
		} catch (err) {
			store.dispatch(
				setAlertbar({
					status: 'error',
					message: utils.getGraphQLError(err, 'updateUserProfile'),
					open: true,
				}),
			);
		}
	};

	verifyUserEmail = async () => {
		const { store, client } = this.context;
		try {
			const res = await client.mutate({
				mutation: gqlQuery.verifyUserEmail,
			});
			const { error } = res.data.verifyUserEmail;

			if (error) {
				const { inputError } = this.state;
				inputError.emailVerify = error.message;
				this.setState({
					inputError,
				});
			} else {
				const { inputFields } = this.state;
				this.setState({
					emailVerifyRequested: true,
				});
				store.dispatch(
					setAlertbar({
						status: 'success',
						message: `An email has been sent to ${inputFields.emailAddress}`,
						open: true,
					}),
				);
			}
		} catch (err) {
			store.dispatch(
				setAlertbar({
					status: 'error',
					message: utils.getGraphQLError(err, 'verifyUserEmail'),
					open: true,
				}),
			);
		}
	};

	handleInputChange = e => {
		this.setState({ inputError: {} });
		const { name, value } = e.target;
		const { inputFields, initialData } = this.state;

		if (inputFields[name] !== value) {
			inputFields[name] = value;
			this.setState({
				inputFields,
				updated: initialData[name] !== inputFields[name],
			});
		}
	};

	saveChanges = () => {
		const { inputFields, updated } = this.state;
		if (updated) {
			this.setState({ updating: true });
			const inputVariables = {
				content: {
					displayName: inputFields.username,
				},
			};
			this.updateUserProfile(inputVariables);
		}
	};

	render() {
		const { inputFields, updating, updated, inputError } = this.state;

		if (!inputFields) {
			return <div className={s.container} />;
		}

		return (
			<div className={s.container}>
				<div className={s.editBox}>
					<strong>Email Address</strong>
					<div id="email" className={s.inputWrapper}>
						<div className={s.staticText}>{inputFields.emailAddress}</div>
						<div className={s.staticText} style={{ marginLeft: '10px' }}>
							{inputFields.emailVerified ? (
								<div className={s.emailVerify}>
									<CheckCircle fontSize="inherit" style={{ color: 'lightgreen' }} />
									Verified
								</div>
							) : (
								<div className={s.emailVerify}>
									<Error fontSize="inherit" style={{ color: 'red' }} />
									<button onClick={this.verifyUserEmail}>
										{!this.state.emailVerifyRequested ? 'Verify now' : 'Resent email'}
									</button>
								</div>
							)}
						</div>
					</div>
				</div>

				<div className={s.editBox}>
					<strong>Username</strong>
					<div className={s.inputWrapper}>
						<input
							id="username"
							name="username"
							className={s.input}
							type="text"
							placeholder="Enter your username here"
							value={inputFields.username}
							onChange={this.handleInputChange}
						/>
						{Boolean(inputError.username) && (
							<div className={s.errMsg}>{inputError.username}</div>
						)}
					</div>
				</div>

				<div className={s.editAction}>
					<button
						disabled={updating || !updated}
						onClick={this.saveChanges}
						className={s.button}
					>
						save changes
					</button>
				</div>
			</div>
		);
	}
}

export default withStyles(s)(GeneralSettings);
