import { DndProvider } from "react-dnd";
// import { MultiBackend } from "react-dnd-multi-backend";
// import { HTML5toTouch } from "rdndmb-html5-to-touch";
import { TouchBackend } from "react-dnd-touch-backend";

import Clues from "../components/Clues";
import Timeline from "../components/Timeline";
import GameOver from "../components/GameOver";

export default function GamePanel({ gameOver }) {
  // <DndProvider backend={MultiBackend} options={HTML5toTouch}>
  // <DndProvider backend={TouchBackend} options={{ enableMouseEvents: true }}>
  return(
    <section id="gamePanel">
      <DndProvider backend={TouchBackend}> 
        { gameOver ? <GameOver /> : <Clues /> }
        <section id="game">
          <Timeline />
        </section>
      </DndProvider>
    </section>
  );
}

