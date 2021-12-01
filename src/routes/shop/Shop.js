/**
 *	Huedeck, Inc
 */

import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import cx from 'classnames';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { Map } from 'immutable';
import { Slide, Dialog, Fade } from '@material-ui/core';
import { setAlertbar } from 'actions/alertbar';
import { setPaletteHistory, setPrevIndex, setNextIndex } from 'actions/paletteHistory';
import { setPaletteData } from 'actions/paletteData';
import gqlQuery from 'routes/gqlType';
import { CloseButton, Loader, ScrollToTopButton } from '../../components/Utilities';
import colorMath from './colorMath';
import Editor from './Editor/Editor';
import FilterBar from './FilterBar/FilterBar';
import PaletteItem from './PaletteItem/PaletteItem';
import utils from '../utils';
import constants from '../constants';
import Link from '../../components/Link';
import history from '../../history';
import s from './Shop.css';

const paletteHistoryType = {
	history: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)).isRequired,
	index: PropTypes.number.isRequired,
	max: PropTypes.number,
};

class Shop extends React.Component {
	static propTypes = {
		paletteHistory: PropTypes.shape(paletteHistoryType).isRequired,
		hexArr: PropTypes.arrayOf(PropTypes.string).isRequired,
		page: PropTypes.number.isRequired,
		// eslint-disable-next-line
    screenSize: PropTypes.object.isRequired,
	};

	static contextTypes = {
		store: PropTypes.object.isRequired,
		client: PropTypes.object.isRequired,
	};

	state = {
		generating: true,
		saveToPaletteHistory: true,
		scrolledBelowPalette: false,
		openEditor: false,
		hexArr: [],
		roomSetList: [],
		filterHistory: {},
		totalCount: 0,
	};

	componentDidMount() {
		const { page } = this.props;
		if (page > 0) {
			this.generateFilter({ page });
		} else {
			this.getNewRoom(this.props.hexArr);
		}
		window.addEventListener('scroll', this.getCurrentScrolltop);
	}

	componentDidUpdate(prevProps) {
		if (!utils.arraysEqual(prevProps.hexArr, this.props.hexArr)) {
			this.getNewRoom(this.props.hexArr);
		}

		if (this.props.page > 0 && prevProps.page !== this.props.page) {
			const { page } = this.props;
			this.generateFilter({ page });
		}
	}

	componentWillUnmount() {
		window.removeEventListener('scroll', this.getCurrentScrolltop);
		this.context.store.dispatch(
			setPaletteData({
				paletteHexArr: [],
				itemListArr: [],
				reload: true,
				view: 'room',
			}),
		);
	}

	getCurrentScrolltop = () => {
		if (this.paletteRef) {
			const { bottom } = this.paletteRef.getBoundingClientRect();
			const { scrolledBelowPalette } = this.state;
			if (bottom <= 1 && !scrolledBelowPalette) {
				this.setState({
					scrolledBelowPalette: true,
				});
			} else if (bottom > 1 && scrolledBelowPalette) {
				this.setState({
					scrolledBelowPalette: false,
				});
			}
		}
	};

	getNewRoom = hexArr => {
		let rgbArr = [];
		if (hexArr && hexArr.length === constants.MAX_PALETTE_LENGTH) {
			if (utils.arraysEqual(hexArr, this.state.hexArr)) return;
			rgbArr = colorMath.hexArr2rgbArr(hexArr);
		}

		const inputVariables = {
			renew: true,
			roomSetList: [],
			color: {
				rgbArr,
				getAI: !rgbArr.length,
			},
		};

		this.setState({
			roomSetList: [],
			filterHistory: {}, // remove all filters when generated new room
			openEditor: false,
		});

		this.generateRoom(inputVariables);
	};

	// for room generator
	handleRoomRenew = () => {
		const { hexArr, roomSetList } = this.state;
		const inputVariables = {
			renew: false,
			roomSetList,
			color: {
				rgbArr: colorMath.hexArr2rgbArr(hexArr), // use present palette
				getAI: false,
			},
		};
		this.generateRoom(inputVariables);
	};

	pagePalette = async act => {
		const { store } = this.context;
		const { paletteHistory } = store.getState();
		const curIndex = paletteHistory.index;
		if (act === 'back' && curIndex > 0) {
			await this.setState({ saveToPaletteHistory: false });
			await store.dispatch(setPrevIndex());
			this.getNewRoom(paletteHistory.history[curIndex - 1]);
		} else if (act === 'next' && curIndex < paletteHistory.history.length - 1) {
			await this.setState({ saveToPaletteHistory: false });
			await store.dispatch(setNextIndex());
			this.getNewRoom(paletteHistory.history[curIndex + 1]);
		}
	};

	changeProductView = view => {
		if (view === 'room') {
			this.handleRoomRenew();
		} else {
			history.push(utils.goToShop(this.state.hexArr, 1));
		}
	};

	generateRoom = async inputVariables => {
		const { client, store } = this.context;

		try {
			this.setState({ generating: true });
			const res = await client.query({
				query: gqlQuery.getProductByRoom,
				fetchPolicy: 'network-only',
				variables: inputVariables,
			});

			const { getProductByRoom } = res.data;
			const { rgb, roomSetList, products } = getProductByRoom;

			// remove remaining items that are enough for a row to display
			const { length } = products;
			const remain = length % (this.props.screenSize.isMobileScreen ? 2 : 5); // make length be the multipe of 5 in big screen
			const itemListArr = products.slice(0, length - remain);

			const newHexArr = colorMath.rgbArr2hexArr(rgb);
			history.replace(utils.goToShop(newHexArr));

			if (this.state.saveToPaletteHistory) {
				store.dispatch(setPaletteHistory({ palette: newHexArr }));
			}

			// put this first
			this.setState({
				saveToPaletteHistory: true,
				hexArr: newHexArr,
				roomSetList,
				generating: false,
			});

			store.dispatch(
				setPaletteData({
					paletteHexArr: newHexArr,
					itemListArr,
					view: 'room',
				}),
			);
		} catch (err) {
			store.dispatch(
				setAlertbar({
					status: 'error',
					message: utils.getGraphQLError(err, 'generateRoom'),
					open: true,
				}),
			);
		}
	};

