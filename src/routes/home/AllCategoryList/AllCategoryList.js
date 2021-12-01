/**
 * Huedeck, Inc.
 */

import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import PropTypes from 'prop-types';
// import cx from 'classnames';
// import constants from '../constants';
// import utils from '../utils';
import { Dialog } from '@material-ui/core';
import { CloseButton } from '../../../components/Utilities';
import Link from '../../../components/Link';
import CategorySchema from './category.json';
import s from './AllCategoryList.css';

function mergeCategory2() {
	const list = [];
	Object.keys(CategorySchema).forEach(cat1 => {
		Object.keys(CategorySchema[cat1]).forEach(cat2 => {
			list.push({
				parent: cat1,
				name: cat2,
				subCategoryList: CategorySchema[cat1][cat2],
				listLength: CategorySchema[cat1][cat2].length,
			});
		});
	});

	function compareListLength(a, b) {
		// sort from hight to low
		if (a.listLength < b.listLength) return 1;
		if (a.listLength > b.listLength) return -1;
		return 0;
	}

	list.sort(compareListLength);
	return list;
}

class AllCategoryList extends React.Component {
	static propTypes = {
		onClose: PropTypes.func.isRequired,
		open: PropTypes.bool.isRequired,
		// eslint-disable-next-line
		screenSize: PropTypes.object.isRequired
	};

	categoryList = mergeCategory2();

	render() {
		const { onClose, open } = this.props;

		return (
			<Dialog
				fullScreen={Boolean(this.props.screenSize.width <= 960)}
				maxWidth="md"
				open={open}
				onClose={onClose}
			>
				<CloseButton onClick={onClose} />
				<div className={s.container}>
					{this.categoryList.map(obj => (
						<div key={obj.name} className={s.column}>
							<Link to={`/products/${obj.name.split(' ').join('-')}`}>
								<strong className={s.header}>{obj.name}</strong>
							</Link>
							{obj.subCategoryList.slice(0, 5).map(cat3 => (
								<Link key={cat3} to={`/products/${cat3.split(' ').join('-')}`}>
									{cat3}
								</Link>
							))}
							{obj.listLength > 5 && (
								<Link to={`/products/${obj.name.split(' ').join('-')}`}>
									<strong>view all</strong>
								</Link>
							)}
						</div>
					))}
				</div>
			</Dialog>
		);
	}
}

export default compose(
	connect(state => ({
		screenSize: state.screenSize,
	})),
	withStyles(s),
)(AllCategoryList);
