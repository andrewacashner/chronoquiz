import { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import UserContext from "../store/UserContext";
import { debug } from "../lib/debug";
import User from "../classes/User";

export default function TimelineList({ data, type = "game", updateFn = null }) {
  let userContext = useContext(UserContext);
  let userToken =  userContext.get.userToken;
  let authenticated = userContext.get.authenticated;


  function AdminLink({ entry }) {
    let [isButtonShown, setIsButtonShown] = useState(false);

    let listButtonVisibility = isButtonShown ? "show" : "hide";

    const showButton = () => setIsButtonShown(true);
    const hideButton = () => setIsButtonShown(false);

    function DeleteButton() {

      let [itemToDelete, setItemToDelete] = useState(null)

      function deleteItem(event) {
        setItemToDelete(entry)
        console.log(`Deleting item with date ${entry.date}`);
      }

      useEffect(() => {
        async function sendDeleteRequest(item, token) {
          let response = await fetch(`${User.SERVER}/timelines/${item.id}/`, {
            method: "DELETE",
            headers: new Headers({
              "Authorization": `Token ${token}`
            })
          });

          if (response.ok) {
            let json = await response.json();
            debug(json);
            updateFn(true);
          } else {
            debug(`Could not delete timeline with id ${item.id}`);
          }
        }

        if (authenticated && itemToDelete === entry) {
          if (window.confirm("Are you sure you want to delete this quiz? (This action cannot be undone.)")) {
            sendDeleteRequest(itemToDelete, userToken);
            setItemToDelete(null);
          }
        }
      }, [itemToDelete])

      return(
        <button type="button" 
          className={listButtonVisibility} 
          onClick={deleteItem}>🗙</button>
      );
    }

    let href = `../game/${entry.id}`;

    return(
      <li key={entry.id} onMouseEnter={showButton} onMouseLeave={hideButton}>
        <Link to={href}>{entry.title}</Link>
        <DeleteButton />
      </li>
    );
  }
  
  function GameLink({ entry }) {
    let href = `../game/${entry.id}`;
    let creator = entry.creator ?? entry.user.username;
    let description = entry.description;

    return(
      <tr key={entry.id}>
        <td><Link to={href}>{entry.title}</Link></td>
        <td><code>{creator}</code></td>
        <td>{description}</td>
      </tr>
    );
  }

  let ThisLink = type === "admin" ? AdminLink : GameLink;

  return(
    <table className="index">
      <thead>
        <tr>
          <th>Title</th>
          <th>Creator</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
       {data.map(item => <ThisLink key={item.id} entry={item} />)}
     </tbody>
   </table>
  );
}
