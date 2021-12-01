/**
 *	Huedeck, Inc
 */

import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import { Map } from 'immutable';
import { Dialog } from '@material-ui/core';
import { FacebookShareButton, TwitterShareButton } from 'react-share';
import { setAlertbar } from 'actions/alertbar';
import { setUserDialog } from 'actions/userDialog';
import { addToCart } from 'actions/cart';
import { toggleAddedCartDialog } from 'actions/addedCartDialog';
import utils from '../utils';
import gqlQuery from '../gqlType';
import constants from '../constants';
import { CloseButton } from '../../components/Utilities';
import Link from '../../components/Link';
import RelatedProduct from '../productPage/RelatedProduct';
import VariantItem from './VariantItem';
import AddedCartDialog from '../Dialogs/AddedCartDialog';
import ProductCtrlDialog from './ProductCtrlDialog';
import s from './CollectionPage.css';

class CollectionPage extends React.Component {
	static propTypes = {
		id: PropTypes.string.isRequired,
		palette: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
		// eslint-disable-next-line
		savedUser: PropTypes.object.isRequired,
		// eslint-disable-next-line
		screenSize: PropTypes.object.isRequired,
	};

	static contextTypes = {
		store: PropTypes.object.isRequired,
		client: PropTypes.object.isRequired,
		reactFbPixel: PropTypes.object.isRequired,
	};

	state = {
		hasClientSaved: false,
		savedCount: 0,
		clicking: false,
		activeProduct: null,
	};

	componentDidMount() {
		const { hasClientSaved, count } = this.props.savedUser;
		// eslint-disable-next-line
		this.setState({
			hasClientSaved,
			savedCount: count,
		});
	}

	handleSaveCollection = async () => {
		const { store, client } = this.context;
		const { clicking, savedCount, hasClientSaved } = this.state;

		if (clicking) return true;

		if (!store.getState().loggedIn) {
			store.dispatch(
				setUserDialog({
					toggle: true,
					target: 'login',
				}),
			);
			return true;
		}

		const mutateQuery = hasClientSaved ? gqlQuery.deleteSavedCollection : gqlQuery.saveCollection;

		this.setState({
			hasClientSaved: !hasClientSaved,
			savedCount: hasClientSaved ? savedCount - 1 : savedCount + 1,
			clicking: true,
		});

		try {
			const res = await client.mutate({
				mutation: mutateQuery,
				variables: { collectionId: this.props.id },
			});
			const data = res.data.saveCollection || res.data.deleteSavedCollection;
			if (data.success) {
				this.setState({
					clicking: false,
				});
			}
		} catch (err) {
			store.dispatch(
				setAlertbar({
					status: 'error',
					message: utils.getGraphQLError(err, 'Collection handleSaveCollection'),
					open: true,
				}),
			);
		}
		return true;
	};

	addCartItem = (item, pd) => {
		const { store } = this.context;
		if (
			this.state.addingToCart ||
			!Object.prototype.hasOwnProperty.call(store.getState().cart, 'cartId')
		)
			return;

		this.setState(
			{
				addingToCart: true,
				activeProduct: null,
			},
			async () => {
				this.context.reactFbPixel.track(
					'AddToCart',
					utils.getPdContentViewData({ minPrice: item.price, ...pd }),
				);
				const variables = {
					itemId: item.VariantID,
					palette: this.props.palette.toString(),
					cartId: store.getState().cart.cartId,
					quantity: 1,
				};
				const res = await this.context.store.dispatch(addToCart(variables));
				if (res === true) {
					this.setState(
						{
							addingToCart: false,
						},
						() =>
							store.dispatch(
								toggleAddedCartDialog({
									open: true,
									item: {
										quantity: variables.quantity,
										title: item.name,
										imgSrc: item.variantImage.miniPic,
									},
								}),
							),
					);
				}
			},
		);
	};

	addToCartOnClick = product => {
		const { variants } = product;
		if (variants.length > 1) {
			this.handleProductCtrlDialogOpen(product);
		} else {
			const itemObj = Map(variants[0])
				.set('name', product.productName.split(',')[0])
				.toObject();
			this.addCartItem(itemObj, product);
		}
	};