	// generate data fitler, update products only
	generateFilter = async input => {
		let updatePalette = true;
		let preUpdateFilterObj = Map(this.state.filterHistory).toObject();
		const inputHexArr = this.state.hexArr.length ? this.state.hexArr : this.props.hexArr;

		// update filter
		if (input.key) {
			if (input.key !== 'reset') {
				const { key, value } = input;
				preUpdateFilterObj[key] = value;
			} else {
				preUpdateFilterObj = {};
			}
			history.replace(utils.goToShop(inputHexArr));
		}

		this.setState({
			filterHistory: preUpdateFilterObj,
			generating: true,
		});

		//  put this after saving to history: not saving activeColors
		if (preUpdateFilterObj.activeColors) {
			updatePalette = false;
		} else {
			preUpdateFilterObj.activeColors = colorMath.hexArr2rgbArr(inputHexArr);
		}

		try {
			const res = await this.context.client.query({
				query: gqlQuery.getProductByPalette,
				variables: {
					filters: preUpdateFilterObj,
					page: input.page,
				},
				fetchPolicy: 'network-only',
			});
			const { getProductByPalette } = res.data;
			if (getProductByPalette) {
				const newPalette = updatePalette
					? colorMath.rgbArr2hexArr(getProductByPalette.rgb)
					: inputHexArr;
				this.setState(
					{
						generating: false,
						totalCount: getProductByPalette.totalCount,
						hexArr: newPalette,
					},
					() => {
						this.context.store.dispatch(
							setPaletteData({
								itemListArr: getProductByPalette.products,
								paletteHexArr: newPalette,
							}),
						);
					},
				);
				window.scrollTo(0, 0);
			}
		} catch (err) {
			this.context.store.dispatch(
				setAlertbar({
					status: 'error',
					message: utils.getGraphQLError(err, 'generateFilter'),
					open: true,
				}),
			);
		}
	};

	togglePaletteEditor = () => {
		this.setState({
			openEditor: !this.state.openEditor,
		});
	};

	render() {
		const {
			generating,
			hexArr,
			scrolledBelowPalette,
			openEditor,
			filterHistory,
			totalCount,
		} = this.state;

		const { paletteHistory, screenSize, page } = this.props;

		return (
			<div className={s.root}>
				<div className={s.container}>
					<div className={s.subHeader}>
						<div className={s.startWord}>
							<h1>Shop with ease!</h1>
							<p>
								Shop the aesthetic matching items for your home with Huedeck&apos;s
								Generated Color Palette
								<Link to="/how-it-works">
									<i className="fa fa-question-circle-o" />
								</Link>
							</p>
						</div>
						<FilterBar
							submitData={(key, value) =>
								this.generateFilter({
									key,
									value,
								})
							}
							hexArr={hexArr}
						/>

						<div className={s.controlBar}>
							<button
								className={cx(s.ctrlBtn, s.pickColorBtn)}
								onClick={this.togglePaletteEditor}
							>
								pick your color
							</button>

							<button className={s.ctrlBtn} onClick={() => this.getNewRoom()}>
								lucky color
							</button>

							<button
								className={cx(s.ctrlBtn, paletteHistory.index <= 0 && s.disabledCtrlBtn)}
								onClick={() => this.pagePalette('back')}
							>
								<i className="fa fa-undo" />
							</button>
							<button
								className={cx(
									s.ctrlBtn,
									paletteHistory.index === paletteHistory.history.length - 1 &&
										s.disabledCtrlBtn,
								)}
								onClick={() => this.pagePalette('next')}
							>
								<i className={cx('fa fa-undo', s.redoIcon)} />
							</button>
						</div>
					</div>

					{/* Palette after scrolled */}
					<Slide direction="down" in={scrolledBelowPalette} mountOnEnter unmountOnExit>
						<div className={s.fixedPalette}>
							{hexArr.map((hex, i) => (
								// eslint-disable-next-line
						<div key={hex+i} style={{ backgroundColor: hex}}/>
							))}
						</div>
					</Slide>

					{/* Palette in normal */}
					<div
						className={s.paletteContainer}
						ref={node => {
							this.paletteRef = node;
						}}
					>
						{hexArr.map((hex, i) => (
							// eslint-disable-next-line
						<div key={hex + i}>
								<Fade in timeout={800}>
									<div className={s.color} style={{ backgroundColor: hex }} />
								</Fade>
							</div>
						))}
					</div>

					{/* products */}
					{generating ? (
						<Loader />
					) : (
						<PaletteItem
							changeProductView={this.changeProductView}
							hideTopSellerTag={filterHistory.order === 'topseller'}
							tally={totalCount}
							activePage={page || 1}
						/>
					)}

					{/* editor popup */}
					<Dialog
						disableBackdropClick
						fullScreen={screenSize.isMobileScreen}
						maxWidth="sm"
						scroll="paper"
						open={openEditor}
						onClose={this.togglePaletteEditor}
					>
						<CloseButton onClick={this.togglePaletteEditor} />
						<Editor palette={hexArr} />
					</Dialog>

					<ScrollToTopButton showUnder={250} />
				</div>
			</div>
		);
	}
}

export default compose(
	connect(state => ({
		paletteHistory: state.paletteHistory,
		screenSize: state.screenSize,
	})),
	withStyles(s),
)(Shop);
