import debug from "../lib/debug";
import BackendRequest from "./BackendRequest";
import Fact from "./Fact";

interface TimelineInput {
  id: number;
  title: string;
  description: string;
  keywords: Array<string>;
  creator: string;
  facts: Array<Fact>;
}

export default class Timeline {
  id: number;
  title: string;
  description: string;
  keywords: Array<string>;
  creator: string;
  facts: Array<Fact>;

  constructor({ 
    id = -1,
    title = "", 
    description = "", 
    keywords = [], 
    creator = "", 
    facts = []
  }: TimelineInput = {}) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.keywords = keywords;
    this.creator = creator;
    this.facts = facts;
  }

  static parseKeywords(inputStr: string = ""): Array<string> {
    if (inputStr) {
      return inputStr.split(";").map(s => s.trim());
    } else {
      return [];
    }
  }

  get keywordString() {
    return this.keywords.join("; ");
  }

  static newFromKeywordString({ id, title, description, keywords, creator, facts }) {
    return new Timeline({
      id: id,
      title: title,
      description: description,
      keywords: keywords ? Timeline.parseKeywords(keywords) : [],
      creator: creator,
      facts: facts
    });
  }

  json() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      keywords: this.keywordString,
      creator: this.creator,
      facts: this.facts.map(e => e.json())
     };
  }

  sortByDate() {
    this.facts.sort((c1, c2) => c1.date - c2.date);
    return this;
  }

  addFact(fact) {
    let newTimeline = new Timeline({
      ...this,
      facts: [...this.facts, fact]
    });
    return newTimeline.sortByDate();
  }

  removeFact(fact) {
    let filtered = this.facts.filter(f => f !== fact);
    return new Timeline({
      ...this,
      facts: filtered
    });
  }

  addFacts(facts) {
    let newTimeline = new Timeline({
      ...this,
      facts: [...this.facts, ...facts]
    });
    return newTimeline.sortByDate();
  }

  equals(other: Timeline): boolean {
    let levelOne = Object.entries(this).every(
      ([key, value]) => value === other[key]);

    let [kw, otherKw] = [this.keywords, other.keywords];
    let keywordTest = (kw.length === otherKw.length) 
    && kw.every(k => otherKw.includes(k));

    let [facts, otherFacts] = [this.facts, other.facts];
    let factTest = (facts.length === otherFacts.length)
    && facts.every((f, index) => f.equals(otherFacts[index]));

    return levelOne && keywordTest && factTest;
  }
  
  static async listTimelines(token: string = ""): array<string> {
    let list = null;
    let request = new BackendRequest({
      url: "timelines/", 
      method: "POST", 
      token: token
    });
    let response = await request.fetch();
    if (response.ok) {
      let json = await response.json();
      list = json;
      debug(`Loaded list of ${json.length} timelines`);
    } else {
      debug(`Problem retrieving quiz list: Server responded ${response.status}, ${response.statusText}`);
    }
    return list;
  } 

  static async newFromBackend(id: number, token: string): Timeline {
    let newTimeline = null;

    let request = new BackendRequest({
      url: `timeline-full/${id}/`, 
      method: "GET",
      token: token
    });
    let response = await request.fetch();
    if (response.ok) {
      let json = await response.json();
      debug(json);
      // TODO don't need this because we always set a creator field when
      // creating
      // let creator = (json.creator === "") ? this.username : json.creator;

      newTimeline = new Timeline({
        id:           json.id,
        title:        json.title,
        description:  json.description,
        keywords:     Timeline.parseKeywords(json.keywords),
        creator:      json.creator,
        facts:        json.facts.map(f => Fact.newFromYear(f))
      });
    } else {
      debug(`Problem loading timeline with id ${id}: Server status ${response.status}, ${response.statusText}`);
    }

    return newTimeline;
  }

}


