import FactCard from "./FactCard";
import { default as Color } from "./RgbColorMix";

export default class TimelineDeck {
  #items: Array<FactCard>;

  constructor(cards: Array<FactCard> = []) {
    this.#items = cards;
  }

  get cards() {
    return this.#items;
  }

  json() {
    return this.#items.map(i => i.json());
  }

  // PRIVATE METHODS
  
  // Set the colors of the cards in this list, in chronological order, to
  // evenly spaced intervals along the spectrum.
  #setColors(): TimelineDeck {
    this.sortByDate();
    let items = this.#items;

    items.forEach((card, index) => {
      items[index].color = Color.colorAtIndex(index, items.length, 
                                              Color.SPECTRUM);
    });
    return this;
  } 

  // Shuffle the array, using the Fisher-Yates/Knuth shuffle
  // (`https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle`)
  #shuffle(): TimelineDeck {
    
    function randomInt(max: number): number {
      return Math.floor(Math.random() * max);
    } 

    let items = this.#items;

    for (let i = items.length - 1; i > 0; --i) {
      let j = randomInt(i);
      [items[i], items[j]] = [items[j], items[i]];
    }

    return this;
  }

  // PUBLIC METHODS

  clone(): TimelineDeck {
    return new TimelineDeck([...this.#items]);
  }

  // Sort the array by the date field, ascending.
  sortByDate(): TimelineDeck {
    this.#items.sort((c1, c2) => { return c1.fact.date - c2.fact.date });
    return this;
  }

  sortedByDate(): TimelineDeck {
    return this.clone().sortByDate();
  }
  

  setupClues() {
    this.#setColors();
    this.#shuffle();
  }

  get length(): number {
    return this.#items.length;
  }

  isEmpty(): boolean {
    return this.length === 0;
  }

  allButLastItems(): Array<FactCard> {
    return this.#items.slice(0, -1);
  }

  last(): FactCard {
    return this.#items.at(-1);
  }

  pop(): FactCard {
    let card = this.#items.pop();
    return card;
  }

  dropLast(): TimelineDeck {
    this.pop();
    return this;
  }

  dropLastCopy(): TimelineDeck {
    return new TimelineDeck(this.#items.slice(0, -1));
  }

  prepend(item): TimelineDeck {
    this.#items.unshift(item);
    return this;
  }
  
  prependCopy(item): TimelineDeck {
    return new TimelineDeck([item, ...this.#items]);
  }

  // Add event to array and then resort by date.
  addFact(card) {
    this.#items.push(card);
    this.sortByDate();
    return this;
  }

  resetMargins(): TimelineDeck {
    let resetItems = [];
    for (let i of this.#items) {
      let card = new FactCard({...i, expand: false});
      resetItems.push(card);
    }
    return new TimelineDeck(resetItems);
  }

  addAnswer(answer): TimelineDeck {
    return this.prependCopy(answer).sortedByDate().resetMargins();
  }

  findById(id: string): FactCard {
    return this.#items.find(c => c.id === id);
  }

  findIndexById(id: string): FactCard {
    return this.#items.findIndex(c => c.id === id);
  }

  at(index: number): FactCard {
    return this.#items.at(index);
  }

  map(fn: (FactCard) => FactCard): TimelineDeck {
    return this.#items.map(fn);
  }

  appendClone(newCard: FactCard): TimelineDeck {
    return this.clone().addFact(newCard);
  }

}

