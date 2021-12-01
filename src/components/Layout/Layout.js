import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

// external-global styles must be imported in your JS.
import normalizeCss from 'normalize.css';
import Alertbar from 'routes/Dialogs/Alertbar';
import s from './Layout.css';
import Header from '../Header';
import SubHeader from '../SubHeader';
import Footer from '../Footer';

class Layout extends React.Component {
	static propTypes = {
		children: PropTypes.node.isRequired,
		hideHeader: PropTypes.bool,
		hideSubHeader: PropTypes.bool,
		hideFooter: PropTypes.bool,
	};

	static defaultProps = {
		hideHeader: false,
		hideSubHeader: false,
		hideFooter: false,
	};

	render() {
		const { hideHeader, hideSubHeader, hideFooter, children } = this.props;

		return (
			<div>
				{!hideHeader && <Header />}
				{!hideSubHeader && <SubHeader />}
				<Alertbar />
				{children}
			</div>
		);
	}
}

export default withStyles(normalizeCss, s)(Layout);
