/**
 *	Huedeck, Inc.
 */
import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import PropTypes from 'prop-types';
import { ArrowBack, ArrowForward } from '@material-ui/icons';
import { setAlertbar } from 'actions/alertbar';
import { fetchSimilarProduct } from 'actions/getSimilarProduct';
import gqlQuery from '../../gqlType';
import constants from '../../constants';
import colorMath from '../../shop/colorMath';
import ProductList from '../../brand/ProductList';
import utils from '../../utils';
import s from './RelatedProduct.css';

// retuened width should match with max-width of
// the productList item defined in ProductList.css
function getItemNumByWidth(width) {
	if (width <= 600) return 2;
	if (width <= 1200) return 3;
	if (width <= 1440) return 5;
	return 6;
}

const INIT_STATE = {
	maxItemFound: 0,
	listBegin: 0,
	lastOffset: 0,
	itemList: [],
};

class RelatedProduct extends React.Component {
	static contextTypes = {
		store: PropTypes.object.isRequired,
		client: PropTypes.object.isRequired,
	};

	static propTypes = {
		palette: PropTypes.arrayOf(PropTypes.string).isRequired,
		// eslint-disable-next-line
		product: PropTypes.object,
		type: PropTypes.oneOf(['similar', 'matching']).isRequired,
	};

	static defaultProps = {
		product: null,
	};

	state = {
		maxItemInRow: getItemNumByWidth(),
		clicking: false,
		...INIT_STATE,
	};

	componentWillMount() {
		this.updateDimensions();
	}

	componentDidMount() {
		window.addEventListener('resize', this.updateDimensions);
		this.init();
	}

	componentDidUpdate(prevProps) {
		if (this.props.product && prevProps.product.ProductID !== this.props.product.ProductID) {
			this.init();
		}
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.updateDimensions);
	}

	getPrevBatch = async () => {
		const { listBegin, maxItemInRow, clicking } = this.state;

		if (clicking || listBegin === 0) return;
		this.setState({
			clicking: true,
		});

		await utils.wait(300);
		this.setState({
			listBegin: listBegin - maxItemInRow,
			clicking: false,
		});
	};

	getNextBatch = async () => {
		const { listBegin, itemList, maxItemInRow, maxItemFound, clicking } = this.state;

		const listEnd = listBegin + maxItemInRow;

		if (clicking || listEnd >= maxItemFound) return;
		this.setState({
			clicking: true,
		});

		if (this.props.type === 'similar') {
			if (listEnd + maxItemInRow >= itemList.length) {
				this.getSimilarProducts();
			}
		}

		await utils.wait(300);
		this.setState({
			listBegin: listEnd,
			clicking: false,
		});
	};

	getRelatedProduct = async () => {
		const { store, client } = this.context;
		const variables = {
			rgbArr: colorMath.hexArr2rgbArr(this.props.palette),
		};

		if (this.props.product) {
			Object.assign(variables, {
				seed: this.props.product.category2, // category2
				productId: this.props.product.ProductID,
			});
		}

		try {
			const res = await client.query({
				query: gqlQuery.getProductByCateogry,
				variables,
			});
			const { getProductByCateogry } = res.data;
			if (getProductByCateogry) {
				this.setState({
					itemList: getProductByCateogry.products,
					maxItemFound: getProductByCateogry.tally,
				});
			} else {
				throw new Error(constants.errMsg);
			}
		} catch (err) {
			store.dispatch(
				setAlertbar({
					status: 'error',
					message: __DEV__ ? `[getRelatedProduct] -> ${err}` : err.message,
					open: true,
				}),
			);
		}
	};

	getSimilarProducts = async () => {
		const { lastOffset, itemList } = this.state;
		if (lastOffset === -1) return;

		const variables = {
			activeColors: colorMath.hexArr2rgbArr(this.props.palette),
			lastOffset,
			excludeProductIds: [this.props.product.ProductID],
			filters: JSON.stringify({
				category3: this.props.product.category3,
			}),
		};

		const data = await this.context.store.dispatch(fetchSimilarProduct(variables));

		if (data) {
			const { newOffset, products, totalCount } = data;
			this.setState({
				itemList: itemList.concat(products),
				maxItemFound: totalCount,
				lastOffset: newOffset,
			});
		}
	};

	updateDimensions = () => {
		if (typeof window !== 'undefined') {
			const newMaxItemInRow = getItemNumByWidth(window.innerWidth);
			if (newMaxItemInRow !== this.state.maxItemInRow) {
				this.setState({
					listBegin: 0,
					maxItemInRow: newMaxItemInRow,
				});
			}
		}
	};

	init = async () => {
		if (this.props.type === 'similar' && this.props.product) {
			await this.setState(INIT_STATE); // important!
			this.getSimilarProducts();
		} else if (this.props.type === 'matching') {
			this.getRelatedProduct();
		}
	};

	render() {
		const { itemList, listBegin, maxItemFound, maxItemInRow, clicking } = this.state;
		const { type } = this.props;
		if (!itemList.length) return null;

		const productList = itemList.slice(listBegin, listBegin + maxItemInRow);

		return (
			<div className={s.container}>
				<div className={s.title}>
					<h1>
						{type === 'matching'
							? 'Matching items appear harmony'
							: 'Similar items you may like'}
					</h1>
				</div>
				<div className={s.pageInfo}>
					<span>{`Page ${Math.floor(listBegin / maxItemInRow + 1)} of ${Math.ceil(
						maxItemFound / maxItemInRow,
					)}`}</span>
				</div>

				<div style={clicking ? { opacity: 0.5 } : {}}>
					<ProductList products={productList} palette={this.props.palette} />
				</div>

				<div className={s.btnGroup}>
					<button
						className={s.listPagingBtn}
						onClick={this.getPrevBatch}
						style={{ visibility: listBegin === 0 ? 'hidden' : 'visible' }}
					>
						<ArrowBack />
					</button>

					<button
						className={s.listPagingBtn}
						onClick={this.getNextBatch}
						style={{
							visibility: listBegin + maxItemInRow >= maxItemFound ? 'hidden' : 'visible',
						}}
					>
						<ArrowForward />
					</button>
				</div>
			</div>
		);
	}
}

export default withStyles(s)(RelatedProduct);
