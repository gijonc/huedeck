/**
 * Huedeck, Inc.
 */

import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { Dialog, withMobileDialog } from '@material-ui/core';
import { compose } from 'recompose';
import { setAlertbar } from 'actions/alertbar';
import { setConfirmDialog } from 'actions/confirmDialog';
import gqlQuery from 'routes/gqlType';
import ConfirmDialog from 'routes/Dialogs/ConfirmDialog';
import { CloseButton, Loader } from '../../components/Utilities';
import constants from '../constants';
import Link from '../../components/Link';
import OrderDetail from './OrderDetail';
import OrderItem from './OrderItem';
import s from './OrderHistory.css';

class OrderHistory extends React.Component {
	static propTypes = {
		fullScreen: PropTypes.bool.isRequired,
	};

	static contextTypes = {
		store: PropTypes.object.isRequired,
		client: PropTypes.object.isRequired,
	};

	state = {
		orderList: null,
		preCancelOrderId: null,
		activeOrderDetail: null,
		loading: false,
	};

	componentDidMount() {
		this.getUserOrders();
	}

	getUserOrders = async () => {
		const { store, client } = this.context;
		try {
			const res = await client.query({
				query: gqlQuery.getUserAllOrder,
				fetchPolicy: 'network-only',
			});
			const { getUserAllOrder } = res.data;
			if (getUserAllOrder) {
				this.setState({
					orderList: getUserAllOrder,
				});
			}
		} catch (err) {
			store.dispatch(
				setAlertbar({
					status: 'error',
					message: __DEV__ ? `[getUserOrders] -> ${err.message}` : constants.errMsg,
					open: true,
				}),
			);
		}
	};

	getMDYfromDate = dateStr => {
		if (!dateStr) return null;
		const dateObj = new Date(dateStr);

		const monthNames = [
			'January',
			'February',
			'March',
			'April',
			'May',
			'June',
			'July',
			'August',
			'September',
			'October',
			'November',
			'December',
		];
		const monthIdx = dateObj.getMonth(); // months from 1-12
		const day = dateObj.getDate();
		const year = dateObj.getFullYear();

		return `${monthNames[monthIdx]} ${day}, ${year}`;
	};

	// get confirm result from dialog
	getConfirm = async result => {
		if (result === 'cancelOrder') {
			this.cancelSelectedOrder();
		}
	};

	cancelSelectedOrder = async () => {
		this.setState({ loading: true });
		const { store, client } = this.context;
		try {
			const res = await client.mutate({
				mutation: gqlQuery.cancelUserOrder,
				variables: {
					orderId: this.state.preCancelOrderId,
				},
			});
			const { cancelUserOrder } = res.data;
			if (cancelUserOrder.success) {
				const { orderList, preCancelOrderId } = this.state;

				// update order cancel time
				const orderIdx = orderList.findIndex(obj => obj.orderId === preCancelOrderId);
				const newOrderObj = Object.assign({}, orderList[orderIdx]);
				const newOrderList = orderList.slice();
				newOrderObj.cancelledAt = new Date().getTime(); // update cancel time
				newOrderList[orderIdx] = newOrderObj;

				store.dispatch(
					setAlertbar({
						status: 'success',
						message: 'Your order has been cancelled.',
						open: true,
					}),
				);

				this.setState({
					orderList: newOrderList,
					preCancelOrderId: null,
					loading: false,
				});
			} else {
				store.dispatch(
					setAlertbar({
						status: 'error',
						message: 'Failed to cancelled, your cancellation may have been expired!',
						open: true,
					}),
				);
			}
		} catch (err) {
			store.dispatch(
				setAlertbar({
					status: 'error',
					message: __DEV__ ? `[cancelSelectedOrder] -> ${err.message}` : constants.errMsg,
					open: true,
				}),
			);
		}
	};

	toggleCancelDialog = (id, orderName) => {
		const { store } = this.context;
		this.setState({ preCancelOrderId: id });

		store.dispatch(
			setConfirmDialog({
				confirmKey: 'yes, continue',
				type: 'cancelOrder',
				query: `Are you sure to continue to cancel order #${orderName}?`,
				open: true,
			}),
		);
	};

