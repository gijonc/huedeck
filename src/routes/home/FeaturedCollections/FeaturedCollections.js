/**
 *	Huedeck, Inc
 */

import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { setAlertbar } from 'actions/alertbar';
import gqlQuery from '../../gqlType';
import utils from '../../utils';
import s from './FeaturedCollections.css';
import CollectionCard from '../../collectionList/CollectionCard';

class FeaturedCollections extends React.Component {
	static propTypes = {
		idList: PropTypes.arrayOf(PropTypes.string).isRequired,
	};

	static contextTypes = {
		store: PropTypes.object.isRequired,
		client: PropTypes.object.isRequired,
	};

	state = {
		collections: [],
	};

	componentDidMount() {
		this.getFeaturedCollections();
	}

	getFeaturedCollections = async () => {
		try {
			const res = await this.context.client.query({
				query: gqlQuery.getCollectionByIds,
				variables: {
					idList: this.props.idList,
				},
			});
			const { getCollectionByIds } = res.data;
			if (getCollectionByIds.length) {
				this.setState({
					collections: getCollectionByIds,
				});
			}
		} catch (err) {
			this.context.store.dispatch(
				setAlertbar({
					status: 'error',
					message: utils.getGraphQLError(err, 'getFeaturedCollections'),
					open: true,
				}),
			);
		}
	};

	render() {
		const { collections } = this.state;
		return (
			<div className={s.container}>
				{Boolean(collections.length) &&
					collections.map(cl => (
						<div key={cl.id} className={s.collectionCardWrapper}>
							<CollectionCard {...cl} hideSaveButton />
						</div>
					))}
			</div>
		);
	}
}

export default withStyles(s)(FeaturedCollections);
