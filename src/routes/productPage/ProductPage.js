/**
 *	Huedeck, Inc
 */

import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import cx from 'classnames';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import gql from 'graphql-tag';
import { FormHelperText, Grid } from '@material-ui/core';
import { ArrowBack, ArrowForward, PlayCircleOutline } from '@material-ui/icons';
import { setAlertbar } from 'actions/alertbar';
import { addToCart } from 'actions/cart';
import constants from '../constants';
import utils from '../utils';
import s from './ProductPage.css';
import { updateCustomMeta } from '../../DOMUtils';
import history from '../../history';
import Link from '../../components/Link';
import ProductDescription from './ProductDescription';
import RelatedProduct from './RelatedProduct';

const updateProductMutation = gql`
	mutation updateProduct($defaultImgUrl: String, $productId: String!) {
		updateProduct(defaultImgUrl: $defaultImgUrl, productId: $productId) {
			success
			errors
		}
	}
`;

// create eCommerce catalogs with the Facebook pixel by OpenGraph protocal
// https://www.facebook.com/business/help/1175004275966513
function setPdOpenGraph(pd) {
	function productStatus(status, stock) {
		if (status === 'discontinued') return status;
		return stock === 1 ? 'In Stock' : 'Out of Stock';
	}
	updateCustomMeta('og:title', pd.productName);
	updateCustomMeta('og:description', pd.category3);
	updateCustomMeta('og:url', `https://www.huedeck.com/product/${pd.ProductID}`);
	updateCustomMeta('og:image', pd.medias[0].miniPic);
	updateCustomMeta('og:image:width', 256);
	updateCustomMeta('og:image:height', 256);
	updateCustomMeta('product:brand', pd.manufacturer);
	updateCustomMeta('product:availability', productStatus(pd.status, pd.stock));
	updateCustomMeta('product:condition', 'new');
	updateCustomMeta('product:price:amount', pd.minPrice.toString());
	updateCustomMeta('product:price:currency', 'USD');
	updateCustomMeta('product:retailer_item_id', pd.ProductID);
}

const ProductType = {
	medias: PropTypes.arrayOf(
		PropTypes.shape({
			MideaID: PropTypes.string,
			alt: PropTypes.string,
			src: PropTypes.string,
			width: PropTypes.number,
			height: PropTypes.number,
		}),
	),
	variants: PropTypes.arrayOf(
		PropTypes.shape({
			VariantID: PropTypes.string,
			price: PropTypes.number,
			msrpPrice: PropTypes.number,
			inventoryQty: PropTypes.number,
			variantOption1: PropTypes.string,
			variantOption2: PropTypes.string,
			variantOption3: PropTypes.string,
		}),
	),
};

class ProductPage extends React.Component {
	static contextTypes = {
		store: PropTypes.object.isRequired,
		client: PropTypes.object.isRequired,
		reactFbPixel: PropTypes.object,
	};

	static propTypes = {
		hexArr: PropTypes.arrayOf(PropTypes.string).isRequired,
		product: PropTypes.shape(ProductType).isRequired,
		initVid: PropTypes.string,
		loggedIn: PropTypes.object,
	};

	static defaultProps = {
		initVid: null,
		loggedIn: null,
	};

	state = {
		pdDefImgUrl: null,
		activeVariant: null,
		addingToCart: false,
		userEnteringQty: false,
		invalidOption: false,
		activeImgIdx: 0,
		quantity: 1,
		rawHtml: {},
		loadedImage: {},
	};

	componentDidMount() {
		this.init();
	}

	componentDidUpdate(prevProps) {
		if (prevProps.product !== this.props.product) {
			this.init();
		}
	}

	setDefaultImg = async defaultImgUrl => {
		try {
			const updated = await this.context.client
				.mutate({
					mutation: updateProductMutation,
					variables: {
						productId: this.props.product.ProductID,
						defaultImgUrl,
					},
				})
				.then(res => res.data.updateProduct);
			if (updated.success) {
				this.setState({
					pdDefImgUrl: defaultImgUrl,
				});
			}
		} catch (err) {
			this.context.store.dispatch(
				setAlertbar({
					status: 'error',
					message: utils.getGraphQLError(err, 'setDefaultImg'),
					open: true,
				}),
			);
		}
	};

	setActiveImage = idx => {
		let activeImgIdx = idx;
		const { medias } = this.props.product;
		const startIdx = this.state.productExtraInfo.video ? -1 : 0;
		if (idx === medias.length) {
			activeImgIdx = startIdx; // video
		} else if (idx < startIdx) {
			activeImgIdx = medias.length - 1;
		}

		this.setState({
			activeImgIdx,
		});
	};

