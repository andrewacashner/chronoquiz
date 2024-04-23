import { useContext } from "react";
import { useDroppable } from "@dnd-kit/core";

import TimelineContext from "../store/TimelineContext";
import Card from "./Card";

export default function Timeline() {
  let context = useContext(TimelineContext);
  let game = context.get;
  let timeline = game.timeline;

  const timelineWidth = {
    style: { width: 
      `calc(${timeline.length} * (var(--card-width) + var(--card-margin)) + 4 * var(--card-margin)`
    }
  }
  const windowWidth = document.documentElement.clientWidth;
  const ruleWidth = (timelineWidth > windowWidth) ? timelineWidth : null;

  const { setNodeRef } = useDroppable({
    id: timeline.id
  });

  if (game.isActive) {
    return(
      <div className="scrollingTimeline">
        <hr />
        <div className="timelineBar" {...timelineWidth} >
          <hr {...ruleWidth} />
          <div className="timeline" ref={ setNodeRef }>
            {timeline.map(card => <Card key={card.id}>{card}</Card>)}
          </div>
        </div>
      </div>
    );
  }
}
