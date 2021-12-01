/**
 *	Huedeck, Inc
 */

import React from 'react';
// import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import ProductList from '../brand/ProductList/ProductList';
import CatalogFilter from './CatalogFilter/CatalogFilter';
import Link from '../../components/Link/Link';
import utils from '../utils';
import { ScrollToTopButton } from '../../components/Utilities';
import s from './Catalog.css';

class Catalog extends React.Component {
	//   static propTypes = {};

	pageList = () => {
		// eslint-disable-next-line react/prop-types
		const { tally, filterState } = this.props;
		const maxAvailablePage = Math.ceil(tally / 30); // 30 item per page, get max available page
		if (maxAvailablePage <= 1) {
			return null;
		}

		const activePage = Number(filterState.page);
		const listMax = window.screen.width > 600 ? 9 : 3; // determine max number of selection by screen width

		let listBegin = activePage - Math.floor(listMax / 2);
		if (listBegin <= 0) listBegin = 1;

		let listEnd = listBegin + listMax - 1;
		if (listEnd > maxAvailablePage) listEnd = maxAvailablePage;

		const list = [];
		for (let i = listBegin; i <= listEnd; i += 1) {
			list.push(
				<Link
					key={i}
					to={utils.resetUriByKey('page', i)}
					className={s.pageBtn}
					style={activePage === i ? { pointerEvents: 'none', background: '#ffd800' } : {}}
				>
					{i}
				</Link>,
			);
		}

		return (
			<div className={s.pagingCtrl}>
				{listBegin > 1 && (
					<Link to={utils.resetUriByKey('page')} className={s.pageBtn}>
						<i className="fa fa-angle-double-left" />
					</Link>
				)}
				{activePage > 1 && (
					<Link to={utils.resetUriByKey('page', activePage - 1)} className={s.pageBtn}>
						<i className="fa fa-angle-left" />
					</Link>
				)}
				{list}
				{activePage < maxAvailablePage && (
					<Link to={utils.resetUriByKey('page', activePage + 1)} className={s.pageBtn}>
						<i className="fa fa-angle-right" />
					</Link>
				)}
			</div>
		);
	};

	render() {
		// eslint-disable-next-line react/prop-types
		const { tally, products, filterState, catalog } = this.props;

		return (
			<div className={s.root}>
				<div className={s.container}>
					{Boolean(catalog && catalog.length) && (
						<div className={s.stepperContainer}>
							<div className={s.stepper}>
								<Link to="/products">All Products</Link>
							</div>
							{catalog.map(cat => (
								<div key={cat} className={s.stepper}>
									<Link to={`/products/${cat.split(' ').join('-')}`}>{cat}</Link>
								</div>
							))}
						</div>
					)}

					<CatalogFilter {...filterState} />

					{tally && products.length ? (
						<div style={{ display: 'flex', flexDirection: 'column' }}>
							<ProductList
								products={products}
								hideTopSellerTag={filterState.sort === 'topseller'}
							/>
							{typeof window !== 'undefined' && this.pageList()}
						</div>
					) : (
						<p style={{ fontSize: '2rem', color: 'grey' }}>0 result found.</p>
					)}

					<ScrollToTopButton showUnder={200} />
				</div>
			</div>
		);
	}
}

export default withStyles(s)(Catalog);
