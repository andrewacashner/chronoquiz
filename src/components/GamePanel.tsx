import { DndProvider } from "react-dnd";
import { MultiBackend } from "react-dnd-multi-backend";
import { HTML5toTouch } from "rdndmb-html5-to-touch";

import Clues from "../components/Clues";
import Timeline from "../components/Timeline";
import GameOver from "../components/GameOver";

export default function GamePanel({ gameOver }) {
  return(
    <section id="gamePanel">
      <DndProvider backend={MultiBackend} options={HTML5toTouch}>
        <div className="gameTop">
          { gameOver ? <GameOver /> : <Clues /> }
        </div>
        <section id="game">
          <Timeline />
        </section>
      </DndProvider>
    </section>
  );
}

