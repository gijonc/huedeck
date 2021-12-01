/**
 * Huedeck, Inc
 */

import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import cx from 'classnames';
import { Popper, Grow, ClickAwayListener, Paper } from '@material-ui/core';
import { Check } from '@material-ui/icons';
// import constants from 'routes/constants';
import utils from '../../utils';
import colorMath from '../colorMath';
import CategoryList from './filterContents/categoryList';
import StyleList from './filterContents/styleList';
import InputFilter from './filterContents/filterByInput';
import s from '../../catalog/CatalogFilter/CatalogFilter.css';
// import history from '../../../history';

const SORTING_OPTIONS = [
	{ key: 'none', value: 'Recommended' },
	{ key: 'topseller', value: 'Top Seller' },
	{ key: 'price-ltoh', value: 'Price: Low to High' },
	{ key: 'price-htol', value: 'Price: High to Low' },
];

const INIT_FILTER_STATE = {
	category: {},
	style: [],
	price: [-1, 0],
	width: [-1, 0],
	height: [-1, 0],
	length: [-1, 0],
};

class FilterBar extends React.Component {
	static propTypes = {
		submitData: PropTypes.func.isRequired,
		hexArr: PropTypes.arrayOf(PropTypes.string).isRequired,
	};

	state = {
		filterHistory: null,
		activeSelect: null,
		activeSorting: 'Recommended',
	};

	componentDidMount() {
		this.getInitFilterState();
	}

	// listen on palette change
	componentDidUpdate(prevProps) {
		if (!utils.arraysEqual(this.props.hexArr, prevProps.hexArr)) {
			this.getInitFilterState();
		}
	}

	getInitFilterState = () => {
		const resetState = Object.assign({}, INIT_FILTER_STATE);
		resetState.colors = this.props.hexArr.slice();
		this.setState({
			filterHistory: resetState,
			activeSorting: 'Recommended',
		});
	};

	/**
	 * filter on change controls
	 */

	resetAllFilter = () => {
		this.props.submitData('reset');
		this.getInitFilterState();
	};

	applyCategoryFilter = checkList => {
		const uncheckStatus = Object.keys(checkList);
		const uncheckResult = {};

		for (let i = 0, len = uncheckStatus.length; i < len; i += 1) {
			const cat1 = uncheckStatus[i];
			const { checked, cat2UncheckList, cat2Length } = checkList[cat1];
			const cat2UncheckListLen = cat2UncheckList.length;
			if (!checked) {
				if (cat2UncheckListLen === cat2Length) {
					// all cat2 unchecked
					if (!uncheckResult.cat1List) uncheckResult.cat1List = [];
					uncheckResult.cat1List.push(cat1);
				} else {
					// partial cat2 unchecked
					if (!uncheckResult.cat2List) uncheckResult.cat2List = [];
					uncheckResult.cat2List = uncheckResult.cat2List.concat(cat2UncheckList);
				}
			}
		}

		const { filterHistory } = this.state;
		filterHistory.category = checkList;

		// TODO: compare new input and history before calling api
		this.props.submitData('category', uncheckResult);
		this.setState({
			filterHistory,
		});
	};

	applyStyleFilter = checkList => {
		const { filterHistory } = this.state;
		if (utils.arraysEqual(filterHistory.style, checkList)) return;
		filterHistory.style = checkList;
		this.props.submitData('styles', checkList);
		this.setState({
			filterHistory,
		});
	};

	applyInputNumberFilter = (r, type) => {
		const range = r;
		if (range[0] < 0) range[0] = -1;
		if (range[1] < 0) range[1] = 0;

		const { filterHistory } = this.state;
		if (!utils.arraysEqual(filterHistory[type], range)) {
			filterHistory[type] = range;
			this.props.submitData(`${type}Range`, range);
			this.setState({
				filterHistory,
				activeSelect: null,
			});
		}
	};

	applyActiveColorChange = hex => {
		const { filterHistory } = this.state;
		const index = filterHistory.colors.indexOf(hex);

		if (index !== -1) {
			// currently active: disable the input color
			if (filterHistory.colors.length === 1) return; // at least one color must be active
			filterHistory.colors.splice(index, 1);
		} else {
			// currently inactive: enable the input color
			filterHistory.colors.push(hex);
		}

		const activeRGBarr = colorMath.hexArr2rgbArr(filterHistory.colors).slice();
		this.props.submitData('activeColors', activeRGBarr);
		this.setState({
			filterHistory,
		});
	};

