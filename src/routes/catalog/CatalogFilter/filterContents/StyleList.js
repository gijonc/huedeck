/**
 * Huedeck, Inc
 */

import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import styleSchema from 'routes/collectionList/collectionSchema';
import { Zoom } from '@material-ui/core';
import { Check } from '@material-ui/icons';
import Link from 'components/Link';
import utils from '../../../utils';
import s from './filterContent.css';

class StyleList extends React.Component {
	static propTypes = {
		onDone: PropTypes.func.isRequired,
		initState: PropTypes.arrayOf(PropTypes.string),
	};

	static defaultProps = {
		initState: [],
	};

	styleSchema = styleSchema['design style'];

	render() {
		const { onDone, initState } = this.props;

		return (
			<div className={s.container}>
				<div className={s.checkboxContent}>
					{this.styleSchema.map(style => (
						<Link
							className={s.checkBox}
							key={style}
							to={utils.getUpdatedUri('styles', style)}
						>
							<div>
								<Zoom in={initState.indexOf(style) !== -1}>
									<Check />
								</Zoom>
							</div>
							<span>{style}</span>
						</Link>
					))}
				</div>

				<div className={s.filterAction}>
					<Link to={utils.resetUriByKey('styles')}>reset</Link>
					<button className={s.applyBtn} onClick={() => onDone()}>
						done
					</button>
				</div>
			</div>
		);
	}
}

export default withStyles(s)(StyleList);
