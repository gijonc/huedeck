/**
 * Huedeck, Inc
 */

import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './filter.css';

class InputFilter extends React.Component {
	static propTypes = {
		applyChange: PropTypes.func.isRequired,
		initState: PropTypes.arrayOf(PropTypes.number).isRequired,
		type: PropTypes.string.isRequired,
	};

	state = {
		inputNumber: this.props.initState.slice(),
	};

	handleInputNumberChange = e => {
		const { name, value } = e.target;
		const { inputNumber } = this.state;
		const input = !value || Number.isNaN(value) ? -1 : parseFloat(value);
		inputNumber[name] = input;
		this.setState({ inputNumber });
	};

	resetState = () => {
		this.setState({ inputNumber: [-1, 0] });
		this.props.applyChange([-1, 0]);
	};

	apply = () => {
		this.props.applyChange(this.state.inputNumber.slice());
	};

	render() {
		const { inputNumber } = this.state;
		const { type } = this.props;

		return (
			<div className={s.container}>
				<div className={s.textContent}>
					<label htmlFor="low">
						{type === 'price' && <span>$</span>}
						<input
							type="number"
							id="low"
							name={0}
							placeholder="Min"
							onChange={this.handleInputNumberChange}
							value={inputNumber[0] < 0 ? '' : inputNumber[0]}
							className={s.inputBox}
						/>
					</label>

					<span>to</span>

					<label htmlFor="high">
						{type === 'price' && <span>$</span>}
						<input
							id="high"
							type="number"
							name={1}
							placeholder="Max"
							onChange={this.handleInputNumberChange}
							value={inputNumber[1] <= 0 ? '' : inputNumber[1]}
							className={s.inputBox}
						/>
					</label>
					{type === 'dimension' && <span>Inches</span>}
				</div>

				<div className={s.filterAction}>
					<button onClick={this.resetState}>Clear</button>

					<button className={s.applyBtn} onClick={this.apply}>
						apply
					</button>
				</div>
			</div>
		);
	}
}

export default withStyles(s)(InputFilter);
