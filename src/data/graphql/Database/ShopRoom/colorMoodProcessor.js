import colorUtils from '../products/colorUtils';
/*
 * constants
 */

const MAX_PALETTE_LENGTH = 5;
const Colormood = {
	/**
	 * This scale is using HSL
	 * H: scale of 0 ~ 360
	 * S: scale of 0 ~ 100
	 * L: scale of 0 ~ 100
	 */

	// deep: L
	range: {
		deep: {
			min: 10,
			target: 26,
			max: 45,
		},

		light: {
			min: 55,
			target: 74,
			max: 95,
		},

		// TODO: use this (normal luma) for a better warm/cool determination
		normal: {
			min: 30,
			target: 50,
			max: 70,
		},

		neutral: {
			min: 10,
			target: 30,
			max: 40,
		},

		colorful: {
			max: 100,
			target: 100,
			min: 40,
		},

		cool: {
			min: 80,
			target: 230,
			max: 330,
		},

		warm: {
			target: 25,
		},
	},

	deep(L) {
		return this.range.deep.min <= L && L <= this.range.deep.max;
	},
	light(L) {
		return this.range.light.min <= L && L <= this.range.light.max;
	},
	neutral(S) {
		return this.range.neutral.min <= S && S <= this.range.neutral.max;
	},
	colorful(S) {
		return this.range.colorful.min <= S && S <= this.range.colorful.max;
	},
	cool(H) {
		return this.range.cool.min < H && H < this.range.cool.max;
	},
	warm(H) {
		return !this.cool(H);
	},
};

const HslIdx = {
	// H
	cool: 0,
	warm: 0,
	// S
	neutral: 1,
	colorful: 1,
	// L
	deep: 2,
	light: 2,
};

/*
 * util functions
 */

function sortByAccuracyASC(a, b) {
	return a.accuracy > b.accuracy ? -1 : 1;
}

function getRandomInt(min, max) {
	const minInt = Math.ceil(min);
	const maxInt = Math.floor(max);
	return Math.floor(Math.random() * (maxInt - minInt)) + minInt; // The maximum is exclusive and the minimum is inclusive
}

function shuffleArray(array) {
	const arr = array;
	let currentIndex = array.length;
	// While there remain elements to shuffle...
	while (currentIndex !== 0) {
		// Pick a remaining element...
		const randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;
		// And swap it with the current element.
		const temporaryValue = arr[currentIndex];
		arr[currentIndex] = arr[randomIndex];
		arr[randomIndex] = temporaryValue;
	}
	return arr;
}

function getColorMoodAccuracy(inputValue, targetValue) {
	const value = 1 - Math.abs(inputValue - targetValue) / targetValue;
	return value;
}

function getTargetClosetRandNum({ min, max, target }) {
	// get the most possible difference that is in the valid range of the mood
	const maxDiff = Math.min(target - min, max - target);
	const randNum = getRandomInt(target - maxDiff, target + maxDiff);
	return randNum;
}

function cmFilter(hsl, mood) {
	const { range } = Colormood;
	const targetValue = hsl[HslIdx[mood]];
	const inMoodRange = Colormood[mood](targetValue);
	return inMoodRange ? getColorMoodAccuracy(targetValue, range[mood].target) : 0;
}

function hslTuner(hsl, moodList) {
	const result = hsl;
	for (let i = 0, len = moodList.length; i < len; i += 1) {
		const mood = moodList[i];
		const targetIdx = HslIdx[mood];
		if (targetIdx > 0) {
			// check if the color is already within the range
			const shouldTune = !Colormood[mood](result[targetIdx]);
			if (shouldTune) result[targetIdx] = getTargetClosetRandNum(Colormood.range[mood]);
		}
	}
	return result;
}

/*
 * main functions
 */

