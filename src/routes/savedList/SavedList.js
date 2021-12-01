/**
 * Huedeck, Inc.
 */

import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { compose } from 'recompose';
import ImageLoader from 'react-load-image';
import { Grid, withWidth, Fade } from '@material-ui/core';
import { ChevronRight } from '@material-ui/icons';
import { setAlertbar } from 'actions/alertbar';
import { setConfirmDialog } from 'actions/confirmDialog';
import ConfirmDialog from 'routes/Dialogs/ConfirmDialog';
import { Loader } from '../../components/Utilities';
import Link from '../../components/Link';
import { gridCardProps, gridContainerProps } from '../collectionList/collectionUtils';
import gqlQuery from '../gqlType';
import constants from '../constants';
import s from './SavedList.css';

class SavedList extends React.Component {
	static propTypes = {
		width: PropTypes.string.isRequired,
	};

	static contextTypes = {
		store: PropTypes.object.isRequired,
		client: PropTypes.object.isRequired,
	};

	state = {
		savedCollectionList: null,
		preDeleteItemId: null,
	};

	componentDidMount() {
		this.getUserSavedCollectionList();
	}

	getUserSavedCollectionList = async () => {
		const { store, client } = this.context;
		try {
			const res = await client.query({
				query: gqlQuery.getUserSavedCollectionList,
				fetchPolicy: 'network-only',
			});
			const { getUserSavedCollectionList } = res.data;
			if (getUserSavedCollectionList) {
				this.setState({
					savedCollectionList: getUserSavedCollectionList,
					preDeleteItemId: null,
				});
			} else {
				throw new Error(constants.errMsg);
			}
		} catch (err) {
			store.dispatch(
				setAlertbar({
					status: 'error',
					message: __DEV__ ? `[getUserSavedCollectionList] -> ${err}` : err.message,
					open: true,
				}),
			);
		}
	};

	// get confirm result from dialog
	getConfirm = result => {
		if (result === 'deleteSavedCollection') {
			this.deleteSavedCollection();
		}
	};

	toggleDeleteDialog = id => {
		const { store } = this.context;
		this.setState({ preDeleteItemId: id });
		store.dispatch(
			setConfirmDialog({
				confirmKey: 'confirm',
				type: 'deleteSavedCollection',
				query: `Are you sure to remove this collection?`,
				open: true,
			}),
		);
	};

	deleteSavedCollection = async () => {
		const { store, client } = this.context;
		const { preDeleteItemId } = this.state;
		try {
			const res = await client.mutate({
				mutation: gqlQuery.deleteSavedCollection,
				variables: {
					collectionId: preDeleteItemId,
				},
			});
			const { deleteSavedCollection } = res.data;
			if (deleteSavedCollection.success) {
				this.getUserSavedCollectionList();
				this.setState({});
			} else {
				throw new Error(constants.errMsg);
			}
		} catch (err) {
			store.dispatch(
				setAlertbar({
					status: 'error',
					message: __DEV__ ? `[deleteSavedCollection] -> ${err}` : err.message,
					open: true,
				}),
			);
		}
	};

	render() {
		const { savedCollectionList } = this.state;
		const { width } = this.props;

		if (!savedCollectionList) {
			return (
				<div className={s.root}>
					<div className={s.container}>
						<Loader />
					</div>
				</div>
			);
		}

		return (
			<div className={s.root}>
				<div className={s.container}>
					<h1>Saved collections</h1>

					{!savedCollectionList.length ? (
						<p>Oops, you don&apos;t have any saved collections.</p>
					) : (
						<div>
							<ConfirmDialog complete={this.getConfirm} />
							<Grid container {...gridContainerProps} spacing={width !== 'xs' ? 24 : 0}>
								{savedCollectionList.map(cl => (
									<Grid key={cl.id} item {...gridCardProps}>
										<div className={s.card}>
											<div className={s.cardHeader}>
												<div className={s.cardTitle}>
													<span>{cl.title}</span>
												</div>
												<button
													className={s.saveBtn}
													onClick={() => this.toggleDeleteDialog(cl.id)}
												>
													<i
														className="fa fa-heart"
														style={{ color: constants.colors.like }}
													/>
												</button>
											</div>

											<Link className={s.collectionLink} to={`/collection/${cl.id}`}>
												<div className={s.paletteWrapper}>
													{cl.palette.map((hex, i) => (
														<div
															// eslint-disable-next-line
										key={hex + i}
															style={{ backgroundColor: hex }}
														/>
													))}
												</div>

												<div className={s.collectionImage}>
													{cl.items.map(item => (
														<ImageLoader
															key={item.VariantID}
															src={item.variantImage.miniPic}
															className={s.imgWrapper}
														>
															<Fade in timeout={300}>
																<img alt={item.variantImage.alt} />
															</Fade>
															<div className={s.imgPreloder} />
															<div className={s.imgPreloder} />
														</ImageLoader>
													))}
												</div>
											</Link>
										</div>
									</Grid>
								))}
							</Grid>
						</div>
					)}

					<div style={!savedCollectionList.length ? { textAlign: 'center' } : {}}>
						<Link to="/collections" className={s.showMore}>
							Check out more collections
							<ChevronRight fontSize="small" />
						</Link>
					</div>
				</div>
			</div>
		);
	}
}

export default compose(
	withStyles(s),
	withWidth(),
)(SavedList);
