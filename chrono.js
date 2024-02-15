//{{{1 DESCRIPTION
// vim: set foldmethod=marker:
//
/** 
 * @filedescription Timeline Game
 * @author Andrew A. Cashner
 * @copyright Copyright © 2024 Andrew A. Cashner
 * @version 0.1.1
 *
 * See README.md and about.html.
 *
 * The game state consists of the score, a list of clues, and a list of
 * answers that is the timeline.  Given an input file in JSON format (either
 * local or supplied by the user), we construct a deck of clues as a FactList
 * instance, which contains an array of fact Card instances.  The clue deck
 * shows the current clue and the stubs of the remaining clues.  We shuffle
 * the clue deck once at the beginning and display the timeline with the "Now"
 * card.
 *
 * At each turn, we update the DOM to display the current clue (last card in
 * the clue deck).  The user selects the place to insert the clue by dragging
 * the clue card onto the timeline.  While they are dragging, we update the
 * display to highlight where they can drop the card.  When they drop the
 * card, the dropHandler function evaluates their guess and updates the game's
 * state accordingly.
 *
 * If the guess is correct, we remove the current clue from the list of clues
 * and add it to the list of answers.  We sort the answers chronologically,
 * then update the timeline display with the new card included.  We increment
 * and redisplay the score.  If at this point there are no more clues, we
 * display a game over message with the final score.  Otherwise we update the
 * clue display to show the next clue and delete one of the stubs.
 *
 * If the guess is incorrect we flash the color of the current guess card and
 * then decrement (only to zero) and redisplay the score.
 *
 * When we create the clue deck, before shuffling to start play, we sort it
 * chronologically and assign each card a color so that they are spread at
 * equal intervals across the spectrum (defined as a constant array of 768
 * color shades). The clue cards are displayed with a default color, but when
 * the user moves a card to the timeline, it is given the color we assigned at
 * the start. (We use colors mixed with white for a more muted effect.)
 *
 * We have avoided global state and instead pass the game state (a Game
 * instance) only to the functions that need it.  The game state only changes
 * when a card is dropped.  The drop handler function is added only when we
 * generate a DOM element from a card (Card.toHtml()), so we pass the state to
 * that function, which includes the state in its call to dropHandler().
 *
 * In the documentation I preface the decription with "Procedure" for all
 * functions that mutate their arguments and are used only for side effects,
 * not their return value.
 */
"use strict";
//}}}1
//{{{1 IMPORTS
/** We use the Color module to create a spectrum of colors and assign them to
 * the timeline cards. */
import * as Color from "./js/colors.js";

/** The Card module provides the Card class that we use for clue and timeline
 * card data. */
import Card from "./js/card.js";

/** The FactList module provides the FactList class, which is our Array of
 * Card instances. */
import FactList from "./js/factlist.js";
//}}}1
//{{{1 GAME CLASS
/**
 * This class holds the game's state: the list of clues, list of answers
 * ("timeline"), and the score.
  */
class Game {
  /** @type FactList */
  clues;    

  /** @type FactList */
  timeline; 

  /** @type number */
  score;    

  /**
   * @param {FactList} clues - Custom array class with clue Card instances;
   *    shuffled on creation
   * @param {FactList} timeline - Custom array class with answer Cards
   * @param {number} score
   */
  constructor(clues, timeline, score) {
    this.clues = clues;
    this.timeline = timeline;
    this.score = score;
  }

