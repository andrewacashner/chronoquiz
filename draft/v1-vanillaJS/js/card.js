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

  /** @type {Date} */
  date;

  /** @type {string} */
  info;

  /** @type {string} */
  img;

  /** @type {string} */
  color;

  /** @type (boolean} */
  #safe;

  /** Each card gets the given info and a random unique identifier.
   * @param {boolean} isClue - is this a clue (true) or an answer (false)?
   * @param {number} year - Four-digit Year of event 
   *      (NB - We currently use years only)
   * @param {string} info - Brief description of event 
   * @param {string} img - URL of image (on web, not local)
   * @param {string} color - CSS color to be used in timeline
   */
  constructor({isClue = true, date, info, img, color}) {
    this.isClue = isClue;
    this.id = crypto.randomUUID();
    this.dateString = date;
    this.info = info;
    this.img = img;
    this.color = color;
    this.#safe = false; // Has this card been sanitized?
  }

  #markSafe() {
    this.#safe = true;
  }

  get isSafe() {
    return this.#safe;
  }

  /** Create a new card with sanitized input.
   *
   * - The date must be an integer string <= the current year (including
   *   negative numbers).
   * - The info is converted to plain text using textContent.
   * - The image, if present, is downloaded and cached.
   *
   * The parameters are the same as for new Card().
   *
   * @param {boolean} isClue 
   * @param {number} year 
   * @param {string} info 
   * @param {string} img 
   * @param {string} color 
   * @returns {Card} - Card with validated content (with safe property set to
   * true), or null if the input was invalid
   */
  static async newSafeCard({isClue, date, info, img, color}) {
    try {
      let cleanDate = Card.#sanitizeDate(date);
      let cleanInfo = Card.#sanitizeInfo(info);
      let cleanImg = await Card.#sanitizeImg(img).catch(e => console.error(e));

      // The date is the only dealbreaker. We just skip a bad image link.
      if (cleanDate) {
        let card = new Card({
          isClue: isClue, 
          date: cleanDate, 
          info: cleanInfo, 
          img: cleanImg, 
          color: color});
        card.#markSafe();
        return card;
      } else {
        throw `Could not sanitize card input with date '${date}', info '${info}'`;
        return null;
      }
    } catch(e) {
      console.error(e);
    }
  }

  // PRIVATE METHODS
  // Sanitize input 
  static #sanitizeDate(raw) {
    try {
      let numTest = Number(raw);
      if (!isNaN(numTest) 
        && Number.isInteger(numTest) 
        && numTest <= new Date().getFullYear()) {

        let date = new Date();
        date.setFullYear(numTest);
        return date;
      } else {
        throw `Bad date input ${raw}`;
        return null;
      }
    } catch(e) { 
      console.error(e);
    }
  }

  static #sanitizeInfo(raw) {
    let node = document.createElement("span");
    node.textContent = raw;
    return node.textContent;
  }

  static async #sanitizeImg(url) {
    function getImageIfExists(url) { 
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = url;
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
      });
    }
    if (!url) {
      return null;
    } else {
      let imgTest = await getImageIfExists(url).catch(e => console.log(err));
      if (imgTest === true) {
        return url;
      } else {
        throw `Image not found at url '${url}'`;
        return null;
      }
    } 
  }



  /**
   * Procedure: Add the element to display the date to the HTML card we are
   * making. In the date field, just show "Clue" if this is a clue.
   * @param {element} cardNode -- HTML DOM object for a div.card
   */
  #addHtmlDate(cardNode) {
    let dateNode = document.createElement("span");
    dateNode.className = "date";
    dateNode.textContent = this.#dateToString();
    cardNode.appendChild(dateNode);
  }

  #addHtmlImg(cardNode) {
    if (this.img) {
      let imgNode = new Image();
      imgNode.src = this.img;
      cardNode.appendChild(imgNode);
    }
  }

  #addHtmlInfo(cardNode) {
    let infoNode = document.createElement("span");
    infoNode.className = "info";
    infoNode.textContent = this.info;
    cardNode.appendChild(infoNode);
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
    this.#addHtmlImg(card);
    this.#addHtmlInfo(card)

    if (this.isClue) {
      this.#makeDraggable(card);
    } else {
      Color.setCssColor(card, this.color);
    }

    return card;
  }
}

