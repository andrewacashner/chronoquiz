import { DndProvider } from "react-dnd";
import { MultiBackend } from "react-dnd-multi-backend";
import { HTML5toTouch } from "rdndmb-html5-to-touch";
// import { usePreview } from "react-dnd-preview";

import Clues from "../components/Clues";
import Timeline from "../components/Timeline";
import GameOver from "../components/GameOver";

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

export default function GamePanel({ gameOver }) {
  return(
    <section id="gamePanel">
      <DndProvider backend={MultiBackend} options={HTML5toTouch}>
        { gameOver ? <GameOver /> : <Clues /> }
        <section id="game">
          <Timeline />
        </section>
      </DndProvider>
    </section>
  );
}

