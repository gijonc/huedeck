import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import PropTypes from 'prop-types';
import s from './Loader.css';

class Loader extends React.Component {
	static propTypes = {
		color: PropTypes.string,
	};

	static defaultProps = {
		color: '#ffd800',
	};

	render() {
		return (
			<div style={{ textAlign: 'center', fontSize: '13px' }}>
				<div className={s.spinner}>
					<div className={s.rect1} style={{ backgroundColor: this.props.color }} />
					<div className={s.rect2} style={{ backgroundColor: this.props.color }} />
					<div className={s.rect3} style={{ backgroundColor: this.props.color }} />
					<div className={s.rect4} style={{ backgroundColor: this.props.color }} />
					<div className={s.rect5} style={{ backgroundColor: this.props.color }} />
				</div>
				<span>loading...</span>
			</div>
		);
	}
}

export default withStyles(s)(Loader);