	handleQuantityInputChange = e => {
		const { value } = e.target;
		const validQty = Number(this.state.activeVariant.inventoryQty);

		if (value === '10+') {
			this.setState({
				quantity: validQty < 10 ? validQty : 10,
				userEnteringQty: true,
			});
			return true;
		}
		if (parseInt(value, 10) < 0 || Number.isNaN(parseInt(value, 10))) {
			return true;
		}

		this.setState({
			quantity: validQty < Number(value) ? validQty : Number(value),
		});
		return true;
	};

	addToCartOnClick = () => {
		const { store } = this.context;
		if (!Object.prototype.hasOwnProperty.call(store.getState().cart, 'cartId')) return;

		this.setState(
			{
				addingToCart: true,
			},
			async () => {
				// Facebook product addToCart event
				this.context.reactFbPixel.track(
					'AddToCart',
					utils.getPdContentViewData(this.props.product),
				);
				const variables = {
					itemId: this.state.activeVariant.VariantID,
					palette: this.props.hexArr.toString(),
					quantity: this.state.quantity,
					cartId: store.getState().cart.cartId,
				};
				const success = await this.context.store.dispatch(addToCart(variables));
				if (success === true) history.push('/cart');
			},
		);
	};

	init = () => {
		const { product, initVid } = this.props;
		// update facebook metadata
		setPdOpenGraph(product);
		// update product ContentView for FB Pixel event tracking
		this.context.reactFbPixel.track('ViewContent', utils.getPdContentViewData(product));

		const selectOptionList = {};
		let activeVariant = null;

		// find defualt item that is in stock, make first one as defualt
		// if no any in stock
		if (initVid) {
			activeVariant = product.variants.find(v => v.VariantID === initVid);
		}

		// NO vid specified: primarily to select an variant that is in stock
		if (!activeVariant)
			activeVariant = product.variants.find(v => v.inventoryQty > 0) || product.variants[0];

		const activeImgId = product.medias.findIndex(obj => obj.MediaID === activeVariant.MediaID);
		// preload images and find the image of any activeVariant
		this.preloadImage(activeImgId);

		// set default select options from activeVariant
		if (product.options[0].optionName !== 'Title') {
			for (let i = 0, len = product.options.length; i < len; i += 1) {
				const name = `variantOption${i + 1}`;
				selectOptionList[name] = activeVariant[name];
			}
		}

		// extract productInfo from html
		const productExtraInfo = {};
		const rawHtml = {};
		const rawHtmlEls = product.description.split('<p>');

		for (let i = 0, len = rawHtmlEls.length; i < len; i += 1) {
			if (rawHtmlEls[i].indexOf('iframe') !== -1) {
				productExtraInfo.video = rawHtmlEls[i].match('src="(.*)"')[1];
			} else if (rawHtmlEls[i].indexOf('Product type') !== -1) {
				rawHtml.specification = rawHtmlEls[i];
			} else if (rawHtmlEls[i].indexOf('Product care') !== -1) {
				rawHtml.productCare = rawHtmlEls[i];
			} else if (rawHtmlEls[i].indexOf('</p>') !== -1) {
				// remove any newline chars
				const rawDesc = rawHtmlEls[i].split('\n').join('');
				// remove </p> tag from the end of the string
				productExtraInfo.desc = rawDesc.substring(0, rawDesc.length - 4);
				// split string by <br> tag
				productExtraInfo.desc = productExtraInfo.desc.split('<br>' || '<br/>' || '<br />');
			}
		}

		this.setState({
			selectOptionList,
			productExtraInfo,
			activeVariant,
			rawHtml,
			pdDefImgUrl: product.image,
		});
	};

	preloadImage = activeImgId => {
		// collection on images (eliminate video)
		this.allImages = this.props.product.medias.filter(obj => obj.mediaType === 'image');

		// init state before updating image
		this.setState(
			{
				loadedImage: {},
				activeImgIdx: activeImgId || 0,
			},
			() => {
				const { product } = this.props;
				const loadedImage = {};
				for (let i = 0, len = product.medias.length; i < len; i += 1) {
					const { src, mediaType, MediaID } = product.medias[i];
					if (mediaType === 'image') {
						const img = new Image();
						img.onload = () => {
							loadedImage[MediaID] = true;
							this.setState({
								loadedImage,
							});
						};
						img.src = src;
					}
				}
			},
		);
	};

