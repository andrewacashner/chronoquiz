import Fact from "./Fact";

interface FactCardInput  {
  isClue: boolean;      // Is this a clue (true) or answer?
  fact: Fact;
}

export default class FactCard {
  isClue: boolean;
  id: string;
  fact: Fact;
  color: string;    // CSS color to be used in timeline
  expand: boolean;  // Add margin because a card is being dragged over?
  flash: boolean;   // Should this card flash an alert? (For wrong guess)
  #safe: boolean;   // Has this card been sanitized?

  // Each card gets the given info and a random unique identifier.
  constructor({ isClue = true, fact = new Fact(), color = null, expand = false, flash = false }: FactCardInput) {
    this.isClue = isClue;
    this.id = crypto.randomUUID();
    this.fact = fact;
    this.color = color;
    this.expand = expand;
    this.flash = flash;
    this.#safe = false; // Has this card been sanitized?
  }

  markSafe(): FactCard {
    this.#safe = true;
    return this;
  }

  // PUBLIC METHODS

  get isSafe(): boolean {
    return this.#safe;
  }

  /** Creat a new card with sanitized input.
   * - The date must be an integer string <= the current year (including
   *   negative numbers).
   * - The info is converted to plain text using textContent.
   * - The image, if present, is downloaded and cached.
   *
   * The parameters are the same as for new FactCard().
   *
   * Returns: FactCard with validated content (with safe property set to true), or
   * null if the input was invalid.
   */
  static async newSafeCard({ isClue, date, info, img }: 
                           FactCardInput): FactCard | null {
    let card = null;
    try {
      let cleanDate = FactCard.#sanitizeDate(date);
      let cleanInfo = info;
      let cleanImg = await FactCard.#sanitizeImg(img).catch(console.error);

      // The date is the only dealbreaker. We just skip a bad image link.
      if (cleanDate) {
        card = new FactCard({
          isClue: isClue, 
          fact: new Fact({ date: cleanDate, info: cleanInfo, img: cleanImg})
        });
        card.markSafe();
        return card;
      } else {
        throw new Error(`Could not sanitize card input with date '${date}', info '${info}'`);
      }
    } catch(e) {
      console.error(e);
    }
    return card;
  }

  json() {
    return this.fact.json();
  }

  // PRIVATE METHODS
  // Sanitize input 
  static #sanitizeDate(rawDate: any): Date | null {
    let date = null;
    try {
      let numTest = Number(rawDate);
      if (!isNaN(numTest) 
          && Number.isInteger(numTest) 
          && numTest <= new Date().getFullYear()) {

            // TODO date comparison bad for cards with current year, because
            // they include exact time if created after Now card?
            date = new Date();
            date.setFullYear(numTest);
        } else {
          throw new Error(`Bad date input ${rawDate}`);
        }
    } catch(e) { 
      console.error(e);
    }
    return date;
  }

  static async #sanitizeImg(url: string): string | null {
    function getImageIfExists(url: string): Promise { 
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = url;
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
      });
    }
    let testedUrl = null;
    try {
      if (url) {
        let imgTest = await getImageIfExists(url).catch(console.log);
        if (imgTest === true) {
          testedUrl = url;
        } else {
          throw new Error(`Image not found at url '${url}'`);
        }
      } 
    } catch(e) {
      console.error(e);
    }
    return testedUrl;
  }

  // Return the date as YYYY year string.
  get year(): string { 
    return this.fact.year; 
  }

  copyAsAnswer(): FactCard {
    return new FactCard({ ...this, isClue: false});
  }

  flash(): FactCard {
    this.flash = true;
    return this;
  }
}
