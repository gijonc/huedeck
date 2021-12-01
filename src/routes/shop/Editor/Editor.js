/**
 *	Huedeck, Inc
 */
import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import cx from 'classnames';
import Dropzone from 'react-dropzone';
import { Grow, Zoom, Collapse, ButtonBase, ClickAwayListener, Tooltip } from '@material-ui/core';
import { AddPhotoAlternate, Check, Undo } from '@material-ui/icons';
import { setAlertbar } from 'actions/alertbar';
import gqlQuery from 'routes/gqlType';
import utils from 'routes/utils';
import constants from 'routes/constants';
import imageHelper from './imageHelper';
import history from '../../../history';
import colorMath from '../colorMath';
import ColorPicker from './ColorPicker';
import s from './Editor.css';

class Editor extends React.Component {
	static propTypes = {
		palette: PropTypes.arrayOf(PropTypes.string).isRequired,
	};

	static contextTypes = {
		store: PropTypes.object.isRequired,
		client: PropTypes.object.isRequired,
	};

	state = {
		generating: false,
		lastEditHexArr: [],
		editorHexArr: [],
		customizeColorList: [],
		baseColorList: [],
		editingOption: 'random',
		activeColorPicker: -1,
		imgPreviewUrl: null,
	};

	componentDidMount() {
		// eslint-disable-next-line react/no-did-mount-set-state
		this.setState({
			lastEditHexArr: this.props.palette.slice(),
		});
	}

	onImgDrop = async imageFile => {
		const file = imageFile[0];
		const imgPreviewUrl = URL.createObjectURL(file);
		this.setState({
			generating: true,
			imgPreviewUrl,
		});
		const imgData = await imageHelper.getImgData(imgPreviewUrl, this.previewImg);
		const imgColors = await imageHelper.getImgPalette(imgData, 10);
		const hexArr = colorMath.sortHexArr(imgColors).slice(0, 5);
		this.setEditorPalette(hexArr, true);
		this.setState({ imgData }); // save image data for reload
	};

	setEditorPalette = async (hexArr, sortPalette) => {
		const { editorHexArr } = this.state;
		const inputHexArr = sortPalette ? colorMath.sortHexArr(hexArr) : hexArr;
		this.setState({
			editorHexArr: inputHexArr,
			generating: false,
		});

		// save last palette to previous palette
		if (editorHexArr.length && !utils.arraysEqual(editorHexArr, hexArr)) {
			this.setState({
				lastEditHexArr: Array.from(editorHexArr),
			});
		}
	};