	/**
	 * Sorting controls
	 */
	applySortingChange = obj => {
		const { key, value } = obj;
		if (this.state.activeSorting !== value) {
			this.props.submitData('order', key);
		}
		this.setState({
			activeSorting: value,
			activeSelect: null,
		});
	};

	/**
	 * popup & chips controls
	 */
	handleChipOnDelete = chipObj => {
		const { filterHistory } = this.state;
		if (chipObj.key === 'category') {
			this.applyCategoryFilter({});
		} else if (chipObj.key === 'style') {
			const inputStyle = chipObj.value.split(' ').pop();
			const newList = filterHistory.style.filter(k => k !== inputStyle);
			this.applyStyleFilter(newList);
		} else if (chipObj.key === 'colors') {
			filterHistory.colors = this.props.hexArr.slice();
			const activeRGBarr = colorMath.hexArr2rgbArr(filterHistory.colors);
			this.props.submitData('activeColors', activeRGBarr);
			this.setState({
				filterHistory,
			});
		} else {
			this.applyInputNumberFilter([0, -1], chipObj.key);
		}
	};

	generateFilterChipList = () => {
		const { filterHistory } = this.state;
		const list = [];
		if (filterHistory) {
			const historyList = Object.keys(filterHistory);
			for (let j = 0, keyLen = historyList.length; j < keyLen; j += 1) {
				const key = historyList[j];
				// get category chip
				if (key === 'category' && Object.keys(filterHistory[key]).length) {
					let currentCat2Num = 0;
					let totalCat2Num = 0;
					const catStatus = Object.keys(filterHistory.category);
					for (let i = 0, len = catStatus.length; i < len; i += 1) {
						const cat1 = catStatus[i];
						const { cat2UncheckList, cat2Length } = filterHistory.category[cat1];
						totalCat2Num += cat2Length;
						currentCat2Num += cat2Length - cat2UncheckList.length;
					}
					// only show chip for incompleted category list
					if (currentCat2Num < totalCat2Num) {
						list.push({
							key,
							value: `${currentCat2Num}/${totalCat2Num} categories applied`,
						});
					}
					// get style chip(s)
				} else if (key === 'style' && filterHistory[key].length) {
					const styleList = filterHistory[key];
					for (let i = 0, len = styleList.length; i < len; i += 1) {
						list.push({
							key,
							value: `style: ${styleList[i]}`,
						});
					}
					// get chips for price
				} else if (['price', 'width', 'length', 'height'].indexOf(key) !== -1) {
					const [min, max] = filterHistory[key];
					const queryStr = utils.getRangeFilterStr(min, max);
					if (queryStr) {
						list.push({
							key,
							value: `${key} (${key === 'price' ? '$' : '(inch)'}): ${queryStr}`,
						});
					}
				} else if (
					key === 'colors' &&
					filterHistory[key].length &&
					filterHistory[key].length < 5
				) {
					list.push({
						key,
						value: `${filterHistory[key].length}/5 colors applied`,
					});
				}
			}
		}
		return list;
	};

	handleSelectClick = name => {
		this.setState({
			activeSelect: this.state.activeSelect === name ? null : name,
		});
	};

	handleSelectClose = e => {
		if (e) {
			const { activeSelect } = this.state;
			if (!activeSelect || this.anchorEl[activeSelect].contains(e.target)) {
				return;
			}
		}
		this.setState({ activeSelect: null });
	};

	// define refs from anchorEl
	anchorEl = {};

	popperProps = {
		transition: true,
		disablePortal: true,
		placement: 'bottom-start',
		className: s.filterPopper,
	};

