/**
 *	Huedeck, Inc.
 */
import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import PropTypes from 'prop-types';
import Link from 'components/Link';
import utils from 'routes/utils';
import ProductImage from './ProductImage';
import s from './ProductList.css';

class ProductList extends React.Component {
	static propTypes = {
		products: PropTypes.arrayOf(PropTypes.object).isRequired,
		palette: PropTypes.arrayOf(PropTypes.string),
		hideTopSellerTag: PropTypes.bool,
		setRef: PropTypes.func,
	};

	static defaultProps = {
		palette: [],
		hideTopSellerTag: false,
		setRef: undefined,
	};

	render() {
		const { products, palette, hideTopSellerTag, setRef } = this.props;
		return (
			<div className={s.itemList} ref={setRef}>
				{products.map(pd => (
					<div key={pd.ProductID} className={s.itemWrapper}>
						<div className={s.card}>
							{Boolean(pd.status || pd.topSeller) && (
								<div className={s.ribbon}>
									{pd.status === 'discontinued' ? (
										<span>FINAL SALE</span>
									) : (
										Number(pd.topSeller) >= 0.85 &&
										!hideTopSellerTag && <span>TOP SELLER</span>
									)}
								</div>
							)}

							<Link to={utils.goToProduct(pd.ProductID, palette)} className={s.imageWrapper}>
								<ProductImage src={pd.image} alt={pd.productName} />
							</Link>

							<div className={s.itemInfo}>
								<div className={s.price}>
									{utils.getProductPrices(pd).map((price, i) => (
										<div className={i ? s.oldPrice : s.curPrice} key={price}>
											{price}
										</div>
									))}
								</div>

								<Link to={utils.goToProduct(pd.ProductID, palette)} className={s.title}>
									{pd.productName}
								</Link>
							</div>
						</div>
					</div>
				))}
			</div>
		);
	}
}

export default withStyles(s)(ProductList);
