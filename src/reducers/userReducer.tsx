import User from "../classes/User";
import { debug } from "../lib/debug";

interface UserState {
  currentUser:    User,
  authenticated:  boolean
  userToken:      string | null,
  timelineList:   array<Timeline>
}

const defaultUserState: UserState = {
  currentUser:    new User(),
  authenticated:  false,
  userToken:      null,    // Used for token authentication with backend
  timelineList:   []
}

function userReducer(state: UserState, action: object): UserState {
  debug(action);
  debug(state);

  let obj = action.payload;
  let newState = null;

  switch(action.type) {
    case "set":
      newState = { ...state, ...obj };
    break;

    case "user":
      newState = { ...state, currentUser: obj };
    break;

    case "list":
      newState = { ...state, timelineList: [...obj] };
    break;

    case "reset":
      newState = defaultUserState;
    break;

    default:
      newState = state;
  }

  return newState;
}

export { userReducer, defaultUserState };


