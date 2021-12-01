/* eslint-disable */

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 */
function hsl2Rgb(h, s, l) {
  let r, g, b;

  if (s == 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function hsl2RgbArr(hslArr) {
	const rgbArr = [];
	for (let i = 0, len = hslArr.length; i < len; i += 1) {
		const [h, s, l] = hslArr[i];
		const rgb = hsl2Rgb(h/360, s/100, l/100);
		rgbArr.push(rgb);
	}
	return rgbArr;
}

/**
 * Converts an RGB color value to HSL. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and l in the set [0, 1].
 */
function rgb2Hsl(r, g, b) {
  (r /= 255), (g /= 255), (b /= 255);
  let max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;

  if (max == min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  h = Math.round(h * 360); // convert h to 360 deg range
  s = Math.round(s * 100); // convert s to percentage of 100
  l = Math.round(l * 100); // convert l to percentage of 100
  return [h, s, l];
}

function sort2dArr(a, b) {
  if (a[0] === b[0]) {
    return 0;
  }
  return a[0] < b[0] ? -1 : 1;
}

function hslToHex(h, s, l) {
  h /= 360;
  s /= 100;
  l /= 100;
  let r, g, b;
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  const toHex = x => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
  };
  console.log(`#${toHex(r)}${toHex(g)}${toHex(b)}`);
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function rgb2HslArr(arr) {
  const hslArr = [];
  for (let i = 0, len = arr.length; i < len; i += 1) {
    const [r, g, b] = arr[i];
    hslArr.push(rgb2Hsl(r, g, b));
  }
  return hslArr;
}

function hex2rgb(hexString) {
  const hex = parseInt(hexString.replace(/[^0-9a-f]/gi, ''), 16);
  return [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255];
}

function hexToHsl(hexStr) {
	const rgb = hex2rgb(hexStr);
	const [r, g, b] = rgb;
	return rgb2Hsl(r, g, b);
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function rgb2hex(rgb) {
	return "#" + ((1 << 24) + ((+rgb[0]) << 16) + ((+rgb[1]) << 8) + (+rgb[2])).toString(16).slice(1);
}

function rgbArr2hexArr(rgbArr) {
	const hexArr = rgbArr.map(x => rgb2hex(x))
	return hexArr;
}

export default {
  shuffle,
  sort2dArr,
  rgb2HslArr,
  hsl2Rgb,
  rgb2Hsl,
  hslToHex,
  hex2rgb,
  hexToHsl,
  rgb2hex,
  rgbArr2hexArr,
  hsl2RgbArr
};
