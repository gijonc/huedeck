/**
 * Huedeck, Inc
 */

import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { withMobileDialog, Dialog } from '@material-ui/core';
import { setUserDialog } from 'actions/userDialog';
import LogIn from './LogIn';
import SignUp from './SignUp';
import ForgetPassword from './ForgetPassword/ForgetPassword';
import { CloseButton } from '../../Utilities';
import s from './UserDialog.css';

const userDialogType = {
	toggle: PropTypes.bool,
	target: PropTypes.string,
};

class UserDialog extends React.Component {
	static propTypes = {
		dispatch: PropTypes.func.isRequired,
		userDialog: PropTypes.shape(userDialogType).isRequired,
		fullScreen: PropTypes.bool.isRequired,
	};

	handleClose = () => {
		this.props.dispatch(
			setUserDialog({
				toggle: false,
			}),
		);
	};

	handleChange = target => {
		this.props.dispatch(
			setUserDialog({
				toggle: true,
				target,
			}),
		);
	};

	render() {
		const { userDialog, fullScreen } = this.props;

		if (!userDialog.target) return null;

		return (
			<Dialog
				open={userDialog.toggle}
				onClose={this.handleClose}
				fullScreen={fullScreen}
				fullWidth
				maxWidth="sm"
			>
				<CloseButton onClick={this.handleClose} />
				{userDialog.target === 'login' && (
					<div className={s.container}>
						<h1>Log In</h1>
						<LogIn />
						<button onClick={() => this.handleChange('reset')}>Forgot password?</button>
						<button onClick={() => this.handleChange('signup')}>
							<span>
								{"Don't have an account? "}
								<span style={{ textDecoration: 'underline' }}>Sign Up</span>
							</span>
						</button>
					</div>
				)}

				{userDialog.target === 'signup' && (
					<div className={s.container}>
						<h1>sign up</h1>
						<SignUp />
						<button onClick={() => this.handleChange('login')}>
							<span>
								{'Already have an account? '}
								<span style={{ textDecoration: 'underline' }}>Log In.</span>
							</span>
						</button>
					</div>
				)}

				{userDialog.target === 'reset' && (
					<div className={s.container}>
						<h1>Forget password</h1>
						<ForgetPassword />
						<button onClick={() => this.handleChange('login')}>
							<i style={{ marginRight: '5px' }} className="fa fa-chevron-left" />
							Go Back
						</button>
					</div>
				)}
			</Dialog>
		);
	}
}

export default compose(
	withStyles(s),
	withMobileDialog(),
	connect(state => ({
		userDialog: state.userDialog,
	})),
)(UserDialog);
