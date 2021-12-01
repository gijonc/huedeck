/**
 * Huedeck, Inc.
 */

import React from 'react';
// import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './OrderDetail.css';
import utils from '../../utils';

class OrderDetail extends React.Component {
	//   static propTypes = {};

	getAddressCombination = address => {
		const { address1, address2, city, province, zip, country } = address;
		return `${address1} ${address2}, ${city}, ${province} ${zip}, ${country}`;
	};

	getGrandTotalPrice = order => {
		const { subTotalPrice, totalTax, shippingLines } = order;

		let total = Number(subTotalPrice + totalTax);
		for (let i = 0, len = shippingLines.length; i < len; i += 1) {
			total += Number(shippingLines[i].price);
		}
		return utils.convertPrice(total);
	};

	render() {
		const order = this.props;

		return (
			<div className={s.container}>
				<h1>Order# {order.orderName}</h1>

				<div className={s.orderSummary}>
					<div>
						<p>Shipping Address</p>
						<span>{order.shippingAddress.name}</span>
						<span>{this.getAddressCombination(order.shippingAddress)}</span>
						<span style={{ paddingTop: '3px', textTransform: 'lowercase' }}>
							{order.contactInfo}
						</span>
					</div>

					<div>
						<p>Billing Address</p>
						<span>{order.billingAddress.name}</span>
						<span>{this.getAddressCombination(order.billingAddress)}</span>
					</div>
				</div>

				<div className={s.orderSummary}>
					<div>
						<p>Payment Method</p>
						<span>{order.paymentDetails.creditCardNumber}</span>
						<span>{order.paymentDetails.creditCardCompany}</span>
					</div>

					<div>
						<p>Order Summary</p>
						<div className={s.priceSummary}>
							<span>Items Subtotal</span>
							<span>${utils.convertPrice(order.subTotalPrice)}</span>
						</div>

						<div className={s.priceSummary}>
							<span>Estimated Tax</span>
							<span>${utils.convertPrice(order.totalTax)}</span>
						</div>

						<div className={s.priceSummary}>
							<span>Discount</span>
							<span>- ${utils.convertPrice(order.totalDiscount)}</span>
						</div>

						<div className={s.priceSummary}>
							<span>Shipping</span>
							<div>
								{order.shippingLines.map(sl => (
									<span key={sl.title}>${utils.convertPrice(sl.price)}</span>
								))}
							</div>
						</div>

						<div className={s.priceSummary}>
							<p>Grand Total</p>
							<p>${this.getGrandTotalPrice(order)}</p>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default withStyles(s)(OrderDetail);
