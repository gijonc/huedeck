/**
 * Huedeck, Inc
 */

import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { compose } from 'recompose';
import { connect } from 'react-redux';
// import reactCSS from 'reactcss';
import { Dialog, DialogTitle, DialogActions } from '@material-ui/core';
import { setConfirmDialog } from 'actions/confirmDialog';
import { CloseButton } from '../../components/Utilities';
import s from './ConfirmDialog.css';

const confirmDialogType = {
	confirmKey: PropTypes.string,
	type: PropTypes.string,
	query: PropTypes.string,
	open: PropTypes.bool,
};

class ConfirmDialog extends React.Component {
	static contextTypes = {
		store: PropTypes.object.isRequired,
		client: PropTypes.object.isRequired,
	};

	static propTypes = {
		dispatch: PropTypes.func.isRequired,
		toggleConfirmDialog: PropTypes.shape(confirmDialogType).isRequired,
		complete: PropTypes.func.isRequired,
	};

	handleComplete = async type => {
		await this.props.complete(type);
		this.handleDialogClose();
	};

	handleDialogClose = () => {
		this.props.dispatch(
			setConfirmDialog({
				open: false,
			}),
		);
	};

	render() {
		const { toggleConfirmDialog } = this.props;

		return (
			<Dialog open={toggleConfirmDialog.open} onClose={this.handleDialogClose} maxWidth="sm">
				<CloseButton onClick={this.handleDialogClose} />
				<DialogTitle disableTypography>
					<h2 className={s.title}>{toggleConfirmDialog.query}</h2>
				</DialogTitle>

				<DialogActions>
					<button onClick={this.handleDialogClose} className={s.dismissBtn}>
						dismiss
					</button>
					<button
						onClick={() => this.handleComplete(toggleConfirmDialog.type)}
						className={s.confirmBtn}
					>
						{toggleConfirmDialog.confirmKey}
					</button>
				</DialogActions>
			</Dialog>
		);
	}
}

export default compose(
	connect(state => ({
		toggleConfirmDialog: state.confirmDialog,
	})),
	withStyles(s),
)(ConfirmDialog);
