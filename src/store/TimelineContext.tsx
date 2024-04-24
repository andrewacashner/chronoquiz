import { createContext } from "react";

const TimelineContext = createContext({
  get: {},
  set: () => {},
  isDragging: { get: {}, set: () => {}},
  dragPoint: { get: {}, set: () => {}}
})

export default TimelineContext;
