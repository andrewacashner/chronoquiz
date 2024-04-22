import { defaultTimeline } from "./timelineReducer";

interface AdminState {
  timelineID: number,
  initialTimeline: Timeline,
  updateTimelineList: boolean,
  saveReady: boolean,
  refresh: boolean,
  hasUnsavedChanges: boolean
}

const defaultAdminState: AdminState = {
  // ID of timeline user wants to load
  timelineID: null,  

  initialTimeline: defaultTimeline,

  // Update the timeline select options?
  updateTimelineList: true,
  
  // Save client-side timeline to the backend DB?
  saveReady: false,
  
  // Update timeline display?
  refresh: true,

  // Does client-side timeline differ from version originally loaded from
  // backend server?  
  hasUnsavedChanges: false, 
};

function adminReducer(state: AdminState, action: object): AdminState {
  let obj = action.payload;
  let newState = null;

  switch(action.type) {
    case "set":
      newState = { ...state, ...obj };
    break;

    case "reset":
      newState = defaultAdminState;
    break;

    default:
      newState = state;
  }
  return newState;
}

export { adminReducer, defaultAdminState };
