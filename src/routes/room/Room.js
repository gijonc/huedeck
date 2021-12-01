/**
 *	Huedeck, Inc
 */

import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import cx from 'classnames';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { Drawer, Dialog, ClickAwayListener, Paper } from '@material-ui/core';
import { setAlertbar } from '../../actions/alertbar';
import { updatePreference } from '../../actions/updateDbUser';
import { fetchSimilarProduct } from '../../actions/getSimilarProduct';
import history from '../../history';
import { CloseButton, Loader } from '../../components/Utilities';
import colorMath from '../shop/colorMath';
import utils from '../utils';
import constants from '../constants';
import gqlQuery from '../gqlType';
import s from './Room.css';
import RoomEditor from './RoomEditor';
import CategoryView from './CategoryView';
import MasonryView from './MasonryView';
import Link from '../../components/Link';

const INIT_PREF = {
	style: [],
	colorMood: [],
	color: [],
	// default to be living room
	roomType: 'living-room',
};

class Room extends React.Component {
	static propTypes = {
		palette: PropTypes.arrayOf(PropTypes.string).isRequired,
		// eslint-disable-next-line
		screenSize: PropTypes.object.isRequired,
		// eslint-disable-next-line
		loggedIn: PropTypes.object,
	};

	static defaultProps = {
		loggedIn: null,
	};

	static contextTypes = {
		store: PropTypes.object.isRequired,
		client: PropTypes.object.isRequired,
	};

	state = {
		productList: [],
		categorySet: [],
		palette: [],
		activeSearchingProduct: {},
		similarItem: {
			newOffset: 0,
			itemList: [],
		},
		loadingSimilarItem: false,
		loadingRoom: false,
		openEditor: false,
		selectRoomOpen: false,
		view: 'masonry',
		preferenceState: INIT_PREF,
	};

	componentDidMount() {
		const { palette, loggedIn } = this.props;
		const { preferenceState } = this.state;

		if (loggedIn) {
			Object.keys(loggedIn.preference).forEach(key => {
				if (preferenceState[key] && loggedIn.preference[key])
					preferenceState[key] = loggedIn.preference[key];
			});
			// init preference for editor
			// eslint-disable-next-line
			this.setState({ preferenceState });
		}
		this.getRoom({ palette, ...preferenceState }, !palette.length);
	}

	componentDidUpdate(prevProps) {
		if (Boolean(prevProps.loggedIn) !== Boolean(this.props.loggedIn)) {
			window.location.reload();
		}

		// check URL params
		if (!utils.arraysEqual(this.props.palette, prevProps.palette)) {
			const { palette } = this.props;
			this.getRoom({ palette, ...this.state.preferenceState }, true);
		}
	}

	getRoom = (variables, updatePalette) => {
		if (updatePalette) {
			if (variables.palette.length && utils.arraysEqual(variables.palette, this.state.palette))
				return;
		}
		this.setState(
			{
				loadingRoom: true,
			},
			async () => {
				try {
					const res = await this.context.client
						.query({
							query: gqlQuery.fetchRoom,
							fetchPolicy: 'network-only',
							variables,
						})
						.then(r => r.data.fetchRoom);
					const { categorySet, palette } = res;
					const products = categorySet.map(c => c.products);
					const list = [].concat(...products);
					// const preShuffleList = await utils.preloadProductImg(list);
					const productList = await utils.shuffleArray(list);

					this.setState({
						loadingRoom: false,
						productList,
						categorySet,
						palette,
					});

					// update palette params in URL
					if (updatePalette) history.replace(utils.goToRoom(palette));
					window.scrollTo(0, 0);
				} catch (err) {
					this.context.store.dispatch(
						setAlertbar({
							status: 'error',
							message: utils.getGraphQLError(err, 'getRoom'),
							open: true,
						}),
					);
				}
			},
		);
	};

	fetchSimilarItems = async variables => {
		const data = await this.context.store.dispatch(fetchSimilarProduct(variables));
		if (data) {
			const { newOffset, products } = data;
			const productList = await utils.preloadProductImg(products);
			const newState = {
				newOffset,
				itemList: this.state.similarItem.itemList.concat(productList),
			};

			this.setState({
				similarItem: newState,
				loadingSimilarItem: false,
			});
		}
	};

	findSimilarProduct = pd => {
		const { similarItem, palette, activeSearchingProduct } = this.state;
		const variables = {
			activeColors: colorMath.hexArr2rgbArr(palette),
			excludeProductIds: [pd.ProductID],
			filters: JSON.stringify({
				category3: pd.category3,
			}),
		};

		if (pd.ProductID !== activeSearchingProduct.ProductID) {
			variables.lastOffset = 0;
			similarItem.itemList = [];
		} else {
			if (similarItem.newOffset === -1) return; // all item fetched
			variables.lastOffset = similarItem.newOffset;
		}

		this.setState(
			{
				activeSearchingProduct: pd,
				loadingSimilarItem: true,
			},
			() => this.fetchSimilarItems(variables),
		);
	};

	toggleSimListClose = () => {
		this.setState({
			activeSearchingProduct: {},
		});
	};

	toggleEditor = () => {
		this.setState(prevState => ({
			openEditor: !prevState.openEditor,
		}));
	};

	toggleSelectRoom = () => {
		const { selectRoomOpen } = this.state;
		this.setState({
			selectRoomOpen: !selectRoomOpen,
		});
	};

	applyPreferenceChanges = inputPreference => {
		const { preferenceState } = this.state;
		let palette = this.state.palette;

		if (
			!utils.arraysEqual(preferenceState.color, inputPreference.color) ||
			!utils.arraysEqual(preferenceState.colorMood, inputPreference.colorMood)
		) {
			palette = [];
		}

		this.getRoom({ palette, ...inputPreference });
		this.setState({
			preferenceState: inputPreference,
			openEditor: false,
			selectRoomOpen: false,
		});

		if (this.props.loggedIn) {
			this.context.store.dispatch(updatePreference(inputPreference));
		}
	};

