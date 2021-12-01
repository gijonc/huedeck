/**
 * Huedeck, Inc
 */

import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import utils from '../../../utils';
import history from '../../../../history';
import s from './filterContent.css';

class InputFilter extends React.Component {
	static propTypes = {
		onDone: PropTypes.func.isRequired,
		initState: PropTypes.arrayOf(PropTypes.number),
		type: PropTypes.string.isRequired,
	};

	static defaultProps = {
		initState: [-1, 0],
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
		const uri = utils.resetUriByKey(this.props.type);
		const { pathname, search } = window.location;
		if (uri !== pathname + search) {
			history.push(uri);
		}
		this.props.onDone();
	};

	apply = () => {
		const { inputNumber } = this.state;
		const { initState } = this.props;
		const min = Number(inputNumber[0]);
		const max = Number(inputNumber[1]);
		if (initState[0] === min && initState[1] === max) {
			this.props.onDone();
			return;
		}

		const queryStr = utils.getRangeFilterStr(min, max);

		const uri = utils.resetUriByKey(this.props.type, queryStr);
		history.push(uri);
		this.props.onDone();
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
					{type !== 'price' && <span>Inches</span>}
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
