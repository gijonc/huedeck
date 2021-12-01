/**
 *	Huedeck, Inc.
 */
import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import PropTypes from 'prop-types';
import { CustomPicker, MaterialPicker, HuePicker } from 'react-color';
import { Saturation } from 'react-color/lib/components/common';

import constants from 'routes/constants';
import s from './ColorPicker.css';

class ColorPicker extends React.Component {
	static propTypes = {
		onChange: PropTypes.func.isRequired,
		hex: PropTypes.string.isRequired,
	};

	render() {
		const { hex, onChange } = this.props;
		return (
			<div className={s.container}>
				<div className={s.editable}>
					<MaterialPicker color={hex} onChange={onChange} />
				</div>

				<div className={s.hsl}>
					<div className={s.saturation}>
						<Saturation
							{...this.props}
							// pointer={ pointer }
							onChange={onChange}
						/>
					</div>
					<div className={s.hue}>
						<HuePicker onChange={onChange} width="100%" color={hex} />
					</div>
				</div>

				<div className={s.checker}>
					{constants.colorPickerList.map(color => (
						<button
							key={color.hex}
							onClick={() => onChange({ hex: color.hex })}
							className={s.baseColor}
							style={{ backgroundColor: color.hex }}
						/>
					))}
				</div>
			</div>
		);
	}
}

export default CustomPicker(withStyles(s)(ColorPicker));
