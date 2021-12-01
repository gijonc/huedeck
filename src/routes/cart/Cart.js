/**
 * Huedeck, Inc.
 */

import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { Dialog } from '@material-ui/core';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { setAlertbar } from 'actions/alertbar';
import { setUserCart } from 'actions/cart';
import Link from 'components/Link';
import gqlQuery from 'routes/gqlType';
import utils from 'routes/utils';
import { Loader } from '../../components/Utilities';
import CartItem from './CartItem';
import s from './Cart.css';

class Cart extends React.Component {
	static contextTypes = {
		store: PropTypes.object.isRequired,
		client: PropTypes.object.isRequired,
		reactFbPixel: PropTypes.object,
	};

	static propTypes = {
    cart: PropTypes.object, // eslint-disable-line
    loggedIn: PropTypes.object, // eslint-disable-line
	};

	static defaultProps = {
		loggedIn: null,
		cart: null,
	};

	state = {
		checkingOut: false,
		updatingDialog: false,
		cartItems: null,
		requireUpdateItemList: [],
	};

	componentDidMount() {
		this.initCart();
	}

	componentDidUpdate(prevProps) {
		if (this.props.loggedIn !== prevProps.loggedIn) {
			this.initCart();
		}
	}

	getSubTotalPrice = () => {
		const { cartItems } = this.state;
		let total = 0.0;
		for (let i = 0, len = cartItems.length; i < len; i += 1) {
			const { quantity, inStock, variant } = cartItems[i];
			if (inStock) total += quantity * variant.price;
		}
		return utils.convertPrice(total, true);
	};

	// checkout from backend
	checkOutOnClick = async () => {
		if (this.disableCheckout) return;

		this.setState({ checkingOut: true });
		const { client, store, reactFbPixel } = this.context;
		try {
			// fire checkout event to FB pixel trackinig
			reactFbPixel.track('InitiateCheckout');

			// get shopify checkout URL
			const res = await client.query({
				query: gqlQuery.getCheckout,
				variables: {
					checkoutId: store.getState().cart.cartId,
				},
			});
			const { url } = res.data.getCheckout;
			window.location.href = url;
		} catch (err) {
			store.dispatch(
				setAlertbar({
					status: 'error',
					message: utils.getGraphQLError(err, 'checkOutOnClick'),
					open: true,
				}),
			);
		}
	};

	// fetch new cart data
	initCart = async () => {
		this.disableCheckout = false;
		const { client, store } = this.context;

		try {
			const res = await client.query({
				query: gqlQuery.getUserCartItems,
				fetchPolicy: 'network-only',
			});
			const { getUserCartItems } = res.data;

			let validItemCount = 0;
			if (!getUserCartItems.length) {
				this.setState({
					cartItems: [],
				});
			} else {
				const requireUpdateItemList = [];

				for (let i = 0, len = getUserCartItems.length; i < len; i += 1) {
					const { quantity, inStock, variant } = getUserCartItems[i];
					if (inStock) {
						// update and notify to user for any changes to the cart (quantity & price)
						if (variant.inventoryQty < quantity) {
							requireUpdateItemList.push(getUserCartItems[i]);
						}
						validItemCount += Number(quantity);
					}
				}

				if (!this.disableCheckout && !validItemCount) {
					this.disableCheckout = true;
				}

				this.setState({
					cartItems: getUserCartItems,
					requireUpdateItemList,
				});
			}
			// syncronize cart item numbers
			store.dispatch(
				setUserCart({
					cartItemCount: validItemCount,
				}),
			);
		} catch (err) {
			store.dispatch(
				setAlertbar({
					status: 'error',
					message: utils.getGraphQLError(err, 'initCart'),
					open: true,
				}),
			);
		}
	};

	bulkUpdateItems = async () => {
		const { requireUpdateItemList } = this.state;
		if (!requireUpdateItemList.length) {
			return true;
		}

		const items = requireUpdateItemList.map(item => ({
			id: item.shopifyLineId,
			quantity: item.variant.inventoryQty,
		}));

		const { client, store } = this.context;
		try {
			this.setState({
				updatingDialog: true,
			});

			const res = await client.mutate({
				mutation: gqlQuery.updateCartItem,
				variables: {
					cartId: store.getState().cart.cartId,
					items,
				},
			});
			const { updateCartItem } = res.data;
			if (updateCartItem.success) {
				this.initCart();
				this.setState({
					updatingDialog: false,
				});
			}
		} catch (err) {
			store.dispatch(
				setAlertbar({
					status: 'error',
					message: utils.getGraphQLError(err, 'bulkUpdateItems'),
					open: true,
				}),
			);
		}
		return true;
	};

	render() {
		const { cartItems, checkingOut, requireUpdateItemList, updatingDialog } = this.state;

		const { cart } = this.props;

		if (!cartItems || !cart || !Object.prototype.hasOwnProperty.call(cart, 'cartId')) {
			return (
				<div className={s.root}>
					<div className={s.container}>
						<Loader />
					</div>
				</div>
			);
		}

		if (!cartItems.length) {
			return (
				<div className={s.root}>
					<div className={s.container}>
						<h1>your cart</h1>
						<p>
							{' '}
							Your cart is empty, <Link to="/shop">back to shop</Link>.
						</p>
					</div>
				</div>
			);
		}

		return (
			<div className={s.root}>
				<div className={s.container}>
					<h1>your cart</h1>
					{requireUpdateItemList.length > 0 ? (
						<Dialog
							open={requireUpdateItemList.length > 0}
							disableBackdropClick
							disableEscapeKeyDown
							maxWidth="sm"
						>
							<div className={s.dialogContainer}>
								<h1>Important update to your cart</h1>
								<p>
									One or more item(s) in your cart has/have no enough stock in inventory,
									please confirm the change(s):
								</p>
								<div>
									{requireUpdateItemList.map(item => (
										<div key={item.id} className={s.dialogItem}>
											<div className={s.imgWrapper}>
												<img
													src={item.variant.variantImage.miniPic}
													alt={item.variant.variantImage.alt}
												/>
											</div>
											<div className={s.dialogItemInfo}>
												<span>{item.variant.product.productName}</span>
												<span>
													Available Quantity:
													<strong>{item.variant.inventoryQty}</strong>
												</span>
											</div>
										</div>
									))}
								</div>

								<div style={{ textAlign: 'right', margin: '3% 0' }}>
									<button className={s.dialogUpdateBtn} onClick={this.bulkUpdateItems}>
										{updatingDialog ? (
											<i className="fa fa-spinner fa-spin" />
										) : (
											'confirm update'
										)}
									</button>
								</div>
							</div>
						</Dialog>
					) : (
						<div className={s.cartList}>
							{cartItems.map(item => (
								<CartItem key={item.id} {...item} updateCart={this.initCart} />
							))}

							<div className={s.checkout}>
								{cart.cartItemCount > 0 && (
									<div className={s.subTotal}>
										<span>{`Subtotal (${cart.cartItemCount} item${
											cart.cartItemCount > 1 ? 's' : ''
										}):`}</span>
										<span className={s.subTotalPrice}>${this.getSubTotalPrice()}</span>
										<p>Shipping & taxes calculated at checkout</p>
									</div>
								)}
								<button
									onClick={this.checkOutOnClick}
									className={s.checkoutBtn}
									disabled={this.disableCheckout}
								>
									{checkingOut ? (
										<i className="fa fa-spinner fa-spin" />
									) : (
										'Proceed to Checkout'
									)}
								</button>
							</div>
						</div>
					)}
				</div>
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
)(Cart);