	toggleOrderDetailOpen = id => {
		this.setState({
			activeOrderDetail: this.state.activeOrderDetail === id ? null : id,
		});
	};

	toggleOrderDetailClose = () => {
		this.setState({
			activeOrderDetail: null,
		});
	};

	isValidCancelEvent = date => {
		const diff = new Date() - new Date(date);
		const orderPlacedAfterMiniute = Math.floor(parseInt(diff, 10) / 60000); // convert seconds to minute
		return orderPlacedAfterMiniute <= 30;
	};

	render() {
		const { orderList, activeOrderDetail, loading } = this.state;

		if (!orderList) {
			return (
				<div className={s.root}>
					<div className={s.container}>
						<Loader />
					</div>
				</div>
			);
		}

		return (
			<div className={s.root}>
				<div
					className={s.container}
					style={loading ? { opacity: 0.3, pointerEvents: 'none' } : {}}
				>
					<h1>Order History</h1>
					{!orderList.length ? (
						<p>
							Looks like you haven&apos;t put any orders yet,{' '}
							<Link to="/shop">back to shop</Link>
						</p>
					) : (
						<div>
							<ConfirmDialog complete={this.getConfirm} />
							{orderList.map(order => (
								<div className={s.orderWrapper} key={order.orderId}>
									<div className={s.orderHeader}>
										{order.cancelledAt ? (
											<div className={s.headerContent}>
												<span>Status</span>
												<div style={{ color: 'red' }}>Cancelled on</div>
												<div>{this.getMDYfromDate(order.cancelledAt)}</div>
											</div>
										) : (
											<div className={s.headerContent}>
												<span>Status</span>
												{order.fulfillments.length ? (
													<div>Completed</div>
												) : (
													<div>Processing</div>
												)}
											</div>
										)}

										<div className={s.headerContent}>
											<span>Order#</span>
											<div>{order.orderName}</div>
										</div>

										<div className={s.headerContent}>
											<span>Placed on</span>
											<div>{this.getMDYfromDate(order.placedAt)}</div>
										</div>

										<div className={s.orderCtrl}>
											<Dialog
												fullScreen={this.props.fullScreen}
												maxWidth="md"
												scroll="paper"
												open={activeOrderDetail === order.orderId}
												onClose={this.toggleOrderDetailClose}
											>
												<CloseButton onClick={this.toggleOrderDetailClose} />
												<OrderDetail {...order} />
											</Dialog>

											<button
												className={s.button}
												onClick={() => this.toggleOrderDetailOpen(order.orderId)}
											>
												order details
											</button>

											{this.isValidCancelEvent(order.placedAt) && !order.cancelledAt && (
												<button
													className={s.button}
													onClick={() =>
														this.toggleCancelDialog(order.orderId, order.orderName)
													}
												>
													cancel order
												</button>
											)}
										</div>
									</div>

									<div className={s.fullfillmentListContainer}>
										{order.fulfillments.map(fulfillment => (
											<div className={s.fulfillment} key={fulfillment.id}>
												<div className={s.fulfillmentStatus}>
													<h3>Shipment {fulfillment.shipmentStatus}</h3>
													<div className={s.headerContent}>
														<span>Last update by</span>
														<div>{this.getMDYfromDate(fulfillment.lastUpdate)}</div>
													</div>
												</div>

												<div className={s.tracking}>
													{fulfillment.trackingCompany} tracking number:
													<a
														href={fulfillment.trackingUrl}
														target="_blank"
														rel="noopener noreferrer"
													>
														{fulfillment.trackingNumber}
													</a>
												</div>

												{fulfillment.items.map(item => (
													<OrderItem {...item} key={item.variantId} />
												))}
											</div>
										))}

										{Boolean(order.lineItems.length) && (
											<div className={s.fulfillment}>
												{!order.cancelledAt && (
													<div className={s.fulfillmentStatus}>
														<h3>Preparing for shipment</h3>
													</div>
												)}

												{order.lineItems.map(item => (
													<OrderItem {...item} key={item.variantId} />
												))}
											</div>
										)}
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		);
	}
}

export default compose(
	withStyles(s),
	withMobileDialog(),
)(OrderHistory);
