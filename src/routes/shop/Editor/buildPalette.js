/* eslint-disable */

/**
 *	Huedeck, Inc
 */

import utils from 'routes/utils';
// import kdTree from './kdTree';
import colorMath from '../colorMath';

const buildPalette = {
  // Euclidean color distance from
  // http://www.compuphase.com/cmetric.htm
  colorDistance(a, b) {
    const dr = a.r - b.r;
    const dg = a.g - b.g;
    const db = a.b - b.b;
    const redMean = (a.r + b.r) / 2;
    return (2 + redMean / 256) * dr * dr + 4 * dg * dg + (2 + (255 - redMean) / 256) * db * db;
  },

  colorDistanceIsClose(rgb, paletteRgb, distanceThreshold) {
    let threshold = 20000;
    if (distanceThreshold && typeof distanceThreshold === 'number') {
      /* default if not defined */
      threshold = distanceThreshold;
    }
    for (let i = 0; i < paletteRgb.length; i += 1) {
      const distance = this.colorDistance(paletteRgb[i], rgb);
      if (distance < threshold) return true;
    }
    return false;
  },

  colorIsGray(rgb, grayThreshold) {
    let threshold = 15;
    if (grayThreshold && typeof grayThreshold === 'number') {
      /* default if not defined */
      threshold = grayThreshold;
    }
    // max value is 255
    const dRG = Math.abs(rgb.r - rgb.g);
    const dRB = Math.abs(rgb.r - rgb.b);
    const dBG = Math.abs(rgb.b - rgb.g);
    if (dRG < threshold && dRB < threshold && dBG < threshold) {
      return true;
    }
    return false;
  },

  /* Typical values:
   * paletteSize = 5;
   * candidateSize = 10
   */

  /*

  fromKdTree(pix, paletteSize, candidateSize) {
    if (paletteSize > candidateSize) {
      // This shoundn't happen. But if it does, we correct it here
      candidateSize = paletteSize * 2;
    }
    const pixels = [];
    for (let i = 0, n = pix.length; i < n; i += 8) {
      pixels.push({ r: pix[i], g: pix[i + 1], b: pix[i + 2] });
    }

    const Tree = new kdTree.kdTree(pixels, this.colorDistance, ['r', 'g', 'b']);
    let data = [];
    if (pixels.length > 128) {
      data = Tree.getColorsOnDepth(6);
    } else {
      data = Tree.getColorsOnDepth(0, true);
    }

    // Removed duplicate data
    let uniqDataHex = data.filter((v, i, a) => a.indexOf(v) === i);
    let paletteHex = [];
    if (uniqDataHex.length > candidateSize) {
      let paletteRgb = [];
      for (let i = 0, n = uniqDataHex.length; i < n; i += 1) {
        const rgbData = colorMath.hex2rgbObject(uniqDataHex[i]);
        if (this.colorIsGray(rgbData) === false) {
          if (this.colorDistanceIsClose(rgbData, paletteRgb, 10000) === false) {
            paletteRgb.push(rgbData);
          }
        }
      }
      if (paletteRgb.length < paletteSize) {
        paletteRgb = [];
        for (let i = 0, n = uniqDataHex.length; i < n; i += 1) {
          const rgbData = colorMath.hex2rgbObject(uniqDataHex[i]);
          if (this.colorDistanceIsClose(rgbData, paletteRgb, 5000) === false) {
            paletteRgb.push(rgbData);
          }
        }
        if (paletteRgb.length < paletteSize) {
          paletteRgb = [];
          for (let i = 0, n = uniqDataHex.length; i < n; i += 1) {
            const rgbData = colorMath.hex2rgbObject(uniqDataHex[i]);
            paletteRgb.push(rgbData);
          }
        }
      }
      paletteRgb = utils.shuffleArray(paletteRgb);
      for (let i = 0; i < paletteSize; i += 1) {
        paletteHex.push(colorMath.rgbObject2hex(paletteRgb[i]));
      }
    } else {
      uniqDataHex = utils.shuffleArray(uniqDataHex);
      paletteHex = uniqDataHex.slice(0, paletteSize);
    }
    return paletteHex;
  },
*/


  /* Typical values:
   * paletteSize = 5;
   * candidateSize = 10
   */
  fromHoneycomb(pix, paletteSize, candidateSize) {
    if (paletteSize > candidateSize) {
      /* This shoundn't happen. But if it does, we correct it here */
      candidateSize = paletteSize * 2;
    }
    let colors = {};
    // Loop over each pixel
    for (let i = 0, n = pix.length; i < n; i += 8) {
      // i+3 is alpha (the fourth element)
      const hexComb = colorMath.rgb2Comb(pix[i], pix[i + 1], pix[i + 2]);
      if (typeof colors[`${hexComb}`] === 'undefined') {
        colors[`${hexComb}`] = 0;
      }
      colors[`${hexComb}`] += 1;
    }

    // sorted by volume
    colors = Object.keys(colors).sort((a, b) => colors[b] - colors[a]);
    let paletteRgb = [];
    for (const i in colors) {
      const rgbData = colorMath.hex2rgbObject(colors[i]);
      if (this.colorIsGray(rgbData) === false) {
        if (this.colorDistanceIsClose(rgbData, paletteRgb) === false) {
          paletteRgb.push(rgbData);
          if (paletteRgb.length === candidateSize) break;
        }
      }
    }

    /* If there is not enough colors, we lower the filter and redo it */
    if (paletteRgb.length < paletteSize) {
      paletteRgb = [];
      for (const i in colors) {
        const rgbData = colorMath.hex2rgbObject(colors[i]);
        if (this.colorDistanceIsClose(rgbData, paletteRgb, 5000) === false) {
          paletteRgb.push(rgbData);
          if (paletteRgb.length === candidateSize) break;
        }
      }
    }

    /* If there is not enough colors, we lower the filter and redo it */
    if (paletteRgb.length < paletteSize) {
      paletteRgb = [];
      for (const i in colors) {
        const rgbData = colorMath.hex2rgbObject(colors[i]);
        paletteRgb.push(rgbData);
        if (paletteRgb.length === candidateSize) break;
      }
    }

    paletteRgb = utils.shuffleArray(paletteRgb);
    const paletteHex = [];
    for (let i = 0; i < paletteSize; i += 1) {
      if (i < paletteRgb.length) {
        paletteHex.push(colorMath.rgbObject2hex(paletteRgb[i]));
      }
      else {
        paletteHex.push(colorMath.rgbObject2hex(paletteRgb[i % paletteRgb.length]));
      }
    }
    return paletteHex;
  },
};

export default buildPalette;
