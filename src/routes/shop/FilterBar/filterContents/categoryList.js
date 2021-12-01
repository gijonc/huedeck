/**
 * Huedeck, Inc
 */

import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import categorySchema from '../../../home/AllCategoryList/category.json';
import s from './filter.css';

class CategoryList extends React.Component {
	static propTypes = {
		applyChange: PropTypes.func.isRequired,
		onDone: PropTypes.func.isRequired,
		// eslint-disable-next-line react/forbid-prop-types
		initState: PropTypes.object.isRequired,
	};

	state = {
		checkList: null,
		inputError: null,
	};

	componentDidMount() {
		const { initState } = this.props;
		if (initState && Object.keys(initState).length) {
			// eslint-disable-next-line react/no-did-mount-set-state
			this.setState({
				checkList: JSON.parse(JSON.stringify(initState)), // deep clone
			});
		} else {
			this.initState();
		}
	}

	initState = () => {
		const checkList = {};
		const cat1List = Object.keys(categorySchema);
		for (let i = 0, len = cat1List.length; i < len; i += 1) {
			const cat1 = cat1List[i];
			checkList[cat1] = {
				checked: true,
				cat2UncheckList: [],
				cat2Length: Object.keys(categorySchema[cat1]).length,
			};
		}
		this.setState({
			checkList,
		});
	};

	resetState = () => {
		this.props.applyChange({});
		this.initState();
	};

	handleCat1OnCheck = e => {
		const { value } = e.target;
		const { checkList } = this.state;
		const { checked } = checkList[value];

		checkList[value].checked = !checked;

		if (checked) {
			// uncheck all cat2
			checkList[value].cat2UncheckList = Object.keys(categorySchema[value]);
		} else {
			// check all cat2
			checkList[value].cat2UncheckList = [];
		}

		this.setState({
			checkList,
			inputError: null,
		});
		this.apply();
	};

	handleCat2OnCheck = (e, cat1) => {
		const { value } = e.target;
		const { checkList } = this.state;
		const { cat2UncheckList } = checkList[cat1];
		const idx = cat2UncheckList.indexOf(value);
		const checked = idx === -1;

		if (checked) {
			checkList[cat1].cat2UncheckList.push(value);
		} else {
			checkList[cat1].cat2UncheckList.splice(idx, 1);
		}

		// check cat1 by default if all cat2 all checked
		checkList[cat1].checked = !checkList[cat1].cat2UncheckList.length;

		this.setState({
			checkList,
			inputError: null,
		});
		this.apply();
	};

	apply = () => {
		const { checkList } = this.state;
		const uncheckStatus = Object.keys(checkList);

		for (let i = 0, len = uncheckStatus.length; i < len; i += 1) {
			const cat1 = uncheckStatus[i];
			const { checked, cat2UncheckList, cat2Length } = checkList[cat1];
			if (checked || cat2UncheckList.length < cat2Length) break;
			if (i + 1 === uncheckStatus.length) {
				this.setState({
					inputError: 'At least one category to be applied',
				});
				return;
			}
		}
		this.props.applyChange(JSON.parse(JSON.stringify(checkList)));
	};

	render() {
		const { checkList, inputError } = this.state;

		if (!checkList) return <div className={s.container} />;

		return (
			<div className={s.container}>
				<h3>Filter products by category</h3>
				<div className={s.checkboxContent}>
					{Object.keys(categorySchema).map(cat1 => (
						<div key={cat1}>
							<label htmlFor={cat1} className={s.highlight}>
								<input
									id={cat1}
									checked={checkList[cat1].checked}
									type="checkbox"
									onChange={this.handleCat1OnCheck}
									name="cat1"
									value={cat1}
								/>
								all {cat1}
							</label>

							<div>
								{Object.keys(categorySchema[cat1]).map(cat2 => (
									<label htmlFor={cat2} key={cat2}>
										<input
											id={cat2}
											checked={checkList[cat1].cat2UncheckList.indexOf(cat2) === -1}
											type="checkbox"
											onChange={e => this.handleCat2OnCheck(e, cat1)}
											name="cat2"
											value={cat2}
										/>
										{cat2}
									</label>
								))}
							</div>
						</div>
					))}
				</div>

				<div className={s.filterAction}>
					{inputError && <p>{inputError}</p>}
					<button onClick={this.resetState}>reset</button>
					<button className={s.applyBtn} onClick={() => this.props.onDone()}>
						done
					</button>
				</div>
			</div>
		);
	}
}

export default withStyles(s)(CategoryList);
