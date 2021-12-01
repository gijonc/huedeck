/**
 *	Huedeck, Inc
 */

import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import { Dialog } from '@material-ui/core';
import { toggleAddedCartDialog } from 'actions/addedCartDialog';
import { CloseButton } from '../../../components/Utilities';
import Link from '../../../components/Link';
import s from './addedCartDialog.css';

class AddedCartDialog extends React.Component {
	static propTypes = {
		dispatch: PropTypes.func.isRequired,
		// eslint-disable-next-line
		addedCartDialog: PropTypes.object.isRequired,
	};

	closeDialog = () => {
		clearTimeout(this.timer);
		this.props.dispatch(
			toggleAddedCartDialog({
				open: false,
			}),
		);
	};

	autoClose = () => {
		this.timer = setTimeout(() => {
			this.closeDialog();
		}, 4000);
	};

	render() {
		const { item, open } = this.props.addedCartDialog;

		if (!open || item === null) return null;

		return (
			<Dialog open={open} onEntered={this.autoClose} onClose={this.closeDialog} maxWidth="sm">
				<CloseButton onClick={this.closeDialog} />
				<div className={s.container}>
					<div className={s.imgWrapper}>
						<img src={item.imgSrc} alt="" />
					</div>

					<div className={s.itemInfo}>
						<h1>{item.title}</h1>
						<div className={s.message}>
							<i className="fa fa-check-circle" />
							<span>Added to Your Cart!</span>
						</div>

						<div className={s.ctrlBtnGroup}>
							<button onClick={this.closeDialog} className={s.ctrlBtn}>
								continue shopping
							</button>

							<Link to="/cart" className={s.ctrlBtn}>
								go to cart
							</Link>
						</div>
					</div>
				</div>
			</Dialog>
		);
	}
}

export default compose(
	connect(state => ({
		addedCartDialog: state.addedCartDialog,
	})),
	withStyles(s),
)(AddedCartDialog);
