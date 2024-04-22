import { createContext } from "react";
import Game from "../classes/Game";

const TimelineContext = createContext({
  get: () => {},
  set: () => {},
  timeline: [new Game(), () => {}]
})

export default TimelineContext;
