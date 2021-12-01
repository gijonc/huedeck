/**
 *	Huedeck, Inc.
 */
import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import PropTypes from 'prop-types';
import { Map } from 'immutable';
import utils from '../../utils';
import Link from '../../../components/Link';
import s from './ProductCtrlDialog.css';

class ProductCtrlDialog extends React.Component {
	static propTypes = {
		palette: PropTypes.arrayOf(PropTypes.string).isRequired,
		addToCart: PropTypes.func.isRequired,
	};

	static contextTypes = {
		store: PropTypes.object.isRequired,
		client: PropTypes.object.isRequired,
	};

	getVariantOptions = item => {
		const product = this.props;
		const optionArr = product.options.map(
			op => `${op.optionName}: ${item[`variantOption${op.optionPosition}`]}`,
		);
		return optionArr;
	};

	addToCart = item => {
		const itemObj = Map(item)
			.set('name', this.props.productName.split(',')[0])
			.toObject();
		this.props.addToCart(itemObj);
	};

	render() {
		if (!this.props.ProductID) return null;
		const { palette, ...product } = this.props;

		return (
			<div className={s.itemListModal}>
				<div className={s.modalHeader}>
					<h1>{product.productName.split(',')[0]}</h1>
					<p>{product.variants.length} options available</p>
				</div>

				<div className={s.modalContent}>
					{product.variants.map(item => (
						<div key={item.VariantID} className={s.itemListRow}>
							<Link
								className={s.imgWrapper}
								to={utils.goToProduct(product.ProductID, palette, item.VariantID)}
							>
								<img src={item.variantImage.miniPic} alt={item.variantImage.alt} />
							</Link>

							<div className={s.variantOption}>
								{this.getVariantOptions(item).map(optionStr => (
									<span key={optionStr}>{optionStr}</span>
								))}
							</div>

							<div className={s.variantPrice}>${utils.convertPrice(item.price)}</div>

							{item.inventoryQty > 0 ? (
								<div className={s.itemRowCtrl}>
									<button className={s.button} onClick={() => this.addToCart(item)}>
										Add to Cart
									</button>
								</div>
							) : (
								<div className={s.itemRowCtrl}>Out of Stock</div>
							)}
						</div>
					))}
				</div>
			</div>
		);
	}
}

export default withStyles(s)(ProductCtrlDialog);
