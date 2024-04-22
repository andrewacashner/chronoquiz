import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

function color(card) {
  const bg = card => ({ style: { backgroundColor: card.color.css } });
  return (card.isClue) ? null : bg(card);
}

// function dragstartHandler(event) {
//   event.dataTransfer.setData("id", event.target.id);
//   event.dataTransfer.effectAllowed = "move";
// }

// function draggable(card) {
//   const dragSettings = { 
//     draggable : true,
//     onDragStart: dragstartHandler
//   };
//   return (card.isClue) ? dragSettings : null;
// }

function expand(card) {
  return (card.expand) ? { "data-expand": true } : null;
}

function classList(card) {
  let classes = ["card"];
  if (card && card.flash) {
    classes.push("flash");
  }
  return classes.join(" ");
}

export default function Card(props) {
  let card = props.children;

  const { attributes, listeners, setCardRef, transform } = useDraggable({
    id: card ? card.id : null
  });

  const style = {
    transform: CSS.Translate.toString(transform)
  };

  if (card) {
    return(
      <div key={card.id}
        className={classList(card)}
        id={card.id}
        data-when={card.fact.year}
        data-noselect="noselect"
        {...expand(card)}
        {...color(card)}

        ref={setCardRef}
        style={style}
        {...listeners}
        {...attributes}>
        <span className="date">{card.isClue ? "Clue" : card.fact.yearString }</span>
        { card.fact.img ? <img alt="Clue" src={card.fact.img} /> : null }
        <span className="info">{card.fact.info}</span>
      </div>
    );
  }
}
