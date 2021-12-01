/**
 * Huedeck, Inc
 */

import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import cx from 'classnames';
import { Popper, Grow, Paper, ClickAwayListener } from '@material-ui/core';
import { Check } from '@material-ui/icons';
import constants from '../../constants';
import colorMath from '../../shop/colorMath';
import utils from '../../utils';
import Link from '../../../components/Link/Link';
import StyleList from './filterContents/StyleList';
import InputFilter from './filterContents/FilterByInput';
import history from '../../../history';
import json from '../../brand/brand.json';
import s from './CatalogFilter.css';

const SORTING_OPTIONS = [
	{ key: 'none', value: 'Recommended' },
	{ key: 'topseller', value: 'Top Seller' },
	{ key: 'price-ltoh', value: 'Price: Low to High' },
	{ key: 'price-htol', value: 'Price: High to Low' },
];

function generateFilterChipList(filterState) {
	const list = [];
	const keyList = Object.keys(filterState);
	for (let j = 0, keyLen = keyList.length; j < keyLen; j += 1) {
		const key = keyList[j];
		// get category chip
		if (key === 'styles') {
			const { styles } = filterState;
			if (styles.length) {
				for (let i = 0, len = styles.length; i < len; i += 1) {
					list.push({
						key,
						value: styles[i],
					});
				}
			}
			// get chips for price
		} else if (['priceRange', 'widthRange', 'lengthRange', 'heightRange'].indexOf(key) !== -1) {
			const subKey = key.match(/(.*)Range/)[1];
			const [min, max] = filterState[key];
			const queryStr = utils.getRangeFilterStr(min, max);
			list.push({
				key: subKey,
				value: `${subKey} ${subKey === 'price' ? '$' : '(inch)'}: ${queryStr}`,
			});
		} else if (key === 'color') {
			list.push({
				key,
				value: filterState[key],
			});
		} else if (key === 'brand') {
			list.push({
				key,
				value: `Brand: ${filterState[key]}`,
			});
		}
	}
	return list;
}

class ProductFilter extends React.Component {
	static propTypes = {
		sort: PropTypes.string,
	};

	static defaultProps = {
		sort: 'none',
	};

	static getDerivedStateFromProps(nextProps, prevState) {
		let activeSorting = SORTING_OPTIONS[0];
		let activeBrand;
		let chipList = [];

		chipList = generateFilterChipList(nextProps);
		if (nextProps.sort) {
			const option = SORTING_OPTIONS.find(obj => obj.key === nextProps.sort);
			if (option && option.value) activeSorting = option;
		}

		if (nextProps.brand !== prevState.activeBrand) {
			if (typeof nextProps.brand === 'string') {
				activeBrand = nextProps.brand.split('-').join(' ');
			}
		}

		return {
			activeSorting,
			activeBrand,
			chipList,
		};
	}

	state = {
		activeSorting: SORTING_OPTIONS[0],
		activeSelect: null,
		chipList: [],
	};

	componentDidUpdate(prevProps) {
		if (this.props !== prevProps) {
			this.handleSelectClose();
		}
	}

	handleSelectClose = e => {
		if (e) {
			const { activeSelect } = this.state;
			if (!activeSelect || this.anchorEl[activeSelect].contains(e.target)) {
				return;
			}
		}
		this.setState({ activeSelect: null });
	};

	handleMouseClick = e => {
		const { id } = e.target;
		const { activeSelect } = this.state;
		this.setState({
			activeSelect: id === activeSelect ? null : id,
		});
	};

	applySortingChange = value => {
		const activeSorting = this.props.sort;
		if (activeSorting !== value) {
			const uri = utils.resetUriByKey('sort', value === 'none' ? null : value);
			history.push(uri);
		}
	};

	applyActiveColorChange = hex => {
		if (utils.isValidHexCode(hex)) {
			const hexCode = hex.substr(1);
			const uri = utils.resetUriByKey('color', hexCode);
			history.push(uri);
		}
	};

	handleChipOnDelete = chipObj => {
		const { key, value } = chipObj;
		// styles will be removed by specified value only
		if (key === 'styles') {
			return utils.getUpdatedUri(key, value);
		}
		return utils.resetUriByKey(key);
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
		const { activeSelect, activeSorting, activeBrand, chipList } = this.state;
		const filterState = this.props;

		return (
			<div className={s.container}>
				<div className={s.filterBtnContainer}>
					<span>Filter by:</span>

					{/* filter by next level category */}
					{filterState.nextLevelCatList && filterState.nextLevelCatList.length > 0 && (
						<div
							ref={node => {
								this.anchorEl.categoryF = node;
							}}
						>
							<button
								className={cx(s.filterBtn, activeSelect === 'categoryF' && s.active)}
								onClick={this.handleMouseClick}
								id="categoryF"
							>
								Category
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
												<div className={s.menuList}>
													{filterState.nextLevelCatList.map(cat => (
														<Link
															key={cat}
															to={`/products/${cat.split(' ').join('-')}`}
															className={s.menuItem}
														>
															{cat}
														</Link>
													))}
												</div>
											</ClickAwayListener>
										</Paper>
									</Grow>
								)}
							</Popper>
						</div>
					)}

