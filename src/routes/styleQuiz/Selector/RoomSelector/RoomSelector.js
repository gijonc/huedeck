/**
 *	Huedeck, Inc
 */

import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './RoomSelector.css';

class RoomSelector extends React.Component {
	static propTypes = {
		complete: PropTypes.func.isRequired,
		initState: PropTypes.string,
		// eslint-disable-next-line
	 content: PropTypes.arrayOf(PropTypes.object.isRequired).isRequired,
	};

	static defaultProps = {
		initState: null,
	};

	state = {
		selected: this.props.initState,
	};

	handleSelect = selected => {
		this.setState({ selected });
		this.props.complete('roomType', selected);
	};

	render() {
		const { selected } = this.state;
		const { content } = this.props;

		return (
			<div className={s.container}>
				<h1>What are you looking for?</h1>
				<div className={s.optionsContainer}>
					{content.map(op => (
						<button
							key={op.name}
							onClick={() => this.handleSelect(op.name)}
							className={s.imageOption}
						>
							<div className={s.imgWrapper}>
								<img src={op.imgSrc} alt={op.name} />
								{op.name === selected && (
									<div className={s.activeOption}>
										<i className="fa fa-check" />
									</div>
								)}
							</div>
							<span>{op.name.split('-').join(' ')}</span>
						</button>
					))}
				</div>
			</div>
		);
	}
}

export default withStyles(s)(RoomSelector);
