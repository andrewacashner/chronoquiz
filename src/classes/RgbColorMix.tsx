/**
 * Colors: This class holds the information for one color: red, green, blue
 * values plus a percentage of white to mix in.
 */
export default class RgbColorMix {
  red: number;          // integer 0 <= n < 256
  green: number;        // integer 0 <= n < 256
  blue: number;         // integer 0 <= n < 256
  percentWhite: number; // integer percentage of white to mix in (50 = * 50%)

  constructor(r: number, g: number, b: number, w: number) {
    this.red = r;
    this.green = g;
    this.blue = b;
    this.percentWhite = w; // as decimal, 0.5 not 50%
  }

  // Create CSS color (color-mix with rgb color)
  // Returns: CSS color-mix expression
  get css(): string {
    let rgb = `rgb(${this.red}, ${this.green}, ${this.blue})`;
    return `color-mix(in srgb, ${rgb}, ${this.percentWhite}% white)`;
  }

  /**
   * List of all colors available in range.
   * For each of red, blue, and green, iterate through values of primary with
   * constant secondary and white values (tertiary color is zero).
   */
  static colorSpectrum(
    max: number = 256, // Highest color value possible for each (RGB)
    min: number = 0,   // Used for secondary color, 
                       //    fixed value mixed in to each primary 
    white: number = 50 // Percent white to mix in, fixed for all 
  ): Array<RgbColorMix> {
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

  static get SPECTRUM() { return RgbColorMix.colorSpectrum(); }
  static get VIOLET() { return RgbColorMix.SPECTRUM.at(-1); }

  /**
   * Get the CSS color string for a card at a given index, dividing the
   * spectrum evenly by the total number of cards
   * Returns CSS color string
   */
  static colorAtIndex(
    index: number,  // integer index of this card in array
    length: number, // integer length of the array
    spectrum: Array<RgbColorMix>
  ): string {
    let color;
    if (length === 1) {
      color = RgbColorMix.VIOLET;
    } else {
      let interval = Math.floor(spectrum.length / length);
      color = spectrum[index * interval];
    }
    return color;
  }
}

