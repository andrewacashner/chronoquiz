import { useEffect } from "react";
import { useDragLayer } from "react-dnd";

export default function CardDragPreview({ stateFn, card }) {
  let setDragState = stateFn;

  const {
    isDragging,
    currentFileOffset,
  } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    isDragging: monitor.isDragging(),
    currentFileOffset: monitor.getSourceClientOffset(),
  }));

  useEffect(() => {
    setDragState(isDragging);
  }, [setDragState, isDragging]);
  
  if (!isDragging) {
    return null;
  } 
  
  return (
    <div className="dragPreview" style={layerStyles}>
      <div style={getItemStyles(currentFileOffset)}>
        <div className="card clue">
          <span className="date">Clue</span>
          { card.fact.img ? <img alt="Clue" src={card.fact.img} /> : null }
          <span className="info">{card.fact.info}</span>
        </div>
      </div>
    </div>
  );
}

const layerStyles: CSSProperties = {
  position: "fixed",
  pointerEvents: "none",
  zIndex: 100,
  left: 0,
  top: 0,
  width: "var(--card-width)",
  height: "var(--card-height)",
};

function getItemStyles(currentOffset: XYCoord | null): object {
  if (!currentOffset) {
    return {
      display: "none",
    };
  }

  let { x, y } = currentOffset;
  let transform = `translate(${x}px, ${y}px)`;

  return {
    transform,
    WebkitTransform: transform,
  };
}


