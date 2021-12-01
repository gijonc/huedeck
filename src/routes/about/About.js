/**
 * Huedeck, Inc.
 */

import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import cx from 'classnames';
// import PropTypes from 'prop-types';
import s from './About.css';

const img1 = 'https://storage.googleapis.com/huedeck/img/about/img1.jpg';
const img2 = 'https://storage.googleapis.com/huedeck/img/about/img2.jpg';
const img3 = 'https://storage.googleapis.com/huedeck/img/about/img3.jpg';

class About extends React.Component {
	render() {
		return (
			<div className={s.root}>
				<div className={s.container}>
					<div className={s.title}>
						<div className={s.quoteBefore} />
						<h1>
							Huedeck is your very own Personal Home Stylist that helps you find the best
							matching items for your home.
						</h1>
						<div className={s.quoteAfter} />
					</div>

					<div className={cx(s.content, s.rightAlign)}>
						<div className={s.contentImg}>
							<img src={img1} alt=" " />
						</div>
						<div className={s.contentText}>
							<h1>What does Huedeck Stand for?</h1>
							<p>
								Hue standing for color and Deck for decoration, Huedeck has perfected the
								technology that matters most in home design, matching the colors. Huedeck is
								the first online store that helps you find the exact furniture that fits
								best. Matching every item in your house with our patented color palette
								technology. It is Huedeck&apos;s mission to relieve your stress, save you
								time and money, and bring wonderful designs to your home, with care of
								harmony.
							</p>
						</div>
					</div>

					<div className={cx(s.content, s.leftAlign)}>
						<div className={s.contentImg}>
							<img src={img2} alt=" " />
						</div>
						<div className={s.contentText}>
							<h1>Why we started Huedeck?</h1>
							<p>
								When our founders, Jin & Niya, bought their first home in 2017, they ran
								into a major problem. &quot;How are we going to decorate it?!&quot; Today,
								online furniture stores offer so many choices, but there&apos;s no clear
								direction. Furnishing is like a giant puzzle if you do not have the
								designer&apos;s sense. You never know if what you&apos;re buying will match
								your room or even worse, compromise the other furniture in it. Sometimes,
								it&apos;s the wrong shade of color or wrong style completely. And who has
								the money to pay a designer thousands to get it right? They found this out
								firsthand as they spent months going from store to store, just to decorate a
								single room!
							</p>
						</div>
					</div>
					<div className={cx(s.content, s.rightAlign)}>
						<div className={s.contentImg}>
							<img src={img3} alt=" " />
						</div>
						<div className={s.contentText}>
							<h1>The Solution from Huedeck</h1>
							<p>
								Your very own Personal Home Stylist, all at the touch of your fingertips.
								With major advancements in technology, Jin & Niya find out that you can get
								help designing your room in seconds. With full control over exactly what you
								want. No more spending hours looking through furniture stores, or hoping
								that the color matches your home. Designing your room has never been easier,
								with one simple click. With this knowledge in hand, they founded Huedeck.
							</p>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default withStyles(s)(About);
