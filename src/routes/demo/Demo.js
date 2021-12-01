/**
 * Huedeck, Inc.
 */

import React from 'react';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
// import cx from 'classnames';
// import PropTypes from 'prop-types';
import s from './Demo.css';

function getOrientation(file, callback) {
	const reader = new FileReader();
	reader.onload = e => {
		const view = new DataView(e.target.result);
		if (view.getUint16(0, false) !== 0xffd8) {
			return callback(-2);
		}
		let offset = 2;
		while (offset < view.byteLength) {
			if (view.getUint16(offset + 2, false) <= 8) return callback(-1);
			const marker = view.getUint16(offset, false);
			offset += 2;
			if (marker === 0xffe1) {
				const unit32 = view.getUint32((offset += 2), false);
				if (unit32 !== 0x45786966) {
					return callback(-1);
				}

				const little = view.getUint16((offset += 6), false) === 0x4949;
				offset += view.getUint32(offset + 4, little);
				const tags = view.getUint16(offset, little);
				offset += 2;
				for (let i = 0; i < tags; i += 1) {
					if (view.getUint16(offset + i * 12, little) === 0x0112) {
						return callback(view.getUint16(offset + i * 12 + 8, little));
					}
				}
			} else if ((marker & 0xff00) !== 0xff00) {
				break;
			} else {
				offset += view.getUint16(offset, false);
			}
		}
		return callback(-1);
	};
	reader.readAsArrayBuffer(file);
}

function filterImgUrl(str) {
	const url = str.split('/').pop();
	if (url.match(/.(jpg|png|gif)$/i)) {
		return url.replace(/\.[^/.]+$/, '.jpeg');
	} else if (!str.endsWith('.jpeg')) {
		return `${url}.jpeg`;
	}
	return url;
}

const IMG_PREFIX_MAP = {
	product: 'https://storage.googleapis.com/huedeck/img/product/origin/',
	roomscene: 'https://storage.googleapis.com/huedeck/img/roomScene/512/',
};

class Demo extends React.Component {
	state = {
		detectedObjects: [],
		similarProducts: [],
		loading: false,
		rotate: false,
		imgLoaded: false,
		selectedTargetProductSet: Object.keys(IMG_PREFIX_MAP)[0],
		warningMsg: null,
	};

