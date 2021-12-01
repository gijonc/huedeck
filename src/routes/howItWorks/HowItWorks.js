/**
 *	Huedeck
 */

import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import Waypoint from 'react-waypoint';
import cx from 'classnames';
import s from './HowItWorks.css';
import Section1 from './Section1/Section1';
import Section2 from './Section2/Section2';
import Section3 from './Section3/Section3';
import Section4 from './Section4/Section4';
import Section5 from './Section5/Section5';

const GCS_IMG_URL = 'https://storage.googleapis.com/huedeck/img/home/';

class HowItWorks extends React.Component {
	static propTypes = {};
	static contextTypes = {
		store: PropTypes.object.isRequired,
	};

	state = {
		currentSecIdx: 0,
	};

	getCurSection = idx => {
		if (this.state.currentSecIdx !== idx) {
			this.setState({
				currentSecIdx: idx,
			});
		}
	};

	scrollToSection = (idx, behavior) => {
		if (this.SECTION_REFS[idx]) {
			this.SECTION_REFS[idx].scrollIntoView({ block: 'end', behavior: behavior || 'smooth' });
		}
	};

	sectionName = idx => {
		switch (idx) {
			case 0:
				return 'Huedeck';
			case 1:
				return 'How';
			case 2:
				return 'Generator';
			case 3:
				return 'Stories';
			case 4:
				return 'Reviews';
			default:
				return 'Huedeck';
		}
	};

	// section component list
	SECTION_LIST = [
		<Section1 imgUrl={GCS_IMG_URL} scrollToSection={this.scrollToSection} />,
		<Section2 imgUrl={GCS_IMG_URL} scrollToSection={this.scrollToSection} />,
		<Section3 imgUrl={GCS_IMG_URL} />,
		<Section4 imgUrl={GCS_IMG_URL} />,
		<Section5 imgUrl={GCS_IMG_URL} />,
	];

	SECTION_REFS = new Array(this.SECTION_LIST.length);

	render() {
		const { currentSecIdx } = this.state;

		return (
			<div className={s.root}>
				<nav className={s.sectionNav}>
					{[...Array(this.SECTION_LIST.length).keys()].map(idx => (
						<button
							className={cx(s.navBtn, currentSecIdx === idx && s.navBtnFocused)}
							key={idx}
							onClick={() => this.scrollToSection(idx)}
						>
							<span>{`${this.sectionName(idx)}`}</span>
						</button>
					))}
				</nav>

				{this.SECTION_LIST.map((section, idx) => (
					// eslint-disable-next-line
			 <div key={idx} ref={node => (this.SECTION_REFS[idx] = node)}>
						<Waypoint bottomOffset="50%" onEnter={() => this.getCurSection(idx)} />
						{section}
					</div>
				))}
			</div>
		);
	}
}

export default withStyles(s)(HowItWorks);
