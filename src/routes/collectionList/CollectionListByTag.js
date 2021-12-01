/**
 *	Huedeck, Inc
 */

import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { compose } from 'recompose';
import { Grid, withWidth } from '@material-ui/core';
import { ChevronRight } from '@material-ui/icons';
import { setAlertbar } from 'actions/alertbar';
import { Loader } from '../../components/Utilities';
import Link from '../../components/Link/Link';
import gqlQuery from '../gqlType';
import constants from '../constants';
import CollectionCard from './CollectionCard/CollectionCard';
import { getNumberOfCollectionInRow, gridCardProps, gridContainerProps } from './collectionUtils';
import s from './CollectionList.css';

class CollectionListByTag extends React.Component {
	static propTypes = {
		width: PropTypes.string.isRequired,
		displayTag: PropTypes.string.isRequired,
	};

	static contextTypes = {
		store: PropTypes.object.isRequired,
		client: PropTypes.object.isRequired,
	};

	state = {
		collectionList: null,
		responsiveNumOfCl: getNumberOfCollectionInRow(this.props.width),
	};

	componentDidMount() {
		this.fetchCollectionByTag();
	}

	fetchCollectionByTag = async () => {
		try {
			const res = await this.context.client.query({
				query: gqlQuery.getCollectionsByTag,
				variables: {
					tagContent: this.props.displayTag,
				},
				fetchPolicy: 'network-only',
			});
			const { getCollectionsByTag } = res.data;
			if (getCollectionsByTag) {
				this.setState({
					collectionList: getCollectionsByTag,
				});
			}
		} catch (err) {
			this.context.store.dispatch(
				setAlertbar({
					status: 'error',
					message: __DEV__ ? `[fetchCollectionByTag] -> ${err.message}` : constants.errMsg,
					open: true,
				}),
			);
		}
	};

	render() {
		const { collectionList, responsiveNumOfCl } = this.state;
		const { displayTag } = this.props;

		return (
			<div className={s.root}>
				<div className={s.container}>
					<h1>{displayTag}</h1>
					{!collectionList ? (
						<Loader />
					) : (
						<div>
							{collectionList.length ? (
								<Grid
									container
									{...gridContainerProps}
									spacing={responsiveNumOfCl > 1 ? 24 : 0}
								>
									{collectionList.map(cl => (
										<Grid item key={cl.id} {...gridCardProps}>
											<CollectionCard {...cl} />
										</Grid>
									))}
								</Grid>
							) : (
								<p>{`Oops, we couldn't find any matched collections for ${displayTag}`}</p>
							)}
							<Link to="/collections" className={s.showMore}>
								Show all other collections
								<ChevronRight fontSize="small" />
							</Link>
						</div>
					)}
				</div>
			</div>
		);
	}
}

export default compose(
	withStyles(s),
	withWidth(),
)(CollectionListByTag);
