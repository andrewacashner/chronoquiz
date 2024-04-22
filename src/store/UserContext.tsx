import { createContext } from "react";

const UserContext = createContext({
  get: {},
  set: () => {}
});

export default UserContext;
