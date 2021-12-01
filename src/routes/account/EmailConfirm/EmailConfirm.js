/**
 * Huedeck, Inc
 */

import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { setAlertbar } from 'actions/alertbar';
import gql from 'graphql-tag';
import { FormHelperText } from '@material-ui/core';
import s from './EmailConfirm.css';
import utils from '../../utils';

const VERIFY_EMAIL_CONF_REQUEST = gql`
	mutation verifyEmailConfirmReq($id: String!, $secret: String!) {
		verifyEmailConfirmReq(id: $id, secret: $secret) {
			errMsg
			email
		}
	}
`;

class EmailConfirm extends React.Component {
	static contextTypes = {
		store: PropTypes.object.isRequired,
		client: PropTypes.object.isRequired,
	};

	state = {
		errMsg: null,
		confirmedEmail: null,
	};

	componentDidMount() {
		this.validateToken();
		this.PAGE_LOADED = true;
	}

	validateToken = async () => {
		const { store, client } = this.context;
		try {
			const res = await client.mutate({
				mutation: VERIFY_EMAIL_CONF_REQUEST,
				variables: this.props,
			});
			const { verifyEmailConfirmReq } = res.data;
			if (verifyEmailConfirmReq.errMsg) {
				this.setState({
					errMsg: verifyEmailConfirmReq.errMsg,
				});
			} else {
				this.setState({
					confirmedEmail: verifyEmailConfirmReq.email,
				});
			}
		} catch (err) {
			store.dispatch(
				setAlertbar({
					status: 'error',
					message: utils.getGraphQLError(err, 'validateToken'),
					open: true,
				}),
			);
		}
	};

	render() {
		const { errMsg, confirmedEmail } = this.state;

		return (
			<div className={s.root}>
				<div className={s.container}>
					<div className={s.submitForm}>
						<h3>Confirm Email</h3>

						{this.PAGE_LOADED ? (
							<div>
								{confirmedEmail ? (
									<div className={s.successMsg}>
										<i className="fa fa-check-circle" />
										<p>Thank you, your email ({confirmedEmail}) has been confirmed.</p>
									</div>
								) : (
									<div>
										{errMsg ? (
											<FormHelperText error style={{ fontSize: '1.2rem' }}>
												<i className="fa fa-exclamation-circle" />
												{` ${errMsg}`}
											</FormHelperText>
										) : (
											<div className={s.loading}>
												<i className="fa fa-spinner fa-spin" />
												<span>verifying ...</span>
											</div>
										)}
									</div>
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

export default withStyles(s)(EmailConfirm);