	setRandomPalette = async () => {
		await this.setState({ generating: true });
		const { baseColorList } = this.state;
		const rgbArr = [...Array(constants.MAX_PALETTE_LENGTH)].map(() => Array(0));
		let setFuzzy = false;
		if (baseColorList.length < 3) {
			const inputCandidates = baseColorList.slice(0);
			while (inputCandidates.length) {
				const inputIndex = utils.getRandomInt(0, constants.MAX_PALETTE_LENGTH);
				if (rgbArr[inputIndex].length === 0) {
					rgbArr[inputIndex] = colorMath.hex2rgb(inputCandidates[0]);
					inputCandidates.splice(0, 1); // pop the first element in array
				}
			}
		} else {
			setFuzzy = true;
			let inputCandidates = baseColorList.slice(0);
			if (baseColorList.length > constants.MAX_PALETTE_LENGTH - 2) {
				// shuffle it before we chop it
				inputCandidates = utils.shuffleArray(inputCandidates);
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
		const input = {
			lockedArr: rgbArr,
			setFuzzy,
		};
		const result = await this.fetchAIColor(input);
		if (result && result.length) {
			this.setEditorPalette(result, true);
		}
	};

	// option: customize
	setCustomizeColorList = async () => {
		await this.setState({ generating: true });
		const { customizeColorList } = this.state;
		const len = customizeColorList.length;
		const input = {
			lockedArr: [],
			setFuzzy: false,
		};

		for (let i = 0; i < len; i += 1) {
			if (customizeColorList[i]) {
				input.lockedArr.push(colorMath.hex2rgb(customizeColorList[i]));
			} else {
				input.lockedArr.push([]);
			}
		}

		const result = await this.fetchAIColor(input);
		if (result && result.length) {
			this.setEditorPalette(result, false);
		}
	};

	switchEditOption = option => {
		const { editingOption, lastEditHexArr } = this.state;
		if (option === editingOption) return;

		//  reset customized color list
		if (option === 'customize') {
			this.setState({
				customizeColorList: Array.from(lastEditHexArr),
			});
		}
		this.setState({
			baseColorList: [],
			editorHexArr: [],
			imgPreviewUrl: null,
			editingOption: option,
			activeColorPicker: -1,
		});
	};

	// option: random
	handleBasePickerColorOnClick = hex => {
		const { baseColorList } = this.state;
		const index = baseColorList.indexOf(hex);
		if (index === -1) {
			baseColorList.push(hex);
		} else {
			baseColorList.splice(index, 1);
		}
		this.setState({ baseColorList });
	};

	reloadImgPalette = async () => {
		const { imgData } = this.state;
		if (imgData) {
			const imgColors = await imageHelper.getImgPalette(imgData, 10);
			const hexArr = colorMath.sortHexArr(imgColors).slice(0, 5);
			this.setEditorPalette(hexArr, true);
		}
	};

	uploadImgOnClick = e => {
		const file = e.target.files[0];
		if (!file.type.startsWith('image/')) return;
		e.target.value = null;
		this.onImgDrop([file]);
	};

	changeActiveColorBlock = i => {
		const { activeColorPicker } = this.state;
		let index = i;
		if (activeColorPicker === index) index = -1;
		this.setState({
			activeColorPicker: index,
		});
	};

	removeCustomizeColor = index => {
		// deep copy array, otherwise will change the original data!!
		const newList = Array.from(this.state.customizeColorList);
		newList[index] = 0;

		this.setState({
			customizeColorList: newList,
			activeColorPicker: -1,
		});
	};

	fetchAIColor = async input => {
		const { store, client } = this.context;
		let hexArr;
		try {
			const res = await client.query({
				query: gqlQuery.getAIColor,
				fetchPolicy: 'network-only',
				variables: input,
			});
			const { rgb } = res.data.getAIColor;
			if (rgb && rgb.length) {
				hexArr = await colorMath.rgbArr2hexArr(rgb);
				return hexArr;
			}
		} catch (err) {
			store.dispatch(
				setAlertbar({
					status: 'error',
					message: __DEV__ ? `[fetchAIColor] -> ${err.message}` : constants.errMsg,
					open: true,
				}),
			);
		}
		return false;
	};

	applyPaletteChange = () => {
		const { editorHexArr, lastEditHexArr } = this.state;
		if (!utils.arraysEqual(editorHexArr, lastEditHexArr))
			history.push(utils.goToShop(editorHexArr));
	};

	handleColorPickerOnChange = c => {
		const { activeColorPicker, customizeColorList } = this.state;
		if (activeColorPicker !== -1) {
			customizeColorList[activeColorPicker] = c.hex;
			this.setState({
				customizeColorList,
			});
		}
	};

	handleClickAway = () => {
		this.setState({
			activeColorPicker: -1,
		});
	};

	render() {
		const {
			generating,
			lastEditHexArr,
			editorHexArr,
			editingOption,
			imgPreviewUrl,
			baseColorList,
			customizeColorList,
			activeColorPicker,
		} = this.state;

		const palette = (
			<Grow in={!generating}>
				<div className={s.editedPaletteWrapper}>
					{editorHexArr.map((hex, i) => (
						// eslint-disable-next-line
            <div key={hex + i} style={{ backgroundColor: hex }} />
					))}
				</div>
			</Grow>
		);

		return (
			<div className={s.container} style={generating ? { pointerEvents: 'none' } : {}}>
				<h2>Pick Your Color</h2>
				<div className={s.editorBtnGroup}>
					<button
						className={cx(s.editOptionBtn, editingOption === 'random' && s.editing)}
						onClick={() => this.switchEditOption('random')}
					>
						<i className="fa fa-random" />
						<span>lucky</span>
					</button>

					<button
						className={cx(s.editOptionBtn, editingOption === 'photo' && s.editing)}
						onClick={() => this.switchEditOption('photo')}
					>
						<i className="fa fa-image" />
						<span>photo</span>
					</button>

					<button
						className={cx(
							s.hideOnMobile,
							s.editOptionBtn,
							editingOption === 'customize' && s.editing,
						)}
						onClick={() => this.switchEditOption('customize')}
					>
						<i className="fa fa-edit" />
						<span>customize</span>
					</button>
				</div>

				{editingOption === 'random' && (
					<div className={s.contentWrapper}>
						<p>Choose your favorite colors to generate your lovely palette</p>
						<div className={s.colorsContainer}>
							{constants.colorPickerList.map(color => (
								<div key={color.hex} className={s.selectBlock}>
									<button
										onClick={() => this.handleBasePickerColorOnClick(color.hex)}
										style={{ background: color.hex }}
										className={s.colorBtn}
									>
										<Zoom in={baseColorList.indexOf(color.hex) !== -1}>
											<Check style={{ color: colorMath.getContrastYIQ(color.hex) }} />
										</Zoom>
									</button>
									<div>{color.name}</div>
								</div>
							))}
						</div>
						<button onClick={this.setRandomPalette} className={s.matchBtn}>
							Generate
						</button>
						{palette}
					</div>
				)}

				{editingOption === 'photo' && (
					<div className={s.contentWrapper}>
						<p>Extract a lovely palette from an image you like</p>
						<Dropzone
							className={s.dropZone}
							multiple={false}
							accept="image/*"
							onDrop={this.onImgDrop}
							style={imgPreviewUrl ? { backgroundImage: `url('${imgPreviewUrl}')` } : {}}
						>
							{!imgPreviewUrl && <AddPhotoAlternate fontSize="inherit" />}
						</Dropzone>

						<canvas
							ref={c => {
								this.previewImg = c;
							}}
							style={{ display: 'none' }}
						/>

						{palette}

						{imgPreviewUrl && (
							<div className={s.imgCtrlBtnGroup}>
								<Tooltip title="Extract a new palette" placement="top">
									<ButtonBase onClick={this.reloadImgPalette}>
										<i className="fa fa-refresh" />
									</ButtonBase>
								</Tooltip>

								<Tooltip title="Use a diffierent photo" placement="top">
									<ButtonBase>
										<label htmlFor="imgInput" style={{ cursor: 'pointer' }}>
											<input
												id="imgInput"
												accept="image/*"
												type="file"
												style={{ display: 'none' }}
												onChange={this.uploadImgOnClick}
											/>
											<i className="fa fa-image" />
										</label>
									</ButtonBase>
								</Tooltip>
							</div>
						)}
					</div>
				)}

				{editingOption === 'customize' && (
					<div className={s.contentWrapper}>
						<p>Edit your loving Palette like a Pro</p>
						<ClickAwayListener onClickAway={this.handleClickAway}>
							<div>
								{customizeColorList.map((hex, i) => (
									// eslint-disable-next-line
						  <div key={hex + i} className={s.customizeColorWrapper}>
										{hex !== 0 && (
											<ButtonBase
												className={s.customizeCtrlBtn}
												onClick={() => this.removeCustomizeColor(i)}
											>
												<i className="fa fa-minus" />
											</ButtonBase>
										)}
										<div>
											<ButtonBase
												className={cx(
													s.customizeColorBlock,
													activeColorPicker === i && s.activeColorBlock,
												)}
												style={{ backgroundColor: hex || '#fff' }}
												onClick={() => this.changeActiveColorBlock(i)}
											>
												{!hex && <i className="fa fa-plus" />}
											</ButtonBase>
											<div>
												<i
													className="fa fa-caret-up"
													style={{
														color:
															activeColorPicker === i ? '#dd1818' : 'transparent',
													}}
												/>
											</div>
										</div>
									</div>
								))}

								<Collapse in={activeColorPicker !== -1}>
									<div className={s.colorPickerContainer}>
										<ColorPicker
											color={customizeColorList[activeColorPicker] || '#ffffff'}
											onChange={this.handleColorPickerOnChange}
										/>
									</div>
								</Collapse>
							</div>
						</ClickAwayListener>

						<button onClick={this.setCustomizeColorList} className={s.matchBtn}>
							match
						</button>
						{palette}
					</div>
				)}

				{editorHexArr.length > 0 && (
					<div className={s.dialogActions}>
						<button onClick={() => this.setEditorPalette(lastEditHexArr, false)}>
							<Undo fontSize="small" />
							Undo
						</button>
						<button onClick={this.applyPaletteChange} className={s.actionButton}>
							<Check fontSize="small" />
							apply change
						</button>
					</div>
				)}
			</div>
		);
	}
}

export default withStyles(s)(Editor);
