/**
 * @filedescription FactList module for Timeline Game
 * @author Andrew A. Cashner
 * @copyright Copyright © 2024 Andrew A. Cashner
 * @version 0.1.1
 */

import * as Color from "./colors.js";

/**
 * An array of Card instances representing a list of facts (date + info) for
 * the timeline. Check the cards for safety first; if an unsafe card is found,
 * return an empty array.
 * @extends Array
 */
export default class FactList extends Array {
  constructor(...cards) {
    try {
      if (cards.every(c => c.isSafe)) {
        super(...cards);
      } else throw "Cannot create a FactList with unsafe Cards";
    } catch(e) {
      console.error(e);
      return [];
    }
  }

  // PRIVATE METHODS
  /**
   * Procedure: Sort the array by the date field, ascending.
   */
  #sortByDate() {
    this.sort((c1, c2) => { return c1.date - c2.date });
  }
  
  /**
   * Procedure: Set the colors of the cards in this list, in chronological
   * order, to evenly spaced intervals along the spectrum.
   */
  #setColors() {
    this.#sortByDate();
    let spectrum = Color.colorSpectrum();
    this.forEach((card, index) => {
      this[index].color = Color.colorAtIndex(index, this.length, spectrum);
    });
  }

  /**
   * Procedure: Shuffle the array, using the Fisher-Yates/Knuth shuffle
   * (`https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle`)
   */
  #shuffle() {
    /**
     * Return a random integer up to the given max.
     * @param {number} max 
     * @returns {number}
     */
    function randomInt(max) {
      return Math.floor(Math.random() * max);
    } 

    for (let i = this.length - 1; i > 0; --i) {
      let j = randomInt(i);
      [this[i], this[j]] = [this[j], this[i]];
    }
  }

  // PUBLIC METHODS

  /** Procedure: Set up a FactList as clues: set colors and shuffle. */
  setupClues() {
    this.#setColors();
    this.#shuffle();
  }

  /**
   * Return the last item of the array.
   * @returns {Card}
   */
  last() {
    return this.at(-1);
  }

  /**
   * Procedure: Add event to array and then resort by date.
   */
  addFact(card) {
    this.push(card);
    this.#sortByDate();
  }
}

