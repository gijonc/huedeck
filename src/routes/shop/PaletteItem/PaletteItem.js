/**
 *	Huedeck, Inc.
 */
import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import Link from '../../../components/Link';
import ProductList from '../../brand/ProductList';
import utils from '../../utils';
import s from './PaletteItem.css';

class PaletteItem extends React.Component {
	static contextTypes = {
		store: PropTypes.object.isRequired,
		client: PropTypes.object.isRequired,
	};

	static propTypes = {
		changeProductView: PropTypes.func.isRequired,
		hideTopSellerTag: PropTypes.bool.isRequired,
		tally: PropTypes.number.isRequired,
		activePage: PropTypes.number.isRequired,
		// eslint-disable-next-line
    paletteData: PropTypes.object.isRequired,
	};

	pageList = () => {
		const { tally, activePage, paletteData } = this.props;
		function goToPage(p) {
			return utils.goToShop(paletteData.paletteHexArr, p);
		}
		const maxAvailablePage = Math.ceil(tally / 30); // 30 item per page, get max available page
		if (maxAvailablePage <= 1) {
			return null;
		}

		const listMax = window.screen.width > 600 ? 9 : 3; // determine max number of selection by screen width

		let listBegin = activePage - Math.floor(listMax / 2);
		if (listBegin <= 0) listBegin = 1;

		let listEnd = listBegin + listMax - 1;
		if (listEnd > maxAvailablePage) listEnd = maxAvailablePage;

		const list = [];
		for (let i = listBegin; i <= listEnd; i += 1) {
			list.push(
				<Link
					className={s.pageBtn}
					key={i}
					to={goToPage(i)}
					style={activePage === i ? { pointerEvents: 'none', background: '#ffd800' } : {}}
				>
					{i}
				</Link>,
			);
		}

		return (
			<div className={s.pagingCtrl}>
				{listBegin > 1 && (
					<Link to={goToPage(1)} className={s.pageBtn}>
						<i className="fa fa-angle-double-left" />
					</Link>
				)}
				{activePage > 1 && (
					<Link to={goToPage(activePage - 1)} className={s.pageBtn}>
						<i className="fa fa-angle-left" />
					</Link>
				)}
				{list}
				{activePage < maxAvailablePage && (
					<Link to={goToPage(activePage + 1)} className={s.pageBtn}>
						<i className="fa fa-angle-right" />
					</Link>
				)}
			</div>
		);
	};

	//
	/* ---------------------- Rendering ---------------------- */
	render() {
		const { paletteHexArr, itemListArr, view } = this.props.paletteData;

		if (!itemListArr.length) return <div className={s.noItemFound} />;

		return (
			<div className={s.container}>
				<div className={s.itemList}>
					<ProductList
						products={itemListArr}
						palette={paletteHexArr}
						hideTopSellerTag={this.props.hideTopSellerTag}
					/>
				</div>

				{view !== 'room' ? (
					typeof window !== 'undefined' && this.pageList()
				) : (
					<div className={s.pdCtrl}>
						<button
							className={s.pdCtrlBtn}
							onClick={() => this.props.changeProductView('all')}
						>
							show all items
						</button>
						<button
							className={s.pdCtrlBtn}
							onClick={() => this.props.changeProductView('room')}
						>
							change the set
						</button>
					</div>
				)}
			</div>
		);
	}
}

export default compose(
	connect(state => ({
		paletteData: state.paletteData,
	})),
	withStyles(s),
)(PaletteItem);