  // PRIVATE METHODS
  /** Procedure: Remove last item of clue list and add it to timeline list.
   * (Note: The timeline list will then shuffle itself in chronological
   * order.)
   */
  #moveCurrentClueToTimeline() {
    let answer = this.clues.pop();
    answer.isClue = false;
    this.timeline.addFact(answer);
  }

  // PUBLIC METHODS
  /** Procedure: Add one to score */
  incrementScore() {
    ++this.score;
  }

  /** Procedure: Subtract one from score; don't go below zero */
  decrementScore() {
    this.score  = Math.max(0, this.score - 1);
  }

  /** Procedure: Check for end of game, otherwise pull up the next clue. */
  nextClue() {
    this.#moveCurrentClueToTimeline();
    if (this.clues.length > 0) {
      updateClues(this);
    } else {
      displayGameOver(this.score);
    }
  }

  /** Create a span.score DOM element with the current score.
   * @returns {element} - span.score 
   */
  scoreToHtml() {
    let scoreNode = document.createElement("span");
    scoreNode.className = "score";
    scoreNode.textContent = this.score;
    return scoreNode;
  }

  /** Create a div.timeline DOM element with the current answer list.
   * @returns {element} - div.timeline
   */
  timelineToHtml() {
    let timelineNode = document.createElement("div");
    timelineNode.className = "timeline";

    this.timeline.forEach((fact) => 
      timelineNode.appendChild(fact.toHtml()));

    return timelineNode;
  }

  /** Create a div.clue DOM element with the current clue list.
   * @returns {element} div.clue
   */
  cluesToHtml() {
    /**
     * Procedure: Remove all children of a node.
     * @param {element} node - parent node
       */
    function removeChildren(node) {
      let child = node.lastChild;
      while (child) {
        node.removeChild(child);
        child = node.lastChild;
      }
    }

    /**
     * Procedure: Fill the clue deck with stubs for the remaining clues.
     * @param {number} n - Number of clues
     */
    function fillDeck(deck, n) {
      console.log(`Filling deck with ${n} cards`);
      removeChildren(deck);

      for (let i = 0; i < n - 1; ++i) {
        let card = document.createElement("div");
        card.className = "cardStub";
        deck.appendChild(card);
      }
    }

    let deckNode = document.createElement("div");
    deckNode.className = "clue";

    fillDeck(deckNode, this.clues.length);

    if (this.clues.length > 0) {
      let currentClue = this.clues.last();
      let clueNode = currentClue.toHtml();
      deckNode.appendChild(clueNode);
    }
    return deckNode;
  }
}
//}}}1
//{{{1 DRAG AND DROP HANDLER FUNCTIONS
/** 
 * Procedure: Set node as a drop target. 
 *
 * IMPORTANT: We pass the game state to the drop handler function so that the
 * game can update when the card is dropped.
 * @param {element} el - a Card DOM Element (div.card)
 */
function makeDropTarget(el, state) {
  el.addEventListener("drop", (e) => dropHandler(state, event));
  el.addEventListener("dragover", dragoverHandler);
  el.addEventListener("dragleave", dragleaveHandler);
}

// Functions to shift timeline cards over when user drags the clue over them,
// and shift them back when the user leaves the area

/** CSS value for card's normal left margin when shifted right */
const CARD_LEFT_MARGIN_DEFAULT = "var(--card-margin)";

const CARD_LEFT_MARGIN_EXTRA = `calc(5 * ${CARD_LEFT_MARGIN_DEFAULT})`;

/**
 * Procedure: Set the given card's left margin to the given value.
 * @param {element} cardNode - div.card DOM element (not Card instance)
 * @param {string} val - CSS width string
 */
function setCardLeftMargin(cardNode, val) {
  cardNode.style.marginLeft = val;
}

/**
 * Procedure: Shift a card to the right (when user is dragging over it)
 * @param {element} cardNode - div.card DOM element in timeline
 */
function insertTimelineGap(cardNode) {
  setCardLeftMargin(cardNode, CARD_LEFT_MARGIN_EXTRA);
}

/**
 * Procedure: Shift a card back to its normal space (when user is done
 * dragging over it)
 * @param {element} cardNode - div.card DOM element in timeline
 */
function removeTimelineGap(cardNode) {
  setCardLeftMargin(cardNode, CARD_LEFT_MARGIN_DEFAULT);
}

// Functions to test the clue card's location when dragged

/** Get the center point between two coordinates.
 * @param {number} a - smaller coordinate (left edge) 
 * @param {number} b - larger coordinate (right edge)
 * @returns {number}
 */
function midpoint(a, b) {
  return (b - a) / 2 + a;
}

/**
 * Is the element a div.card DOM element?
 * @param {element} el 
 * @returns {boolean}
 */
