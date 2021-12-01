/**
 *	Huedeck, Inc
 */

import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './ColorMoodSelector.css';

class ColorMoodSelector extends React.Component {
	static propTypes = {
		complete: PropTypes.func.isRequired,
		// eslint-disable-next-line
	 content: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.object.isRequired).isRequired).isRequired,
		initState: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
	};

	state = {
		selected: this.props.initState.slice(),
	};

	handleSelect = (group, idx) => {
		const { selected } = this.state;

		const selectedIdx = selected.indexOf(group[idx].name);
		if (selectedIdx === -1) {
			selected.push(group[idx].name);
			const opsiteMoodIdx = selected.indexOf(group[1 - idx].name);
			if (opsiteMoodIdx !== -1) selected.splice(opsiteMoodIdx, 1);
		} else {
			selected.splice(selectedIdx, 1);
		}

		this.setState({ selected });
		this.props.complete('colorMood', selected);
	};

	render() {
		const { content } = this.props;
		const { selected } = this.state;

		return (
			<div className={s.container}>
				<h1>Select your favorite color mood(s)</h1>
				<div className={s.colorMoodContainer}>
					{content.map(optionGrp => (
						<div key={optionGrp[0].name} className={s.optionGroup}>
							{optionGrp.map((colorMood, idx) => (
								<button
									key={colorMood.name}
									onClick={() => this.handleSelect(optionGrp, idx)}
									className={s.imageOption}
								>
									<div className={s.imgWrapper}>
										<img src={colorMood.imgSrc} alt={colorMood.name} />
										{selected.indexOf(colorMood.name) !== -1 && (
											<div className={s.activeOption}>
												<i className="fa fa-check" />
											</div>
										)}
									</div>
									<span>{colorMood.name}</span>
								</button>
							))}
						</div>
					))}
				</div>
			</div>
		);
	}
}

export default withStyles(s)(ColorMoodSelector);
