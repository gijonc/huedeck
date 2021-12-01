/**
 *	Huedeck, Inc
 */

import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { Zoom } from '@material-ui/core';
import { Check } from '@material-ui/icons';
import constants from '../../../constants';
import colorMath from '../../../shop/colorMath';
import s from './ColorSelector.css';

class ColorSelector extends React.Component {
	static propTypes = {
		complete: PropTypes.func.isRequired,
		initState: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
	};

	state = {
		selected: this.props.initState.slice(),
	};

	handleSelect = hex => {
		const { selected } = this.state;
		const idx = selected.indexOf(hex);
		if (idx !== -1) {
			selected.splice(idx, 1);
		} else {
			selected.push(hex);
		}

		this.setState({ selected }); // update for UI
		this.props.complete('color', selected); // update for selection state
	};

	render() {
		const { selected } = this.state;

		return (
			<div className={s.container}>
				<h1>Select your favourite color(s)</h1>
				<div className={s.colorsContainer}>
					{constants.colorPickerList.map(color => (
						<div key={color.hex} className={s.selectBlock}>
							<button
								onClick={() => this.handleSelect(color.hex)}
								style={{ background: color.hex }}
								className={s.colorBtn}
							>
								<Zoom in={selected.indexOf(color.hex) !== -1}>
									<Check style={{ color: colorMath.getContrastYIQ(color.hex) }} />
								</Zoom>
							</button>
							<div>{color.name}</div>
						</div>
					))}
				</div>
			</div>
		);
	}
}

export default withStyles(s)(ColorSelector);
