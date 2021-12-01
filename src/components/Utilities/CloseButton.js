/**
 *	Huedeck, Inc
 */

import withStyles from 'isomorphic-style-loader/lib/withStyles';
import React from 'react';
import { ButtonBase } from '@material-ui/core';
import s from './utilities.css';

const CloseButton = props => (
	<ButtonBase className={s.closeButton} {...props}>
		<span>&#10005;</span>
	</ButtonBase>
);

export default withStyles(s)(CloseButton);
