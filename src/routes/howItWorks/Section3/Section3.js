/**
 * Huedeck, Inc
 */
import React from 'react';
import { AddPhotoAlternate, Check } from '@material-ui/icons';
import { Zoom, Grow, Fade } from '@material-ui/core';
import cx from 'classnames';
import Dropzone from 'react-dropzone';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import ImageLoader from 'react-load-image';
import utils from 'routes/utils';
import constants from 'routes/constants';
import imageHelper from 'routes/shop/Editor/imageHelper';
import colorMath from 'routes/shop/colorMath';
import gqlQuery from 'routes/gqlType';
import { setAlertbar } from 'actions/alertbar';
import Link from '../../../components/Link';
import s from './Section3.css';

const RESULT_MAX = 2;
const RESULT_ITEM_MAX = 6;

class Section3 extends React.Component {
	static propTypes = {
		imgUrl: PropTypes.string.isRequired,
	};

	static contextTypes = {
		store: PropTypes.object.isRequired,
		client: PropTypes.object.isRequired,
	};

	state = {
		generating: false,
		activHexArr: [],
		designResult: [],
		imgPreviewUrl: null,
		paletteAction: 'picker',
	};

	onImgDrop = async imageFile => {
		const file = imageFile[0];
		const imgPreviewUrl = URL.createObjectURL(file);
		const imgData = await imageHelper.getImgData(imgPreviewUrl, this.previewImg);
		const hexArr = await imageHelper.getImgPalette(imgData, 10);

		this.setState({
			activHexArr: hexArr,
			imgPreviewUrl,
		});
	};

	getMoreResults = async () => {
		const { designResult } = this.state;
		if (designResult.length !== RESULT_MAX) return;
		this.setState({
			generating: true,
		});

		const promises = designResult.map(design => this.generateProduct(design.rgb, false));

		const data = await Promise.all(promises);
		if (data && data.length) {
			this.setState({
				designResult: data,
				generating: false,
			});
		}
	};

	handlePaletteAct = action => {
		if (this.state.paletteAction === action) return;
		this.setState({
			paletteAction: action || this.state.paletteAction,
			activHexArr: [],
			imgPreviewUrl: null,
		});
	};

	handleBasePickerColorOnClick = hex => {
		const { activHexArr } = this.state;
		const index = activHexArr.indexOf(hex);
		if (index === -1) {
			activHexArr.push(hex);
		} else {
			activHexArr.splice(index, 1);
		}
		this.setState({ activHexArr });
	};

	handleGenerateOnClick = async () => {
		const { activHexArr, paletteAction } = this.state;
		if (!activHexArr.length || !paletteAction) return;

		this.setState({
			generating: true,
		});

		const promises = [];
		let shuffledList = [];
		let rgbArr = [];
		let setFuzzy = false;
		if (activHexArr.length > 2) {
			shuffledList = utils.shuffleArray(activHexArr);
		} else {
			shuffledList = activHexArr;
		}
		for (let i = 0; i < RESULT_MAX; i += 1) {
			if (paletteAction === 'picture') {
				const avg = shuffledList.length / RESULT_MAX;
				const begin = i * avg;
				const end = i === RESULT_MAX - 1 ? shuffledList.length : begin + avg;
				const inputCandidates = shuffledList.slice(begin, end);
				const inputHexArr = colorMath.sortHexArr(inputCandidates);
				rgbArr = colorMath.hexArr2rgbArr(inputHexArr);
			} else {
				rgbArr = [...Array(constants.MAX_PALETTE_LENGTH)].map(() => Array(0));
				if (shuffledList.length < 2 + 1) {
					const inputCandidates = shuffledList.slice(0);
					while (inputCandidates.length) {
						const inputIndex = utils.getRandomInt(0, constants.MAX_PALETTE_LENGTH);
						if (rgbArr[inputIndex].length === 0) {
							rgbArr[inputIndex] = colorMath.hex2rgb(inputCandidates[0]);
							inputCandidates.splice(0, 1); // pop the first element in array
						}
					}
				} else {
					const avg = shuffledList.length / RESULT_MAX;
					const begin = i * avg;
					const end = i === RESULT_MAX - 1 ? shuffledList.length : begin + avg;
					const inputCandidates = shuffledList.slice(begin, end);
					setFuzzy = false;
					if (inputCandidates.length > 2) {
						setFuzzy = true;
					}
					if (inputCandidates.length > constants.MAX_PALETTE_LENGTH - 2) {
						// slice and make sure we won't get into infinite loop
						inputCandidates.splice(constants.MAX_PALETTE_LENGTH - 2);
					}
					while (inputCandidates.length) {
						const inputIndex = utils.getRandomInt(0, constants.MAX_PALETTE_LENGTH);
						if (rgbArr[inputIndex].length === 0) {
							rgbArr[inputIndex] = colorMath.hex2rgb(inputCandidates[0]);
							inputCandidates.splice(0, 1); // pop the first element in array
						}
					}
				}
			}
			promises.push(this.generateProduct(rgbArr, setFuzzy, i));
		}

		const data = await Promise.all(promises);

		if (data && data.length === RESULT_MAX) {
			this.setState({
				designResult: data,
				generating: false,
			});
		}
	};

