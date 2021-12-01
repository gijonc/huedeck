/**
 * Huedeck
 */

import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { compose } from 'recompose';
import { Grid, withWidth } from '@material-ui/core';
import { Settings, Security } from '@material-ui/icons';
import s from './UserProfile.css';
import GeneralSettings from './editSections/GeneralSettings';
import SecurityPassword from './editSections/SecurityPassword';
import Link from '../../components/Link';
import history from '../../history';

class UserProfile extends React.Component {
	static propTypes = {
		width: PropTypes.string.isRequired,
		action: PropTypes.string,
	};

	static defaultProps = {
		action: 'profile',
	};

	componentDidMount() {
		history.push('/user/profile');
	}

	COMPONENT_LIST = {
		profile: 'Account settings',
		security: 'password & security',
	};

	render() {
		const { action, width } = this.props;

		return (
			<div className={s.root}>
				<div className={s.container}>
					<Grid container spacing={width === 'xs' ? 0 : 40}>
						<Grid item xs={12} sm={3}>
							<Link
								className={cx(s.tab, action === 'profile' && s.tabFocused)}
								to="/user/profile"
							>
								<Settings fontSize="small" />
								{this.COMPONENT_LIST.profile}
							</Link>

							<Link
								className={cx(s.tab, action === 'security' && s.tabFocused)}
								to="/user/security"
							>
								<Security fontSize="small" />
								{this.COMPONENT_LIST.security}
							</Link>
						</Grid>

						<Grid item xs={12} sm={9}>
							<div className={s.sectionWrapper}>
								<strong>{this.COMPONENT_LIST[action]}</strong>
								{action === 'profile' && <GeneralSettings />}
								{action === 'security' && <SecurityPassword />}
							</div>
						</Grid>
					</Grid>
				</div>
			</div>
		);
	}
}

export default compose(
	withStyles(s),
	withWidth(),
)(UserProfile);