function isCard(el) {
  return el.className === "card";
}

/** 
 * Return a card element, if found at given coordinates; or null. 
 * @param {number} x - horizontal coordinate
 * @param {number} y - vertical coordinate
 * @returns {element} - DOM div.card element at (x,y), if there is one
 */
function cardAtCoord(x, y) {
  let el = document.elementFromPoint(x, y);
  return isCard(el) ? el : null;
}

/**
 * Procedure: Allow to move by dragging. Insert gap to the left of a card when
 * the drag point is in range to guess this card.
 * @param {event} event
 */
function dragoverHandler(event) {
  event.preventDefault();

  let bounds = event.target.getBoundingClientRect();
  let center = midpoint(bounds.left, bounds.right);

  if (event.clientX <= center) {
    console.log("In range");
    let cardUnderDrag = cardAtCoord(event.clientX, event.clientY);
    if (cardUnderDrag) {
      insertTimelineGap(cardUnderDrag);
    }
  }
  event.dataTransfer.effectAllowed = "move";
}

/**
 * Procedure: Shift cards back in place when the drag point leaves the target.
 * @param {event} event
 */
function dragleaveHandler(event) {
  console.log("Dragged card leaving target");
  let el = event.target;
  if (isCard(el)) {
    removeTimelineGap(el);
  }
}

/**
 * Given an event (from a drop), start from its coordinates and search
 * to the right until a card element is found. The card must be dropped to
 * left of the midpoint of the card.
 * Return the answer card or null.
 * @param {event} event 
 * @returns {element} div.card element or null
 */
function findFirstCardToRight(event) {
  console.log(`Card dropped with pointer at (${event.clientX}, ${event.clientY})`);

  // Search along the timeline bar regardless of where the drop was vertically
  let timelineBar = document.querySelector("div.scrollingTimeline hr");
  let y = timelineBar.getBoundingClientRect().top;

  console.log("Looking for nearest card to timeline drop point");
  let max = document.documentElement.clientWidth; 

  let card = null;
  for (let x = event.clientX; x < max; ++x) {
    card = cardAtCoord(x, y);
    if (card) {
      let bounds = card.getBoundingClientRect();
      let center = midpoint(bounds.left, bounds.right);
      if (x <= center) break;
    }
  }

  return card;
}

/** 
 * Procedure: Wait the given time.
 * @param {number} ms - milliseconds
 * @returns {Promise}
 */
function sleep(ms) {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms)
  });
}

/**
 * Procedure: Quickly toggle the given element's alert state on and off twice.
 * @param {element} el - DOM Element
 */
async function flashAlert(el) {
  let duration = 100;
  for (let i = 0; i < 2; ++i) {
    el.setAttribute("data-alert", "alert");
    await sleep(duration);
    el.removeAttribute("data-alert");
    await sleep(duration);
  }
}

/**
 * Procedure: Change the class of the element with the given ID to "hide".
 * @param {string} id - Element id attribute
 */
function hideElementById(id) {
  let el = document.getElementById(id);
  el.className = "hide";
}

/**
 * Procedure: Change the class of the element with the given ID to "show".
 * @param {string} id - Element id attribute
 */
function showElementById(id) {
  let el = document.getElementById(id);
  el.className = "show";
}

/**
 * Procedure: Hide the input form controls and show the score panel instead
 * (at the start of the game).
 */
function hideInput() {
  hideElementById("inputForm");
  hideElementById("file");
  showElementById("score");
}

//}}}1
//{{{1 FUNCTIONS TO UPDATE HTML DOM BASED ON GAME STATE
//{{{2 Update page elements
/** 
 * Procedure: Replace an element found by selector with the given element.
 * @param {string} selector - HTML selector string passed to querySelector
 * @param {element} el- DOM element
 */
function replaceElement(selector, el) {
  let current = document.querySelector(selector);
  current.replaceWith(el);
}

/**
 * Procedure: Reset the width of the div holding the timeline
 * (div.timelineBar) to the width of the current timeline.
 */
