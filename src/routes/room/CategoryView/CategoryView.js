/**
 *	Huedeck, Inc
 */

import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import {
	Element,
	// Link as ScrollLink
} from 'react-scroll';
import { Collapse } from '@material-ui/core';
import { Add, Remove } from '@material-ui/icons';
import { fetchSimilarProduct } from '../../../actions/getSimilarProduct';
import utils from '../../utils';
import colorMath from '../../shop/colorMath';
import s from './CategoryView.css';
import RoomItem from '../RoomItem';

class CategoryView extends React.Component {
	static propTypes = {
		// eslint-disable-next-line
		categorySet: PropTypes.arrayOf(PropTypes.object).isRequired,
		palette: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
		findSimPd: PropTypes.func.isRequired,
	};

	static contextTypes = {
		store: PropTypes.object.isRequired,
		client: PropTypes.object.isRequired,
	};

	state = {
		loadingMore: false,
		activeCategoryName: null,
		similarCategory: {
			newOffset: 0,
			itemList: [],
		},
	};

	findSimilarCategory = selected => {
		const { products, key, values, name } = selected;

		// click on the same button
		if (this.state.activeCategoryName === name) {
			this.setState({
				activeCategoryName: null,
			});
			return;
		}

		this.setState(
			{
				activeCategoryName: name,
				loadingMore: true,
				similarCategory: {
					newOffset: 0,
					itemList: [],
				},
			},
			async () => {
				const variables = {
					activeColors: colorMath.hexArr2rgbArr(this.props.palette),
					excludeProductIds: products.map(pd => pd.ProductID),
					filters: JSON.stringify({
						[key]: values,
					}),
					lastOffset: 0,
				};

				// if (pd.ProductID !== activeProductId) {
				// 	variables.lastOffset = 0;
				// 	similarItem.itemList = [];
				// } else {
				// 	if (similarItem.newOffset === -1) return; // all item fetched
				// 	variables.lastOffset = similarItem.newOffset;
				// }

				const data = await this.context.store.dispatch(fetchSimilarProduct(variables));
				if (data) {
					const productList = await utils.preloadProductImg(data.products);
					const newState = {
						newOffset: data.newOffset,
						itemList: this.state.similarCategory.itemList.concat(productList),
					};

					this.setState({
						similarCategory: newState,
						loadingMore: false,
					});
				}
			},
		);
	};

	render() {
		const { categorySet, palette } = this.props;
		const { activeCategoryName, similarCategory, loadingMore } = this.state;

		return (
			<div className={s.container}>
				{/* <div className={s.categoryNav}>
					{categorySet.map(
						cat =>
							cat.products.length > 0 && (
								<div key={cat.name} className={s.scrollLink}>
									<ScrollLink to={cat.name} smooth>
										<span>{cat.name}</span>
									</ScrollLink>
								</div>
							),
					)}
				</div> */}

				<div className={s.categoryList}>
					{categorySet.map(
						cat =>
							cat.products.length > 0 && (
								<Element className={s.roomCategory} name={cat.name} key={cat.name}>
									<p>{cat.name}</p>
									<div>
										{cat.products.map(pd => (
											<RoomItem
												key={pd.ProductID}
												product={pd}
												palette={palette}
												findSimPd={this.props.findSimPd}
											/>
										))}
									</div>

									<Collapse in={activeCategoryName === cat.name}>
										<div className={s.similarItemContainer}>
											{similarCategory.itemList.map(pd => (
												<RoomItem
													key={pd.ProductID}
													product={pd}
													palette={palette}
													findSimPd={this.props.findSimPd}
												/>
											))}
										</div>
									</Collapse>

									{cat.products.length >= 5 && (
										<div>
											{activeCategoryName === cat.name && loadingMore ? (
												<i className="fa fa-spinner fa-spin" />
											) : (
												<button
													className={s.showMoreBtn}
													onClick={() => this.findSimilarCategory(cat)}
												>
													{activeCategoryName === cat.name ? (
														<span>
															show less <Remove />
														</span>
													) : (
														<span>
															show more <Add />
														</span>
													)}
												</button>
											)}
										</div>
									)}
								</Element>
							),
					)}
				</div>
			</div>
		);
	}
}

export default withStyles(s)(CategoryView);
