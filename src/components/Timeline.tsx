import { useContext } from "react";
import { ItemTypes } from "../lib/Constants";
import { useDrop } from "react-dnd";
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
  
  const [{isOver}, drop] = useDrop(() => ({
    accept: ItemTypes.CARD,
    drop: (item, monitor) => ({ dropPoint: monitor.getClientOffset() }),
    collect: monitor => ({
      isOver: monitor.isOver()
    })
  }), []);

  if (game.isActive) {
    return(
      <div className="scrollingTimeline" ref={drop}>
        <hr />
        <div className="timelineBar" {...timelineWidth} >
          <hr {...ruleWidth} />
          <div className="timeline">
            {timeline.map(card => <Card key={card.id}>{card}</Card>)}
          </div>
        </div>
      </div>
    );
  }
}
