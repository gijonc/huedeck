/**
 *	Huedeck, Inc.
 */
import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import PropTypes from 'prop-types';
import ImageLoader from 'react-load-image';
import { Fade } from '@material-ui/core';
import Link from '../../../components/Link';
import utils from '../../utils';
import s from './VariantItem.css';

class VariantItem extends React.Component {
	static propTypes = {
		addToCartOnClick: PropTypes.func.isRequired,
		palette: PropTypes.arrayOf(PropTypes.string).isRequired,
		// eslint-disable-next-line react/prop-types
		variants: PropTypes.arrayOf(PropTypes.object).isRequired,
	};

	inStock = () => {
		const { variants } = this.props;
		let totalQty = 0;
		for (let i = 0, len = variants.length; i < len; i += 1) {
			totalQty += variants[i].inventoryQty;
		}
		return totalQty > 0;
	};

	render() {
		const { addToCartOnClick, ...product } = this.props;
		const hasTag = Boolean(product.status || product.topSeller);

		return (
			<Link
				className={s.itemWrapper}
				to={utils.goToProduct(product.ProductID, this.props.palette)}
			>
				{hasTag && (
					<div className={s.ribbon}>
						{product.status === 'discontinued' ? (
							<span>FINAL SALE</span>
						) : (
							product.topSeller >= 1 && <span>TOP SELLER</span>
						)}
					</div>
				)}

				<ImageLoader src={product.variants[0].variantImage.miniPic} className={s.imageWrapper}>
					<Fade in>
						<img alt={product.variants[0].variantImage.alt} />
					</Fade>
					<div>
						<img src={product.variants[0].variantImage.src} alt="" />
					</div>
					<div>
						<i className="fa fa-spinner fa-spin" />
					</div>
				</ImageLoader>

				<div className={s.itemInfo}>
					<div className={s.itemCtrl}>
						<div>
							{utils.getProductPrices(product).map((price, i) => (
								<div
									style={{ background: 'none', paddingLeft: 0 }}
									className={i ? s.originPrice : s.nowPrice}
									key={price}
								>
									{price}
								</div>
							))}
						</div>
						{this.inStock() && (
							<button
								className={s.addToCartBtn}
								onClick={e => {
									e.stopPropagation();
									e.preventDefault();
									addToCartOnClick(product);
								}}
							>
								<i className="fa fa-cart-plus" />
							</button>
						)}
					</div>

					<div className={s.title}>{product.productName.split(',')[0]}</div>
				</div>
			</Link>
		);
	}
}

export default withStyles(s)(VariantItem);
