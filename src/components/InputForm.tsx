import { useContext, useState, useEffect } from "react";

import FactCard from "../classes/FactCard";
import TimelineDeck from "../classes/TimelineDeck";
import Game from "../classes/Game";

import RestartButton from "./RestartButton";

import TimelineContext from "../store/TimelineContext";

function isInputValid(json: any): boolean {
  return typeof json === "object"
  && Array.isArray(json) 
  && json.length > 0 
  && json.every(fact => ("date" in fact) && ("info" in fact));
}

async function clueListFromJson(json: object): TimelineDeck { 
  let cards = [];
  try {
    if (json && json.length > 0) {
      for (let entry of json) {
        try {
          let card = await FactCard.newSafeCard(entry);
          if (card && card.isSafe) {
            cards.push(card);
          } else {
            throw new Error(`Faulty card input {date: '${entry.date}', info: '${entry.info.slice(0, 15)}...'}; skipping`);
          }
        } catch(e) {
          console.error(e);
        }
      }
    }
  } catch(e) {
    console.error(e);
  }
  return new TimelineDeck(cards);
}


export default function InputForm({ src }) {

  let context = useContext(TimelineContext);
  let setGame = context.set;

  let [url, setUrl] = useState("");
  let [json, setJson] = useState(null);
  let [isGameActive, setIsGameActive] = useState(false);

  function getUrl(event: React.FormEvent<HTMLFormElement>): void {
    setIsGameActive(true); 
    setUrl(src);
    console.debug(`Set URL to ${src}`);
  }
  
  useEffect(() => {
    async function fetchUrl(): void {
      if (url) {
        console.log(`Loading file ${url}`);

        try {
          let response = await fetch(url);

          let newJson;
          let contentType = response.headers.get("content-type");
          
          if (contentType && contentType.includes("application/json")) {
            newJson = await response.json();
          } else {
            throw new Error(`No JSON input: ${response}`);
          }

          if (isInputValid(newJson)) {
            setJson(newJson);
          } else {
            alert(`Could not create a timeline from JSON file at ${url}`);
            window.location.reload();
            throw new Error("Unusable JSON input; restarting");
          }
        } catch(e) { 
          console.error(e); 
        }
      }
    }
    fetchUrl();
  }, [url]);

  useEffect(() => {
    async function loadClues(json) {
      try {
        let newClues = await clueListFromJson(json);
        newClues.setupClues();
        setGame(prevGame => new Game({ 
          clues: newClues,
          timeline: prevGame.timeline,
          score: prevGame.score,
          isActive: isGameActive
        }));
      } catch(e) {
        console.error(e);
      }
    }

    loadClues(json);
  }, [json, setGame, isGameActive])


  function restart() {
    window.location.reload();
  }

  function PlayButton() {
    return(
      <button type="button" id="playbutton" onClick={getUrl}>Play!</button>
    );
  }

  function PlayAgainButton() {
    return(
      <button type="button" id="playbutton" onClick={restart}>Play again!</button>
    );
  }

  return(
    <>
      { isGameActive ? <PlayAgainButton /> : <PlayButton /> }
      { isGameActive ? <RestartButton /> : null }
    </>
  );
}

