/**
 *	Huedeck, Inc
 */

import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import cx from 'classnames';
import { Zoom } from '@material-ui/core';
import { Check } from '@material-ui/icons';
import utils from '../../utils';
import s from './RoomEditor.css';
import json from '../../collectionList/collectionSchema';
import json2 from '../../styleQuiz/quizContent.json';
import constants from '../../constants';
import colorMath from '../../shop/colorMath';

const ALL_STYLES = json['design style'];
const ALL_COLORMOODS = json2.colorMood;

class RoomEditor extends React.Component {
	static propTypes = {
		initState: PropTypes.object.isRequired,
		applyChange: PropTypes.func.isRequired,
	};

	static contextTypes = {
		store: PropTypes.object.isRequired,
		client: PropTypes.object.isRequired,
	};

	state = {
		preference: JSON.parse(JSON.stringify(this.props.initState)),
		originState: JSON.parse(JSON.stringify(this.props.initState)),
		inputUpdated: new Set(),
	};

	handleColorMood = (group, idx) => {
		const { preference, inputUpdated, originState } = this.state;
		const key = 'colorMood';
		const selectedColorMood = preference[key];
		const selectedIdx = selectedColorMood.indexOf(group[idx].name);
		if (selectedIdx === -1) {
			selectedColorMood.push(group[idx].name);
			const opsiteMoodIdx = selectedColorMood.indexOf(group[1 - idx].name);
			if (opsiteMoodIdx !== -1) selectedColorMood.splice(opsiteMoodIdx, 1);
		} else {
			selectedColorMood.splice(selectedIdx, 1);
		}

		if (utils.arraysEqual(originState[key], selectedColorMood, true)) {
			inputUpdated.delete(key);
		} else {
			inputUpdated.add(key);
		}

		preference[key] = selectedColorMood;
		this.setState({
			preference,
			inputUpdated,
		});
	};

	editPreference = (key, value) => {
		const { preference, originState, inputUpdated } = this.state;
		const idx = preference[key].indexOf(value);
		if (idx !== -1) {
			preference[key].splice(idx, 1);
		} else {
			preference[key].push(value);
		}

		if (utils.arraysEqual(originState[key], preference[key])) {
			inputUpdated.delete(key);
		} else {
			inputUpdated.add(key);
		}

		this.setState({
			preference,
			inputUpdated,
		});
	};

	applyChanges = () => {
		const { preference } = this.state;
		this.props.applyChange(preference);
	};

	render() {
		const { preference, inputUpdated } = this.state;

		return (
			<div className={s.container}>
				<div className={s.roomInfo}>
					<strong>style</strong>
					<div>
						{ALL_STYLES.map(style => (
							<button
								key={style}
								onClick={() => this.editPreference('style', style)}
								className={cx(
									s.selection,
									preference.style.indexOf(style) !== -1 && s.selected,
								)}
							>
								{style}
							</button>
						))}
					</div>
				</div>

				<div className={s.roomInfo}>
					<strong>Color Mood</strong>
					<div style={{ textAlign: 'center' }}>
						{ALL_COLORMOODS.map(optionGrp => (
							<div key={optionGrp[0].name} className={s.optionGroup}>
								{optionGrp.map((colorMood, idx) => (
									<button
										key={colorMood.name}
										onClick={() => this.handleColorMood(optionGrp, idx)}
										className={cx(
											s.selection,
											preference.colorMood.indexOf(colorMood.name) !== -1 && s.selected,
										)}
									>
										<span>{colorMood.name}</span>
									</button>
								))}
							</div>
						))}
					</div>
				</div>

				<div className={s.roomInfo}>
					<strong>Base Color</strong>
					<div style={{ textAlign: 'center' }}>
						{constants.colorPickerList.map(color => (
							<div key={color.hex} className={s.colorBlock}>
								<button
									onClick={() => this.editPreference('color', color.hex)}
									style={{ background: color.hex }}
									className={s.colorBtn}
								>
									<Zoom in={preference.color.indexOf(color.hex) !== -1}>
										<Check style={{ color: colorMath.getContrastYIQ(color.hex) }} />
									</Zoom>
								</button>
							</div>
						))}
					</div>
				</div>

				<button
					className={s.button}
					onClick={this.applyChanges}
					disabled={inputUpdated.size === 0}
				>
					Apply changes
				</button>
			</div>
		);
	}
}

export default withStyles(s)(RoomEditor);
