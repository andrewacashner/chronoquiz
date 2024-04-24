import { useContext } from "react";
import { ItemTypes } from "../lib/Constants";
import { useDrag } from "react-dnd";

import debug from "../lib/debug";
import Game from "../classes/Game";
import TimelineContext from "../store/TimelineContext";

function isCardElement(el: HTMLElement): boolean {
  return el.classList.contains("card");
}

// Return a card element, if found at given coordinates; or null. 
function cardAtCoord(x: number, y: number): HTMLElement {
  let elements = document.elementsFromPoint(x, y);
  let card = elements.find(isCardElement);
  return card || null;
}

// Get the center point between two coordinates.
function midpoint(
  a: number, // smaller (left edge)
  b: number  // larger (right edge)
): number {
  return (b - a) / 2 + a;
}


// TODO redo without queryselector?

/**
 * Given an event (from a drop), start from its coordinates and search
 * to the right until a card element is found. The card must be dropped to
 * left of the midpoint of the card.
 * Return the answer card or null.
 */
function findFirstCardToRight(point): HTMLElement {
  debug(`Card dropped at point (${point.x}, ${point.y})`);

  // Search along the timeline bar regardless of where the drop was vertically
  let timelineBar = document.querySelector("div.scrollingTimeline hr");
  let y = timelineBar.getBoundingClientRect().top;

  debug("Looking for nearest card to timeline drop point");
  let max = document.documentElement.clientWidth; 

  let card = null;
  for (let x = point.x; x < max; ++x) {
    card = cardAtCoord(x, y);
    if (card) {
      let bounds = card.getBoundingClientRect();
      let center = midpoint(bounds.left, bounds.right);
      if (x <= center) break;
    }
  }

  return card;
}

function color(card) {
  const bg = card => ({ style: { backgroundColor: card.color.css } });
  return (card.isClue) ? null : bg(card);
}

function classList(card) {
  let classes = ["card"];
  if (card) {
    if (card.flash) {
      classes.push("flash");
    }
    if (card.isClue) {
      classes.push("clue");
    }
  }
  return classes.join(" ");
}

export default function Card(props) {
  let card = props.children;

  let context = useContext(TimelineContext);
  let [game, setGame] = [context.get, context.set];
  let timeline = game.timeline;


  /**
   * When the user drops a card onto a timeline card, find the closest card,
   * test if the date on the clue is between that card and its previous
   * neighbor (if there is one); if so insert the card and increment the
   * score; if not, do not insert the card and decrement the score.  */
  function dropHandler(dropPoint): void {
    
    // Is the given clue between a given answer card and the one before it?
    function isClueBetweenDates(
      clue: FactCard,            // Dropped card
      guess: FactCard,           // Card that clue was dropped onto
      preGuess: FactCard | null  // previous card of guess, if exists
    ): boolean {
      let clueDate = clue.fact.date
      let guessDate = guess.fact.date
      let isBeforeGuess = clueDate <= guessDate;

      let noPreGuess = !preGuess;
      let isAfterPreGuess = preGuess && (clueDate >= preGuess.fact.date);
      let isAfterAnyPreGuess = noPreGuess || isAfterPreGuess;

      return isBeforeGuess && isAfterAnyPreGuess;
    }

    // Find nearest answer (first card found to right of click) to compare
    let clues = game.clues;
    let clue = clues.last();
    let guessElement = findFirstCardToRight(dropPoint);
    let guessID = guessElement?.id;
    let guessIndex = timeline.findIndexById(guessID);

    if (guessID && guessIndex !== -1) {
      let guess = timeline.at(guessIndex);
      // TODO put this logic in "isClueBetweenDates"
      let beforeGuess = (guessIndex > 0) ? timeline.at(guessIndex - 1) : null;

      if (isClueBetweenDates(clue, guess, beforeGuess)) {
        debug("Correct: ++Score");
        clue.flash = false;
        setGame(prevGame => prevGame.copyWithNextClue().incrementScore());
      } else {
        debug("Incorrect: --Score");
        clue.flash = true;
        // TODO apparently clue is not a Clue instance at this point?
        setGame(prevGame => new Game({ 
          clues: clues, 
          timeline: prevGame.timeline.resetMargins(),
          ...prevGame }));
          setGame(prevGame => prevGame.decrementScore());
      }
    } else {
      debug("No card found at drop location");
    }
  }
  const [, drag] = useDrag(() => ({
    type: ItemTypes.CARD,
    canDrag: (monitor) => {
      return card && card.isClue;
    },
    item: {
      year: card ? card.fact.year : null,
      card: card
    },
    end: (item, monitor) => {
      let dropResult = monitor.getDropResult();
      if (item && dropResult) {
        dropHandler(dropResult.dropPoint);
      }
    },
  }));

  if (card) {
    return(
      <div key={card.id}
        ref={drag}
        className={classList(card)}
        id={card.id}
        data-when={card.fact.year}
        {...color(card)}>
        <span className="date">{card.isClue ? "Clue" : card.fact.yearString }</span>
        { card.fact.img ? <img alt="Clue" src={card.fact.img} /> : null }
        <span className="info">{card.fact.info}</span>
      </div>
    );
  }
}
