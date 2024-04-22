import { useContext } from "react";
import UserContext from "../store/UserContext";

import LoginForm from "../components/LoginForm";
import AdminPanel from "../components/AdminPanel";

export default function Admin() {

  let userContext = useContext(UserContext);
  let authenticated = userContext.get.authenticated;

  return(
    <main>
      <LoginForm />
      { authenticated ?  <AdminPanel /> : null }
    </main>
  );
}
