/**
 *	Huedeck, Inc.
 */

import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { Drawer, Divider, ButtonBase, LinearProgress, Fade } from '@material-ui/core';
import { Menu, Close } from '@material-ui/icons';
import { setUserDialog } from '../../actions/userDialog';
import { setScreenSize } from '../../actions/screenSize';
import Link from '../Link';
import utils from '../../routes/utils';
import UserActivity from './UserActivity';
// import Banner from './Banner';
import s from './Header.css';

class Header extends React.Component {
	static propTypes = {
		// eslint-disable-next-line
	 screenSize: PropTypes.object.isRequired,
		// eslint-disable-next-line
    loggedIn: PropTypes.object,
		dispatch: PropTypes.func.isRequired,
		progressBar: PropTypes.shape({
			start: PropTypes.bool,
		}).isRequired,
	};

	static defaultProps = {
		loggedIn: null,
	};

	state = {
		openDrawer: false,
		progress: 0,
	};

	componentWillMount() {
		this.updateDimensions();
	}

	componentDidMount() {
		window.addEventListener('resize', this.updateDimensions);
	}

	componentDidUpdate(prevProps) {
		if (prevProps.progressBar.start !== this.props.progressBar.start) {
			const inProgress = this.props.progressBar.start;
			if (inProgress) {
				this.timer = setInterval(this.progress, 800);
			} else {
				clearInterval(this.timer);
				this.endProgress();
			}
		}
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.updateDimensions);
	}

	updateDimensions = () => {
		if (typeof window !== 'undefined') {
			if (window.innerWidth !== this.props.screenSize.width) {
				this.props.dispatch(
					setScreenSize({
						width: window.innerWidth,
					}),
				);
			}
		}
	};

	endProgress = async () => {
		this.setState({ progress: 90 });
		await utils.wait(500);
		this.setState({ progress: 99 });
		await utils.wait(500);
		this.setState({ progress: 100 });
	};

	progress = () => {
		const { progress } = this.state;
		const diff = Math.random() * 10;
		this.setState({ progress: Math.min(progress + diff, 80) });
	};

	toggleDrawer = () => {
		this.setState({
			openDrawer: !this.state.openDrawer,
		});
	};

	triggerUserDialog = target => {
		this.toggleDrawer();
		this.props.dispatch(
			setUserDialog({
				target,
				toggle: true,
			}),
		);
	};

	render() {
		const { loggedIn, screenSize } = this.props;
		const { progress } = this.state;

		return (
			<div className={s.root}>
				<Fade unmountOnExit in={progress > 0 && progress < 100}>
					<LinearProgress
						className={s.progressBar}
						classes={{
							colorPrimary: s.linearColorPrimary,
							barColorPrimary: s.linearBarColorPrimary,
						}}
						variant="determinate"
						value={progress}
					/>
				</Fade>

				<div className={s.container}>
					{screenSize.width !== undefined && (
						<div className={s.headerContainer}>
							<div role="navigation">
								{screenSize.isMobileScreen && (
									<button style={{ paddingBottom: '4px' }} onClick={this.toggleDrawer}>
										<Menu />
									</button>
								)}
								<Link className={s.brand} to="/">
									Huedeck
								</Link>
							</div>

							{!screenSize.isMobileScreen ? (
								<div role="navigation">
									<Link className={s.link} to="/style-quiz">
										style quiz
									</Link>
									<Link className={s.link} to="/shop">
										shop
									</Link>
									<Link className={s.link} to="/scene">
										Scene
									</Link>
									<Link className={s.link} to="/collections">
										Collections
									</Link>
								</div>
							) : (
								<Drawer open={this.state.openDrawer} onClose={this.toggleDrawer}>
									<div className={s.miniNav}>
										<button onClick={this.toggleDrawer}>
											<Close fontSize="large" />
										</button>

										<ButtonBase
											onClick={this.toggleDrawer}
											component={Link}
											className={s.link}
											to="/style-quiz"
										>
											style quiz
										</ButtonBase>
										<Divider />
										<ButtonBase
											onClick={this.toggleDrawer}
											component={Link}
											className={s.link}
											to="/shop"
										>
											shop
										</ButtonBase>
										<Divider />
										<ButtonBase
											onClick={this.toggleDrawer}
											component={Link}
											className={s.link}
											to="/scene"
										>
											scene
										</ButtonBase>
										<Divider />
										<ButtonBase
											onClick={this.toggleDrawer}
											component={Link}
											className={s.link}
											to="/collections"
										>
											Collections
										</ButtonBase>
										<Divider />

										{!loggedIn && (
											<div>
												<ButtonBase
													className={s.link}
													onClick={() => this.triggerUserDialog('signup')}
												>
													sign up
												</ButtonBase>
												<Divider />
												<ButtonBase
													className={s.link}
													onClick={() => this.triggerUserDialog('login')}
												>
													log in
												</ButtonBase>
												<Divider />
											</div>
										)}
									</div>
								</Drawer>
							)}

							<UserActivity isMobileScreen={screenSize.isMobileScreen} />
						</div>
					)}
				</div>
			</div>
		);
	}
}

export default compose(
	connect(state => ({
		loggedIn: state.loggedIn,
		progressBar: state.progressBar,
		screenSize: state.screenSize,
	})),
	withStyles(s),
)(Header);