function colorMoodTuner(baseColorList, colorMoodArr) {
	// const t0 = now();

	let inputCandidates = baseColorList.slice();
	const hslArr = [...Array(MAX_PALETTE_LENGTH)].map(() => Array(0));

	// random the order of the palette
	const medium = MAX_PALETTE_LENGTH - 2;
	if (baseColorList.length > medium) {
		// shuffle it before we chop it
		inputCandidates = shuffleArray(inputCandidates);
		// slice and make sure we won't get into infinite loop
		inputCandidates.splice(medium);
	}

	while (inputCandidates.length) {
		const inputIndex = getRandomInt(0, MAX_PALETTE_LENGTH);
		if (!hslArr[inputIndex].length) {
			hslArr[inputIndex] = colorUtils.hexToHsl(inputCandidates[0]);
			inputCandidates.splice(0, 1); // pop the first element in array
		}
	}

	// tune to get a better colormood matching
	const rgbArr = [];
	for (let i = 0, len = hslArr.length; i < len; i += 1) {
		const hsl = hslArr[i];
		if (hsl.length) {
			const tunedHsl = hslTuner(hsl, colorMoodArr);
			const rgb = colorUtils.hsl2Rgb(tunedHsl[0] / 360, tunedHsl[1] / 100, tunedHsl[2] / 100);
			rgbArr.push(rgb);
		} else {
			rgbArr.push([]);
		}
	}

	// console.log(`spent: ${Math.round((now() - t0) * 100) / 100} ms`);

	return rgbArr;
}

// get the most mood matching color(hsl) out from the group
function colorMoodFilter(hslArr, moods) {
	const filteredList = [];
	for (let i = 0, len = hslArr.length; i < len; i += 1) {
		const hsl = hslArr[i];
		// get score of accuracy for each input mood
		const acScores = moods.map(mood => ({
			score: cmFilter(hsl, mood),
			mood,
		}));

		// filter out 0 accuracy feilds and get the final
		const filteredScores = acScores.filter(v => v.score > 0);
		// get final accuracy
		const { length } = filteredScores;
		if (length) {
			filteredList.push({
				hsl,
				accuracy: filteredScores.map(obj => obj.score).reduce((sum, val) => sum + val) / length,
				mood: filteredScores.map(obj => obj.mood),
			});
		}
	}

	// SORT BY ASC
	return filteredList.sort(sortByAccuracyASC);
}

function groupToHslArray(arr) {
	const bp = [7, 6, 7, 6, 6]; // 5 breakponits of 32
	const group = [];

	let start = 0;
	for (let i = 0, len = bp.length; i < len; i += 1) {
		const end = start + bp[i];
		const rgbArr = arr.slice(start, end);
		const hslArr = colorUtils.rgb2HslArr(rgbArr);
		group.push(hslArr);
		start = end;
	}
	return group;
}

async function getPaletteFromColorMood(rawRgbArrList, colorMoodList) {
	const hslGroup = groupToHslArray(rawRgbArrList);
	// const hslArr = colorUtils.rgb2HslArr(rawRgbArrList);

	// filter and get accuracy score
	const res = await hslGroup.map(grp => colorMoodFilter(grp, colorMoodList));

	// handle no any results match the desired colormood: output raw AI result
	if (!res.length) {
		const rawHslArr = hslGroup.map(grp => grp[0]);
		return colorUtils.hsl2RgbArr(rawHslArr);
	}

	// get the most matching one (first item of the array);
	const result = [];
	for (let i = 0, len = res.length; i < len; i += 1) {
		const grp = res[i];
		if (grp && grp.length) {
			result.push(grp[0]);
			grp.splice(0, 1);
		} else {
			const deprecatedGrp = hslGroup[i];
			const rand = getRandomInt(0, deprecatedGrp.length);
			result.push({ hsl: deprecatedGrp[rand] });
		}
	}

	const rgbArr = result.map(obj =>
		colorUtils.hsl2Rgb(obj.hsl[0] / 360, obj.hsl[1] / 100, obj.hsl[2] / 100),
	);

	return rgbArr;
}

export { getPaletteFromColorMood, colorMoodTuner };