	handleOptionsChange = event => {
		const { value, name } = event.target;
		const { selectOptionList } = this.state;
		const { product, hexArr } = this.props;

		selectOptionList[name] = value;

		let filteredVariants = product.variants;
		const optionList = Object.keys(selectOptionList);
		for (let i = 0, len = optionList.length; i < len; i += 1) {
			const option = optionList[i];
			filteredVariants = filteredVariants.filter(v => v[option] === selectOptionList[option]);
		}

		if (!filteredVariants.length) {
			this.setState({
				invalidOption: true,
			});
		} else {
			const activeVariant = filteredVariants[0];
			history.push(utils.goToProduct(product.ProductID, hexArr, activeVariant.VariantID));
		}
	};

	render() {
		const { product, hexArr, loggedIn } = this.props;
		const {
			activeVariant,
			activeImgIdx,
			quantity,
			productExtraInfo,
			userEnteringQty,
			selectOptionList,
			invalidOption,
			addingToCart,
			rawHtml,
			loadedImage,
			pdDefImgUrl,
		} = this.state;

		if (!activeVariant || !this.allImages) return <div className={s.root} />;

		const noValidItem = !activeVariant.inventoryQty || invalidOption;
		const curActiveImg = this.allImages[activeImgIdx || 0];
		const enableSetDefImg =
			loggedIn && loggedIn.profile.roleType === 'admin' && activeImgIdx !== -1;

		return (
			<div className={s.root}>
				<Grid container className={s.container}>
					<Grid item xs={12} sm={6} className={s.bgImg} />

					<Grid item xs={12} sm={6} className={s.left}>
						<div
							className={s.thumbnailImgList}
							style={{ visibility: product.medias.length > 0 ? 'visible' : 'hidden' }}
						>
							<button
								style={{ left: '2vw' }}
								onClick={() => this.setActiveImage(activeImgIdx - 1)}
							>
								<ArrowBack />
							</button>

							{product.medias.map((img, i) => (
								<div
									className={cx(
										s.thumbnailImg,
										i === activeImgIdx ? s.activeThumbnailImg : null,
									)}
									key={img.MediaID}
									onMouseEnter={() => this.setActiveImage(i)}
								>
									<img src={img.miniPic} alt={img.alt} />
								</div>
							))}

							{!productExtraInfo.video ? null : (
								<div
									className={cx(
										s.thumbnailImg,
										activeImgIdx === -1 ? s.activeThumbnailImg : null,
									)}
									onMouseEnter={() => this.setActiveImage(-1)}
								>
									<PlayCircleOutline />
								</div>
							)}

							<button
								style={{ right: '2vw' }}
								onClick={() => this.setActiveImage(activeImgIdx + 1)}
							>
								<ArrowForward />
							</button>
						</div>

						<div className={cx(s.activeImage, activeImgIdx === -1 && s.activeIframe)}>
							{activeImgIdx === -1 ? (
								<div className={s.iframeWrapper}>
									<iframe
										title="product video"
										src={productExtraInfo.video}
										frameBorder="0"
										scrolling="0"
										width="100%"
										height="100%"
									>
										<span>Browser not compatible.</span>
									</iframe>
								</div>
							) : (
								<img
									src={
										loadedImage[curActiveImg.MediaID]
											? curActiveImg.src
											: curActiveImg.miniPic
									}
									alt={curActiveImg.alt}
									style={
										curActiveImg.height > curActiveImg.width
											? { height: '100%' }
											: { width: '100%' }
									}
								/>
							)}
							{enableSetDefImg &&
								(pdDefImgUrl === curActiveImg.miniPic ? (
									<div
										style={{ borderColor: 'green', color: 'green' }}
										className={s.setDefImgBtn}
									>
										DEFAULT
									</div>
								) : (
									<button
										onClick={() => this.setDefaultImg(curActiveImg.miniPic)}
										className={s.setDefImgBtn}
									>
										set as default
									</button>
								))}
						</div>
					</Grid>
					<Grid item xs={12} sm={6} className={s.right}>
						<Link to={utils.goToShop(hexArr)} className={s.paletteContainer}>
							<div className={s.paletteWrapper}>
								<span>
									color
									<br />
									palette
								</span>
								{hexArr.map((hex, i) => (
									// eslint-disable-next-line
								<div key={hex + i} style={{ backgroundColor: hex }} />
								))}
							</div>
						</Link>

						<div className={s.content}>
							<div className={s.title}>
								<div className={s.stepper}>
									{Boolean(product.category1) && (
										<Link to={`/products/${product.category1.split(' ').join('-')}`}>
											{product.category1}
										</Link>
									)}
									{Boolean(product.category2) && (
										<span>
											<Link to={`/products/${product.category2.split(' ').join('-')}`}>
												{product.category2}
											</Link>
										</span>
									)}
									{Boolean(product.category3) && (
										<span>
											<Link to={`/products/${product.category3.split(' ').join('-')}`}>
												{product.category3}
											</Link>
										</span>
									)}
								</div>

								<h1>{product.productName}</h1>

								<div className={s.brandName}>{product.manufacturer.toUpperCase()}</div>
							</div>

							{Boolean(productExtraInfo.desc) && (
								<div className={s.articleText}>
									{productExtraInfo.desc.length &&
										productExtraInfo.desc.map(
											(p, i) =>
												// eslint-disable-next-line
									(p !== "") && <p key={p[0]+i}>{p}</p>
										)}
								</div>
							)}

							<Grid
								container
								direction="row-reverse"
								justify="space-between"
								className={s.optionList}
							>
								<Grid item xs={product.options.length > 1 ? 2 : 3}>
									<label htmlFor="quantityField">
										Quantity
										{userEnteringQty ? (
											<input
												id="quantityField"
												disabled={noValidItem}
												onChange={this.handleQuantityInputChange}
												value={quantity}
												style={{ background: 'none', cursor: 'text' }}
												type="number"
												autoFocus // eslint-disable-line jsx-a11y/no-autofocus
												onBlur={() => {
													this.setState({ userEnteringQty: quantity > 9 });
												}}
											/>
										) : (
											<select
												id="quantityField"
												disabled={noValidItem}
												onChange={this.handleQuantityInputChange}
												value={quantity}
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
									{!noValidItem && quantity >= activeVariant.inventoryQty && (
										<FormHelperText error style={{ fontSize: '1.2rem' }}>
											Only {activeVariant.inventoryQty} left in stock
										</FormHelperText>
									)}
								</Grid>

								{selectOptionList.variantOption1 &&
									product.options.map((option, i) => (
										<Grid
											item
											xs={product.options.length > 1 ? 4 : 6}
											key={option.optionName}
										>
											<label htmlFor={option.optionName}>
												{option.optionName}
												<select
													onChange={this.handleOptionsChange}
													id={option.optionName}
													name={`variantOption${i + 1}`}
													defaultValue={selectOptionList[`variantOption${i + 1}`]}
												>
													<optgroup
														label={`Select ${option.optionName.toLowerCase()}`}
													/>
													{option.values.map(value => (
														<option key={value} value={value}>
															{value}
														</option>
													))}
												</select>
											</label>
										</Grid>
									))}
							</Grid>

							<div className={s.priceContainer}>
								{noValidItem ? (
									<div className={s.noPrice}>
										{invalidOption ? (
											<h1>Currently unavailable</h1>
										) : (
											<h1>Out of stock</h1>
										)}
									</div>
								) : (
									<div>
										<h1>${utils.convertPrice(activeVariant.price)}</h1>
										{product.status === 'discontinued' ? (
											<span>FINAL SALE</span>
										) : (
											product.topSeller >= 1 && <span>TOP SELLER</span>
										)}

										{Number(activeVariant.price) < Number(activeVariant.msrpPrice) && (
											<p>
												<span className={s.msrpPrice}>
													${utils.convertPrice(activeVariant.msrpPrice)}
												</span>
												<span className={s.priceOff}>
													{Math.round(
														((activeVariant.msrpPrice - activeVariant.price) /
															activeVariant.msrpPrice) *
															100,
													)}
													% Off
												</span>
											</p>
										)}
									</div>
								)}

								<button
									className={s.addToCartBtn}
									onClick={this.addToCartOnClick}
									disabled={noValidItem || addingToCart}
								>
									{addingToCart ? (
										<i className="fa fa-spinner fa-spin" />
									) : (
										<span>Add to Cart</span>
									)}
								</button>
							</div>
						</div>
					</Grid>
				</Grid>

				<div className={s.lowerPart}>
					<ProductDescription
						rawSpec={rawHtml.specification || ''}
						rawPdCare={rawHtml.productCare || ''}
						shippingMethod={activeVariant.shipping.shippingMethod}
					/>

					<div id="similar">
						<RelatedProduct product={product} palette={hexArr} type="similar" />
					</div>

					<div id="matching">
						<RelatedProduct product={product} palette={hexArr} type="matching" />
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
)(ProductPage);
