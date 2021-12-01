/**
 *	Huedeck, Inc.
 */
import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import PropTypes from 'prop-types';
import ImageLoader from 'react-load-image';
import { setAlertbar } from 'actions/alertbar';
import { setUserDialog } from 'actions/userDialog';
import s from './CollectionCard.css';
import gqlQuery from '../../gqlType';
import constants from '../../constants';
import Link from '../../../components/Link';

class CollectionCard extends React.Component {
	static contextTypes = {
		store: PropTypes.object.isRequired,
		client: PropTypes.object.isRequired,
	};

	static propTypes = {
		id: PropTypes.string.isRequired,
		hideSaveButton: PropTypes.bool,
		// eslint-disable-next-line
		savedUser: PropTypes.object,
	};

	static defaultProps = {
		hideSaveButton: false,
		savedUser: null,
	};

	state = {
		hasClientSaved: false,
		count: 0,
		clicking: false,
	};

	componentDidMount() {
		if (!this.props.hideSaveButton && this.props.savedUser) {
			const { hasClientSaved, count } = this.props.savedUser;
			// eslint-disable-next-line
			this.setState({
				hasClientSaved,
				count,
			});
		}
	}

	handleSaveCollection = async () => {
		const { store, client } = this.context;
		const { clicking, count, hasClientSaved } = this.state;

		if (clicking) return true;

		if (!store.getState().loggedIn) {
			store.dispatch(
				setUserDialog({
					toggle: true,
					target: 'login',
				}),
			);
			return true;
		}

		const mutateQuery = hasClientSaved ? gqlQuery.deleteSavedCollection : gqlQuery.saveCollection;

		this.setState({
			hasClientSaved: !hasClientSaved,
			count: hasClientSaved ? count - 1 : count + 1,
			clicking: true,
		});

		try {
			const res = await client.mutate({
				mutation: mutateQuery,
				variables: { collectionId: this.props.id },
			});
			const data = res.data.saveCollection || res.data.deleteSavedCollection;
			if (data.success) {
				this.setState({
					clicking: false,
				});
			}
		} catch (err) {
			store.dispatch(
				setAlertbar({
					status: 'error',
					message: __DEV__ ? `[handleSaveCollection] -> ${err.message}` : constants.errMsg,
					open: true,
				}),
			);
		}
		return true;
	};

	render() {
		const { hideSaveButton, ...collection } = this.props;
		const { hasClientSaved, count } = this.state;

		return (
			<div className={s.card}>
				<div className={s.cardHeader}>
					<div className={s.cardTitle}>
						<span>{collection.title}</span>
					</div>
					{!hideSaveButton && (
						<button className={s.saveBtn} onClick={this.handleSaveCollection}>
							{hasClientSaved ? (
								<i className="fa fa-heart" style={{ color: constants.colors.like }} />
							) : (
								<span>
									<i
										className="fa fa-heart-o"
										style={count ? { marginRight: '5px' } : {}}
									/>
									{count || ''}
								</span>
							)}
						</button>
					)}
				</div>

				<Link className={s.collectionLink} to={`/collection/${collection.id}`}>
					<div className={s.paletteWrapper}>
						{collection.palette.map((hex, i) => (
							<div
								// eslint-disable-next-line
						key={hex + i}
								style={{ backgroundColor: hex }}
							/>
						))}
					</div>

					<div className={s.collectionImage}>
						{collection.items.map(item => (
							<ImageLoader
								key={item.VariantID}
								src={item.variantImage.miniPic}
								className={s.imgWrapper}
							>
								<img alt={item.variantImage.alt} />
								<div>
									<img src={item.variantImage.src} alt={item.variantImage.alt} />
								</div>
								<div />
							</ImageLoader>
						))}
					</div>
				</Link>
			</div>
		);
	}
}

export default withStyles(s)(CollectionCard);
