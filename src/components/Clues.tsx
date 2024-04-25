import { useState, useContext } from "react";
import CardDragPreview from "./CardDragPreview";
import TimelineContext from "../store/TimelineContext";
import Card from "./Card";

export default function Clues() {
  let context = useContext(TimelineContext);
  let game = context.get;
  let clues = game.clues;
  
  let [dragState, setDragState] = useState(false);

  function Stubs(): Array<React.ReactElement> {
    let stubs = clues.allButLastItems();
    return stubs.map((card, index, array) => {
      let classList = "cardStub";
      let status = (dragState && index === array.length - 1) ? " last" : "";
      return(
        <div key={card.id} className={classList + status} />
      );
    });
  }


  function CurrentCard() {
    let cardElement = null;
    if (clues) {
      cardElement = dragState || <Card>{clues.last()}</Card>;
    } 
    return cardElement;
  }

  return(
    <>
      <div className="clueDeck">
        <Stubs />
        <CurrentCard />
        <CardDragPreview stateFn={setDragState} card={clues.last()} />
      </div>
    </>
  );
}
