/**
 *	Huedeck, Inc.
 */
import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Waypoint from 'react-waypoint';
import s from './ProductDescription.css';

class ProductDescription extends React.Component {
	static propTypes = {
		rawSpec: PropTypes.string.isRequired,
		rawPdCare: PropTypes.string.isRequired,
		shippingMethod: PropTypes.string.isRequired,
	};

	state = {
		activeTab: 'spec',
	};

	init = () => {
		const { rawSpec, rawPdCare } = this.props;

		let specification = 'N/A';
		let productCare = 'N/A';

		if (rawSpec && rawSpec !== '') {
			const specHtml = rawSpec.match('(.*)</p>')[1];
			const specList = specHtml.split('<br>');
			const { length } = specList;

			// split into two part if too many lines
			specification =
				length >= 8
					? [specList.slice(0, length / 2), specList.slice(length / 2, length)]
					: [specList];
		}

		if (rawPdCare && rawPdCare !== '') {
			productCare = rawPdCare.match('Product care: (.*)</p>')[1];
		}

		this.setState({
			specification,
			productCare,
		});
	};

	shippingCopy = shippingMethod => {
		let shipping = '';
		if (shippingMethod === 'parcel') {
			shipping =
				'Shipping Method: Standard Shipping. Free standard shipping for orders over $149.';
		} else if (shippingMethod === 'ltl') {
			shipping = 'Shipping Method: Freight and White-Glove Delivery.';
		} else if (shippingMethod === 'white glove') {
			shipping = 'Shipping Method: White-Glove Delivery.';
		} else {
			shipping = 'Shipping Method: N/A.';
		}
		return shipping;
	};

	render() {
		const { specification, productCare, activeTab } = this.state;

		return (
			<Waypoint onEnter={this.init}>
				<div className={s.container}>
					<div className={s.tabs}>
						<button
							className={cx(activeTab === 'spec' && s.activeTab)}
							onClick={() => {
								this.setState({ activeTab: 'spec' });
							}}
						>
							specification
						</button>

						<button
							className={cx(activeTab === 'pdCare' && s.activeTab)}
							onClick={() => {
								this.setState({ activeTab: 'pdCare' });
							}}
						>
							product care
						</button>

						<button
							className={cx(activeTab === 'shipping' && s.activeTab)}
							onClick={() => {
								this.setState({ activeTab: 'shipping' });
							}}
						>
							shipping & return
						</button>
					</div>

					{specification && productCare && (
						<div className={s.tabContent}>
							{activeTab === 'spec' &&
								specification.map((part, i) => (
									// eslint-disable-next-line
							<div key={i} className={s.tabContentWrapper}>
										{part.map(str => (
											<div key={str}>
												<span className={s.name}>{str.split(/:(.+)/)[0]}</span>
												<span
													className={s.desc}
													// eslint-disable-next-line
                            dangerouslySetInnerHTML={{ __html: str.split(/:(.+)/)[1] }}
												/>
											</div>
										))}
									</div>
								))}

							{activeTab === 'pdCare' && (
								<div className={s.tabContentWrapper}>
									<p>{productCare}</p>
								</div>
							)}

							{activeTab === 'shipping' && (
								<div className={s.tabContentWrapper}>
									<p>{this.shippingCopy(this.props.shippingMethod)}</p>
									<p>
										For more details, please check our{' '}
										<a
											href="/docs/huedeck_shipping_policy"
											target="_blank"
											rel="noopener noreferrer"
										>
											Shipping
										</a>{' '}
										&amp;{' '}
										<a
											href="/docs/huedeck_return_policy"
											target="_blank"
											rel="noopener noreferrer"
										>
											Return
										</a>{' '}
										policies.
									</p>
								</div>
							)}
						</div>
					)}
				</div>
			</Waypoint>
		);
	}
}

export default withStyles(s)(ProductDescription);
