/**
 * Huedeck, Inc
 */

import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Section4.css';

class Section4 extends React.Component {
	static propTypes = {
		imgUrl: PropTypes.string.isRequired,
	};

	render() {
		return (
			<div className={s.section}>
				<div className={s.container}>
					<div className={s.title}>
						<h1>Real</h1>
						<br />
						<h1>Design Stories</h1>
						<br />
						<h1>from our Customer</h1>
					</div>

					<div className={s.designShowCase}>
						<div className={s.reviewCard}>
							<div className={s.cardHeader}>Maria S.</div>
							<p>
								I absolutely love how easy and quick it was to use Huedeck’ s Palette
								Generator! I’ ve always had so much trouble figuring out what will match my
								furniture, but now I don’ t even have to think twice.And all the products
								are amazingly made! 5 stars from me!
							</p>
						</div>

						<div className={s.imgBefore}>
							<span>before</span>
							<img src={`${this.props.imgUrl}s4_p1.jpg`} width="100%" alt=" " />
						</div>

						<div className={s.imgAfterAndPalette}>
							<div className={s.imgAfter}>
								<span>after</span>
								<img src={`${this.props.imgUrl}s4_p2.jpg`} width="100%" alt=" " />
							</div>

							<div className={s.imgPalette}>
								<span>
									color
									<br /> palette
								</span>
								<div className={s.paletteWrapper}>
									{['#313340', '#09646D', '#A6370C', '#D39021', '#DBB69C'].map(
										(hex, i) => (
											// eslint-disable-next-line
							<div className={s.paletteBlock} key={hex + i} style={{ backgroundColor: hex }} />
										),
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default withStyles(s)(Section4);
