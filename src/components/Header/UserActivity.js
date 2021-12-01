/**
 *	Huedeck, Inc.
 */

import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import gqlQuery from 'routes/gqlType';
import constants from 'routes/constants';
import { compose } from 'recompose';
import { Badge, Popper, Collapse } from '@material-ui/core';
import { ShoppingCart, ArrowDropDown } from '@material-ui/icons';
import { setAlertbar } from '../../actions/alertbar';
import { setUserDialog } from '../../actions/userDialog';
import { setUserCart } from '../../actions/cart';
import Link from '../Link';
import UserDialog from './UserDialog';
import s from './Header.css';

class UserActivity extends React.Component {
	static contextTypes = {
		store: PropTypes.object.isRequired,
		client: PropTypes.object.isRequired,
	};

	static propTypes = {
		dispatch: PropTypes.func.isRequired,
    cart: PropTypes.object, // eslint-disable-line
	 loggedIn: PropTypes.object, // eslint-disable-line
		isMobileScreen: PropTypes.bool.isRequired,
	};

	static defaultProps = {
		loggedIn: null,
		cart: null,
	};

	state = {
		openProfile: false,
	};

	componentDidMount() {
		// load cart info when user first loaded the page
		if (this.props.loggedIn) {
			this.getUserCartInfo();
		} else {
			this.getGuestCartInfo();
		}
	}

	componentDidUpdate(prevProps) {
		// load cart info when user just logged in
		if (this.props.loggedIn !== prevProps.loggedIn) {
			if (this.props.loggedIn) {
				this.getUserCartInfo();
			} else {
				this.getGuestCartInfo();
			}
		}
	}

	getGuestCartInfo = async () => {
		const { client, store } = this.context;
		try {
			const res = await client.query({
				query: gqlQuery.getGuestCartInfo,
				fetchPolicy: 'network-only',
			});
			const { getGuestCartInfo } = res.data;
			if (getGuestCartInfo) {
				store.dispatch(
					setUserCart({
						cartId: getGuestCartInfo.cartId,
						cartItemCount: getGuestCartInfo.count,
					}),
				);
			}
		} catch (err) {
			store.dispatch(
				setAlertbar({
					status: 'error',
					message: __DEV__ ? `[getGuestCartInfo] -> ${err.message}` : constants.errMsg,
					open: true,
				}),
			);
		}
	};

	getUserCartInfo = async () => {
		const { client, store } = this.context;
		try {
			const res = await client.query({
				query: gqlQuery.getUserCartInfo,
				fetchPolicy: 'network-only',
			});
			const { getUserCartInfo } = res.data;
			if (getUserCartInfo) {
				store.dispatch(
					setUserCart({
						cartId: getUserCartInfo.cartId,
						cartItemCount: getUserCartInfo.count,
					}),
				);
			}
		} catch (err) {
			store.dispatch(
				setAlertbar({
					status: 'error',
					message: __DEV__ ? `[getUserCartInfo] -> ${err.message}` : constants.errMsg,
					open: true,
				}),
			);
		}
	};

	triggerUserDialog = target => {
		this.props.dispatch(
			setUserDialog({
				target,
				toggle: true,
			}),
		);
	};

	handleOnMouseEnter = () => {
		this.setState({ openProfile: true });
	};

	handleOnClick = () => {
		this.setState({ openProfile: !this.state.openProfile });
	};

	handleOnMouseLeave = () => {
		this.setState({ openProfile: false });
	};

	render() {
		const { loggedIn, cart, isMobileScreen } = this.props;

		return (
			<div role="navigation">
				{loggedIn ? (
					<div
						className={s.dropdown}
						onMouseLeave={this.handleOnMouseLeave}
						ref={node => {
							this.anchorEl = node;
						}}
					>
						<button
							className={s.link}
							onMouseEnter={this.handleOnMouseEnter}
							onClick={this.handleOnClick}
						>
							<span>{loggedIn.profile.displayName}</span>
							<ArrowDropDown fontSize="small" />
						</button>

						<Popper
							open={this.state.openProfile}
							anchorEl={this.anchorEl}
							transition
							disablePortal
							placement="bottom-end"
						>
							{({ TransitionProps }) => (
								<Collapse
									unmountOnExit
									{...TransitionProps}
									style={{ transformOrigin: 'right top' }}
								>
									<div className={s.dropdownContent}>
										<Link className={s.dropdownItem} to="/savedlist">
											<i className="fa fa-heart" />
											<span>saved</span>
										</Link>
										<Link className={s.dropdownItem} to="/orders">
											<i className="fa fa-shopping-bag" />
											<span>Orders</span>
										</Link>
										<Link className={s.dropdownItem} to="/user">
											<i className="fa fa-user-circle" />
											<span>Account</span>
										</Link>
										<form style={{ width: '100%' }} action="/auth/logout" method="POST">
											<button type="submit" className={s.dropdownItem}>
												<i className="fa fa-sign-out" />
												<span>Log Out</span>
											</button>
										</form>
									</div>
								</Collapse>
							)}
						</Popper>
					</div>
				) : (
					<div className={s.userDialogAction}>
						<UserDialog />
						<button className={s.link} onClick={() => this.triggerUserDialog('signup')}>
							sign up
						</button>
						<button className={s.link} onClick={() => this.triggerUserDialog('login')}>
							log in
						</button>
					</div>
				)}

				<a href="/cart" className={s.cartIcon}>
					{!isMobileScreen && <div className={s.link}>Cart</div>}
					<Badge
						badgeContent={cart.cartItemCount || 0}
						invisible={!cart || !cart.cartItemCount}
					>
						<ShoppingCart fontSize="inherit" />
					</Badge>
				</a>
			</div>
		);
	}
}

export default compose(
	connect(state => ({
		loggedIn: state.loggedIn,
		cart: state.cart,
	})),
	withStyles(s),
)(UserActivity);