	generateProduct = async (rgbArr, setFuzzy, idx) => {
		const { client, store } = this.context;
		const inputVariables = {
			foo: idx, // this is NOT an API params but for concurrent API calls
			itemNumPerColor: 10,
			color: {
				rgbArr,
				setFuzzy,
				getAI: this.state.paletteAction === 'picker',
			},
		};

		try {
			const res = await client.query({
				query: gqlQuery.getProductByColor,
				fetchPolicy: 'network-only',
				variables: inputVariables,
			});

			const { getProductByColor } = res.data;
			if (getProductByColor) {
				return getProductByColor;
			}
		} catch (err) {
			store.dispatch(
				setAlertbar({
					status: 'error',
					message: __DEV__ ? `[generateData] -> ${err.message}` : constants.errMsg,
					open: true,
				}),
			);
		}
		return false;
	};

	PICKER_OPTION_NUM = 8;

	render() {
		const samplePalette1 = ['#515767', '#B8904C', '#ADB79E', '#A29086', '#DAD6CE'];
		const samplePalette2 = ['#3C2037', '#7B4E82', '#A88190', '#CE947E', '#F9E5CE'];

		const { activHexArr, paletteAction, imgPreviewUrl, designResult, generating } = this.state;

		return (
			<div className={s.section}>
				{typeof window !== 'undefined' && (
					<div className={s.container}>
						<div className={s.leftPart}>
							<h2>Create your palette</h2>
							<div className={s.editOption}>
								<button
									className={cx(
										s.paletteActBtn,
										paletteAction === 'picker' && s.paletteActBtnActive,
									)}
									onClick={() => this.handlePaletteAct('picker')}
								>
									Choose a Palette
								</button>

								<p>OR</p>

								<button
									className={cx(
										s.paletteActBtn,
										paletteAction === 'picture' && s.paletteActBtnActive,
									)}
									onClick={() => this.handlePaletteAct('picture')}
								>
									Upload a Picture
								</button>
							</div>

							<div className={s.paletteContent}>
								{paletteAction === 'picture' && (
									<Grow
										in={paletteAction === 'picture'}
										style={{ transformOrigin: 'center top 0' }}
									>
										<div>
											<Dropzone
												className={s.dropZone}
												multiple={false}
												accept="image/*"
												onDrop={this.onImgDrop}
												style={
													imgPreviewUrl
														? { backgroundImage: `url('${imgPreviewUrl}')` }
														: {}
												}
											>
												{!imgPreviewUrl && (
													<div>
														<AddPhotoAlternate />
													</div>
												)}
											</Dropzone>

											<canvas
												ref={c => {
													this.previewImg = c;
												}}
												style={{ display: 'none' }}
											/>
										</div>
									</Grow>
								)}

								{paletteAction === 'picker' && (
									<Grow
										in={paletteAction === 'picker'}
										style={{ transformOrigin: 'center top 0' }}
									>
										<div>
											<p>Choose your favorite colors for your palette</p>
											<div className={s.colorPicker}>
												{constants.colorPickerList.map(color => (
													<button
														// eslint-disable-next-line
											key={color.name}
														onClick={() =>
															this.handleBasePickerColorOnClick(color.hex)
														}
														style={{ backgroundColor: color.hex }}
													>
														<Zoom in={activHexArr.indexOf(color.hex) !== -1}>
															<Check
																style={{
																	color: colorMath.getContrastYIQ(color.hex),
																}}
															/>
														</Zoom>
													</button>
												))}
											</div>
											{/* <p>Click on the color you like</p> */}
										</div>
									</Grow>
								)}

								<Grow in={Boolean(activHexArr.length)}>
									<div>
										<button
											disabled={!activHexArr.length || generating}
											className={s.generateBtn}
											onClick={this.handleGenerateOnClick}
										>
											{generating ? (
												<i className="fa fa-spinner fa-spin" />
											) : (
												'generating'
											)}
										</button>
										<button
											className={s.resetBtn}
											disabled={!activHexArr.length}
											onClick={() => this.handlePaletteAct(null)}
										>
											Clear
										</button>
									</div>
								</Grow>
							</div>
						</div>

						<div className={s.rightPart}>
							<h1>
								Design
								<br /> by Huedeck
							</h1>

							<div style={{ opacity: generating ? 0.3 : 1 }}>
								{designResult.length ? (
									<div style={{ textAlign: 'center' }}>
										<div className={s.designSample}>
											{designResult.map((design, idx) => (
												// eslint-disable-next-line
								<div className={s.card} key={idx}>
													<div className={s.cardImgContainer}>
														{design.products.slice(0, RESULT_ITEM_MAX).map(pd => (
															<Link
																to={utils.goToProduct(
																	pd.ProductID,
																	colorMath.rgbArr2hexArr(design.rgb),
																)}
																key={pd.ProductID}
																className={s.imgWrapper}
															>
																<ImageLoader src={pd.image}>
																	<Fade in timeout={200}>
																		<img alt={pd.productName} />
																	</Fade>
																	<div>Error!</div>
																	<div />
																</ImageLoader>
															</Link>
														))}
													</div>

													<div className={s.cardPalette}>
														<div className={s.paletteWrapper}>
															{colorMath.rgbArr2hexArr(design.rgb).map((hex, i) => (
																// eslint-disable-next-line
										<Fade in key={hex + i}>
																	<div
																		className={s.colorBlock}
																		style={{ backgroundColor: hex }}
																	/>
																</Fade>
															))}
														</div>

														<Link
															className={s.button}
															to={utils.goToShop(
																colorMath.rgbArr2hexArr(design.rgb),
															)}
														>
															Shop now
														</Link>
													</div>
												</div>
											))}
										</div>

										<button className={s.moreBtn} onClick={this.getMoreResults}>
											more results
										</button>
									</div>
								) : (
									<div className={s.designSample}>
										<div className={s.card}>
											<img src={`${this.props.imgUrl}s3_p1.jpg`} alt=" " />
											<div className={s.cardPalette}>
												<div className={s.paletteWrapper}>
													{samplePalette1.map((hex, i) => (
														<div
															// eslint-disable-next-line
										key={hex + i}
															className={s.colorBlock}
															style={{ backgroundColor: hex }}
														/>
													))}
												</div>
												<Link className={s.button} to={utils.goToShop(samplePalette1)}>
													Shop now
												</Link>
											</div>
										</div>

										<div className={s.card}>
											<img src={`${this.props.imgUrl}s3_p2.jpg`} alt=" " />
											<div className={s.cardPalette}>
												<div className={s.paletteWrapper}>
													{samplePalette2.map((hex, i) => (
														<div
															// eslint-disable-next-line
										key={hex + i}
															className={s.colorBlock}
															style={{ backgroundColor: hex }}
														/>
													))}
												</div>
												<Link className={s.button} to={utils.goToShop(samplePalette2)}>
													Shop now
												</Link>
											</div>
										</div>
									</div>
								)}
							</div>
						</div>
					</div>
				)}
			</div>
		);
	}
}

export default withStyles(s)(Section3);
