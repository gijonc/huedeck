/**
 *	Huedeck, Inc.
 */

import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Banner.css';

class Banner extends React.Component {
	state = { bannerContent: false };

	componentDidMount() {
		this.getBanner();
	}

	getBanner = async () => {
		const gcsBannerRoot = 'https://huedeck.storage.googleapis.com/banner/';
		const res = await fetch(`${gcsBannerRoot}banner.json`);
		if (res.status === 200) {
			const banner = await res.json();
			const { display, expiresOn, startsOn, contentHtml } = banner;
			const time = new Date();
			const begin = new Date(startsOn);
			const end = new Date(expiresOn);
			if (display && time >= begin && time < end && typeof contentHtml === 'string') {
				this.setState({
					bannerContent: contentHtml,
				});
			}
		}
	};

	render() {
		const { bannerContent } = this.state;
		if (!bannerContent) return null;

		return (
			<div className={s.container}>
				<div
					className={s.content}
					// eslint-disable-next-line react/no-danger
					dangerouslySetInnerHTML={{ __html: bannerContent }}
				/>
				<button onClick={() => this.setState({ bannerContent: false })}>
					<span>&#10005;</span>
				</button>
			</div>
		);
	}
}

export default withStyles(s)(Banner);
