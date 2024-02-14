/**
 * @filedescription Colors module for Timeline Game
 * @author Andrew A. Cashner
 * @copyright Copyright © 2024 Andrew A. Cashner
 * @version 0.1.1
 */

/**
 * Colors: This class holds the information for one color: red, green, blue
 * values plus a percentage of white to mix in.
  */
class RgbColorMix {
  red;          /** @type {number} **/
  green;        /** @type {number} **/
  blue;         /** @type {number} **/
  percentWhite; /** @type {number} **/
  
  /**
   * @param {number} r - red, integer 0 <= n < 256
   * @param {number} g - green, integer 0 <= n < 256
   * @param {number} b - blue, integer 0 <= n < 256
   * @param {number} percentWhite - integer percentage of white to mix in 
   *      (50 = * 50%)
   */
  constructor(r, g, b, w) {
    this.red = r;
    this.green = g;
    this.blue = b;
    this.percentWhite = w; // as decimal, 0.5 not 50%
  }

  /**
   * Create CSS color (color-mix with rgb color)
   * @returns {string} CSS color-mix expression
   */
  toCss() {
    let rgb = `rgb(${this.red}, ${this.green}, ${this.blue})`;
    return `color-mix(in srgb, ${rgb}, ${this.percentWhite}% white)`;
  }
}

/**
 * List of all colors available in range.
 * For each of red, blue, and green, iterate through values of primary with
 * constant secondary and white values (tertiary color is zero).
 *
 * @param {number} max - Highest color value possible for each 
 *      (red, green, blue)
 * @param {number} min - Used for secondary color, 
 *      fixed value mixed in to each primary
 * @param {number} white - Percent white to mix in, fixed for all
 * @returns {array} array of RgbColorMix instances
 */
function colorSpectrum(max = 256, min = 0, white = 50) {
  let reds = [];
  let blues = [];
  let greens = []

  // Increase red value relative to others to go red -> orange
  for (let i = 0; i < max; ++i) {
    reds.push([max, i, min, white]);
  }

  // *Decrease* green and blue value relative to others to continue in
  // spectrum order 
  for (let i = max - 1; i >= 0; --i) {
    greens.push([i, max, min, white]);
    blues.push([min, i, max, white]);
  }

  // Combine the spectrums and create a color instance for each
  let perms = [...reds, ...greens, ...blues];
  let colors = perms.map((p) => new RgbColorMix(...p));
  return colors;
}


/**
 * Get the CSS color string for a card at a given index, dividing the
 * spectrum evenly by the total number of cards
 * @param {number} index - integer index of this card in array
 * @param {length} index - integer length of the array
 * @returns {string} - CSS color
 */
function colorAtIndex(index, length, spectrum) {
  let color;
  if (length === 1) {
    color = violet;
  } else {
    let interval = Math.floor(spectrum.length / length);
    color = spectrum[index * interval];
  }
  return color;
}

/**
 * Procedure: Set an element's inline style to the given RgbColorMix.
 * @param {element} el - DOM element
 * @param {RgbColorMix} color
 */
function setCssColor(el, color) {
  el.style.backgroundColor = color.toCss();
}

export { colorSpectrum, colorAtIndex, setCssColor };
