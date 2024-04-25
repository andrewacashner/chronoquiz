import { useContext } from "react";
import CardDragPreview from "./CardDragPreview";
import TimelineContext from "../store/TimelineContext";
import Card from "./Card";

export default function Clues() {
  let context = useContext(TimelineContext);
  let game = context.get;
  let clues = game.clues;

  function Stubs(): Array<React.ReactElement> {
    const Stub = (key) => <div key={key} className="cardStub" />;
    let stubs = clues.allButLastItems();
    return stubs.map(card => <Stub key={card.id} />);
  }

  function CurrentCard() {
    if (clues) {
      return(
        <Card>{clues.last()}</Card> 
      );
    } else {
      return null;
    }
  }

  return(
    <>
      <div className="clueDeck">
        <Stubs />
        <CurrentCard />
        <CardDragPreview card={clues.last()} />
      </div>
    </>
  );
}
