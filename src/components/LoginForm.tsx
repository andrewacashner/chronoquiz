import { useContext, useEffect } from "react";
import UserContext from "../store/UserContext";
import User from "../classes/User";

export default function LoginForm() {
  let userContext = useContext(UserContext);
  let dispatch = userContext.set;

  let currentUser   = userContext.get.currentUser;
  let userToken     = userContext.get.userToken;
  let authenticated = userContext.get.authenticated;

  function login(event) {
    event.preventDefault();
    let data = new FormData(event.target);
    let username = data.get("username");
    let password = data.get("password");

    dispatch({
      type: "user",
      payload: new User({
        username: username,
        password: password
      })
    });
  }

  useEffect(() => {
    async function doAuthenticate(user, token) {
      let exists = await user.exists();
      if (exists) {
        let token = await user.authenticate();
        if (token) {
          dispatch({
            type: "set",
            payload: {
              userToken: token,
              authenticated: true
            }
          });
        }
      } else {
        if (window.confirm("User not found. Register new user with these credentials?")) {
          console.debug("Ready to register");
          let test = await user.register();
          if (test) {
            doAuthenticate(user, token);
          } 
        } 
      }
    }
    if (currentUser && !currentUser.isEmpty && !authenticated) {
      doAuthenticate(currentUser, userToken);
    } else {
      console.debug("No user authenticated");
    }

  }, [currentUser, authenticated, userToken, dispatch]);

  function LoginForm() {
    return(
      <main>
        <h1>Log In</h1>
        <form id="login" onSubmit={login}>
          <div className="formInputBlock">
            <div className="formItem">
              <label htmlFor="username">Username</label>
              <input type="text" name="username" />
            </div>
            <div className="formItem">
              <label htmlFor="password">Password</label>
              <input type="password" name="password" />
            </div>
          </div>
          <button type="submit">Log In</button>
        </form>
      </main>
    );
  }

  function LogoutButton() {
    function logout() {
      dispatch({ type: "reset" });
    }

    return(
      <button type="button" onClick={logout}>Log Out</button>
    );
  }

  return(
    <>
      { authenticated ? <LogoutButton /> : <LoginForm /> }
    </>
  );
}


