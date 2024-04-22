import React from "react";
import "./App.css";

import { useReducer } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/shared/Layout";
import About from "./routes/About";
import Admin from "./routes/Admin";
import Choose from "./routes/Choose";
import Chronoquiz from "./routes/Chronoquiz";

import UserContext from "./store/UserContext";

import { userReducer, defaultUserState } from "./reducers/userReducer";

function App() {

  let [userState, dispatchUser] = useReducer(userReducer, defaultUserState);

  let userContext = {
    get: userState,
    set: dispatchUser
  };

  return (
    <UserContext.Provider value={userContext}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Choose/>} />
            <Route path="/game/:gameId" element={<Chronoquiz />} />
            <Route path="/about" element={<About />} />
            <Route path="/admin" element={<Admin />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </UserContext.Provider>
  );
}

export default App;
