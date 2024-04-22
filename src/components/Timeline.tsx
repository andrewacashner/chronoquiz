import { useContext } from "react";
import TimelineContext from "../store/TimelineContext";

import Game from "../classes/Game";

import Card from "./Card";

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
function findFirstCardToRight(event: React.DropEvent<HTMLElement>): HTMLElement {
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



export default function Clues() {
  let context = useContext(TimelineContext);
  let [game, setGame] = [context.get, context.set];
  let timeline = game.timeline;

  // Allow to move by dragging. Insert gap to the left of a card when the drag
  // point is in range to guess this card.
  function dragoverHandler(event: React.DragEvent<HTMLElement>): void {
    event.preventDefault();
  
    let bounds = event.target.getBoundingClientRect();
    let center = midpoint(bounds.left, bounds.right);
  
    if (event.clientX <= center) {
      console.log("In range");
      let cardUnderDrag = cardAtCoord(event.clientX, event.clientY);
      if (cardUnderDrag) {
        let match = timeline.findById(cardUnderDrag.id);
        match.expand = true;
        setGame(prevGame => new Game({ timeline: timeline, ...prevGame }));
      }
    }
    event.dataTransfer.effectAllowed = "move";
  }
  
  function dragleaveHandler(event: React.DragEvent<HTMLElement>): void {
    let el = event.target;
    if (isCardElement(el)) {
      let match = timeline.findById(el.id);
      match.expand = false;
      setGame(prevGame => new Game({ timeline: timeline.resetMargins(), 
                                   ...prevGame }));
    }
  }

  /**
   * When the user drops a card onto a timeline card, find the closest card,
   * test if the date on the clue is between that card and its previous
   * neighbor (if there is one); if so insert the card and increment the
   * score; if not, do not insert the card and decrement the score.
   */
  function dropHandler(event: React.DropEvent<HTMLElement>): void {
    
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

    event.preventDefault();

    // Find nearest answer (first card found to right of click) to compare
    let clues = game.clues;
    let clue = clues.last();
    let guessElement = findFirstCardToRight(event);
    let guessID = guessElement?.id;
    let guessIndex = timeline.findIndexById(guessID);

    if (guessID && guessIndex !== -1) {
      let guess = timeline.at(guessIndex);
      // TODO put this logic in "isClueBetweenDates"
      let beforeGuess = (guessIndex > 0) ? timeline.at(guessIndex - 1) : null;

      if (isClueBetweenDates(clue, guess, beforeGuess)) {
        console.log("Correct: ++Score");
        clue.flash = false;
        setGame(prevGame => prevGame.copyWithNextClue().incrementScore());
      } else {
        console.log("Incorrect: --Score");
        clue.flash = true;
        // TODO apparently clue is not a Clue instance at this point?
        setGame(prevGame => new Game({ 
          clues: clues, 
          timeline: prevGame.timeline.resetMargins(),
          ...prevGame }));
        setGame(prevGame => prevGame.decrementScore());
      }
    } else {
      console.log("No card found at drop location");
    }
  }

  let dragDropInterface = {
    onDrop: dropHandler,
    onDragOver: dragoverHandler,
    onDragLeave: dragleaveHandler
  } 

  const timelineWidth = {
    style: { width: 
      `calc(${timeline.length} * (var(--card-width) + var(--card-margin)) + 4 * var(--card-margin)`
    }
  }
  const windowWidth = document.documentElement.clientWidth;
  const ruleWidth = (timelineWidth > windowWidth) ? timelineWidth : null;

  if (game.isActive) {
    return(
      <div className="scrollingTimeline">
        <hr />
        <div className="timelineBar" {...timelineWidth} >
          <hr {...ruleWidth} />
          <div className="timeline" {...dragDropInterface}>
            {timeline.map(card => <Card key={card.id}>{card}</Card>)}
          </div>
        </div>
      </div>
    );
  }
}
