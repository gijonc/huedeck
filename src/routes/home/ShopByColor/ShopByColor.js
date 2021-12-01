/**
 * Huedeck, Inc.
 */

import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { Fade, Dialog } from '@material-ui/core';
import { NavigateBefore, NavigateNext } from '@material-ui/icons';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import utils from '../../utils';
import Link from '../../../components/Link';
import { CloseButton } from '../../../components/Utilities';
import Editor from '../../shop/Editor/Editor';
import s from './ShopByColor.css';

class ShopByColor extends React.Component {
	static propTypes = {
		title: PropTypes.string.isRequired,
		subtitle: PropTypes.string.isRequired,
		showCase: PropTypes.arrayOf(
			PropTypes.shape({
				palette: PropTypes.arrayOf(PropTypes.string),
				products: PropTypes.arrayOf(PropTypes.object),
			}),
		).isRequired,
		// eslint-disable-next-line
		screenSize: PropTypes.object.isRequired,
	};

	static contextTypes = {
		store: PropTypes.object.isRequired,
		client: PropTypes.object.isRequired,
	};

	state = {
		curShowCaseIdx: 0,
		openEditor: false,
		loadedImgCount: 0,
	};

	componentDidMount() {
		this.preloadImage();
	}

	componentDidUpdate(prevProps, prevState) {
		if (prevState.loadedImgCount !== this.state.loadedImgCount) {
			if (this.state.loadedImgCount === this.props.showCase.length * 5) {
				this.startPaletteRotation();
			}
		}
	}

	componentWillUnmount() {
		this.stopPaletteRotaion();
	}

	preloadImage = () => {
		const { showCase } = this.props;
		const imgList = [];
		for (let i = 0, iLen = showCase.length; i < iLen; i += 1) {
			const curPdList = showCase[i].products;
			for (let j = 0, jLen = curPdList.length; j < jLen; j += 1) {
				imgList.push(curPdList[j].image);
			}
		}

		for (let i = 0, len = imgList.length; i < len; i += 1) {
			const img = new Image();
			img.onload = () => {
				this.setState({
					loadedImgCount: this.state.loadedImgCount + 1,
				});
			};
			img.src = imgList[i];
		}
	};

	startPaletteRotation = () => {
		if (!this.timer) {
			this.timer = setInterval(this.rotatePalette, 5000);
		}
	};

	stopPaletteRotaion = () => {
		if (this.timer) {
			clearInterval(this.timer);
			this.timer = null;
		}
	};

	rotatePalette = () => {
		const { curShowCaseIdx } = this.state;
		if (curShowCaseIdx === this.props.showCase.length - 1) {
			this.setState({
				curShowCaseIdx: 0,
			});
		} else {
			this.setState({
				curShowCaseIdx: curShowCaseIdx + 1,
			});
		}
	};

	togglePaletteEditor = () => {
		this.setState({
			openEditor: !this.state.openEditor,
		});
	};

	goToShowCase = idx => {
		this.stopPaletteRotaion();
		const { length } = this.props.showCase;
		let nextIdx = idx;
		if (nextIdx === length) {
			// hit to the tail of list
			nextIdx = 0;
		} else if (nextIdx < 0) {
			// hit to the head of list
			nextIdx = length - 1;
		}

		this.setState({
			curShowCaseIdx: nextIdx,
		});

		this.startPaletteRotation();
	};

	timer = null;

	render() {
		const { curShowCaseIdx, openEditor, loadedImgCount } = this.state;
		const { showCase, title, subtitle } = this.props;

		const curShowCase = showCase[curShowCaseIdx];

		return (
			<div className={s.container}>
				<h1>
					{title}
					<Link to="/how-it-works">
						<i className="fa fa-question-circle-o" />
					</Link>
				</h1>

				<p>{subtitle}</p>

				{typeof window !== 'undefined' && loadedImgCount === showCase.length * 5 ? (
					<div className={s.shopByColor}>
						<div className={s.navBtnBack}>
							<button
								className={s.navBtn}
								onClick={() => this.goToShowCase(curShowCaseIdx + 1)}
							>
								<NavigateNext />
							</button>
						</div>

						<div className={s.navBtnForward}>
							<button
								className={s.navBtn}
								onClick={() => this.goToShowCase(curShowCaseIdx - 1)}
							>
								<NavigateBefore />
							</button>
						</div>

						<div className={s.productList}>
							{curShowCase.products.map(pd => (
								<Fade key={pd.id} in timeout={1500}>
									<Link
										className={s.productImgWrapper}
										to={utils.goToProduct(pd.id, curShowCase.palette)}
									>
										<img src={pd.image} alt=" " />
									</Link>
								</Fade>
							))}
						</div>

						<div className={s.paletteList}>
							{curShowCase.palette.map((hex, i) => (
								// eslint-disable-next-line
						<div key={hex + i}>
									<Fade in timeout={1500}>
										<div className={s.color} style={{ backgroundColor: hex }} />
									</Fade>
								</div>
							))}
						</div>

						<div className={s.subNavList}>
							{showCase.map((foo, i) => (
								<button
									onClick={() => this.goToShowCase(i)}
									// eslint-disable-next-line
                  key={i}
									style={i === curShowCaseIdx ? { background: 'grey' } : {}}
								/>
							))}
						</div>

						<div className={s.btnGroup}>
							<Link
								onMouseEnter={this.stopPaletteRotaion}
								onMouseLeave={this.startPaletteRotation}
								to={utils.goToShop(curShowCase.palette)}
								className={s.shopPaletteBtn}
							>
								Shop these Colors
							</Link>

							<button className={s.pickColorBtn} onClick={this.togglePaletteEditor}>
								Pick your Color
							</button>
							<Dialog
								disableBackdropClick
								fullScreen={Boolean(this.props.screenSize.isMobileScreen)}
								maxWidth="sm"
								scroll="paper"
								open={openEditor}
								onClose={this.togglePaletteEditor}
							>
								<CloseButton onClick={this.togglePaletteEditor} />
								<Editor palette={curShowCase.palette} />
							</Dialog>
						</div>
					</div>
				) : (
					<div style={{ padding: '7% 0' }} />
				)}
			</div>
		);
	}
}

export default compose(
	connect(state => ({
		screenSize: state.screenSize,
	})),
	withStyles(s),
)(ShopByColor);
