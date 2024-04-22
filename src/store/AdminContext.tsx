import { createContext } from "react";

const AdminContext = createContext({
  get: {},
  set: () => {}
});

export default AdminContext;
