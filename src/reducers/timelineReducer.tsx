import Timeline from "../classes/Timeline";

const defaultTimeline = new Timeline({
  title: '',
  description: '',
  keyword: [],
  creator: '',
  facts: []
});

function timelineReducer(state: Timeline, action: object) {
  let obj = action.payload;

  let newState = null;
  
  switch(action.type) {
    case "set":
      newState = new Timeline({ ...state, ...obj });
    break;

    case "reset":
      newState = defaultTimeline;
    break;

    case "addFact":
      newState = state.addFact(obj.fact);
    break;

    case "removeFact":
      newState = state.removeFact(obj.fact);
    break;

    case "addFacts":
      newState = state.addFacts(obj);
    break;

    default:
      newState = state; 
  }

  return newState;
}

export { timelineReducer, defaultTimeline };

