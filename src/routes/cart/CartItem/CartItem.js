/**
 * Huedeck, Inc.
 */

import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import Link from 'components/Link';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { setAlertbar } from 'actions/alertbar';
import gqlQuery from 'routes/gqlType';
import utils from '../../utils';
import constants from '../../constants';
import s from './CartItem.css';

class CartItem extends React.Component {
	static contextTypes = {
		store: PropTypes.object.isRequired,
		client: PropTypes.object.isRequired,
	};

	static propTypes = {
    cart: PropTypes.object, // eslint-disable-line
	 loggedIn: PropTypes.object, // eslint-disable-line
		variant: PropTypes.object, // eslint-disable-line
		updateCart: PropTypes.func.isRequired,
		quantity: PropTypes.number.isRequired,
		shopifyLineId: PropTypes.string.isRequired,
		inStock: PropTypes.bool.isRequired,
	};

	static defaultProps = {
		loggedIn: null,
		cart: null,
	};

	state = {
		displayQty: this.props.quantity,
		updateErrorMsg: null,
		updating: false,
		activeInputField: this.props.quantity >= 10,
		showUpdateBtn: false,
	};

	getVariantOptions = item => {
		const optionArr = item.product.options.map(op =>
			op.optionName.toLowerCase() === 'title'
				? ''
				: `${op.optionName}: ${item[`variantOption${op.optionPosition}`]}`,
		);
		return optionArr;
	};

	handleQuantityInputChange = qty => {
		// allow only interger
		// allow to enter empty string but NOT allow to update
		if (!utils.isValidNumericInput(qty)) return;

		const inventoryQty = Number(this.props.variant.inventoryQty);
		if (Number(qty) > inventoryQty) {
			this.setState({
				updateErrorMsg: `Only ${inventoryQty} left in stock`,
			});
			return;
		}

		this.setState({
			displayQty: qty,
			showUpdateBtn: qty !== '' && Number(qty) !== Number(this.props.quantity),
			activeInputField: true,
		});
	};

	handleInputFieldOnBlur = () => {
		const { displayQty } = this.state;

		if (!displayQty || displayQty === '') {
			this.setState({
				displayQty: this.props.quantity,
				activeInputField: this.props.quantity >= 10,
			});
		}
	};

	handleQtySelect = e => {
		const { value } = e.target;
		const inventoryQty = Number(this.props.variant.inventoryQty);
		const preUpdateQty = value === '10+' ? 10 : Number(value);

		// check valid inventory
		if (preUpdateQty > inventoryQty) {
			this.setState({
				updateErrorMsg: `Only ${inventoryQty} left in stock`,
			});
		} else if (preUpdateQty === 10) {
			this.handleQuantityInputChange(preUpdateQty);
		} else {
			this.updateCartItem(preUpdateQty);
		}
	};

	updateCartItem = async qty => {
		// unable to update if not enough inventory quantity
		if (!this.props.inStock) {
			return true;
		}
		// default to delete item if user sert quantity to 0
		if (qty === 0) {
			await this.deleteCartItem();
			return true;
		}

		const { client, store } = this.context;
		try {
			this.setState({
				updating: true,
				showUpdateBtn: false,
			});

			const res = await client.mutate({
				mutation: gqlQuery.updateCartItem,
				variables: {
					cartId: store.getState().cart.cartId,
					items: [
						{
							id: this.props.shopifyLineId,
							quantity: qty,
						},
					],
				},
			});
			const { updateCartItem } = res.data;
			if (updateCartItem.success) {
				this.setState({
					displayQty: qty,
					updating: false,
					activeInputField: qty >= 10,
					updateErrorMsg: null,
				});
				this.props.updateCart();
			}
			return true;
		} catch (err) {
			store.dispatch(
				setAlertbar({
					status: 'error',
					message: utils.getGraphQLError(err, 'updateCartItem'),
					open: true,
				}),
			);
			return true;
		}
	};

	deleteCartItem = async () => {
		const { client, store } = this.context;

		try {
			this.setState({ updating: true });
			const res = await client.mutate({
				mutation: gqlQuery.deleteCartItem,
				variables: {
					cartId: store.getState().cart.cartId,
					ids: [this.props.shopifyLineId],
				},
			});
			const { deleteCartItem } = res.data;
			if (deleteCartItem.success) {
				this.setState({
					updating: false,
				});
				this.props.updateCart();
			}
		} catch (err) {
			store.dispatch(
				setAlertbar({
					status: 'error',
					message: utils.getGraphQLError(err, 'deleteCartItem'),
					open: true,
				}),
			);
		}
	};

	render() {
		const { displayQty, updateErrorMsg, updating, activeInputField, showUpdateBtn } = this.state;
		const item = this.props;

		return (
			<div
				className={s.container}
				style={updating ? { opacity: 0.3, pointerEvents: 'none' } : {}}
			>
				<div className={s.imagePalette}>
					<Link
						className={s.itemImage}
						to={utils.goToProduct(
							item.variant.ProductID,
							item.palette,
							item.variant.VariantID,
						)}
					>
						<img
							src={item.variant.variantImage.miniPic}
							alt={item.variant.variantImage.alt}
						/>
					</Link>
					<Link to={utils.goToShop(item.palette)} className={s.itemPalette}>
						{item.palette.map((hex, i) => (
							// eslint-disable-next-line
						<div key={hex+i} style={{backgroundColor: hex}} />
						))}
					</Link>
				</div>

				<div className={s.flexible}>
					<div className={s.itemInfo}>
						<Link
							to={utils.goToProduct(
								item.variant.ProductID,
								item.palette,
								item.variant.VariantID,
							)}
						>
							<p style={{ margin: 0 }}>{item.variant.product.productName}</p>
							{this.getVariantOptions(item.variant).map(optionStr => (
								<span style={{ marginRight: '1rem' }} key={optionStr}>
									{optionStr}
								</span>
							))}
						</Link>
					</div>

					<div className={s.itemPrice}>{`$${utils.convertPrice(item.variant.price)}`}</div>

					<div className={s.itemCtrl}>
						{!item.inStock ? (
							<div className={s.outOfStock} />
						) : (
							<div className={s.quantity}>
								<label htmlFor="quantityField">
									<span>Qty</span>
									{activeInputField ? (
										<input
											id="quantityField"
											onChange={e => this.handleQuantityInputChange(e.target.value)}
											value={displayQty}
											style={{ background: 'none', cursor: 'text' }}
											name={item.id}
											type="number"
											onBlur={this.handleInputFieldOnBlur}
											className={s.qtyInput}
										/>
									) : (
										<select
											id="quantityField"
											name={item.id}
											onChange={this.handleQtySelect}
											value={displayQty}
											className={s.qtyInput}
										>
											<optgroup label="Quantity" />
											{constants.qtyArr.map(value => (
												<option key={value} value={value}>
													{value}
												</option>
											))}
										</select>
									)}
								</label>

								{showUpdateBtn && (
									<button
										onClick={() => this.updateCartItem(displayQty)}
										className={s.updateQtyBtn}
									>
										update
									</button>
								)}

								{Boolean(updateErrorMsg) && (
									<span className={s.updateError}>
										<i
											style={{ marginRight: '5px' }}
											className="fa fa-exclamation-circle"
										/>
										{updateErrorMsg}
									</span>
								)}
							</div>
						)}
						<button onClick={() => this.deleteCartItem(item)} className={s.removeBtn}>
							<i className="fa fa-trash" />
						</button>
					</div>
				</div>
			</div>
		);
	}
}

export default compose(
	connect(state => ({
		loggedIn: state.loggedIn,
	})),
	withStyles(s),
)(CartItem);
