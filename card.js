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

    if (date instanceof Date) {
      this.date = date;
    } else {
      this.date = new Date();
      this.date.setFullYear(date);
    }
this.info = info;
    this.img = img;
    this.color = color;
  }
  
  // PRIVATE METHODS
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
   * Procedure: Add the element to display the description information to the
   * HTML card we are making.  
   * @param {element} cardNode -- HTML DOM object for a div.card
   */
  #addHtmlInfo(cardNode) {
    let infoNode = document.createElement("span");
    infoNode.className = "info";
    infoNode.textContent = this.info;
    cardNode.appendChild(infoNode);
  }
  
  /**
   * Procedure: If there is an img field, add the element for the image to the
   * HTML card we are making.
   * @param {element} cardNode -- HTML DOM object for a div.card
   */
  #addHtmlImg(cardNode) {
    if (this.img) {
      let imageNode = document.createElement("img");
      imageNode.src = this.img;
      cardNode.appendChild(imageNode);
    }
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
    this.#addHtmlInfo(card);

    if (this.isClue) {
      this.#makeDraggable(card);
    } else {
      Color.setCssColor(card, this.color);
    }

    return card;
  }
}

