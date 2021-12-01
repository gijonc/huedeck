/**
 *	Huedeck, Inc
 */

import withStyles from 'isomorphic-style-loader/lib/withStyles';
import React from 'react';
import s from './utilities.css';

const LineThrough = () => <p className={s.lineThrough}>OR</p>;

export default withStyles(s)(LineThrough);
