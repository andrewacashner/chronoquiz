import { useContext } from "react";
import TimelineContext from "../store/TimelineContext";

export default function GameOver() {
  let context = useContext(TimelineContext);
  let score = context.get.score;
  let pointWord = (score !== 1) ? "points" : "point";

  return(
    <div className="gameover">
      <p>Game over!</p>
      <p>Final score: {score} {pointWord}</p>
    </div>
  );
}