					{/* filter popper of Color */}
					<div
						ref={node => {
							this.anchorEl.colorF = node;
						}}
					>
						<button
							onClick={this.handleMouseClick}
							id="colorF"
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
											<div className={s.colorFilterButton}>
												{constants.colorPickerList.map(color => (
													<button
														// eslint-disable-next-line
												key={color.hex}
														style={{ backgroundColor: color.hex }}
														onClick={() => this.applyActiveColorChange(color.hex)}
														disabled={filterState.color === color.hex}
													>
														<Grow in={filterState.color === color.hex}>
															<Check
																style={{
																	color: colorMath.getContrastYIQ(color.hex),
																}}
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

					{/* filter popper of Style */}
					<div
						ref={node => {
							this.anchorEl.styleF = node;
						}}
					>
						<button
							className={cx(s.filterBtn, activeSelect === 'styleF' && s.active)}
							onClick={this.handleMouseClick}
							id="styleF"
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
												initState={filterState.styles}
												onDone={() => this.handleSelectClose()}
											/>
										</ClickAwayListener>
									</Paper>
								</Grow>
							)}
						</Popper>
					</div>

					{/* filter popper of Price */}
					<div
						ref={node => {
							this.anchorEl.priceF = node;
						}}
					>
						<button
							className={cx(s.filterBtn, activeSelect === 'priceF' && s.active)}
							onClick={this.handleMouseClick}
							id="priceF"
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
												initState={filterState.priceRange}
												type="price"
												onDone={() => this.handleSelectClose()}
											/>
										</ClickAwayListener>
									</Paper>
								</Grow>
							)}
						</Popper>
					</div>

					{/* filter popper of Length */}
					<div
						ref={node => {
							this.anchorEl.lengthF = node;
						}}
					>
						<button
							className={cx(s.filterBtn, activeSelect === 'lengthF' && s.active)}
							onClick={this.handleMouseClick}
							id="lengthF"
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
												initState={filterState.lengthRange}
												type="length"
												onDone={() => this.handleSelectClose()}
											/>
										</ClickAwayListener>
									</Paper>
								</Grow>
							)}
						</Popper>
					</div>

					{/* filter popper of Width */}
					<div
						ref={node => {
							this.anchorEl.widthF = node;
						}}
					>
						<button
							className={cx(s.filterBtn, activeSelect === 'widthF' && s.active)}
							onClick={this.handleMouseClick}
							id="widthF"
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
												initState={filterState.widthRange}
												type="width"
												onDone={() => this.handleSelectClose()}
											/>
										</ClickAwayListener>
									</Paper>
								</Grow>
							)}
						</Popper>
					</div>

					{/* filter popper of Height */}
					<div
						ref={node => {
							this.anchorEl.heightF = node;
						}}
					>
						<button
							className={cx(s.filterBtn, activeSelect === 'heightF' && s.active)}
							onClick={this.handleMouseClick}
							id="heightF"
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
												initState={filterState.heightRange}
												type="height"
												onDone={() => this.handleSelectClose()}
											/>
										</ClickAwayListener>
									</Paper>
								</Grow>
							)}
						</Popper>
					</div>

					{/* filter popper of Brand */}
					<div
						ref={node => {
							this.anchorEl.brandF = node;
						}}
					>
						<button
							className={cx(s.filterBtn, activeSelect === 'brandF' && s.active)}
							onClick={this.handleMouseClick}
							id="brandF"
						>
							brand
						</button>
						<Popper
							open={activeSelect === 'brandF'}
							anchorEl={this.anchorEl.brandF}
							{...this.popperProps}
						>
							{({ TransitionProps }) => (
								<Grow
									unmountOnExit
									{...TransitionProps}
									id="brandF"
									style={{ transformOrigin: 'left top' }}
								>
									<Paper>
										<ClickAwayListener onClickAway={this.handleSelectClose}>
											<div className={s.menuList}>
												{json.brands.map(brand => (
													<Link
														key={brand}
														to={utils.resetUriByKey('brand', brand)}
														className={cx(
															s.menuItem,
															brand === activeBrand && s.activeMenuItem,
														)}
													>
														{brand}
													</Link>
												))}
											</div>
										</ClickAwayListener>
									</Paper>
								</Grow>
							)}
						</Popper>
					</div>
				</div>

				{/* popper of Sorting */}

				<div className={s.filterBtnContainer}>
					<span>Sort by:</span>
					<div
						ref={node => {
							this.anchorEl.orderS = node;
						}}
					>
						<button
							className={cx(s.filterBtn, activeSelect === 'orderS' && s.active)}
							onClick={this.handleMouseClick}
							id="orderS"
						>
							{activeSorting.value}
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
														onClick={() => this.applySortingChange(op.key)}
														className={cx(
															s.menuItem,
															activeSorting.key === op.key && s.activeMenuItem,
														)}
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

				{typeof window !== 'undefined' && chipList.length > 0 && (
					<div className={s.chipContainer}>
						{chipList.map(obj =>
							obj.key === 'color' ? (
								<Link
									to={this.handleChipOnDelete(obj)}
									key={obj.value}
									className={s.colorChip}
								>
									color:
									<div style={{ backgroundColor: obj.value }} />
									<span>&#10005;</span>
								</Link>
							) : (
								<Link
									to={this.handleChipOnDelete(obj)}
									key={obj.value}
									className={s.filterChip}
								>
									{obj.value}
									<span>&#10005;</span>
								</Link>
							),
						)}
						<Link className={s.clrAllBtn} to={window.location.pathname}>
							clear all
						</Link>
					</div>
				)}
			</div>
		);
	}
}

export default withStyles(s)(ProductFilter);
