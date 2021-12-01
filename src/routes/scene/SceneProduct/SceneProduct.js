/**
 * Huedeck, Inc.
 */

import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { FacebookShareButton, TwitterShareButton, PinterestShareButton } from 'react-share';
// import cx from 'classnames';
import PropTypes from 'prop-types';
import { Popper, Paper, ClickAwayListener } from '@material-ui/core';
import utils from '../../utils';
import s from './SceneProduct.css';

class SceneProduct extends React.Component {
	static propTypes = {
		// eslint-disable-next-line
	 products: PropTypes.arrayOf(PropTypes.object).isRequired,
		largeImage: PropTypes.string.isRequired,
		smallImage: PropTypes.string.isRequired,
		// eslint-disable-next-line
    screenSize: PropTypes.object.isRequired,
		goBack: PropTypes.func.isRequired,
	};

	state = {
		imageSrc: this.props.screenSize.width > 480 ? this.props.largeImage : this.props.smallImage,
		largeImageLoaded: false,
		openPopup: false,
	};

	componentDidMount() {
		this.initScene();
	}

	initScene = () => {
		this.setState(
			{
				largeImageLoaded: false,
			},
			() => {
				const img = new Image();
				img.onload = () => {
					this.setState({ largeImageLoaded: true });
				};
				img.src = this.state.imageSrc;
			},
		);
	};

	openPopup = () => {
		this.setState({
			openPopup: !this.state.openPopup,
		});
	};

	closePopup = () => {
		this.setState({
			openPopup: false,
		});
	};

	socialShareGroup = () => (
		<div className={s.shareIconGroup}>
			<span>Share this scene</span>
			{typeof window !== 'undefined' && (
				<div>
					<FacebookShareButton
						style={{ background: '#3C5A99' }}
						url={window.location.href}
						className={s.shareIcon}
						hashtag="#huedeck"
					>
						<i className="fa fa-facebook-f" />
					</FacebookShareButton>

					<TwitterShareButton
						style={{ background: '#38A1F3' }}
						className={s.shareIcon}
						title="A lovely room scene from Huedeck..."
						url={window.location.href}
						hashtags={['huedeck']}
						via="huedeck"
					>
						<i className="fa fa-twitter" />
					</TwitterShareButton>

					<PinterestShareButton
						style={{ background: '#c8232c' }}
						media={this.props.smallImage}
						url={window.location.href}
						className={s.shareIcon}
					>
						<i className="fa fa-pinterest-p" />
					</PinterestShareButton>
				</div>
			)}
		</div>
	);

	render() {
		const { largeImageLoaded, imageSrc, openPopup } = this.state;
		const { products, smallImage } = this.props;

		return (
			<div className={s.container}>
				<div className={s.content}>
					<div className={s.leftPart}>
						<div className={s.sceneImage}>
							<img
								style={!largeImageLoaded ? { height: '100%' } : {}}
								src={largeImageLoaded ? imageSrc : smallImage}
								alt=""
							/>
						</div>

						{typeof window !== 'undefined' && (
							<div className={s.sceneCtrl}>
								<button className={s.backBtn} onClick={this.props.goBack}>
									<i className="fa fa-chevron-left" />
									Scene
								</button>

								<button
									onClick={this.openPopup}
									className={s.sharePopupBtn}
									ref={node => {
										this.anchorEl = node;
									}}
									aria-owns="popper"
									aria-haspopup="true"
								>
									<i className="fa fa-share-alt" />
									Share
								</button>
							</div>
						)}

						<Popper
							open={openPopup}
							anchorEl={this.anchorEl}
							disablePortal
							placement="bottom-start"
							className={s.filterPopper}
						>
							<Paper>
								<ClickAwayListener onClickAway={this.closePopup}>
									{this.socialShareGroup()}
								</ClickAwayListener>
							</Paper>
						</Popper>
					</div>

					<div className={s.productList}>
						{products.map(pd => (
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
				</div>
			</div>
		);
	}
}

export default withStyles(s)(SceneProduct);
