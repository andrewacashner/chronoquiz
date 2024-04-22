import { useNavigate } from "react-router-dom";

export default function RestartButton() {
  let navigate = useNavigate();

  function restart() {
    navigate("../game");
  }

  return(
    <button type="button" id="restart" onClick={restart}>Choose Another Timeline</button>
  );
}
