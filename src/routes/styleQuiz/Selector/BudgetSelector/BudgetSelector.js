/**
 *	Huedeck, Inc
 */

import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './BudgetSelector.css';

class BudgetSelector extends React.Component {
	static propTypes = {
		complete: PropTypes.func.isRequired,
		initState: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
		// eslint-disable-next-line
	 content: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number.isRequired).isRequired).isRequired,
	};

	state = {
		selected: this.props.initState.slice(),
	};

	handleSelect = range => {
		this.setState({
			selected: range,
		});
		this.props.complete('budget', range);
	};

	render() {
		const { selected } = this.state;
		const { content } = this.props;

		return (
			<div className={s.container}>
				<h1>How much is your budget?</h1>
				<div className={s.optionsContainer}>
					{content.map(range => (
						<button
							onClick={() => this.handleSelect(range)}
							key={range[0]}
							className={cx(
								s.budgetOption,
								String(range[0]) + String(range[1]) ===
									String(selected[0]) + String(selected[1]) && s.activeOption,
							)}
						>
							<span>
								${range[0]} ~ ${range[1]}
							</span>
						</button>
					))}
				</div>
			</div>
		);
	}
}

export default withStyles(s)(BudgetSelector);
