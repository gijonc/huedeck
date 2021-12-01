/**
 *	Huedeck, Inc
 */

import withStyles from 'isomorphic-style-loader/lib/withStyles';
import React from 'react';
import ScrollToTop from 'react-scroll-up';
import s from './utilities.css';

const ScrollToTopButton = props => (
	<ScrollToTop {...props}>
		<button className={s.scrollTopBtn}>
			<i className="fa fa-arrow-up" />
		</button>
	</ScrollToTop>
);

export default withStyles(s)(ScrollToTopButton);
