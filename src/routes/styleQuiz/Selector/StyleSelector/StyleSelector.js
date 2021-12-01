/**
 *	Huedeck, Inc
 */

import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './StyleSelector.css';

class StyleSelector extends React.Component {
	static propTypes = {
		complete: PropTypes.func.isRequired,
		// eslint-disable-next-line
	 	content: PropTypes.arrayOf(PropTypes.object.isRequired).isRequired,
	};

	state = {
		selected: [],
	};

	// componentDidMount() {
	// 	const allstls = [].concat(...this.props.content.map(obj => obj.values));
	// 	const styles = [...new Set(allstls)];
	// 	console.log(styles);
	// }

	handleSelect = id => {
		const { selected } = this.state;
		const clickedIdx = selected.indexOf(id);

		if (clickedIdx === -1) {
			selected.push(id);
		} else {
			selected.splice(clickedIdx, 1);
		}

		const fooList = [];
		for (let i = 0, len = selected.length; i < len; i += 1) {
			const { values } = this.props.content[selected[i]];
			fooList.push(...values);
		}

		const selectedStyles = [...new Set(fooList)];
		this.setState({ selected }); // update for UI
		this.props.complete('style', selectedStyles); // update for selected state
	};

	render() {
		const { content } = this.props;
		const { selected } = this.state;

		return (
			<div className={s.container}>
				<h1>Choose designs that suit your style</h1>
				<div className={s.optionsContainer}>
					{content.map((op, idx) => (
						<button
							key={op.imgSrc}
							onClick={() => this.handleSelect(idx)}
							className={s.imageOption}
						>
							<div className={s.imgWrapper}>
								<img src={op.imgSrc} alt="" />
								{selected.indexOf(idx) !== -1 && (
									<div className={s.activeOption}>
										<i className="fa fa-check" />
									</div>
								)}
							</div>
						</button>
					))}
				</div>
			</div>
		);
	}
}

export default withStyles(s)(StyleSelector);
