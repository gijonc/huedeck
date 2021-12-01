/**
 * Huedeck, Inc
 */
import React from 'react';
import PropTypes from 'prop-types';
import reactCSS from 'reactcss';
import { connect } from 'react-redux';
import { Snackbar, SnackbarContent, ButtonBase } from '@material-ui/core';
import { Error, Close, CheckCircle } from '@material-ui/icons';

import { setAlertbar } from '../../actions/alertbar';

const styles = reactCSS({
	default: {
		alertbar: {
			height: '60px',
			marginTop: '10px',
			fontSize: '16px',
			backgroundColor: '#F5F5F5',
			color: '#000',
		},
	},
});

const AlertBarType = {
	status: PropTypes.string,
	message: PropTypes.string,
	open: PropTypes.bool,
};

class Alertbar extends React.Component {
	static propTypes = {
		alertbar: PropTypes.shape(AlertBarType).isRequired,
	};

	static contextTypes = {
		store: PropTypes.object.isRequired,
	};

	handleClose = () => {
		this.context.store.dispatch(
			setAlertbar({
				open: false,
			}),
		);
		if (this.props.alertbar.status === 'error') window.location.reload();
	};

	render() {
		const { alertbar } = this.props;

		if (!alertbar) return null;

		return (
			<Snackbar
				anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
				autoHideDuration={alertbar.status === 'success' ? 5000 : null}
				open={alertbar.open}
				onClose={this.handleClose}
			>
				<SnackbarContent
					style={styles.alertbar}
					aria-describedby="client-snackbar"
					message={
						<div>
							{alertbar.status === 'success' ? (
								<CheckCircle
									fontSize="small"
									style={{ marginRight: '10px', color: 'yellowGreen' }}
								/>
							) : (
								<Error color="error" fontSize="small" style={{ marginRight: '10px' }} />
							)}
							{alertbar.message}
						</div>
					}
					action={[
						<ButtonBase key="close" aria-label="close" onClick={this.handleClose}>
							<Close color="disabled" />
						</ButtonBase>,
					]}
				/>
			</Snackbar>
		);
	}
}

export default connect(state => ({
	alertbar: state.alertbar,
}))(Alertbar);
