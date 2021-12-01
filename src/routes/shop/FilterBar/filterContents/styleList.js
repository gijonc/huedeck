/**
 * Huedeck, Inc
 */

import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import styleSchema from 'routes/collectionList/collectionSchema';
import s from './filter.css';

class StyleList extends React.Component {
	static propTypes = {
		applyChange: PropTypes.func.isRequired,
		onDone: PropTypes.func.isRequired,
		initState: PropTypes.arrayOf(PropTypes.string).isRequired,
	};

	state = {
		checkedList: this.props.initState.slice(),
	};

	resetState = () => {
		this.props.applyChange([]);
		this.setState({ checkedList: [] });
	};

	handleOnCheck = async e => {
		const { value, checked } = e.target;
		const { checkedList } = this.state;
		const idx = checkedList.indexOf(value);

		if (checked && idx === -1) {
			checkedList.push(value);
		} else {
			checkedList.splice(idx, 1);
		}

		this.setState(checkedList);
		this.props.applyChange(checkedList.slice());
	};

	styleSchema = styleSchema['design style'];

	render() {
		const { checkedList } = this.state;
		const { length } = this.styleSchema;
		const midpoint = length / 2;

		return (
			<div className={s.container}>
				<h3>Filter products by style</h3>
				<div className={s.checkboxContent}>
					<div>
						{this.styleSchema.slice(0, midpoint).map(style => (
							<label htmlFor={style} key={style}>
								<input
									id={style}
									checked={checkedList.indexOf(style) !== -1}
									type="checkbox"
									onChange={this.handleOnCheck}
									value={style}
								/>
								{style}
							</label>
						))}
					</div>

					<div>
						{this.styleSchema.slice(midpoint, length).map(style => (
							<label htmlFor={style} key={style}>
								<input
									id={style}
									checked={checkedList.indexOf(style) !== -1}
									type="checkbox"
									onChange={this.handleOnCheck}
									value={style}
								/>
								{style}
							</label>
						))}
					</div>
				</div>

				<div className={s.filterAction}>
					<button onClick={this.resetState}>reset</button>
					<button className={s.applyBtn} onClick={() => this.props.onDone()}>
						done
					</button>
				</div>
			</div>
		);
	}
}

export default withStyles(s)(StyleList);
