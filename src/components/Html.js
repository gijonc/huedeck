/**
 * Huedeck
 */

import React from 'react';
import PropTypes from 'prop-types';
import serialize from 'serialize-javascript';
import config from '../config';

/* eslint-disable react/no-danger */

class Html extends React.Component {
	static propTypes = {
		title: PropTypes.string.isRequired,
		description: PropTypes.string.isRequired,
		styles: PropTypes.arrayOf(
			PropTypes.shape({
				id: PropTypes.string.isRequired,
				cssText: PropTypes.string.isRequired,
			}).isRequired,
		),
		scripts: PropTypes.arrayOf(PropTypes.string.isRequired),
    	app: PropTypes.object, // eslint-disable-line
		children: PropTypes.string.isRequired,
		image: PropTypes.string,
		path: PropTypes.string,
	};

	static defaultProps = {
		styles: [],
		scripts: [],
		image: null,
		path: null,
	};

	render() {
		const { title, description, styles, scripts, app, children, image, path } = this.props;

		return (
			<html lang="en">
				<head>
					<meta charSet="utf-8" />
					<meta httpEquiv="x-ua-compatible" content="ie=edge" />
					<title>{title}</title>
					<meta name="description" content={description} />
					<meta name="viewport" content="width=device-width, initial-scale=1" />
					{scripts.map(script => (
						<link key={script} rel="preload" href={script} as="script" />
					))}
					<link rel="manifest" href="/site.webmanifest" />
					<link rel="apple-touch-icon" href="/icon.png" />
					{styles.map(style => (
						<style
							key={style.id}
							id={style.id}
							dangerouslySetInnerHTML={{ __html: style.cssText }}
						/>
					))}

					{/* Twitter metadata */}
					<meta name="twitter:card" content="summary_large_image" />
					<meta name="twitter:site" content="@huedeck" />
					<meta name="twitter:title" content={title} />
					<meta name="twitter:description" content={description} />
					<meta name="twitter:image" content={image} />

					{/* Facebook metadata */}
					<meta property="fb:app_id" content={config.auth.facebook.id} />
					<meta property="og:title" content={title} />
					<meta property="og:image" content={image} />
					<meta property="og:site_name" content="Huedeck" />
					<meta property="og:url" content={app ? app.apiUrl + path : ''} />
					<meta property="og:type" content="website" />
				</head>

				<body>
					<div id="app" dangerouslySetInnerHTML={{ __html: children }} />
					<script dangerouslySetInnerHTML={{ __html: `window.App=${serialize(app)}` }} />
					{scripts.map(script => (
						<script key={script} src={script} />
					))}

					{/* <!-- Google Analytics Code --> */}
					{config.analytics.googleTrackingId && (
						<script
							dangerouslySetInnerHTML={{
								__html:
									'window.ga=function(){ga.q.push(arguments)};ga.q=[];ga.l=+new Date;' +
									`ga('create','${
										config.analytics.googleTrackingId
									}','auto');ga('send','pageview')`,
							}}
						/>
					)}
					{config.analytics.googleTrackingId && (
						<script src="https://www.google-analytics.com/analytics.js" async defer />
					)}
					{/* <!-- End Google Analytics Code End */}
				</body>
			</html>
		);
	}
}

export default Html;
