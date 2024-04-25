import { debug } from "./debug";

function isCardElement(el: HTMLElement): boolean {
  return el.classList.contains("card");
}

// Return a card element, if found at given coordinates; or null. 
function cardAtCoord(x: number, y: number): HTMLElement {
  let elements = document.elementsFromPoint(x, y);
  let card = elements.find(isCardElement);
  return card || null;
}

// Get the center point between two coordinates.
function midpoint(
  a: number, // smaller (left edge)
  b: number  // larger (right edge)
): number {
  return (b - a) / 2 + a;
}


// TODO redo without queryselector?

/**
 * Given an event (from a drop), start from its coordinates and search
 * to the right until a card element is found. The card must be dropped to
 * left of the midpoint of the card.
 * Return the answer card or null.
 */
export default function findFirstCardToRight(point): HTMLElement {
  debug(`Card dropped at point (${point.x}, ${point.y})`);

  // Search along the timeline bar regardless of where the drop was vertically
  let timelineBar = document.querySelector("div.scrollingTimeline hr");
  let y = timelineBar.getBoundingClientRect().top;

  debug("Looking for nearest card to timeline drop point");
  let max = document.documentElement.clientWidth; 

  let card = null;
  for (let x = point.x; x < max; ++x) {
    card = cardAtCoord(x, y);
    if (card) {
      let bounds = card.getBoundingClientRect();
      let center = midpoint(bounds.left, bounds.right);
      if (x <= center) break;
    }
  }

  return card;
}
