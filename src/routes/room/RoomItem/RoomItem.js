/**
 *	Huedeck, Inc
 */

import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import utils from '../../utils';
import Link from '../../../components/Link/Link';
import s from './RoomItem.css';

class RoomItem extends React.Component {
	static propTypes = {
		// eslint-disable-next-line
		product: PropTypes.object.isRequired,
		findSimPd: PropTypes.func.isRequired,
		palette: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
	};

	render() {
		const { product, palette } = this.props;

		return (
			<div key={product.ProductID} className={s.itemWrapper}>
				<div className={s.imgWrapper}>
					<Link to={utils.goToProduct(product.ProductID, palette)} className={s.imgLink}>
						<img src={product.image} alt={product.productName} />
					</Link>
				</div>
				<div className={s.price}>
					{utils.getProductPrices(product).map((price, i) => (
						<div className={i ? s.oldPrice : s.curPrice} key={price}>
							{price}
						</div>
					))}
				</div>
				<button className={s.findSimilarBtn} onClick={() => this.props.findSimPd(product)}>
					find similar
				</button>
			</div>
		);
	}
}

export default withStyles(s)(RoomItem);
