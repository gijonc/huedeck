/**
 * Huedeck, Inc.
 */

import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { Slide, Zoom } from '@material-ui/core';
import { ArrowBack, ArrowForward, CheckCircle } from '@material-ui/icons';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import Link from '../../components/Link';
import utils from '../utils';
import StyleSelector from './Selector/StyleSelector';
import RoomSelector from './Selector/RoomSelector';
import ColorSelector from './Selector/ColorSelector';
// import BudgetSelector from './Selector/BudgetSelector';
import ColorMoodSelector from './Selector/ColorMoodSelector';
import QuickSignUp from './QuickSignUp';
import s from './StyleQuiz.css';

class StyleQuiz extends React.Component {
	static propTypes = {
		order: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
		width: PropTypes.number,
	};

	static defaultProps = {
		width: NaN,
	};

	static contextTypes = {
		store: PropTypes.object.isRequired,
		fetch: PropTypes.func.isRequired,
	};

	state = {
		currentSlideIdx: 0,
		quizComponentList: [],
		selectStates: {},
		enableContinue: false,
		completed: null,
		sliding: false,
	};

	componentDidMount() {
		this.init();
	}

	// automatically adjust content position when screen width is changed
	componentDidUpdate(prevProps) {
		if (prevProps.width !== this.props.width && !this.state.completed) {
			this.topSellerList.scrollLeft =
				this.state.currentSlideIdx * this.topSellerList.offsetWidth;
		}
	}

	setProgressBarWidth = (idx, length) => {
		let percent = 0;
		if (idx < length) {
			percent = Math.ceil(100 * (idx / length));
		} else if (idx === length) {
			percent = 99;
		}
		return `${percent}%`;
	};

	init = () => {
		const { order } = this.props;
		const quizComponentList = [];
		const { loggedIn } = this.context.store.getState();
		const selectStates = loggedIn ? loggedIn.preference : {};

		// init quiz pages by order
		for (let i = 0, len = order.length; i < len; i += 1) {
			const name = order[i];
			if (!selectStates[name]) {
				selectStates[name] = name === 'roomType' ? null : [];
			}

			switch (name) {
				case 'roomType':
					quizComponentList.push(
						<RoomSelector
							initState={selectStates[name]}
							content={this.props[name]}
							complete={this.handleQuizSelectOption}
						/>,
					);
					break;

				case 'color':
					quizComponentList.push(
						<ColorSelector
							initState={selectStates[name]}
							complete={this.handleQuizSelectOption}
						/>,
					);
					break;

				// case 'budget':
				// 	quizComponentList.push(
				// 		<BudgetSelector
				// 			initState={selectStates[name]}
				// 			complete={this.handleQuizSelectOption}
				// 			content={this.props[name]}
				// 		/>,
				// 	);
				// 	break;

				case 'style':
					quizComponentList.push(
						<StyleSelector
							initState={selectStates[name]}
							content={this.props[name]}
							complete={this.handleQuizSelectOption}
						/>,
					);
					break;

				case 'colorMood':
					quizComponentList.push(
						<ColorMoodSelector
							initState={selectStates[name]}
							content={this.props[name]}
							complete={this.handleQuizSelectOption}
						/>,
					);
					break;

				default:
					break;
			}
		}

		this.setState({
			quizComponentList,
			selectStates,
			enableContinue: Boolean(selectStates.roomType),
		});
	};

	handleQuizSelectOption = (key, selections) => {
		const { selectStates } = this.state;
		selectStates[key] = selections;
		const enableContinue = key === 'roomType' ? Boolean(selections) : selections.length > 0;
		this.setState({
			selectStates,
			enableContinue, // at leat 1 select for all
		});
	};

	handleComplete = completed => {
		this.setState({ completed });
	};

