import { useState, useContext, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import User from "../classes/User";
import Fact from "../classes/Fact";
import Timeline from "../classes/Timeline";

import UserContext from "../store/UserContext";

export default function Create() {
  let userContext = useContext(UserContext);
  let authenticated = userContext.get("authenticated");
  let currentUser = userContext.get("currentUser");
  let userToken = userContext.get("userToken");

  let navigate = useNavigate();

  useEffect(() => {
    if (!authenticated) {
      navigate("../admin");
    }
  }, [authenticated, navigate]);

  const defaultMetadata = useCallback(() => {
    return {
      title: '',
      description: '',
      keywordString: [],
      creator: currentUser.username
    }
  }, [currentUser.username]);

  let [metadata, setMetadata] = useState(defaultMetadata);

  let [facts, setFacts] = useState([]);

  const startingTimeline = useCallback(() => {
    return new Timeline({ ...defaultMetadata });
  }, [defaultMetadata]);

  let [timeline, setTimeline] = useState(startingTimeline());
  console.debug(timeline);

  const updateTimeline = useCallback(() => {
    setTimeline({ ...metadata, facts: facts });
  }, [metadata, facts]);

  const resetTimeline = useCallback(() => {
    setTimeline(startingTimeline());
  }, [startingTimeline]);

  let [saveReady, setSaveReady] = useState(false);
  
  function Instructions() {
    return(
      <p className="instructions">Your data will not be saved until you click Save.</p>
    );
  }

  let [timelineList, setTimelineList] = useState([]);

  useEffect(() => {
    async function loadTimelineList(user, token) {
      let list = await user.loadUserTimelineList(token);
      if (list) {
        setTimelineList(list);
      }
    }
    if (authenticated) {
      loadTimelineList(currentUser, userToken);
    } else {
      setTimelineList([]);
    }
  }, [authenticated, currentUser, userToken]);
  // TODO update when new timeline created

  let [timelineID, setTimelineID] = useState(null);
  // TODO replace with field of timeline?

  function loadTimeline(event) {
    event.preventDefault();
    let data = new FormData(event.target);
    let id = data.get("select-timeline");
    setTimelineID(id);
  }

  useEffect(() => {
    async function loadTimeline(id, token) {
      let response = await fetch(`${User.SERVER}/timeline-full/${id}`, {
        method: "GET",
        headers: new Headers({
          "Authorization": `Token ${token}`
        })
      });

      if (response.ok) {
        let json = await response.json();
        console.debug(json);
        setMetadata({
          title: json.title,
          description: json.description,
          keywords: Timeline.parseKeywords(json.keywords),
          creator: Timeline.creator ?? currentUser.username,
        });
        setFacts(json.facts.map(f => Fact.newFromYear(f)));
        updateTimeline();

      } else {
        console.debug(`Problem loading timeline with id ${id}: Server status ${response.status}, ${response.statusText}`);
      }
    }

    if (timelineID) {
      if (timelineID === "create") {
        resetTimeline();
      } else {
        loadTimeline(timelineID, userToken);
      }
    }
  }, [timelineID, currentUser.username, resetTimeline, updateTimeline, userToken]);


  function Chooser() {
    function timelineOption(timeline) {
      return(
        <option key={timeline.id} value={timeline.id}>{timeline.title}</option>
      );
    }
    return(
      <form id="chooser" onSubmit={loadTimeline}>
        <label for="select-timeline">Select a Timeline:</label>
        <select name="select-timeline" defaultValue="create">
          <option value="create">Create New</option>
          { timelineList.map(timelineOption) }
        </select>
        <button type="submit">Submit</button>
      </form>
    );
  }

  function MetadataPanel() {
        function updateMetadata(event) {
      event.preventDefault();
      let data = new FormData(event.target);
      setMetadata({
        title: data.get("title"),
        description: data.get("description"),
        keywordString: data.get("keywords"),
        creator: data.get("creator")
      });
      console.log("Updating metadata on client side; remember to save your timeline");
      console.debug(metadata);
    }

    return(
      <section id="metadata">
        <h2>Metadata</h2>
        <form className="timelinePanel" onSubmit={updateMetadata}>
          <div className="formInputBlock">
            <div className="formItem">
              <label htmlFor="title">Title</label>
              <input type="text" name="title" 
                defaultValue={metadata.title} />
            </div>
            <div className="formItem">
              <label htmlFor="description">Description</label>
              <input type="text" name="description" 
                defaultValue={metadata.description} />
            </div>
            <div className="formItem">
              <label htmlFor="keywords">Keywords (separated with semicolons)</label>
              <input type="text" name="keywords" 
                defaultValue={metadata.keywordString} />
            </div>
            <div className="formItem">
              <label htmlFor="creator">Creator (for public display; default: your username)</label>
              <input type="text" name="creator" 
                defaultValue={metadata.creator}/>
            </div>
          </div>
          <button type="submit">Update Metadata</button>
        </form>
      </section>
    );
  }

  function CurrentFactsPanel() {

    function currentFact(item) {

      function deleteFact(event) {
        if (window.confirm("Are you sure you want to delete the current fact? Deleted facts can be recovered by reloading the timeline without first clicking Save.")) {
          console.debug(`Delete item (date ${item.date.getFullYear()})`);
          setFacts(prev => Fact.remove(prev, item));
        }
      }

      function editFact(event) {
        console.debug(`Edit item (date ${item.date.getFullYear()})`);
        setTestCard(item);
        setFacts(prev => Fact.remove(prev, item));
      }

      return(
        <tr key={crypto.randomUUID()}>
          <td><button type="button" onClick={editFact}>Edit</button>
            <button type="button" onClick={deleteFact}>Delete</button></td>
          <td>{item.id}</td>
          <td>{item.year}</td>
          <td>{item.info}</td>
          <td>{item.img}</td>
        </tr>
      );
    }

    function Instructions() {
      return(
        <p className="instructions">Enter timeline events using the form below</p>
      );
    }

    return(
      <section id="currentTimeline">
        <h2>Current Timeline Events</h2>
        <table className="timeline">
          <thead>
            <tr>
              <th>Controls</th>
              <th>ID</th>
              <th>Year</th>
              <th>Description</th>
              <th>Image URL</th>
            </tr>
          </thead>
          <tbody>
            { facts?.length > 0 ? facts.map(currentFact) : null }
          </tbody>
        </table>
        { timeline ? null : <Instructions /> }
      </section>
    );
  }

  const startingCard = () => new Fact({
    date: new Date(),
    info: "Description", 
    img: "https://picsum.photos/200.jpg"
  });

  let [testCard, setTestCard] = useState(startingCard());
 
  function resetTestCard() {
    setTestCard(startingCard());
  }

  function NewFactForm() {

    function newFact(event) {
      if (testCard.date && testCard.info) {
        setFacts(prev => Fact.append(prev, testCard));
        console.debug("Added fact to timeline");
        resetTestCard();
      }
    }

    function CardPreview({ fact }) {
      return(
        <div className="card" data-when={fact.year} data-noselect="noselect">
          <span className="date">{fact.year}</span>
          <img alt={fact.img} src={fact.img} />
          <span className="info">{fact.info}</span>
        </div>
      );
    }

    function setDate(event) {
      let newDate = new Date();
      newDate.setFullYear(Number(event.target.value));
      setTestCard(prev => new Fact({ ...prev, date: newDate }));
    }

    function setInfo(event) {
      let newInfo = event.target.value;
      setTestCard(prev => new Fact({ ...prev, info: newInfo }));
    }

    function setImg(event) {
      let newImg = event.target.value;
      setTestCard(prev => new Fact({ ...prev, img: newImg }));
    }

    return(
      <section id="new">
        <h2>Add an Event</h2>
        <form id="addFactForm">
          <div className="formInputBlock">
            <div className="formItem">
              <label htmlFor="date">Year</label>
              <input 
                type="number" 
                name="date" 
                max={startingCard().year}
                onChange={setDate}
                defaultValue={testCard.year} />
            </div>
            <div className="formItem">
              <label htmlFor="info">Description of event</label>
              <input 
                type="text" 
                name="info" 
                onChange={setInfo}
                defaultValue={testCard.info} />
            </div>
            <div className="formItem">
              <label htmlFor="img">Complete URL of image (optional)</label>
              <input 
                type="url" 
                name="img" 
                onChange={setImg}
                defaultValue={testCard.img} />
            </div>
          </div>
          <section id="preview">
            <h3>Preview</h3>
            <CardPreview fact={testCard} />
          </section>
          <button type="button" id="add" onClick={newFact}>Add</button>
        </form>
      </section>
    );
  }

  function SaveButton() {
    return(
      <button id="save" type="button" onClick={saveTimeline}>Save</button>
    );
  }


  // TODO indicate save state: 
  // (1) metadata, (2) facts, (3) whole timeline on server
  function saveTimeline(event) {
    let action = timeline ? "Updated" : "Created";
    console.debug(`${action} timeline with title '${timeline.title}'`);
    
    setTimeline(new Timeline({ ...metadata, facts: facts }));
    setSaveReady(true);
  }

  function ResetButton() {
    return(
      <button id="reset" type="button" onClick={resetAllForms}>Reset</button>
    );
  }

  // TODO reset to last saved version on backend
  function resetAllForms() {
    if (window.confirm("Are you sure you want to discard changes to the current timeline? This action cannot be undone.")) {
      setTimeline(startingTimeline());
    }
  }

   
  useEffect(() => {
    async function postTimeline(user, token, timeline) {
      console.debug(timeline.facts);
      console.debug(timeline.json());
      let response = await fetch(`${User.SERVER}/timeline-full/`, {
        method: "POST",
        headers: new Headers({
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Token ${token}`
        }),
        body: timeline.json()
      });
      if (response.ok) {
        let json = await response.json();
        console.debug(json);
      } else {
        console.debug(`Problem creating timeline: Server status ${response.status}, ${response.statusText}`);
      }
    }
    if (saveReady) {
      console.debug("Ready to post timeline");
      console.debug(timeline);
      postTimeline(currentUser, userToken, timeline);
      setSaveReady(false);
    } 
  }, [saveReady, timeline, currentUser, userToken]);


  return(
    <main>
      <h1>Create a Chronoquiz</h1>
      <Instructions />
      <Chooser />
      <MetadataPanel />
      <CurrentFactsPanel />
      <NewFactForm />
      <SaveButton />
      <ResetButton />
    </main>
  );
}

