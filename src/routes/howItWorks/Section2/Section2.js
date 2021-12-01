/**
 * Huedeck, Inc
 */

import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Section2.css';

class Section2 extends React.Component {
	static propTypes = {
		imgUrl: PropTypes.string.isRequired,
		scrollToSection: PropTypes.func.isRequired,
	};

	render() {
		return (
			<div className={s.section}>
				<div className={s.container}>
					<h1>See Who Loves Huedeck</h1>
					<div className={s.logosWrapper}>
						<div className={s.logo1} />
						<div className={s.logo2} />
						<div className={s.logo3} />
						<div className={s.logo4} />
						<div className={s.logo5} />
					</div>

					<div className={s.mainContent}>
						<div className={s.leftPart}>
							<div>
								<h1>
									How <br />
									it <br />
									Works?
								</h1>
							</div>
							<button className={s.button} onClick={() => this.props.scrollToSection(2)}>
								Try it now!
							</button>
						</div>

						<div className={s.rightPart}>
							{/* <ArrowForward fontSize="inherit" /> */}
							<div className={s.arrowIcon} />

							<div className={s.card}>
								<div className={s.cardImgWrapper}>
									<span className={s.imgIdx}>1</span>
									<img src={`${this.props.imgUrl}s2_p1.jpg`} alt=" " />
								</div>

								<div className={s.cardTitle}>
									Show us your space or pick your favorite colors
								</div>
								<div className={s.cardDesc}>
									Take a photo of your home or choose the matching colors
								</div>
							</div>

							{/* <ArrowForward fontSize="inherit" /> */}
							<div className={s.arrowIcon} />

							<div className={s.card}>
								<div className={s.cardImgWrapper}>
									<span className={s.imgIdx}>2</span>
									<img src={`${this.props.imgUrl}s2_p2.jpg`} alt=" " />
								</div>

								<div className={s.cardTitle}>Generate Your Matching Color Palette</div>

								<div className={s.cardDesc}>
									Watch as Huedeck generates the exact color palette to match your choices
								</div>
							</div>

							{/* <ArrowForward fontSize="inherit" /> */}
							<div className={s.arrowIcon} />

							<div className={s.card}>
								<div className={s.cardImgWrapper}>
									<span className={s.imgIdx}>3</span>
									<img src={`${this.props.imgUrl}s2_p3.jpg`} alt=" " />
								</div>

								<div className={s.cardTitle}>Shop!</div>
								<div className={s.cardDesc}>
									Shop with ease knowing anything you buy will match your home
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default withStyles(s)(Section2);
