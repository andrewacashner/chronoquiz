/**
 * @filedescription Card module for Timeline Game
 * @author Andrew A. Cashner
 * @copyright Copyright © 2024 Andrew A. Cashner
 * @version 0.1.1
 */

import * as Color from "./colors.js";

/**
 * We use this class to store information on the historical events used as
 * clues and inserted into the timeline, and to generate the HTML node for a
 * card (div.card). The HTML differs for clues vs. answers (clue shows "CLUE"
 * as its date and is a draggable object; answer shows the real date and is
 * not draggable).
 */
export default class Card {

  /** @type {boolean} */
  isClue;

  /** @type {number} */
  date;

  /** @type {string} */
  info;

  /** @type {string} */
  img;

  /** @type {string} */
  color;

  /** Each card gets the given info and a random unique identifier.
   * @param {boolean} isClue - is this a clue (true) or an answer (false)?
   * @param {number} year - Four-digit Year of event 
   *      (NB - We currently use years only)
   * @param {string} info - Brief description of event 
   * @param {string} img - URL of image (on web, not local)
   * @param {string} color - CSS color to be used in timeline
   */
  constructor({isClue = true, date = new Date(), info, img, color}) {
    this.isClue = isClue;
    this.id = crypto.randomUUID();
    this.date = date;
    this.info = info;
    this.img = img;
    this.color = color;
    this.safe = false; // Has this card been sanitized?
  }

  // POST-INITIALIZATION VALIDATION
  /** Sanitize a card so that the input is valid. Return the cleaned card or
   * null if there was a problem cleaning it.
   *
   * - The date must be either a Date object or an integer string <= the
   *   current year (including negative numbers).
   * - The info is converted to plain text using textContent.
   * - The image, if present, is downloaded and cached.
   *
   * @param {Card} - Unsanitized card
   * @returns {Card} - Card with validated content (with safe property set to
   * true), or null if the input was invalid
   */
  static async sanitize(card) {
    try {
      let cleanDate = card.#sanitizeDate(card.date);
      if (cleanDate) {
        card.date = cleanDate;
        card.info = card.#sanitizeInfo(card.info);
        card.img = await card.#sanitizeImg(card.img)
          .catch((e) => console.error(e));
        card.safe = true;
        return card;
      } 
    } catch(e) {
      console.error(e);
      return null;
    }
  }

  // PRIVATE METHODS
  // Sanitize input 
  #sanitizeDate(raw) {
    let date;
    try {
      if (raw instanceof Date) {
        date = raw;
      } else {
        let numTest = Number(raw);
        if (!isNaN(numTest) 
          && Number.isInteger(numTest) 
          && numTest <= new Date().getFullYear()) {

          date = new Date();
          date.setFullYear(numTest);
        } else throw `Bad date input ${raw}`;
      }
    } catch(e) { 
      console.error(e);
    }
    return date;
  }

  #sanitizeInfo(raw) {
    let node = document.createElement("span");
    node.className = "info";
    node.textContent = raw;
    return node;
  }

  async #sanitizeImg(input) {
    function getImageIfExists(url) { 
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = url;
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
      });
    }
    if (!input) {
      return null;
    } else {
      let img = await getImageIfExists(input).catch(e => console.log(err));
      if (!img) throw `Image not found at url '${input}'`;
      return img;
    } 
  }



  /**
   * Procedure: Add the element to display the date to the HTML card we are
   * making. In the date field, just show "Clue" if this is a clue.
   * @param {element} cardNode -- HTML DOM object for a div.card
   * @param {symbol} mode -- 'answer' or 'clue' 
   */
  #addHtmlDate(cardNode, text) {
    let dateNode = document.createElement("span");
    dateNode.className = "date";
    dateNode.textContent = this.#dateToString();
    cardNode.appendChild(dateNode);
  }

  /**
   * Return the year if positive or year BC if negative. (Deals with the year
   * only.) 
   *
   * Technically BC should be offset by one year but we told users to use
   * negative numbers as years BC.
   *
   * @returns {string} - Formatted string for year, with BC if the year was
   * negative
   */
  #dateToString() { 
    if (this.isClue) {
      return "Clue";
    } else {
      let yearZero = new Date();
      yearZero.setFullYear(0);

      let displayYear = this.year;
      if (this.date < yearZero) {
        displayYear = `${-displayYear} bce`; 
      } 
      return displayYear;
    }
  }
  
  /** 
   * Procedure: Set card node as a draggable object, not a drop target.
   * @param {element} el - a Card DOM Element (div.card)
   */
  #makeDraggable(el) {
    el.setAttribute("draggable", "true");
    el.addEventListener("dragstart", this.#dragstartHandler);
  }
  
  /**
   * Procedure: When a card is dragged, transfer its id and allow it to be
   * moved.
   * @param {event} event
   */
  #dragstartHandler(event) {
    event.dataTransfer.setData("id", event.target.id);
    event.dataTransfer.effectAllowed = "move";
  }
  // PUBLIC METHODS

  /** Return the date as YYYY year string.
   * @returns {string}
   */
  get year() { return this.date.getFullYear(); }
 
  set year(YYYY) { 
    if (YYYY) {
      this.date.setFullYear(YYYY); 
    } 
  }

  /**
   * Create HTML div.card node
   * @returns {element} - div.card DOM element
   */
  toHtml() {
    let card = document.createElement("div");
    card.className = "card";
    card.id = this.id;
    card.setAttribute("data-when", this.year);

    // CSS will use this to make it impossible to select card contents
    // accidentally
    card.setAttribute("data-noselect", "noselect");

    this.#addHtmlDate(card);
    if (this.img) {
      card.appendChild(this.img);
    }
    card.appendChild(this.info);

    if (this.isClue) {
      this.#makeDraggable(card);
    } else {
      Color.setCssColor(card, this.color);
    }

    return card;
  }
}

