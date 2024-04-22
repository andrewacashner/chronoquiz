import { useContext } from "react";
import TimelineContext from "../store/TimelineContext";

export default function ScorePanel() {
  let context = useContext(TimelineContext);
  let game = context.get;
  let score = game.score;

  if (game.isActive) {
    return(
      <div id="score">
        <p>Score: <span className="score">{score}</span></p>
      </div>
    );
  }
}
