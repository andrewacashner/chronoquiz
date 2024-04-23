import { useState } from "react";
import { useLocation } from "react-router-dom";

import BackendRequest from "../classes/BackendRequest";
import Game from "../classes/Game";

import Instructions from "../components/Instructions";
import InputForm from "../components/InputForm";
import ScorePanel from "../components/ScorePanel";
import GamePanel from "../components/GamePanel";

import TimelineContext from "../store/TimelineContext";

export default function Chronoquiz() {
  let [game, setGame] = useState(Game.startingGame());
  let gameContext = { get: game, set: setGame };

  let location = useLocation();
  let sourceUrl = `${BackendRequest.SERVER}${location.pathname}/`;

  return (
    <TimelineContext.Provider value={gameContext}>
      <main>
        <div className="App">
          <section id="frame">
            <Instructions />
            <InputForm src={sourceUrl} />
            { game.isGameOver ? null : <ScorePanel /> }
          </section>
          <GamePanel gameOver={ game.isGameOver } />
        </div>
      </main>
  </TimelineContext.Provider>
  );
}