	handleProductCtrlDialogOpen = product => {
		this.setState({
			activeProduct: product,
		});
	};

	handleProductCtrlDialogClose = () => {
		this.setState({
			activeProduct: null,
		});
	};

	render() {
		const { screenSize, ...collection } = this.props;
		const { hasClientSaved, savedCount, activeProduct, addingToCart } = this.state;

		return (
			<div className={s.root}>
				<div className={s.container}>
					<div className={s.mainContent}>
						<div className={s.collectionInfoSection}>
							<div className={s.titleAuthor}>
								<h1>{collection.title}</h1>
								<span>{collection.author ? collection.author.displayName : 'Huedeck'}</span>
							</div>

							<div className={s.likeShare}>
								<button className={s.saveBtn} onClick={() => this.handleSaveCollection()}>
									{hasClientSaved ? (
										<span>
											<i
												className="fa fa-heart"
												style={{ color: constants.colors.like }}
											/>
										</span>
									) : (
										<span>
											<i className="fa fa-heart-o" />
											<span style={savedCount ? { marginLeft: '5px' } : {}}>
												{savedCount || ' save'}
											</span>
										</span>
									)}
								</button>

								<FacebookShareButton
									style={{ borderColor: '#3C5A99' }}
									url={`https://huedeck.com/collection/${collection.id}`}
									className={s.iconBtn}
								>
									<i style={{ color: '#3C5A99' }} className="fa fa-facebook-f" />
								</FacebookShareButton>

								<TwitterShareButton
									style={{ borderColor: '#38A1F3' }}
									url={`https://huedeck.com/collection/${collection.id}`}
									className={s.iconBtn}
								>
									<i style={{ color: '#38A1F3' }} className="fa fa-twitter" />
								</TwitterShareButton>
							</div>

							<div className={s.tagListContainer}>
								{collection.tags.map(tag => (
									<div className={s.tag} key={tag.tagContent}>
										<span>{tag.tagContent}</span>
									</div>
								))}
							</div>

							<div className={s.descriptionContainer}>
								<p>{collection.description}</p>
							</div>

							{Boolean(collection.images.length) && (
								<div className={s.imgSlider}>
									<h2>See How it Looks</h2>
									<img src={collection.images[0].src} alt=" " />
								</div>
							)}
						</div>

						<div className={s.itemListSection}>
							<div className={s.paletteList}>
								{collection.palette.map((hex, i) => (
									// eslint-disable-next-line
						<div key={hex + i}>
										<div className={s.color} style={{ backgroundColor: hex }} />
									</div>
								))}
							</div>

							{addingToCart && (
								<div className={s.addingCartSpinner}>
									<i className="fa fa-spinner fa-spin" />
								</div>
							)}
							<div
								className={s.itemGridContainer}
								style={addingToCart ? { pointerEvents: 'none', opacity: 0.2 } : {}}
							>
								{collection.items.map(item => (
									<VariantItem
										addToCartOnClick={this.addToCartOnClick}
										key={item.VariantID}
										{...item.product}
										palette={collection.palette}
									/>
								))}
							</div>

							<div style={{ padding: '5% 0', textAlign: 'center' }}>
								<Link className={s.showMoreBtn} to={utils.goToShop(collection.palette)}>
									Shop more with this palette
								</Link>
							</div>
						</div>
					</div>

					<RelatedProduct palette={collection.palette} type="matching" />

					<Dialog
						open={activeProduct !== null}
						onClose={this.handleProductCtrlDialogClose}
						fullScreen={Boolean(screenSize.isMobileScreen)}
						fullWidth
						maxWidth="sm"
					>
						<CloseButton onClick={this.handleProductCtrlDialogClose} />
						<ProductCtrlDialog
							{...activeProduct}
							addToCart={v => this.addCartItem(v, activeProduct)}
							palette={collection.palette}
						/>
					</Dialog>

					<AddedCartDialog />
				</div>
			</div>
		);
	}
}

export default compose(
	connect(state => ({
		screenSize: state.screenSize,
	})),
	withStyles(s),
)(CollectionPage);
