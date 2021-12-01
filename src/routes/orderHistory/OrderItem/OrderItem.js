/**
 * Huedeck, Inc.
 */

import React from 'react';
// import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './OrderItem.css';
import utils from '../../utils';
import Link from '../../../components/Link';

class OrderItem extends React.Component {
	//   static propTypes = {};

	render() {
		const item = this.props;

		return (
			<div className={s.orderItem} key={item.variantId}>
				<Link
					className={s.imgWrapper}
					to={utils.goToProduct(item.productId, item.palette, item.variantId)}
				>
					<img src={item.image.miniPic} alt={item.name} />
				</Link>
				<Link to={utils.goToShop(item.palette)} className={s.itemPalette}>
					{item.palette.map((hex, i) => (
						// eslint-disable-next-line
					<div key={hex+i} style={{backgroundColor: hex}} />
					))}
				</Link>

				<div className={s.itemInfo}>
					<Link to={utils.goToProduct(item.productId, item.palette, item.variantId)}>
						{item.name}
					</Link>
					<div className={s.itemStat}>${utils.convertPrice(item.price)}</div>
					<div className={s.itemStat}>Qty: {item.quantity}</div>
				</div>
			</div>
		);
	}
}

export default withStyles(s)(OrderItem);
