/**
 *	Huedeck, Inc.
 */
import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import PropTypes from 'prop-types';
import { Fade } from '@material-ui/core';
import s from './ProductList.css';

class ProductImage extends React.Component {
	static propTypes = {
		src: PropTypes.string.isRequired,
		alt: PropTypes.string.isRequired,
	};

	state = {
		loaded: false,
	};

	componentDidMount() {
		this.mounted = true;
		this.preload();
	}

	componentWillUnmount() {
		this.mounted = false;
	}

	preload = () => {
		const img = new Image();
		img.onload = () => {
			if (this.mounted) {
				this.setState({
					loaded: true,
				});
			}
		};

		img.onerror = () => {
			this.setState({
				loaded: true,
			});
		};

		img.src = this.props.src;
	};

	handleImgError = e => {
		e.target.onerror = null;
		// backup image
		e.target.src = `https: //cdn.shopify.com/s/files/1/0018/5666/7766/products/${this.props.src
			.split('/')
			.pop()}`;
	};

	render() {
		return (
			<div className={s.frame} style={this.state.loaded ? { background: '#fff' } : {}}>
				<span />
				<Fade timeout={500} in={this.state.loaded}>
					<img src={this.props.src} alt={this.props.alt} onError={this.handleImgError} />
				</Fade>
			</div>
		);
	}
}

export default withStyles(s)(ProductImage);
