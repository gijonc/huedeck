/**
 *	Huedeck, Inc
 */

// import utils from 'routes/utils';
// import colorMath from './colorMath';
import constants from 'routes/constants';
import buildPalette from './buildPalette';

const MAX_IMAGE_WIDTH = 545; // match width of uploaded photo div
// const MAX_IMAGE_WIDTH = 800; // match width of uploaded photo div

async function getImgData(imageUrl, canElement) {
	const img = await new Promise((resolve, reject) => {
		const newImg = new Image();
		newImg.onload = () => resolve(newImg);
		newImg.onerror = reject;
		newImg.src = imageUrl;
	});

	// get resize refrence for image data process
	const resizeRef = img.width > img.height ? img.height : img.width;
	const resizeFraction = 1 / (300 / resizeRef);
	const resizedWidth = img.width / resizeFraction;
	const resizedHeight = img.height / resizeFraction;

	// set canvas width height
	const can = canElement;
	can.width = img.width / resizeFraction;
	can.height = img.height / resizeFraction;

	if (resizedWidth > MAX_IMAGE_WIDTH) {
		const scale = resizedHeight / resizedWidth;
		can.width = MAX_IMAGE_WIDTH;
		can.height = Math.round(can.width * scale);
	}

	const ctx = can.getContext('2d');
	ctx.clearRect(0, 0, canElement.width, canElement.height);
	ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, can.width, can.height);
	const imgData = ctx.getImageData(0, 0, resizedWidth, resizedHeight);
	return imgData;
}

async function getImgPalette(imgData, outputSize, processSize) {
	const hexArr = buildPalette.fromHoneycomb(
		imgData.data,
		outputSize || constants.MAX_PALETTE_LENGTH, // output size
		processSize || 10, // actual processed size
	);
	return hexArr;
}

export default {
	getImgData,
	getImgPalette,
};
