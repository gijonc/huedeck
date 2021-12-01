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
import gqlQuery from '../gqlType';
import constants from '../constants';
import CollectionCard from './CollectionCard/CollectionCard';
import Link from '../../components/Link';
import Slideshow from './Slideshow';
import { getNumberOfCollectionInRow, gridCardProps, gridContainerProps } from './collectionUtils';
import s from './CollectionList.css';

class CollectionList extends React.Component {
	static propTypes = {
		width: PropTypes.string.isRequired,
		displayTags: PropTypes.arrayOf(PropTypes.string).isRequired,
	};

	static contextTypes = {
		store: PropTypes.object.isRequired,
		client: PropTypes.object.isRequired,
	};

	state = {
		// init collection list
		collectionSectionList: this.props.displayTags.map(tag => ({
			name: tag,
			collections: [],
		})),
		responsiveNumOfCl: getNumberOfCollectionInRow(this.props.width),
	};

	componentDidMount() {
		this.fetchCollections();
	}

	fetchCollections = async () => {
		try {
			const res = await this.context.client.query({
				query: gqlQuery.getAllCollections,
				fetchPolicy: 'network-only',
				variables: {
					tagList: this.props.displayTags,
					limit: this.state.responsiveNumOfCl,
				},
			});
			const { getAllCollections } = res.data;
			if (getAllCollections.length) {
				this.setState({
					collectionSectionList: getAllCollections,
				});
			}
		} catch (err) {
			this.context.store.dispatch(
				setAlertbar({
					status: 'error',
					message: __DEV__ ? `[getAllCollections] -> ${err.message}` : constants.errMsg,
					open: true,
				}),
			);
		}
	};

	render() {
		const { collectionSectionList, responsiveNumOfCl } = this.state;

		return (
			<div className={s.root}>
				<Slideshow />

				<div className={s.container}>
					{collectionSectionList.map(section => (
						<div key={section.name} className={s.section}>
							<h1>{section.name}</h1>
							{!section.collections.length ? (
								<Grid
									container
									{...gridContainerProps}
									spacing={responsiveNumOfCl > 1 ? 24 : 0}
								>
									{[...Array(responsiveNumOfCl).keys()].map(idx => (
										<Grid item key={idx} {...gridCardProps}>
											<div className={s.preloadingCollection} />
										</Grid>
									))}
								</Grid>
							) : (
								<Grid
									container
									{...gridContainerProps}
									spacing={responsiveNumOfCl > 1 ? 24 : 0}
								>
									{section.collections.slice(0, responsiveNumOfCl).map(cl => (
										<Grid item key={cl.id} {...gridCardProps}>
											<CollectionCard {...cl} />
										</Grid>
									))}
								</Grid>
							)}
							<Link to={`/collections/${encodeURI(section.name)}`} className={s.showMore}>
								Show more collections of {section.name}
								<ChevronRight fontSize="small" />
							</Link>
						</div>
					))}
				</div>
			</div>
		);
	}
}

export default compose(
	withStyles(s),
	withWidth(),
)(CollectionList);
