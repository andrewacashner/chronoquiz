// Menu to choose which timeline to load (or create new)

import { useState, useContext, useEffect } from "react";
import Timeline from "../classes/Timeline";

import UserContext from "../store/UserContext";
import AdminContext from "../store/AdminContext";

export default function AdminChooser(): React.ReactElement {

  let userContext = useContext(UserContext);
  let authenticated    = userContext.get.authenticated;
  let currentUser      = userContext.get.currentUser;
  let userToken        = userContext.get.userToken;
  let timelineList     = userContext.get.timelineList;
  let dispatchTimeline = userContext.set;

  let adminContext = useContext(AdminContext);
  let update           = adminContext.get.updateTimelineList;
  let dispatchAdmin    = adminContext.set;

  function loadTimeline(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    let data = new FormData(event.target);
    let id = data.get("select-timeline");
    dispatchAdmin({ 
      type: "set", 
      payload: { timelineID: id }
    });
  }

  useEffect(() => {
    async function loadTimelineList(token: string): void {
      let list = await Timeline.listTimelines(token);
      if (list) {
        dispatchTimeline({ type: "list", payload: list });
      }
    }

    if (authenticated && update) {
      loadTimelineList(userToken);
      dispatchAdmin({ 
        type: "set",
        payload: { updateTimelineList: false }
      });
    } else {
      dispatchTimeline({ type: "list", payload: [] });
    }
  }, [authenticated, update, dispatchAdmin, dispatchTimeline, currentUser, userToken]);
  // TODO this is not being triggered by the 'update' state in the parent
  // component


  function timelineOption(timeline: Timeline): React.ReactElement {
    return(
      <option key={timeline.id} value={timeline.id}>{timeline.title}</option>
    );
  }

  // Change display of submit button whether creating or loading
  let [selection, setSelection] = useState("create");

  function updateSelection(event: React.FormEvent<HTMLFormElement>): void {
    setSelection(event.target.value);
  }

  let loadButtonText = (selection === "create") ? "Create" : "Load";

  return(
    <form id="chooser" onSubmit={loadTimeline}>
      <label htmlFor="select-timeline">Select a Timeline:</label>
      <select name="select-timeline" 
        defaultValue="create" 
        onChange={updateSelection}>
        <option value="create">Create New</option>
        { timelineList.map(timelineOption) }
      </select>
      <button type="submit">{ loadButtonText }</button>
    </form>
  );
}
