/**
 *	Huedeck, Inc
 */

import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './MasonryView.css';
import RoomItem from '../RoomItem';

class MasonryView extends React.Component {
	static propTypes = {
		// eslint-disable-next-line
		productList: PropTypes.arrayOf(PropTypes.object).isRequired,
		palette: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
		findSimPd: PropTypes.func.isRequired,
	};

	render() {
		const { productList, palette } = this.props;
		return (
			<div className={s.container}>
				<div className={s.masonryContainer}>
					{productList.map(pd => (
						<RoomItem
							key={pd.ProductID}
							product={pd}
							palette={palette}
							findSimPd={this.props.findSimPd}
						/>
					))}
				</div>
			</div>
		);
	}
}

export default withStyles(s)(MasonryView);