	render() {
		const { activeSelect, activeSorting, filterHistory } = this.state;

		const chipList = this.generateFilterChipList(filterHistory);
		return (
			<div className={s.container}>
				<div className={s.filterBtnContainer}>
					<span>Filter by:</span>

					<div>
						<button
							ref={node => {
								this.anchorEl.colorF = node;
							}}
							aria-owns={activeSelect === 'colorF' ? 'popper' : undefined}
							onClick={() => this.handleSelectClick('colorF')}
							aria-haspopup="true"
							className={cx(s.filterBtn, activeSelect === 'colorF' && s.active)}
						>
							Color
						</button>

						<Popper
							open={activeSelect === 'colorF'}
							anchorEl={this.anchorEl.colorF}
							{...this.popperProps}
						>
							{({ TransitionProps }) => (
								<Grow
									unmountOnExit
									{...TransitionProps}
									id="colorF"
									style={{ transformOrigin: 'left top' }}
								>
									<Paper>
										<ClickAwayListener onClickAway={this.handleSelectClose}>
											<div className={s.paletteCheckboxWrapper}>
												{this.props.hexArr.map((hex, i) => (
													<button
														// eslint-disable-next-line
											key={hex + i}
														style={{ backgroundColor: hex }}
														onClick={() => this.applyActiveColorChange(hex)}
													>
														<Grow in={filterHistory.colors.indexOf(hex) !== -1}>
															<Check
																style={{ color: colorMath.getContrastYIQ(hex) }}
															/>
														</Grow>
													</button>
												))}
											</div>
										</ClickAwayListener>
									</Paper>
								</Grow>
							)}
						</Popper>
					</div>

					<div>
						<button
							ref={node => {
								this.anchorEl.categoryF = node;
							}}
							aria-owns={activeSelect === 'categoryF' ? 'popper' : undefined}
							onClick={() => this.handleSelectClick('categoryF')}
							aria-haspopup="true"
							className={cx(s.filterBtn, activeSelect === 'categoryF' && s.active)}
						>
							category
						</button>

						<Popper
							open={activeSelect === 'categoryF'}
							anchorEl={this.anchorEl.categoryF}
							{...this.popperProps}
						>
							{({ TransitionProps }) => (
								<Grow
									unmountOnExit
									{...TransitionProps}
									id="categoryF"
									style={{ transformOrigin: 'left top' }}
								>
									<Paper>
										<ClickAwayListener onClickAway={this.handleSelectClose}>
											<CategoryList
												initState={filterHistory.category}
												applyChange={this.applyCategoryFilter}
												onDone={this.handleSelectClose}
											/>
										</ClickAwayListener>
									</Paper>
								</Grow>
							)}
						</Popper>
					</div>

					<div>
						<button
							ref={node => {
								this.anchorEl.styleF = node;
							}}
							aria-owns={activeSelect === 'styleF' ? 'popper' : undefined}
							aria-haspopup="true"
							className={cx(s.filterBtn, activeSelect === 'styleF' && s.active)}
							onClick={() => this.handleSelectClick('styleF')}
						>
							style
						</button>

						<Popper
							open={activeSelect === 'styleF'}
							anchorEl={this.anchorEl.styleF}
							{...this.popperProps}
						>
							{({ TransitionProps }) => (
								<Grow
									unmountOnExit
									{...TransitionProps}
									id="styleF"
									style={{ transformOrigin: 'left top' }}
								>
									<Paper>
										<ClickAwayListener onClickAway={this.handleSelectClose}>
											<StyleList
												initState={filterHistory.style}
												applyChange={this.applyStyleFilter}
												onDone={this.handleSelectClose}
											/>
										</ClickAwayListener>
									</Paper>
								</Grow>
							)}
						</Popper>
					</div>

					<div>
						<button
							ref={node => {
								this.anchorEl.priceF = node;
							}}
							aria-owns={activeSelect === 'priceF' ? 'popper' : undefined}
							aria-haspopup="true"
							className={cx(s.filterBtn, activeSelect === 'priceF' && s.active)}
							onClick={() => this.handleSelectClick('priceF')}
						>
							Price
						</button>
						<Popper
							open={activeSelect === 'priceF'}
							anchorEl={this.anchorEl.priceF}
							{...this.popperProps}
						>
							{({ TransitionProps }) => (
								<Grow
									unmountOnExit
									{...TransitionProps}
									id="priceF"
									style={{ transformOrigin: 'left top' }}
								>
									<Paper>
										<ClickAwayListener onClickAway={this.handleSelectClose}>
											<InputFilter
												initState={filterHistory.price}
												type="price"
												applyChange={range =>
													this.applyInputNumberFilter(range, 'price')
												}
											/>
										</ClickAwayListener>
									</Paper>
								</Grow>
							)}
						</Popper>
					</div>

					<div>
						<button
							ref={node => {
								this.anchorEl.widthF = node;
							}}
							aria-owns={activeSelect === 'widthF' ? 'popper' : undefined}
							aria-haspopup="true"
							className={cx(s.filterBtn, activeSelect === 'widthF' && s.active)}
							onClick={() => this.handleSelectClick('widthF')}
						>
							Width
						</button>
						<Popper
							open={activeSelect === 'widthF'}
							anchorEl={this.anchorEl.widthF}
							{...this.popperProps}
						>
							{({ TransitionProps }) => (
								<Grow
									unmountOnExit
									{...TransitionProps}
									id="widthF"
									style={{ transformOrigin: 'left top' }}
								>
									<Paper>
										<ClickAwayListener onClickAway={this.handleSelectClose}>
											<InputFilter
												initState={filterHistory.width}
												type="dimension"
												applyChange={range =>
													this.applyInputNumberFilter(range, 'width')
												}
											/>
										</ClickAwayListener>
									</Paper>
								</Grow>
							)}
						</Popper>
					</div>

					<div>
						<button
							ref={node => {
								this.anchorEl.heightF = node;
							}}
							aria-owns={activeSelect === 'heightF' ? 'popper' : undefined}
							aria-haspopup="true"
							className={cx(s.filterBtn, activeSelect === 'heightF' && s.active)}
							onClick={() => this.handleSelectClick('heightF')}
						>
							Height
						</button>
						<Popper
							open={activeSelect === 'heightF'}
							anchorEl={this.anchorEl.heightF}
							{...this.popperProps}
						>
							{({ TransitionProps }) => (
								<Grow
									unmountOnExit
									{...TransitionProps}
									id="heightF"
									style={{ transformOrigin: 'left top' }}
								>
									<Paper>
										<ClickAwayListener onClickAway={this.handleSelectClose}>
											<InputFilter
												initState={filterHistory.height}
												type="dimension"
												applyChange={range =>
													this.applyInputNumberFilter(range, 'height')
												}
											/>
										</ClickAwayListener>
									</Paper>
								</Grow>
							)}
						</Popper>
					</div>

					<div>
						<button
							ref={node => {
								this.anchorEl.lengthF = node;
							}}
							aria-owns={activeSelect === 'lengthF' ? 'popper' : undefined}
							aria-haspopup="true"
							className={cx(s.filterBtn, activeSelect === 'lengthF' && s.active)}
							onClick={() => this.handleSelectClick('lengthF')}
						>
							Length
						</button>
						<Popper
							open={activeSelect === 'lengthF'}
							anchorEl={this.anchorEl.lengthF}
							{...this.popperProps}
						>
							{({ TransitionProps }) => (
								<Grow
									unmountOnExit
									{...TransitionProps}
									id="lengthF"
									style={{ transformOrigin: 'left top' }}
								>
									<Paper>
										<ClickAwayListener onClickAway={this.handleSelectClose}>
											<InputFilter
												initState={filterHistory.length}
												type="dimension"
												applyChange={range =>
													this.applyInputNumberFilter(range, 'length')
												}
											/>
										</ClickAwayListener>
									</Paper>
								</Grow>
							)}
						</Popper>
					</div>
				</div>

				{/* sortings */}
				<div className={s.filterBtnContainer}>
					<span>Sort by:</span>

					<div>
						<button
							ref={node => {
								this.anchorEl.orderS = node;
							}}
							aria-owns={activeSelect === 'orderS' ? 'popper' : undefined}
							aria-haspopup="true"
							className={cx(s.filterBtn, activeSelect === 'orderS' && s.active)}
							onClick={() => this.handleSelectClick('orderS')}
						>
							{activeSorting}
						</button>
						<Popper
							open={activeSelect === 'orderS'}
							anchorEl={this.anchorEl.orderS}
							{...this.popperProps}
						>
							{({ TransitionProps }) => (
								<Grow
									unmountOnExit
									{...TransitionProps}
									id="orderS"
									style={{ transformOrigin: 'left top' }}
								>
									<Paper>
										<ClickAwayListener onClickAway={this.handleSelectClose}>
											<div className={s.menuList}>
												{SORTING_OPTIONS.map(op => (
													<button
														key={op.key}
														className={cx(
															s.menuItem,
															activeSorting === op.value && s.activeMenuItem,
														)}
														onClick={() => this.applySortingChange(op)}
													>
														{op.value}
													</button>
												))}
											</div>
										</ClickAwayListener>
									</Paper>
								</Grow>
							)}
						</Popper>
					</div>
				</div>

				{Boolean(chipList.length) && (
					<div className={s.chipContainer}>
						{chipList.map(obj => (
							<button
								onClick={() => this.handleChipOnDelete(obj)}
								key={obj.value}
								className={s.filterChip}
							>
								{obj.value}
								<span>&#10005;</span>
							</button>
						))}
						<button className={s.clrAllBtn} onClick={this.resetAllFilter}>
							clear all
						</button>
					</div>
				)}
			</div>
		);
	}
}

export default withStyles(s)(FilterBar);
