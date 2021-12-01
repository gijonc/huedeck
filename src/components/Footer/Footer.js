/**
 *	Huedeck, Inc
 */

import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Footer.css';
import Link from '../Link';

class Footer extends React.Component {
	render() {
		return (
			<div className={s.root}>
				<div className={s.container}>
					<div className={s.linkSection}>
						<div className={s.linkList}>
							<strong>HELP</strong>
							<Link className={s.link} to="/docs/huedeck_shipping_policy">
								Shipping
							</Link>
							<Link className={s.link} to="/docs/huedeck_return_policy">
								Return
							</Link>
							<Link className={s.link} to="/docs/huedeck_faqs">
								FAQs
							</Link>
						</div>

						<div className={s.linkList}>
							<strong>EXPLORE</strong>
							<Link className={s.link} to="/about">
								About Us
							</Link>
							<Link className={s.link} to="/how-it-works">
								How it Works
							</Link>
						</div>

						<div className={s.linkList}>
							<strong>CONTACT</strong>
							<a className={s.link} href="mailto:hi@huedeck.com">
								hi@huedeck.com
							</a>
							<span>Huedeck, Inc.</span>
							<span>39899 Balentine Dr</span>
							<span>Suite 200</span>
							<span>Newark CA 94560</span>
						</div>
					</div>

					<div className={s.brandSection}>
						<div className={s.socialBtnGroup}>
							<a
								href="https://www.instagram.com/huedeck/"
								target="_blank"
								rel="noopener noreferrer"
								className={s.socialBtn}
							>
								<i className="fa fa-instagram" />
							</a>

							<a
								href="https://www.facebook.com/huedeck.inc"
								target="_blank"
								rel="noopener noreferrer"
								className={s.socialBtn}
							>
								<i className="fa fa-facebook-f" />
							</a>

							<a
								href="https://www.pinterest.com/huedeckinc/"
								target="_blank"
								rel="noopener noreferrer"
								className={s.socialBtn}
							>
								<i className="fa fa-pinterest-p" />
							</a>
						</div>

						<div>
							<Link className={s.link} to="/docs/huedeck_privacy_policy">
								Privacy Policy
							</Link>
							<span> &middot; </span>
							<Link className={s.link} to="/docs/huedeck_terms_of_service">
								Terms of Service
							</Link>
						</div>

						<p>Copyright &copy; 2018-2019, Huedeck, Inc. - All Rights Reserved.</p>
					</div>
				</div>
			</div>
		);
	}
}

export default withStyles(s)(Footer);
