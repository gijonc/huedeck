/**
 * Huedeck
 */

import React from 'react';
// import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './NotFound.css';
import Link from '../../components/Link';

class NotFound extends React.Component {
	//   static propTypes = {};

	render() {
		return (
			<div className={s.root}>
				<div className={s.container}>
					<h1>Oops, page not found...</h1>
					<Link className={s.homeBtn} to="/">
						send me home
					</Link>
				</div>
			</div>
		);
	}
}

export default withStyles(s)(NotFound);
