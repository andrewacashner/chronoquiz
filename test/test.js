export default showColorSpectrum;

/** 
 * Create spectrum showing colors at each index
 * @param {array} spectrum - array of RgbColorMix instances
 * @returns {element} Div DOM element containing spans for each color
 */
function showColorSpectrum(spectrum) {
  let tree = document.createElement("div");
  for (let i = 0; i < spectrum.length; ++i) {
    let span = document.createElement("span");
    span.textContent = `${i}|`;
    Color.setCssColor(span, spectrum[i]);
    tree.appendChild(span);
  }
  return tree;
}
//}}}1
