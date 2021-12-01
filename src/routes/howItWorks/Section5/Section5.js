/**
 * Huedeck, Inc
 */

import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Section5.css';

class Section5 extends React.Component {
	render() {
		return (
			<div className={s.section}>
				<div className={s.container}>
					<div className={s.leftPart}>
						<h1>Other</h1>
						<br />
						<h1>Customers</h1>
						<br />
						<h1>Who</h1>
						<br />
						<h1>Love Us</h1>
					</div>

					<div className={s.carList}>
						<div className={s.card}>
							<div className={s.cardHeader}>Huedeck is the BEST!</div>
							<div className={s.cardContext}>
								<strong>&#9733; &#9733; &#9733; &#9733; &#9733;</strong>
								<p>
									I am so absolutely happy me and my husband chose to use Huedeck to
									decorate our new home. We’ve tried so many other stores online and we
									were just left confused and frustrated. Huedeck was the only place where
									we could find furniture that matched our home with ease. It saved us so
									many hours and the prices were amazing!
								</p>

								<div className={s.cardFooter}>Carrie D. San Diego, CA</div>
							</div>
						</div>

						<div className={s.card}>
							<div className={s.cardHeader}>I LOVE HUEDECK!</div>
							<div className={s.cardContext}>
								<strong>&#9733; &#9733; &#9733; &#9733; &#9733;</strong>
								<p>
									The furniture I purchased looks amazing! Way better than I ever expected,
									the quality was excellent and it arrived in perfect condition. Best of
									all I didn’t even have to worry about it not matching my place. Huedeck
									took care of all of that and I could shop stress free! I’m so glad I
									bought my furniture on Huedeck!
								</p>

								<div className={s.cardFooter}>Helen S. Nashville, TN</div>
							</div>
						</div>

						<div className={s.card}>
							<div className={s.cardHeader}>So impressed with everything I got!</div>
							<div className={s.cardContext}>
								<strong>&#9733; &#9733; &#9733; &#9733; &#9733;</strong>
								<p>
									Huedeck is so easy to use! After I picked my color palette they showed me
									so many gorgeous products that match my home. It made my home decor
									project much easier following with a palette. I feel like having a
									personal stylist, for free! I’m already recommending Huedeck to my
									friends.
								</p>

								<div className={s.cardFooter}>Tommy L. Cleveland, OH</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default withStyles(s)(Section5);