	scrollList = dir => {
		if (this.state.sliding) return;
		this.setState({ sliding: true });
		const {
			scrollLeft, // current left most position of the element
			offsetWidth, // max width to be allowed to scroll at once
			scrollWidth, // max scrollable width of the element
		} = this.topSellerList;

		const leftEnd = 0;
		const rightEnd = scrollWidth - offsetWidth;
		const scrollStep = Math.ceil(offsetWidth / 15);

		if (dir === 1 && scrollLeft < rightEnd) {
			// scroll to right
			const end = scrollLeft + offsetWidth > rightEnd ? rightEnd : scrollLeft + offsetWidth;
			const scrollInterval = setInterval(() => {
				if (this.topSellerList.scrollLeft + scrollStep < end) {
					this.topSellerList.scrollLeft += scrollStep;
				} else {
					this.topSellerList.scrollLeft = end;
					clearInterval(scrollInterval);
				}
			}, 15);
		} else if (dir === -1 && scrollLeft > leftEnd) {
			// scroll to left
			const end = scrollLeft - offsetWidth < leftEnd ? leftEnd : scrollLeft - offsetWidth;
			const scrollInterval = setInterval(() => {
				if (this.topSellerList.scrollLeft - scrollStep > end) {
					this.topSellerList.scrollLeft -= scrollStep;
				} else {
					this.topSellerList.scrollLeft = end;
					clearInterval(scrollInterval);
				}
			}, 15);
		} else {
			return;
		}

		const { currentSlideIdx, selectStates } = this.state;
		const nextSlideIdx = currentSlideIdx + dir;
		const slideName = this.props.order[nextSlideIdx];

		this.setState(
			{
				currentSlideIdx: nextSlideIdx,
				enableContinue: selectStates[slideName] && selectStates[slideName].length > 0,
			},
			async () => {
				window.scrollTo(0, 0);
				await utils.wait(300); // avoid repid clicks
				this.setState({
					sliding: false,
				});
			},
		);
	};

	render() {
		const {
			currentSlideIdx,
			quizComponentList,
			enableContinue,
			selectStates,
			completed,
		} = this.state;
		const listLength = quizComponentList.length;
		if (!listLength) return null;

		const widthPercentage = completed
			? '100%'
			: this.setProgressBarWidth(currentSlideIdx, listLength);
		const showProgressCtrl = Boolean(selectStates.roomType) && !completed;

		return (
			<div className={s.root}>
				<div className={s.container}>
					<div className={s.progressBarContainer}>
						<div
							style={{
								width: widthPercentage,
							}}
							className={s.progressBar}
						>
							<div>{widthPercentage}</div>
						</div>
					</div>

					{completed ? (
						<div className={s.afterComplete}>
							<Zoom in timeout={700}>
								<CheckCircle />
							</Zoom>
							{completed === 'signup' ? (
								<div>
									<h1>You are ready to go.</h1>
									<Link className={s.link} to="/room">
										Start shopping now
										<ArrowForward />
									</Link>
								</div>
							) : (
								<div>
									<h1>Your style preferences have been updated.</h1>
									<Link className={s.link} to="/room">
										Continue to shop
										<ArrowForward />
									</Link>
								</div>
							)}
						</div>
					) : (
						<div
							className={s.sliderContainer}
							ref={node => {
								this.topSellerList = node;
							}}
						>
							{quizComponentList.map((component, idx) => (
								// eslint-disable-next-line
						<div key={component + idx} className={s.sliderWrapper}>
									<div className={s.slideContent}>{component}</div>
								</div>
							))}
							<div className={s.sliderWrapper}>
								<div className={s.slideContent}>
									<QuickSignUp preference={selectStates} complete={this.handleComplete} />
								</div>
							</div>
						</div>
					)}

					<Slide in={showProgressCtrl} direction="up">
						<div className={s.progressCtrlContainer}>
							<div className={s.progressCtrlWrapper}>
								<button
									className={s.backBtn}
									onClick={() => this.scrollList(-1)}
									style={{ visibility: currentSlideIdx > 0 ? 'visible' : 'hidden' }}
								>
									<ArrowBack />
									Back
								</button>

								<button
									disabled={!enableContinue}
									className={s.completeBtn}
									onClick={() => this.scrollList(1)}
									style={{
										visibility:
											currentSlideIdx < quizComponentList.length ? 'visible' : 'hidden',
									}}
								>
									continue
								</button>
							</div>
						</div>
					</Slide>
				</div>
			</div>
		);
	}
}

export default compose(
	connect(state => ({
		width: state.screenSize.width,
	})),
	withStyles(s),
)(StyleQuiz);
