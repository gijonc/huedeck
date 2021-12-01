/**
 * Huedeck, Inc.
 */

import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import Masonry from 'react-masonry-component';
import { compose } from 'recompose';
import { connect } from 'react-redux';
// import cx from 'classnames';
import PropTypes from 'prop-types';
import { Fade } from '@material-ui/core';
import { setAlertbar } from '../../actions/alertbar';
import { Loader, ScrollToTopButton } from '../../components/Utilities';
import Link from '../../components/Link';
import history from '../../history';
import gqlQuery from '../gqlType';
import utils from '../utils';
import s from './Scene.css';
import SceneProduct from './SceneProduct';

const LARGE_IMAGE_PATH = 'https://storage.googleapis.com/huedeck/img/roomScene/1024/';
const SMALL_IMAGE_PATH = 'https://storage.googleapis.com/huedeck/img/roomScene/512/';

async function preloadImages(data) {
	function loadImg(image) {
		return new Promise(resolve => {
			const img = new Image();
			img.onload = () => {
				resolve({
					width: img.width,
					height: img.height,
					...image,
				});
			};
			img.src = `${SMALL_IMAGE_PATH + image.name}.jpeg`;
		});
	}

	const promises = [];
	for (let i = 0, len = data.length; i < len; i += 1) {
		promises.push(loadImg(data[i]));
	}

	return Promise.all(promises);
}

class Scene extends React.Component {
	static propTypes = {
		// eslint-disable-next-line
	 scene: PropTypes.object,
		// eslint-disable-next-line
	 screenSize: PropTypes.object.isRequired,
	};

	static defaultProps = {
		scene: null,
	};

	static contextTypes = {
		store: PropTypes.object.isRequired,
		client: PropTypes.object.isRequired,
	};

	state = {
		loading: false,
		sceneListInitialized: false,
		sceneList: [],
		newOffset: 0,
	};

	componentDidMount() {
		this.init();
	}

	componentDidUpdate(prevProps, prevState) {
		if (this.props.scene !== prevProps.scene) {
			this.init();
		}

		// all availible items are loaded
		if (this.state.newOffset < 0 && this.state.newOffset !== prevState.newOffset) {
			window.removeEventListener('scroll', this.shouldLoadMore);
		}
	}

	componentWillUnmount() {
		window.removeEventListener('scroll', this.shouldLoadMore);
	}

	getAllScene = () => {
		this.setState({ loading: true }, async () => {
			try {
				const data = await this.context.client
					.query({
						query: gqlQuery.getAllRoomScene,
						variables: {
							offset: this.state.newOffset,
						},
					})
					.then(res => res.data.getAllRoomScene);

				const sceneList = await preloadImages(data.sceneList);
				const newSceneList = this.state.sceneList.concat(sceneList);

				this.setState({
					sceneList: newSceneList,
					newOffset: data.newOffset,
					loading: false,
					sceneListInitialized: true,
				});
			} catch (err) {
				this.context.store.dispatch(
					setAlertbar({
						status: 'error',
						message: utils.getGraphQLError(err, 'getAllScene'),
						open: true,
					}),
				);
			}
		});
	};

	getImgWrapperStyle = img => {
		const screenWidth = this.props.screenSize.width;

		let width = '25%';

		if (screenWidth < 600) {
			width = '50%';
		} else if (screenWidth < 900) {
			width = '33.3%';
		} else if (img.productCount > 10) {
			width = '50%';
		}

		return {
			width,
		};
	};

	shouldLoadMore = () => {
		if (!this.container) return; // scene product component returned
		const scrollPosition = window.pageYOffset;
		const maxHeight = this.container.clientHeight;
		if (maxHeight / scrollPosition < 1.3 && !this.state.loading) {
			this.getAllScene();
		}
	};

	init = () => {
		if (!this.props.scene && !this.state.sceneListInitialized) {
			this.getAllScene();
			window.addEventListener('scroll', this.shouldLoadMore);
		}
	};

	goBack = () => {
		if (!this.state.sceneListInitialized) {
			history.push('/scene');
		} else {
			history.goBack();
		}
	};

	render() {
		// for product of scene
		if (this.props.scene) {
			const { scene } = this.props;
			return (
				<SceneProduct
					screenSize={this.props.screenSize}
					products={scene.products}
					largeImage={`${LARGE_IMAGE_PATH + scene.name}.jpeg`}
					smallImage={`${SMALL_IMAGE_PATH + scene.name}.jpeg`}
					goBack={this.goBack}
				/>
			);
		}

		//  for masonry
		const { sceneList, loading } = this.state;
		return (
			<div
				className={s.root}
				ref={node => {
					this.container = node;
				}}
			>
				<h1>Explore &middot; Get Inspired &middot; Shop</h1>
				<Masonry className={s.masonryContainer}>
					{sceneList.map(scene => (
						<div
							key={scene.id}
							className={s.imgWrapper}
							style={this.getImgWrapperStyle(scene)}
						>
							<Link to={`/scene/${scene.id}`} className={s.imgLink}>
								<img src={`${SMALL_IMAGE_PATH + scene.name}.jpeg`} alt=" " />
							</Link>
						</div>
					))}
				</Masonry>

				<Fade in={loading}>
					<div style={{ padding: '5% 0' }}>
						<Loader />
					</div>
				</Fade>
				<ScrollToTopButton showUnder={250} />
			</div>
		);
	}
}

export default compose(
	connect(state => ({
		screenSize: state.screenSize,
	})),
	withStyles(s),
)(Scene);