function updateTimelineWidth(state) {
  let width = `calc(${state.timeline.length} * (var(--card-width) + var(--card-margin)) + 4 * ${CARD_LEFT_MARGIN_EXTRA})`;
  let timelineBar = document.querySelector("div.timelineBar");
  timelineBar.style.width = width;

  let timelineRule = document.querySelector("hr");
  let windowWidth = document.documentElement.clientWidth;
  if (width > windowWidth) {
    timelineRule.style.width = width;
  } 
}

/**
 * Procedure: Update the current timeline and score (replace those HTML
 * elements with new ones according to the game state).
 * @param {Game} state
 */
function updateDisplay(state) {
  updateTimelineWidth(state);
  replaceElement("div.timeline", state.timelineToHtml());
  replaceElement("span.score", state.scoreToHtml());
}

/**
 * Procedure: Replace the current div.clue element with a new one showing the
 * current clue deck (clue stubs + current clue card).
 * @param {Game} state
 */
function updateClues(state) {
  replaceElement("div.clue", state.cluesToHtml());
}

/**
 * Procedure: Update the page with a "Game Over" message including the final
 * score.
 * @param {number} score
 */
function displayGameOver(score) {
  console.log("Game over");
  let deck = document.querySelector("div.clue");
  let pointWord = (score !== 1) ? "points" : "point";

  deck.innerHTML = 
`<div class="gameover">
   <p>Game over!</p>
   <p>Final score: ${score} ${pointWord}</p>
</div>`;
}
//}}}2
//{{{2 Central function: Drop handler
// When a card is dropped, process the guess and update the game's state and
// display accordingly.

/**
 * Procedure: When the user drops a card onto a timeline card, 
 * find the closest card, test if the date on the clue is between that card
 * and its previous neighbor (if there is one); if so insert the card and
 * increment the score; if not, do not insert the card and decrement the
 * score.
 * @param {Game} state
 * @param {event} event
 */
function dropHandler(state, event) {
  /**
   * Is the given clue between a given answer card and the one before it?
   * @param {element} clue - card node
   * @param {element} guess - card node where clue was dropped
   * @param {element} preGuess - previousSibling to guess (could be null)
   * @returns {boolean}
   */
  function isClueBetweenDates(clue, guess, preGuess) {
    let clueDate = clue.dataset.when;
    let guessDate = guess.dataset.when;
    let isBeforeGuess = clueDate <= guessDate;

    let noPreGuess = !preGuess;
    let isAfterPreGuess = preGuess && (clueDate >= preGuess.dataset.when);
    let isAfterAnyPreGuess = noPreGuess || isAfterPreGuess;

    return isBeforeGuess && isAfterAnyPreGuess;
  }

  event.preventDefault();

  // Find nearest answer (first card found to right of click) to compare
  let clue = document.getElementById(event.dataTransfer.getData("id"));
  let guess = findFirstCardToRight(event);

  if (guess) {
    let beforeGuess = guess.previousElementSibling;

    if (isClueBetweenDates(clue, guess, beforeGuess)) {
      console.log("Correct: ++Score");

      state.incrementScore();
      state.nextClue();
      updateDisplay(state);
    } else {
      console.log("Incorrect, --Score");
      flashAlert(clue);

      state.decrementScore();
      updateDisplay(state);
    }
  } else {
    console.log("No card found at drop location");
  }
}
//}}}2
//}}}1
//{{{1 FUNCTIONS TO HANDLE GAME SETUP, USER INPUT

/**
 * Procedure: Reset data and reload the page.
 */
function restart() {
  console.log("Restart");
  let input = document.getElementById("fileInput");
  input.files = null;

  let form = document.getElementById("inputForm");
  form.reset();

  location.reload();
}

/** 
 * Get the URL of a user-uploaded file.
 * @param {element} input - DOM input[type='file'] element
 * @returns {string}
 */
function userUploadUrl(input) {
  let infile = input.files[0];
  let url = URL.createObjectURL(infile);
  return url;
}

/**
 * Check the JSON input for validity.
 * @param {array} json - Input to test, hopefully an array
 * @returns {boolean}
 */
