import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
// import { TouchBackend } from "react-dnd-touch-backend";
// import { usePreview } from "react-dnd-preview";

import debug from "../lib/debug";
import Clues from "../components/Clues";
import Timeline from "../components/Timeline";
import GameOver from "../components/GameOver";
import Card from "../components/Card";

//function CardPreview() {
//  let preview = usePreview();
//  if (!preview.display) {
//    return null;
//  } else {
//    const { itemType, item, ref } = preview;
//    if (itemType === 'card') {
//      return(<Card>{item.card}</Card>);
//    }
//  }
//}

//<DndProvider backend={TouchBackend} options={{enableMouseEvents: true}}>
//
export default function GamePanel({ gameOver }) {
  return(
    <section id="gamePanel">
      <DndProvider backend={HTML5Backend}>
        { gameOver ? <GameOver /> : <Clues /> }
        <section id="game">
          <Timeline />
        </section>
      </DndProvider>
    </section>
  );
}

