/**
 *	Huedeck, Inc.
 */

import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import Link from '../Link';
import s from './SubHeader.css';

const QuickLinkTable = [
	{
		name: 'Rugs',
		path: '/products/rugs',
	},
	{
		name: 'Pillow & Throws',
		path: '/products/pillows-&-throws',
	},
	{
		name: 'Lighting',
		path: '/products/lamps',
	},
	{
		name: 'Decorative Accents',
		path: '/products/decorative-accents',
	},
	{
		name: 'Mirrors',
		path: '/products/mirrors',
	},
	{
		name: 'Side Tables',
		path: '/products/side-&-end-tables',
	},
	{
		name: 'Coffee Tables',
		path: '/products/coffee-tables',
	},
	{
		name: 'Accent Chairs',
		path: '/products/armchairs-&-accent-chairs',
	},
	{
		name: 'Sofas',
		path: '/products/sofas',
	},

	{
		name: 'Living Room',
		path: '/products/living-room-furniture',
	},
	{
		name: 'Kitchen',
		path: '/products/kitchen-&-dining-furniture',
	},

	{
		name: 'Entryway',
		path: '/products/entryway-furniture',
	},
];

class SubHeader extends React.Component {
	render() {
		return (
			<div className={s.container}>
				<div className={s.quickLinkContainer}>
					{QuickLinkTable.map(link => (
						<Link key={link.name} to={link.path} className={s.quickLink}>
							{link.name}
						</Link>
					))}
				</div>
			</div>
		);
	}
}

export default withStyles(s)(SubHeader);
