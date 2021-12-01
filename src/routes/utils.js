/* eslint-disable */

/**
 * Huedeck, Inc.
 */

import 'url-search-params-polyfill';
import constants from './constants';

function wait(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function toCapitalize(str) {
	return str.toLowerCase()
		.split(' ')
		.map(s => s.charAt(0).toUpperCase() + s.substring(1))
		.join(' ');
}

function timeSince(dateStr) {
  const date = new Date(Date.parse(dateStr));
  const seconds = Math.floor((new Date() - date) / 1000);

  let interval = Math.floor(seconds / 31536000);
  if (interval > 1) {
    return `${interval} years ago`;
  }

  interval = Math.floor(seconds / 2592000);
  if (interval > 1) {
    return `${interval} months ago`;
  }

  interval = Math.floor(seconds / 86400);
  if (interval > 1) {
    return `${interval} days ago`;
  }

  interval = Math.floor(seconds / 3600);
  if (interval > 1) {
    return `${interval} hours ago`;
  }

  interval = Math.floor(seconds / 60);
  if (interval > 1) {
    return `${interval} minutes ago`;
  }

  // return Math.floor(seconds) + " seconds ago";
  return 'Just now';
}

function arraysEqual(arr1, arr2, orderMatters) {
  if (arr1.length !== arr2.length) return false;
  if (orderMatters) {
	arr1.sort();
	arr2.sort();
  }
  for (let i = 0, len = arr1.length; i < len; i += 1) {
    if (arr1[i] !== arr2[i]) return false;
  }
  return true;
}

function palettesAreSame(_p1, _p2) {
  const p1 = Array.from(_p1).sort();
  const p2 = Array.from(_p2).sort();
  const result = arraysEqual(p1, p2);

  return result;
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

function isValidHexCode(hex) {
  return /^#[0-9A-F]{6}$/i.test(hex);
}

function goToProduct(pid, hexArr, vid) {
  const urlBase = `/product/${pid}`;
  const urlParams = new URLSearchParams();

  if (vid) urlParams.set('vid', vid);
  if (hexArr && hexArr.length) urlParams.set('pl', encodeURIComponent(hexArr.toString()));
  const urlParamStr = urlParams.toString();

  return urlBase + (urlParamStr ? `?${urlParamStr}` : '');
}

function goToShop(hexArr, page) {
  const urlBase = '/shop';
  const urlParams = new URLSearchParams();
  if (hexArr && hexArr.length) urlParams.set('pl', encodeURIComponent(hexArr.toString()));
  if (Number(page) > 0) urlParams.set('page', Number(page));
  
  const urlParamStr = urlParams.toString();
  return urlBase + (urlParamStr ? `?${urlParamStr}` : '');
}

function goToRoom(hexArr) {
  const urlBase = '/room';
  const urlParams = new URLSearchParams();
  if (hexArr && hexArr.length) urlParams.set('pl', encodeURIComponent(hexArr.toString()));

  const urlParamStr = urlParams.toString();
  return urlBase + (urlParamStr ? `?${urlParamStr}` : '');
}

function getValidHexArr(hexStr) {
  try {
	const hexArr = decodeURIComponent(hexStr).split(',');
	if (hexArr.length !== constants.MAX_PALETTE_LENGTH) return false;
	for (let i = 0, len = hexArr.length; i < len; i += 1) {
		if (!isValidHexCode(hexArr[i])) {
			return false;
		}
	}
	return hexArr;
  } catch(err) {
	  return false;
  }
}

function convertPrice(p, getPrecise) {
  // remove decimal numbers on integers
  function isInt(n) {
    return n % 1 === 0;
  }

  const p1 = Math.round(Number(p) * 100) / 100;
  return p1
    .toFixed(!getPrecise && isInt(p1) ? 0 : 2)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function getProductPrices({variants, minPrice, maxPrice}) {
  const result = [];
  const msrpArr = [];

  for (let i = 0, len = variants.length; i < len; i += 1) {
    msrpArr.push(variants[i].msrpPrice);
  }
  const msrpMin = Math.min(...msrpArr);
  const msrpMax = Math.max(...msrpArr);

  // get listing price
  if (minPrice < maxPrice) {
    result.push(`$${convertPrice(minPrice)} - $${convertPrice(maxPrice)}`);
  } else {
    result.push(`$${convertPrice(minPrice)}`);
  }

  // get msrpPrice if msrpPrice are different
  if (minPrice !== msrpMin || maxPrice !== msrpMax) {
    if (msrpMin < msrpMax) {
      result.push(`$${convertPrice(msrpMin)} - $${convertPrice(msrpMax)}`);
    } else {
      result.push(`$${convertPrice(msrpMin)}`);
    }
  } else {
    result.push(' ');
  }

  return result;
}

function getRandomInt(min, max) {
  const minInt = Math.ceil(min);
  const maxInt = Math.floor(max);
  return Math.floor(Math.random() * (maxInt - minInt)) + minInt; // The maximum is exclusive and the minimum is inclusive
}

function getGraphQLError(err, key) {
  if (__DEV__ && err.graphQLErrors && err.graphQLErrors.length) {
    const { message, path } = err.graphQLErrors[0];
    return `Error[${key || 'unknown'}] --> ${path}: ${message}`;
  }
  return `Error[${key || 'unknown'}] --> ${__DEV__ ? err.message : constants.errMsg}`;
}

// checkout valid numeric input (0-9)
function isValidNumericInput(str) {
  const validationRegex = /^(\s*|\d+)$/;
  return validationRegex.test(str);
}

function getUpdatedUri(key, value) {
  const parsedValue = value.split(' ').join('-'); // replace space with '-'
  const { pathname, search } = window.location;
  const urlParams = new URLSearchParams(search);
  const queryStr = urlParams.get(key);
  if (queryStr) {
    const queryArr = queryStr.split(' ');
    const valueIdx = queryArr.indexOf(parsedValue);
    if (valueIdx !== -1) {
      queryArr.splice(valueIdx, 1);
    } else {
      queryArr.push(parsedValue);
    }
    if (!queryArr.length) {
      urlParams.delete(key);
    } else {
      urlParams.set(key, queryArr.join(' ').trim());
    }
  } else {
    urlParams.set(key, parsedValue);
  }

  if (key !== 'page' && urlParams.has('page')) {
    urlParams.delete('page');
  }

  return `${pathname}?${urlParams.toString()}`;
}

function resetUriByKey(key, value) {
  const { pathname, search } = window.location;
  const urlParams = new URLSearchParams(search);
  if (urlParams.has(key)) {
    urlParams.delete(key);
  }

  if (key !== 'page' && urlParams.has('page')) {
    urlParams.delete('page');
  }

  // if value is define, replace the original value with the new value
  if (value) {
    const parsedValue = String(value)
      .split(' ')
      .join('-'); // replace space with '-'
    urlParams.set(key, parsedValue);
  }
  return `${pathname}?${urlParams.toString()}`;
}

function getRangeFilterStr(min, max) {
  if (min >= 0 && max >= min) {
    	return `${min} to ${max}`;
    } else if (min <= 0 && max > 0) {
    	return `under ${max}`;
    } else if (max <= 0 && min >= 0) {
    	return `above ${min}`;
    }
}

function getPdContentViewData(product) {
	return {
		content_type: 'product',
	 	content_ids: [product.ProductID.toString()],
	 	content_name: product.productName,
	 	content_category: product.category3 || 'unknown',
	 	value: product.minPrice,
	 	currency: 'USD'
	}
}

function preloadProductImg(productList) {
	function loadImg(pd) {
		return new Promise(resolve => {
			const img = new Image();
			img.onload = () => {
				resolve(pd);
			};
			img.src = pd.image || pd.medias[0].miniPic;
		});
	}
	const promises = [];
	for (let i = 0, len = productList.length; i < len; i += 1) {
		promises.push(loadImg(productList[i]));
	}
	return Promise.all(promises);
}

export default {
  wait,
  toCapitalize,
  timeSince,
  arraysEqual,
  shuffleArray,
  isValidHexCode,
  goToProduct,
  convertPrice,
  palettesAreSame,
  getProductPrices,
  getValidHexArr,
  goToShop,
  getRandomInt,
  getGraphQLError,
  isValidNumericInput,
  getUpdatedUri,
  resetUriByKey,
  getRangeFilterStr,
  getPdContentViewData,
  preloadProductImg,
  goToRoom
};