	render() {
		const { screenSize } = this.props;
		const {
			productList,
			categorySet,
			palette,
			loadingRoom,
			loadingSimilarItem,
			similarItem,
			activeSearchingProduct,
			openEditor,
			view,
			selectRoomOpen,
			preferenceState,
		} = this.state;

		return (
			<div className={s.root}>
				<div className={s.container}>
					<div className={s.startWord}>
						<h1>Shop with ease!</h1>
						<p>
							Shop the aesthetic matching items for your home with Huedeck&apos;s Generated
							Color Palette
							<Link to="/how-it-works">
								<i className="fa fa-question-circle-o" />
							</Link>
						</p>
					</div>

					<Dialog
						fullScreen={screenSize.isMobileScreen}
						maxWidth="xs"
						fullWidth
						scroll="paper"
						open={openEditor}
						onClose={this.toggleEditor}
					>
						<CloseButton onClick={this.toggleEditor} />
						<RoomEditor
							initState={preferenceState}
							applyChange={this.applyPreferenceChanges}
						/>
					</Dialog>

					{loadingRoom && (
						<div className={s.loader}>
							<Loader />
						</div>
					)}

					<div style={loadingRoom ? { opacity: 0.3, pointerEvents: 'none' } : {}}>
						<div className={s.paletteContainer}>
							{palette.map((hex, i) => (
								// eslint-disable-next-line
							<div key={hex + i}>
									<div className={s.color} style={{ backgroundColor: hex }} />
								</div>
							))}
						</div>

						{Boolean(palette.length) && (
							<div className={s.controlBar}>
								<div className={s.viewSwitch}>
									<button
										className={cx(s.editBtn, view === 'masonry' && s.activeView)}
										onClick={() => this.setState({ view: 'masonry' })}
									>
										<i className="fa fa-th" />
									</button>
									<button
										className={cx(s.editBtn, view === 'list' && s.activeView)}
										onClick={() => this.setState({ view: 'list' })}
									>
										<i className="fa fa-bars" />
									</button>
								</div>

								<div>
									<div className={s.selectRoomWrapper}>
										<ClickAwayListener
											onClickAway={() => this.setState({ selectRoomOpen: false })}
										>
											<div>
												<button
													className={cx(s.editBtn, s.selectRoomBtn)}
													onClick={this.toggleSelectRoom}
												>
													{preferenceState.roomType.split('-').join(' ')}
												</button>

												{selectRoomOpen ? (
													<Paper
														style={{ position: 'absolute' }}
														className={s.menuList}
													>
														{constants.roomOptions.map(roomType => (
															<button
																key={roomType}
																onClick={() =>
																	this.applyPreferenceChanges({
																		...preferenceState,
																		roomType,
																	})
																}
																className={cx(
																	s.menuItem,
																	preferenceState.roomType === roomType &&
																		s.activeMenuItem,
																)}
															>
																{roomType.split('-').join(' ')}
															</button>
														))}
													</Paper>
												) : null}
											</div>
										</ClickAwayListener>
									</div>

									<button className={s.editBtn} onClick={this.toggleEditor}>
										<i className="fa fa-edit" />
										Edit my preference
									</button>
									<button
										className={s.editBtn}
										// onClick={() => this.getRoom({palette:[], ...preferenceState}, true)}
										onClick={() => history.push(utils.goToRoom({ palette: [] }))}
									>
										<i className="fa fa-random" />
										new palette
									</button>
								</div>
							</div>
						)}

						{view === 'masonry' ? (
							<MasonryView
								productList={productList}
								palette={palette}
								findSimPd={this.findSimilarProduct}
							/>
						) : (
							<CategoryView
								findSimPd={this.findSimilarProduct}
								categorySet={categorySet}
								palette={palette}
							/>
						)}
					</div>

					<Drawer
						anchor="right"
						open={Boolean(activeSearchingProduct.ProductID)}
						onClose={this.toggleSimListClose}
					>
						<div className={s.drawer}>
							<div className={s.drawerHead}>
								<strong>Similar Items</strong>
								<CloseButton onClick={this.toggleSimListClose} />
							</div>
							<div className={s.productList}>
								{similarItem.itemList.map(pd => (
									<a
										key={pd.ProductID}
										href={utils.goToProduct(pd.ProductID)}
										className={s.product}
										target="_blank"
										rel="noopener noreferrer"
									>
										<div className={s.productImgWrapper}>
											<div>
												<img src={pd.image} alt={pd.productName} />
											</div>
										</div>
										<div className={s.price}>
											{utils.getProductPrices(pd).map((price, i) => (
												<div className={i ? s.oldPrice : s.curPrice} key={price}>
													{price}
												</div>
											))}
										</div>
									</a>
								))}
							</div>

							<div className={s.simItemStatus}>
								{loadingSimilarItem && <i className="fa fa-spinner fa-spin" />}
								{!loadingSimilarItem && !similarItem.itemList.length && (
									<p>Oops, no similar item found.</p>
								)}
							</div>

							{!loadingSimilarItem && similarItem.newOffset !== -1 && (
								<button
									className={s.loadMoreBtn}
									onClick={() => this.findSimilarProduct(activeSearchingProduct)}
								>
									<span>load more</span>
								</button>
							)}
						</div>
					</Drawer>
				</div>
			</div>
		);
	}
}

export default compose(
	connect(state => ({
		screenSize: state.screenSize,
		loggedIn: state.loggedIn,
	})),
	withStyles(s),
)(Room);
