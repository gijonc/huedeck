/**
 *	Huedeck, Inc
 */

import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import PropTypes from 'prop-types';
import { Popper, Collapse } from '@material-ui/core';
import Link from '../../components/Link/Link';
import utils from '../utils';
import s from './Brand.css';
import ProductList from './ProductList';

class Brand extends React.Component {
	static propTypes = {
		brand: PropTypes.string.isRequired,
		categoryOfBrandSchema: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
		pdOfCategoryList: PropTypes.arrayOf(
			PropTypes.shape({
				name: PropTypes.string,
				tally: PropTypes.number,
				products: PropTypes.arrayOf(PropTypes.object), // eslint-disable-line react/forbid-prop-types
			}),
		).isRequired,
	};

	state = {
		activeCat2: null,
	};

	getLinkUri = category =>
		`/products/${category.split(' ').join('-')}?brand=${this.props.brand.split(' ').join('-')}`;

	roundToNearestPowOfTen = num => {
		const powOfTen = (num.toString().length - 1) ** 10;
		const number = Math.floor(num / powOfTen) * powOfTen;
		return `${utils.convertPrice(number)}+`;
	};

	handleOnMouseEnter = e => {
		this.setState({
			activeCat2: e.target.id,
		});
	};

	handleOnClick = e => {
		const { id } = e.target;
		const { activeCat2 } = this.state;
		this.setState({
			activeCat2: id === activeCat2 ? null : id,
		});
	};

	handleOnMouseLeave = () => {
		this.setState({
			activeCat2: null,
		});
	};

	anchorEl = {};
	brandImageSrcPath = 'https://storage.googleapis.com/huedeck/img/brand/';

	render() {
		const { activeCat2 } = this.state;
		const { brand, categoryOfBrandSchema, pdOfCategoryList } = this.props;

		return (
			<div className={s.root}>
				<div className={s.container}>
					<div
						className={s.brandBgImg}
						style={{
							backgroundImage: `url(${`${this.brandImageSrcPath +
								brand.split(' ').join('_')}_brand_banner.jpg`})`,
						}}
					>
						<div
							className={s.brandLogo}
							style={{
								backgroundImage: `url(${`${this.brandImageSrcPath +
									brand.split(' ').join('_')}_brand_logo.png`})`,
							}}
						/>
					</div>

					<div className={s.categoryFilterList}>
						{Object.keys(categoryOfBrandSchema).map(cat2 => (
							<div
								key={cat2}
								onMouseLeave={this.handleOnMouseLeave}
								ref={node => {
									this.anchorEl[cat2] = node;
								}}
							>
								<button
									onMouseEnter={this.handleOnMouseEnter}
									onClick={this.handleOnClick}
									id={cat2}
									className={s.cat2Link}
								>
									{cat2}
								</button>
								<Popper
									open={activeCat2 === cat2}
									anchorEl={this.anchorEl[cat2]}
									transition
									disablePortal
									placement="bottom-start"
									className={s.popper}
								>
									{({ TransitionProps }) => (
										<Collapse
											unmountOnExit
											{...TransitionProps}
											id={cat2}
											style={{ transformOrigin: 'left top' }}
										>
											<div className={s.dropDownCat3}>
												<Link to={this.getLinkUri(cat2)}>
													<strong>All {cat2}</strong>
												</Link>
												{categoryOfBrandSchema[cat2].map(cat3 => (
													<Link key={cat3} to={this.getLinkUri(cat3)}>
														{cat3}
													</Link>
												))}
											</div>
										</Collapse>
									)}
								</Popper>
							</div>
						))}
					</div>

					<div className={s.categoryListContainer}>
						{pdOfCategoryList.map(category => (
							<div key={category.name} className={s.categoryWrapper}>
								<h1>{category.name}</h1>
								<ProductList products={category.products} hideTopSellerTag />

								<Link to={this.getLinkUri(category.name)}>
									{`Shop all ${category.name} from ${brand}`}
								</Link>
							</div>
						))}
					</div>
				</div>
			</div>
		);
	}
}

export default withStyles(s)(Brand);
