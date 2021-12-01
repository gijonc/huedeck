/**
 *	Huedeck, Inc
 */

import React from 'react';
import PropTypes from 'prop-types';
import ImageLoader from 'react-load-image';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import Slider from 'react-slick';
import Link from 'components/Link';
import s from './Slideshow.css';

class Slideshow extends React.Component {
	static propTypes = {
		isMobileScreen: PropTypes.bool.isRequired,
	};

	IMG_2_COLLECTION = [
		{ imgSrc: 'sl_2.jpg', id: 'Hy3b9_4kV' },
		{ imgSrc: 'sl_3.jpg', id: 'ByosareYX' },
		{ imgSrc: 'sl_4.jpg', id: 'BktREOY_Q' },
		{ imgSrc: 'sl_5.jpg', id: 'SyAM0bUu7' },
		{ imgSrc: 'sl_6.jpg', id: 'r1uLkeRRQ' },
	];

	render() {
		const settings = {
			dots: true,
			autoplay: true,
			arrows: false,
			autoplaySpeed: 5000,
			pauseOnHover: true,
			speed: 1000,
		};

		let srcPath = 'https://storage.googleapis.com/huedeck/img/collections/';
		// use mini picture for small screen devices
		if (this.props.isMobileScreen) srcPath += 'm/';

		return (
			<div className={s.container}>
				<Slider {...settings}>
					{this.IMG_2_COLLECTION.map(cl => (
						<Link to={`/collection/${cl.id}`} key={cl.imgSrc}>
							<ImageLoader src={srcPath + cl.imgSrc}>
								<img alt=" " />
								<div className={s.preloader} />
								<div className={s.preloader} />
							</ImageLoader>
						</Link>
					))}
				</Slider>
			</div>
		);
	}
}

export default compose(
	connect(state => ({
		isMobileScreen: state.screenSize.width < 480,
	})),
	withStyles(s),
)(Slideshow);
