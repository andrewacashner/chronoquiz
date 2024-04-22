import { NavLink } from "react-router-dom";

export default function Navigation() {
  return(
    <nav>
      <ul>
        <li><NavLink to="/game">Play</NavLink></li>
        <li><NavLink to="/about">About</NavLink></li>
        <li><NavLink to="/admin">Account</NavLink></li>
      </ul>
    </nav>
  );
}

