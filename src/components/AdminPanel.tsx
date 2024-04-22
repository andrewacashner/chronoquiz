import { useState, useContext, useEffect, useReducer } from "react";
import { Navigate } from "react-router-dom";

import debug from "../lib/debug";

import BackendRequest from "../classes/BackendRequest";
import User from "../classes/User";
import Fact from "../classes/Fact";
import Timeline from "../classes/Timeline";

import AdminChooser from "./AdminChooser";
import UploadForm from "./UploadForm";

import UserContext from "../store/UserContext";
import AdminContext from "../store/AdminContext";

import { timelineReducer, defaultTimeline } from "../reducers/timelineReducer";
import { factReducer, defaultFact } from "../reducers/factReducer";
import { adminReducer, defaultAdminState } from "../reducers/adminReducer";
import updateReducer from "../reducers/updateReducer";

export default function AdminPanel(): React.ReactElement {

  let userContext = useContext(UserContext);
  let authenticated = userContext.get.authenticated;
  let currentUser   = userContext.get.currentUser;
  let userToken     = userContext.get.userToken;

  // Current timeline on client side
  let [timelineState, dispatchTimeline] = useReducer(timelineReducer, defaultTimeline);

  // Current new fact card
  let [factState, dispatchFact] = useReducer(factReducer, defaultFact);

  // Set a single state field from form input
  const updateTimeline = updateReducer(dispatchTimeline);
  const updateFact = updateReducer(dispatchFact);

  // MONITOR FOR UNSAVED CHANGES
  // (see adminReducer)
  //  - timelineID (number), initialTimeline (Timeline)
  //  - updateTimelineList, saveReady, refresh, adminState.hasUnsavedChanges (booleans)
  let [adminState, dispatchAdmin] = useReducer(adminReducer, defaultAdminState);

  let adminContext = {
    get: adminState,
    set: dispatchAdmin
  };
  
  // When a timeline is loaded or changed, record whether there are unsaved
  // changes (current timeline differs from initial timeline loaded)
  useEffect(() => {
    if (adminState.initialTimeline) { debug(adminState.initialTimeline); }
    if (timelineState) { debug(timelineState); }
    
    let status = (timelineState && adminState.initialTimeline
                  && !timelineState.equals(adminState.initialTimeline));

    dispatchAdmin({
      type: "set",
      payload: { hasUnsavedChanges: status }
    });
  }, [timelineState, adminState.initialTimeline]);


  // GET LIST OF USER TIMELINES
  // LOAD A TIMELINE FROM BACKEND
  // Trigger: timelineID set when user selects timeline to load or create
  // Effects: 
  //     - update timelineState, initialTimeline;
  //     - toggle: 
  //         - updateTimelineList -> true, 
  //         - refresh -> false, 
  //         - adminState.hasUnsavedChanges -> false
  useEffect(() => {
    async function loadTimeline(user: User, id: number, token: string): void {
      debug(`Loading timeline id ${adminState.timelineID}`);

      let newTimeline = await Timeline.newFromBackend(id, token);
      if (newTimeline) {
        dispatchTimeline({ 
          type: "set", 
          payload: newTimeline 
        });
        dispatchAdmin({ 
          type: "set", 
          payload: { initialTimeline: newTimeline }
        });
      } 
    }

    if (adminState.timelineID) {
      if (!adminState.hasUnsavedChanges 
            || window.confirm("Your quiz has unsaved changes. Do you want to discard the changes and reload the quiz?")) {

        if (adminState.timelineID === "create") {
          dispatchTimeline({ type: "reset" });
        } else {
          loadTimeline(currentUser, adminState.timelineID, userToken);
        }
        dispatchAdmin({
          type: "set",
          payload: {
            refresh: false,
            hasUnsavedChanges: false
          }
        });
      }
    }
  }, [adminState.timelineID, currentUser, userToken, adminState.refresh]);
  // TODO fix or silence warning about missing dependency,
  // adminState.hasUnsavedChanges

  function PageInstructions(): React.ReactElement {
    return(
      <p className="instructions">Your data will not be saved until you click Save.</p>
    );
  }

  function MetadataPanel(): React.ReactElement {
    let creator = (timelineState.creator === "") 
                  ? currentUser.username 
                  : timelineState.creator;

    return(
      <section id="metadata">
        <h2>Metadata</h2>
        <form className="timelinePanel">
          <div className="formInputBlock">
            <div className="formItem">
              <label htmlFor="title">Title</label>
              <input type="text" name="title" 
                onBlur={updateTimeline("title")}
                defaultValue={timelineState.title} />
            </div>
            <div className="formItem">
              <label htmlFor="description">Description</label>
              <input type="text" name="description" 
                onBlur={updateTimeline("description")}
                defaultValue={timelineState.description} />
            </div>
            <div className="formItem">
              <label htmlFor="keywords">Keywords (separated with semicolons)</label>
              <input type="text" name="keywords" 
                onBlur={updateTimeline("keywords", Timeline.parseKeywords)}
                defaultValue={timelineState.keywordString} />
            </div>
            <div className="formItem">
              <label htmlFor="creator">Creator (for public display; default: your username)</label>
              <input type="text" name="creator" 
                onBlur={updateTimeline("creator")}
                defaultValue={creator}/>
            </div>
          </div>
        </form>
      </section>
    );
  }

  function CurrentFactsPanel(): React.ReactElement {

    function currentFact(item: Fact): React.ReactElement {

      function deleteFact(event: React.MouseEvent<HTMLInputElement>): void {
        if (window.confirm("Are you sure you want to delete the current fact?")) {
          debug(`Delete item (date ${item.date.getFullYear()})`);
          dispatchTimeline({ 
            type: "removeFact",
            payload: { fact: item }
          });
        }
      }

      function editFact(event: React.MouseEvent<HTMLInputElement>): void {
        debug(`Edit item (date ${item.date.getFullYear()})`);
        dispatchFact({
          type: "set",
          payload: item
        });
        dispatchTimeline({ 
          type: "removeFact",
          payload: { fact: item }
        });
      }

      return(
        <tr key={crypto.randomUUID()}>
          <td>
            <div className="FactListControls">
              <button type="button" onClick={editFact}>Edit</button>
              <button type="button" onClick={deleteFact}>Delete</button>
            </div>
          </td>
          <td>{String(item.year)}</td>
          <td>{item.info}</td>
          <td>{item.img}</td>
        </tr>
      );
    }

    function TimelineInstructions(): React.ReactElement {
      return(
        <>
          <p className="instructions">Enter timeline events manually or upload the data using the forms below</p>
          <UploadForm dispatch={dispatchTimeline} />
        </>
      );
    }

    return(
      <section id="currentTimeline">
        <h2>Current Timeline Events</h2>
        <TimelineInstructions />
        <table className="timeline">
          <thead>
            <tr>
              <th>Controls</th>
              <th>Year</th>
              <th>Description</th>
              <th>Image URL</th>
            </tr>
          </thead>
          <tbody>
            { timelineState.facts.map(currentFact) }
          </tbody>
        </table>
      </section>
    );
  }

  function NewFactForm(): React.ReactElement {

    function newFact(event: React.FormEvent<HTMLFormElement>) {
      if (factState.date && factState.info) {
        dispatchTimeline({
          type: "addFact",
          payload: { fact: factState }
        });
        debug("Added fact to timeline");
        dispatchFact({ type: "reset" });
      }
    }
    
    function CardPreview({ fact: Fact }): React.ReactElement {
      return(
        <div className="card" data-when={factState.year} data-noselect="noselect">
          <span className="date">{factState.year}</span>
          <img alt={factState.img} src={factState.img} />
          <span className="info">{factState.info}</span>
        </div>
      );
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
                max={defaultFact.year}
                onBlur={updateFact("date", Fact.dateFromYear)}
                defaultValue={factState.year} />
            </div>
            <div className="formItem">
              <label htmlFor="info">Description of event</label>
              <input 
                type="text" 
                name="info" 
                onBlur={updateFact("info")}
                defaultValue={factState.info} />
            </div>
            <div className="formItem">
              <label htmlFor="img">Complete URL of image (optional)</label>
              <input 
                type="url" 
                name="img" 
                onBlur={updateFact("img")}
                defaultValue={factState.img} />
            </div>
          </div>
          <section id="preview">
            <h3>Preview</h3>
            <CardPreview fact={factState} />
          </section>
          <button type="button" id="add" onClick={newFact}>Add</button>
        </form>
      </section>
    );
  }

  function activeStyle(isActive: boolean): string {
    return isActive ? "active" : "inactive";
  }
  
  function SaveButton(): React.ReactElement {
    return(
      <button 
        className={activeStyle(adminState.hasUnsavedChanges)} 
        id="save" 
        type="button" 
        onClick={saveTimeline}>Save</button>
    );
  }

  // Send current timeline state to backend to save
  function saveTimeline(event: React.FormEvent<HTMLFormElement>): void {
    let action = timelineState ? "Updated" : "Created";
    debug(`${action} timeline with title '${timelineState.title}'`);
    dispatchAdmin({
      type: "set",
      payload: { saveReady: true }
    });
  }

  useEffect(() => {
    async function postTimeline(
      user: User, 
      token: string, 
      timeline: Timeline
    ): void {

      debug(timeline.facts);
      debug(timeline.json());

      let request = new BackendRequest({
        url: "timeline-full/",
        method: "POST",
        token: token,
        bodyObject: timeline.json()
      });

      let response = await request.fetch();

      if (response.ok) {
        let json = await response.json();
        debug(json);
      } else {
        debug(`Problem creating timeline: Server status ${response.status}, ${response.statusText}`);
      }
    }

    if (adminState.saveReady) {
      debug("Ready to post timeline");
      debug(timelineState);
      postTimeline(currentUser, userToken, timelineState);
      dispatchAdmin({ 
        type: "set", 
        payload: {
          updateTimelineList: true,
          saveReady: false,
          hasUnsavedChanges: false
        }
      });
    } 
  }, [adminState.saveReady, timelineState, currentUser, userToken]);
  
  function DeleteTimelineButton(): React.ReactElement {
    let [timelineToDelete, setTimelineToDelete] = useState(null);

    function deleteTimeline(): void {
      let msg = "Are you sure you want to delete this quiz? All of its fact cards will be lost. This action cannot be undone."

      if (window.confirm(msg)) {
        debug(adminState.timelineID);
        setTimelineToDelete(adminState.timelineID);
      }
    }

    useEffect(() => {
      async function requestDeletion(
        timelineID: number, 
        token: string
      ): boolean {
        let result = false;
        let request = new BackendRequest({
          url: `timelines/${timelineID}/`,
          method: "DELETE",
          token: token
        });

        let response = await request.fetch();

        if (response.ok) {
          let json = await response.json();
          debug(json);
          dispatchAdmin({ 
            type: "set",
            payload: { updateTimelineList: true } 
          });
          result = true;
        } else {
          debug(`Could not delete timeline with id ${timelineID}: Server status ${response.status}, ${response.statusText}`);
          result = false;
        }
        return result;
      }

      if (timelineToDelete !== null) {
        debug(`Deleting timeline with id ${timelineToDelete}`);

        if (adminState.timelineID === "create") {
          dispatchTimeline({ type: "reset" });
        } else {
          let deleted = requestDeletion(timelineToDelete, userToken);
          if (deleted) {
            dispatchTimeline({ type: "reset" });
            dispatchTimeline({ 
              type: "set", 
              payload: { updateTimelineList: true }
            });
          }
        }

        setTimelineToDelete(null);
      }
    }, [timelineToDelete]);

    let msg = (adminState.timelineID === "create") 
              ? "Reset Quiz" : "Delete Quiz";

    return(
      <button id="deleteTimeline" type="button" onClick={deleteTimeline}>{ msg }</button>
    );
  }

  function DiscardChangesButton(): React.ReactElement {
    function discardChanges(event: React.MouseEvent<HTMLInputElement>): void {
      dispatchAdmin({
        type: "set",
        payload: { refresh: true }
      });
    }

    return(
      <button 
        type="button" 
        className={activeStyle(adminState.hasUnsavedChanges)} onClick={discardChanges}>Discard Changes</button>
    );
  }

  function Controls(): React.ReactElement {
    return(
      <div className="controls">
        <SaveButton />
        <DiscardChangesButton />
        <DeleteTimelineButton />
      </div>
    );
  }

  if (authenticated) {
    return(
      <main>
        <h1>Manage Your Quizzes</h1>
        <PageInstructions />
        <AdminContext.Provider value={ adminContext }>
          <AdminChooser />
          <MetadataPanel />
          <CurrentFactsPanel />
          <NewFactForm />
          <Controls />
        </AdminContext.Provider>
      </main>
    );
  } else {
    return(
      <Navigate to="/login" />
      );
  }
}

