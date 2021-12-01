/**
 * Huedeck, Inc
 */

import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { FacebookShareButton, TwitterShareButton, EmailShareButton } from 'react-share';
import Slider from 'react-slick';
import Link from 'components/Link';
import s from './Section1.css';

class Section1 extends React.Component {
	static propTypes = {
		imgUrl: PropTypes.string.isRequired,
		scrollToSection: PropTypes.func.isRequired,
	};

	state = {
		loaded: false,
	};

	componentDidMount() {
		this.preload(this.props.imgUrl + this.IMG_2_COLLECTION[0].imgSrc);
	}

	preload = imgSrc => {
		const img = new Image();
		img.onload = () => {
			this.setState({
				loaded: true,
			});
		};
		img.src = imgSrc;
	};

	IMG_2_COLLECTION = [
		{ imgSrc: 's1_sl_p1.jpg', id: 'HJtONp76Q' },
		{ imgSrc: 's1_sl_p2.jpg', id: 'Hy3b9_4kV' },
		{ imgSrc: 's1_sl_p3.jpg', id: 'Hk7DNDFiQ' },
		{ imgSrc: 's1_sl_p4.jpg', id: 'r1Kt6FuO7' },
		{ imgSrc: 's1_sl_p5.jpg', id: 'ByNA60aR7' },
	];

	render() {
		const { loaded } = this.state;
		const settings = {
			dots: true,
			autoplay: true,
			arrows: false,
			autoplaySpeed: 5000,
			pauseOnHover: true,
			speed: 1500,
		};

		return (
			<div className={s.section}>
				<div className={s.container}>
					<div className={s.textWrapper}>
						<div>
							<h1>Easiest &amp; Most</h1>
							<br />
							<h1>Delightful Way to</h1>
							<br />
							<h1>Decorate Your Home</h1>
						</div>

						<div className={s.subDesc}>
							<span>With Huedeck&apos;s easy to use Palette Generator,</span>
							<br />
							<span>you&apos;ll never stress about home decor again!</span>
						</div>

						<button className={s.button} onClick={() => this.props.scrollToSection(2)}>
							Try it now!
						</button>
					</div>

					<div style={{ visibility: loaded ? 'visible' : 'hidden' }} className={s.slider}>
						<Slider {...settings}>
							{this.IMG_2_COLLECTION.map(cl => (
								<div key={cl.imgSrc} className={s.imgWrapper}>
									<Link to={`/collection/${cl.id}`}>
										<div style={{ display: 'none' }} />
									</Link>
									<img src={this.props.imgUrl + cl.imgSrc} alt=" " />
								</div>
							))}
						</Slider>
					</div>

					<div
						className={s.shareBtnList}
						style={{ visibility: loaded ? 'visible' : 'hidden' }}
					>
						<FacebookShareButton url="https://www.huedeck.com" className={s.shareBtn}>
							<i className="fa fa-facebook-f" />
						</FacebookShareButton>

						<TwitterShareButton url="https://www.huedeck.com" className={s.shareBtn}>
							<i className="fa fa-twitter" />
						</TwitterShareButton>

						<EmailShareButton url="https://www.huedeck.com" className={s.shareBtn}>
							<i className="fa fa-envelope-o" />
						</EmailShareButton>
					</div>
				</div>
			</div>
		);
	}
}

export default withStyles(s)(Section1);
