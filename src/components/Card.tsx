import { useContext, useEffect } from "react";
import { ItemTypes } from "../lib/Constants";
import { useDrag } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";

import { debug } from "../lib/debug";
import findFirstCardToRight from "../lib/findCard";
import Game from "../classes/Game";
import TimelineContext from "../store/TimelineContext";

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


  const [, drag, dragPreview] = useDrag(() => ({
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

  useEffect(() => {
    dragPreview(getEmptyImage(), { captureDraggingState: true });
  }, []); 

  function color(card) {
    const bg = card => ({ style: { backgroundColor: card.color.css } });
    return (card.isClue) ? null : bg(card);
  }

  function classList(card) {
    let flash = card.flash ? " flash" : "";
    let clue = card.clue ? " clue" : "";
    return "card" + clue + flash;
  }

  if (card) {
    return(
      <>
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
      </>
    );
  }
}
