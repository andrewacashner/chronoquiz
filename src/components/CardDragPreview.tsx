import { useDragLayer } from "react-dnd";

export default function CardDragPreview({ card }) {
  const {
    itemType,
    isDragging,
    initialCursorOffset,
    initialFileOffset,
    currentFileOffset,
  } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    initialCursorOffset: monitor.getInitialClientOffset(),
    initialFileOffset: monitor.getInitialSourceClientOffset(),
    currentFileOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging(),
  }));

  if (!isDragging) {
    return null;
  } 
  return (
    <div style={layerStyles}>
      <div style={getItemStyles(
        initialCursorOffset,
        initialFileOffset,
        currentFileOffset
      )}>
      <div 
        className="card clue"
        key={card.id + "preview"}>
        <span className="date">Clue</span>
        { card.fact.img ? <img src={card.fact.img} /> : null }
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

function getItemStyles(
  initialCursorOffset: XYCoord | null,
  initialOffset: XYCoord | null,
  currentOffset: XYCoord | null
) {
  if (!initialOffset || !currentOffset || !initialCursorOffset) {
    return {
      display: "none",
    };
  }

  const x = initialCursorOffset?.x + (currentOffset.x - initialOffset.x);
  const y = initialCursorOffset?.y + (currentOffset.y - initialOffset.y);
  const transform = `translate(${x}px, ${y}px)`;

  return {
    transform,
    WebkitTransform: transform,
  };
}