function isInputValid(json) {
  return typeof json !== undefined
    && Array.isArray(json) 
    && json.length > 0 
    && json.every(fact => ("date" in fact) && ("info" in fact));
}

/**
 * Make a Card array from JSON input.
 * As checked by isInputValid, json should be an array of objects with date,
 * info and optional img properties.
 * Check and sanitize each field before using the sanitized data to create new
 * Card instances.
 *
 * @param {array} json
 * @returns {array} Array of Card instances
 */
async function cardArrayFromJson(json) {
  let cards = [];
  for (let entry of json) {
    try {
      let validCard = await Card.sanitize(new Card(entry));
      if (validCard && validCard.safe) {
        cards.push(validCard);
      } else throw `Faulty card input {date: ${entry.date}, info: ${entry.info}}; skipping`;
    } catch(e) {
      console.error(e);
    }
  }
  return cards;
}

/**
 * Load a JSON timeline from a given URL and if valid, return an array of Card
 * instances; otherwise an empty array.
 * @param {string} URL
 * @returns {array} Array of timeline facts (or empty)
 */
async function loadTimeline(url) {
  let response = await fetch(url).catch((err) => {
    console.error(err);
    return [];
  });

  let data = await response.json().catch((err) => {
    console.error(err);
    return [];
  });

  let cards = null;
  if (isInputValid(data)) {
    cards = await cardArrayFromJson(data).catch((e) => console.error(e));
  } 
  return cards;
}

/** URL of image to use on the "Now" card (used in first setup) */
const NOW_IMAGE_URL = "https://images.pexels.com/photos/17139860/pexels-photo-17139860/free-photo-of-hourglass-with-sand.jpeg";

/**
 * Procedure: Initialize game. Given the URL of a JSON input, process the
 * input and set up a new game state.
 * @param {string} url - Source of JSON timeline (array of objects with date,
 * info, and img properties)
 */
async function playGame(url) {
  hideInput();
  let cards = await loadTimeline(url).catch((err) => {
    console.error(err);
    return null;
  });

  try {
    if (cards) {
      let clues = new FactList(...cards);
      clues.setupClues();

      let violet = Color.colorSpectrum().at(-1);
      let now = await Card.sanitize(new Card({
        isClue: false, 
        info: "Now", 
        img: NOW_IMAGE_URL, 
        color: violet
      }));
      if (!now || !now.safe) throw "Problem creating first card";

      let timeline = new FactList(now);

      let state = new Game(clues, timeline, 0);

      let timelineArea = document.querySelector("div.scrollingTimeline");
      makeDropTarget(timelineArea, state);

      updateClues(state);
      updateDisplay(state);
    } else throw `Invalid timeline input from ${url}`;
  } catch(e) {
    console.error(e);
    alert("Invalid timeline input");
    restart();
  }
}

/** Get the URL of the user's uploaded file or a local file in the input
 * directory (the file name is the value of the selected option).
 * @returns {string} url
 */
function getInputUrl() {
  let input = document.getElementById("fileInput");
  let select = document.getElementById("source");
  let url;
  if (select.value) {
    if (input.files.length > 0) {
      url = userUploadUrl(input);
    } else {
      url = `input/${select.value}.json`;
    }
  }
  return url;
}

/** Procedure: Hide the timeline-chooser menu and load the selected file. */
function setupGame() {
  let source = document.getElementById("source");
  source.addEventListener("change", () => {
    if (source.value === "upload") {
      showElementById("file");
    } else {
      hideElementById("file");
    }
  });

  let restartButton = document.querySelector("button#restart");
  restartButton.addEventListener("click", () => restart());

  let playButton = document.querySelector("button#playbutton");
  playButton.addEventListener("click", () => {
    try {
    let url = getInputUrl();
    if (url) {
      console.log(`Loading file ${url}`);
      playGame(url);
    } else throw "Invalid input, cannot play game.";
    } catch(e) {
      console.error(e);
    }
  });
}

/** On page load, set up the game. */
document.addEventListener("DOMContentLoaded", setupGame);

//}}}1

