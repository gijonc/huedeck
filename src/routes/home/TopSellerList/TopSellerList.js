/**
 *	Huedeck, Inc
 */

import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { NavigateBefore, NavigateNext } from '@material-ui/icons';
import { setAlertbar } from 'actions/alertbar';
import Link from '../../../components/Link';
import gqlQuery from '../../gqlType';
import utils from '../../utils';
import ProductImage from '../../brand/ProductList/ProductImage';
import s from './TopSellerList.css';

class TopSellerList extends React.Component {
	static propTypes = {};

	static contextTypes = {
		store: PropTypes.object.isRequired,
		client: PropTypes.object.isRequired,
	};

	state = {
		products: [],
		currentPage: 0,
		maxPage: 1,
		clicking: false,
	};

	componentDidMount() {
		this.getTopSellerList();
	}

	getTopSellerList = async () => {
		try {
			const res = await this.context.client.query({
				query: gqlQuery.getTopSellerProduct,
				//   variables: {
				//     idList: this.props.idList,
				//   },
			});
			const { getTopSellerProduct } = res.data;
			if (getTopSellerProduct.length) {
				this.setState({
					products: getTopSellerProduct,
				});
			}
		} catch (err) {
			this.context.store.dispatch(
				setAlertbar({
					status: 'error',
					message: utils.getGraphQLError(err, 'getTopSellerList'),
					open: true,
				}),
			);
		}
	};

	scrollList = dir => {
		this.setState({ clicking: true });
		const {
			scrollLeft, // current left most position of the element
			offsetWidth, // max width to be allowed to scroll at once
			scrollWidth, // max scrollable width of the element
		} = this.topSellerList;

		const leftEnd = 0;
		const rightEnd = scrollWidth - offsetWidth;
		const scrollStep = Math.ceil(offsetWidth / 15);

		if (dir === 1 && scrollLeft < rightEnd) {
			// scroll to right
			// scroll to right
			const end = scrollLeft + offsetWidth > rightEnd ? rightEnd : scrollLeft + offsetWidth;
			const scrollInterval = setInterval(() => {
				if (this.topSellerList.scrollLeft + scrollStep < end) {
					this.topSellerList.scrollLeft += scrollStep;
				} else {
					this.topSellerList.scrollLeft = end;
					clearInterval(scrollInterval);
				}
			}, 15);
		} else if (dir === -1 && scrollLeft > leftEnd) {
			// scroll to left
			const end = scrollLeft - offsetWidth < leftEnd ? leftEnd : scrollLeft - offsetWidth;
			const scrollInterval = setInterval(() => {
				if (this.topSellerList.scrollLeft - scrollStep > end) {
					this.topSellerList.scrollLeft -= scrollStep;
				} else {
					this.topSellerList.scrollLeft = end;
					clearInterval(scrollInterval);
				}
			}, 15);
		} else {
			return;
		}

		this.setState(
			{
				currentPage: this.state.currentPage + dir,
				maxPage: Math.floor(scrollWidth / offsetWidth),
			},
			async () => {
				await utils.wait(300);
				this.setState({ clicking: false });
			},
		);
	};

	render() {
		const { products, currentPage, maxPage, clicking } = this.state;

		if (!products.length)
			return (
				<div className={s.preloader}>
					<i className="fa fa-spinner fa-spin" />
				</div>
			);

		return (
			<div className={s.container}>
				<button
					onClick={() => this.scrollList(1)}
					disabled={clicking}
					className={cx(s.toRight, s.scrollBtn)}
					style={{ display: currentPage < maxPage ? 'unset' : 'none' }}
				>
					<NavigateNext />
				</button>
				<button
					onClick={() => this.scrollList(-1)}
					disabled={clicking}
					className={cx(s.toLeft, s.scrollBtn)}
					style={{ display: currentPage ? 'unset' : 'none' }}
				>
					<NavigateBefore />
				</button>

				<div
					className={s.itemCarousel}
					ref={node => {
						this.topSellerList = node;
					}}
				>
					{products.map(pd => (
						<div key={pd.ProductID} className={s.itemWrapper}>
							<Link to={utils.goToProduct(pd.ProductID, [])} className={s.card}>
								<div className={s.imgWrapper}>
									<ProductImage src={pd.image} alt={pd.productName} />
								</div>
								<div className={s.itemPrices}>
									{utils.getProductPrices(pd).map((price, i) => (
										<div className={i ? s.oldPrice : s.curPrice} key={price}>
											{price}
										</div>
									))}
								</div>
							</Link>
						</div>
					))}
				</div>
			</div>
		);
	}
}

export default withStyles(s)(TopSellerList);
