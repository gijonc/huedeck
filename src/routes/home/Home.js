/**
 * Huedeck, Inc.
 */

import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import Slider from 'react-slick';
import Link from '../../components/Link';
import AllCategoryList from './AllCategoryList';
import ShopByColor from './ShopByColor';
import FeaturedCollections from './FeaturedCollections';
import TopSellerList from './TopSellerList';
import s from './Home.css';

class Home extends React.Component {
	state = {
		showAllCategory: false,
		loadedImgCount: 0,
	};

	componentDidMount() {
		this.preloadImage();
	}

	toggleShowAllCategoryDialog = () => {
		this.setState({
			showAllCategory: !this.state.showAllCategory,
		});
	};

	preloadImage = () => {
		const { slideshow } = this.props;
		for (let i = 1, len = slideshow.length; i < len; i += 1) {
			const img = new Image();
			img.onload = () => {
				this.setState({
					loadedImgCount: this.state.loadedImgCount + 1,
				});
			};
			img.src = this.SLIDER_IMG_PATH + slideshow[i].image;
		}
	};

	BRAND_IMG_PATH = 'https://storage.googleapis.com/huedeck/img/homepage/brand_logo/';
	SLIDER_IMG_PATH = 'https://storage.googleapis.com/huedeck/img/homepage/slider/';
	SLIDER_CONFIG = {
		dots: true,
		autoplay: true,
		arrows: false,
		autoplaySpeed: 5000,
		pauseOnHover: true,
		speed: 1000,
	};

	render() {
		const { showAllCategory, loadedImgCount } = this.state;

		const {
			slideshow,
			shopByDepartment,
			shopByColor,
			shopByBrand,
			featuredCollections,
		} = this.props;

		return (
			<div className={s.root}>
				<div className={s.container}>
					{slideshow.length > 0 && (
						<div>
							<div className={s.showCaseHeader} style={{ padding: '1% 2%' }}>
								<h1>Shop by Scene</h1>
							</div>
							<div className={s.slider}>
								{loadedImgCount === slideshow.length - 1 ? (
									<Slider {...this.SLIDER_CONFIG}>
										{slideshow.map(obj => (
											<Link to={obj.link} key={obj.image}>
												<img alt={obj.link} src={this.SLIDER_IMG_PATH + obj.image} />
											</Link>
										))}
									</Slider>
								) : (
									<Link to={slideshow[0].link}>
										<img
											alt={slideshow[0].link}
											src={this.SLIDER_IMG_PATH + slideshow[0].image}
										/>
									</Link>
								)}
							</div>
						</div>
					)}

					<div id="shopByColor" className={s.showCaseContainer}>
						<div className={s.showCaseHeader}>
							<h1>Shop by Color</h1>
						</div>
						<ShopByColor {...shopByColor} />
					</div>

					<div className={s.showCaseContainer}>
						<div className={s.showCaseHeader}>
							<h1>Top Sellers</h1>
						</div>
						<TopSellerList />
					</div>

					<div className={s.showCaseContainer}>
						<div className={s.showCaseHeader}>
							<h1>Featured Collections</h1>
							<Link to="/collections" className={s.showAllBtn}>
								show all
							</Link>
						</div>
						<FeaturedCollections idList={featuredCollections} />
					</div>

					<div id="shopByDepartment" className={s.showCaseContainer}>
						<div className={s.showCaseHeader}>
							<h1>Shop by Department</h1>
							<button className={s.showAllBtn} onClick={this.toggleShowAllCategoryDialog}>
								show all
							</button>
							<AllCategoryList
								open={showAllCategory}
								onClose={this.toggleShowAllCategoryDialog}
							/>
						</div>
						<div>
							{shopByDepartment.map(dept => (
								<div key={dept.name} className={s.showCaseItemWrapper}>
									<Link className={s.showCaseItem} to={dept.path}>
										<img src={dept.coverImg} alt={dept.name} />
										<div className={s.title}>
											<span>{dept.name}</span>
										</div>
									</Link>
								</div>
							))}
						</div>
					</div>

					<div className={s.showCaseContainer}>
						<div className={s.showCaseHeader}>
							<h1>Shop by Brand</h1>
						</div>
						<div>
							{shopByBrand.map(brand => (
								<div key={brand.name} className={s.showCaseItemWrapper}>
									<Link
										className={s.showCaseItem}
										to={`/brand/${brand.name.split(' ').join('-')}`}
									>
										<img src={this.BRAND_IMG_PATH + brand.coverImg} alt={brand.name} />
									</Link>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default withStyles(s)(Home);