	getBase64 = file =>
		new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => {
				let encoded = reader.result.replace(/^data:(.*;base64,)?/, '');
				if (encoded.length % 4 > 0) {
					encoded += '='.repeat(4 - (encoded.length % 4));
				}
				resolve(encoded);
			};
			reader.onerror = error => reject(error);
		});

	drawCanvas = async imageUrl => {
		const MAX_IMAGE_WIDTH = 300; // match width of uploaded photo div

		const img = await new Promise((resolve, reject) => {
			const newImg = new Image();
			newImg.onload = () => resolve(newImg);
			newImg.onerror = reject;
			newImg.src = imageUrl;
		});

		const can = this.previewImg;
		can.width = img.width;
		can.height = img.height;

		if (can.width > MAX_IMAGE_WIDTH) {
			const scale = MAX_IMAGE_WIDTH / can.width;
			can.width = MAX_IMAGE_WIDTH;
			can.height = Math.round(can.height * scale);
		}
		const ctx = can.getContext('2d');
		ctx.clearRect(0, 0, can.width, can.height);
		ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, can.width, can.height);
		this.setState({
			imgLoaded: true,
		});
	};

	fetchData = (imgData, type) => {
		this.setState(
			{
				imgLoaded: false,
				loading: true,
				warningMsg: null,
				detectedObjects: [],
				similarProducts: [],
			},
			async () => {
				const apiUrl = '/vision-ai';
				const { selectedTargetProductSet } = this.state;
				const productSet = `${selectedTargetProductSet}-set`;

				try {
					const res = await fetch(apiUrl, {
						method: 'POST',
						body: JSON.stringify({
							imgData,
							type,
							productSet,
						}),
						headers: {
							Accept: 'application/json',
							'Content-Type': 'application/json',
						},
					});

					const results = await res.json();
					this.setState({
						loading: false,
					});

					const { detectedObjects, similarProducts, success } = results;

					if (!success) throw new Error(`Cannot connect to ${apiUrl}`);

					// process detected object result
					if (detectedObjects && detectedObjects.length) {
						this.setState({
							detectedObjects,
						});
						const can = this.previewImg;
						const optionalColors = ['#f50057', 'green', 'blue', 'orange', 'red'];
						for (let i = 0, len = detectedObjects.length; i < len; i += 1) {
							const { boundingPoly } = detectedObjects[i];
							const [leftTop, rightTop, rightBottom] = boundingPoly.normalizedVertices;
							const x = can.width * leftTop.x;
							const y = can.height * leftTop.y;
							const recWidth = can.width * (rightTop.x - leftTop.x);
							const recHeight = can.height * (rightBottom.y - rightTop.y);
							const color = optionalColors[i % optionalColors.length];

							const ctx = can.getContext('2d');
							// draw stroke
							ctx.strokeStyle = color;
							ctx.strokeRect(x, y, recWidth, recHeight);
							// ctx.fillStyle = color;
							// ctx.fillText(`${name}: ${score.toFixed(3)}`, x + 3, y + 10);
						}
					} else {
						this.setState({
							warningMsg: 'No object detected',
						});
					}

					// process similar object result
					if (similarProducts && similarProducts.length) {
						const imgPrefix = IMG_PREFIX_MAP[selectedTargetProductSet];
						const list = similarProducts.map(obj => ({
							id: obj.product.name.split('/').pop(),
							name: obj.product.displayName,
							image: imgPrefix + filterImgUrl(obj.image),
							score: obj.score,
						}));
						this.setState({
							similarProducts: list,
						});
					} else {
						this.setState({
							warningMsg: 'No similar image found',
						});
					}
				} catch (err) {
					console.error(err);
				}
			},
		);
	};

	uploadImgOnClick = async e => {
		const file = e.target.files[0];
		if (!file.type.startsWith('image/')) return;
		e.target.value = null;
		// create temp url for uploaded image
		const imgPreviewUrl = URL.createObjectURL(file);

		getOrientation(file, ori =>
			this.setState({
				rotate: ori === 6,
			}),
		);

		this.drawCanvas(imgPreviewUrl);
		const imgData = await this.getBase64(file);
		this.fetchData(imgData, 'image');
	};

	searchUri = e => {
		e.preventDefault();
		const url = e.target.url.value;
		if (!url) return;
		this.drawCanvas(url);
		this.fetchData(url, 'url');
	};

	handleTargetProductSetChange = e => {
		const { value } = e.target;
		this.setState({
			selectedTargetProductSet: value,
		});
	};

	render() {
		const {
			detectedObjects,
			similarProducts,
			loading,
			rotate,
			imgLoaded,
			selectedTargetProductSet,
			warningMsg,
		} = this.state;

		return (
			<div className={s.root}>
				<div className={s.container}>
					<div className={s.btnGroup}>
						<button className={s.uploadImgBtn}>
							<label htmlFor="imgInput" style={{ cursor: 'pointer' }}>
								<input
									id="imgInput"
									accept="image/*"
									type="file"
									style={{ display: 'none' }}
									onChange={this.uploadImgOnClick}
								/>
								Upload Image
							</label>
						</button>

						<form onSubmit={this.searchUri} className={s.form}>
							<input
								disabled={loading}
								className={s.input}
								type="text"
								name="url"
								placeholder="Enter an image URL"
							/>
							<button type="submit" disabled={loading}>
								<i className="fa fa-search" />
							</button>
						</form>

						{/* <div className={s.optionList}>
							<select
								disabled={loading}
								onChange={this.handleTargetProductSetChange}
								value={selectedTargetProductSet}
							>
								{Object.keys(IMG_PREFIX_MAP).map(val => (
									<option key={val} value={val}>
										{val}
									</option>
								))}
							</select>
						</div> */}
					</div>

					<div className={s.canvans}>
						<canvas
							style={{
								opacity: loading ? 0.3 : 1,
								transform: rotate ? 'rotate(90deg)' : 'unset',
								borderColor: imgLoaded ? 'lightgray' : '#fff',
							}}
							ref={c => {
								this.previewImg = c;
							}}
						/>
						{loading && (
							<span>
								<i className="fa fa-spinner fa-spin" />
								<p>loading...</p>
							</span>
						)}
					</div>

					{Boolean(detectedObjects.length) && (
						<div>
							<h2>{detectedObjects.length} objects detected</h2>
							{__DEV__ &&
								detectedObjects.map((obj, i) => (
									// eslint-disable-next-line
								<div key={obj.name + i}>
										{obj.name}: {obj.score.toFixed(3)}
									</div>
								))}
						</div>
					)}

					{Boolean(similarProducts.length) && (
						<div className={s.similarProducts}>
							<h2>Similar Images of {selectedTargetProductSet}</h2>
							{similarProducts.map(obj => (
								<div className={s.productWrapper} key={obj.id}>
									<a
										href={`http://www.huedeck.com/product/${obj.id}`}
										target="_blank"
										rel="noopener noreferrer"
									>
										<img src={obj.image} alt={obj.name} />
										{__DEV__ && <p>Score: {obj.score.toFixed(3)}</p>}
									</a>
								</div>
							))}
						</div>
					)}

					{warningMsg && <h1 style={{ color: 'red' }}>{warningMsg}</h1>}
				</div>
			</div>
		);
	}
}

export default withStyles(s)(Demo);
