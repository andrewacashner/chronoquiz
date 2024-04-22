import { useContext } from "react";
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

  if (clues) {
    return(
      <div className="clueDeck">
        <Stubs />
        <Card>{clues.last()}</Card>
      </div>
    );
  }
}
