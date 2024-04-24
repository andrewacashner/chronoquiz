import { useContext, useState } from "react";
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
  
  const [, drop] = useDrop(() => ({
    accept: ItemTypes.CARD,
    drop: (item, monitor) => ({ dropPoint: monitor.getClientOffset() }),
  }), []);

  function Buffer() {
    let [expand, setExpand] = useState(false);
    let active = expand ? " active" : "";
    let classList = "buffer" + active;

    return(
      <div className={classList} 
        onDragEnter={() => setExpand(true)}
        onDragLeave={() => setExpand(false)} />
    );
  }

  function CardDeck({ cards, buffer }) {
    let deck = cards.flatMap((card, index, array) => {
      let cardElement = <Card key={card.id}>{card}</Card>;
      return (index < array.length - 1) 
        ? [cardElement, <Buffer key={card.id + "buffer"} />]
        : cardElement;
    });
    return(
      <div className="timeline">
        {deck}
      </div>
    );
  }

  if (game.isActive) {
    return(
      <div className="scrollingTimeline" ref={drop}>
        <hr />
        <div className="timelineBar" {...timelineWidth} >
          <hr {...ruleWidth} />
          <CardDeck cards={timeline.cards} buffer={<Buffer />} />
        </div>
      </div>
    );
  }
}
