import { HTML5Backend } from "react-dnd-html5-backend";
import { DndProvider } from "react-dnd";

import Clues from "../components/Clues";
import Timeline from "../components/Timeline";
import GameOver from "../components/GameOver";

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

