import { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";

import UserContext from "../store/UserContext";
import Fact from "../classes/Fact";

export default function UploadForm({ dispatch }) {
  let userContext = useContext(UserContext);
  let userToken = userContext.get.userToken;

  let [uploadFile, setUploadFile] = useState(null);

  function handleUpload(event) {
    event.preventDefault();
    let infile = event.target.upload.files[0];
    setUploadFile(infile);
  }

  useEffect(() => {
    // TODO remove duplication of code (this may not be needed when reading
    // from server)
    // - also, skip duplicates when adding
    function isInputValid(json) {
      return Array.isArray(json) && 
        json.length > 0 &&
        json.every(i => ("date" in i) && ("info" in i));
    }

    async function loadUserTimeline(token, file) {
      let text = await file.text();
      let json = JSON.parse(text);

      if (isInputValid(json)) {
        console.debug("Valid input");
        console.debug(json);
        let facts = json.map(item => Fact.newFromYear(item));
        console.debug(facts);
        dispatch({
          type: "addFacts",
          payload: facts
        });
      } else {
        console.debug("Invalid input");
      }
    }

    if (uploadFile) {
      loadUserTimeline(userToken, uploadFile);
    }
  }, [uploadFile, dispatch, userToken]);

  return(
    <details>
      <summary>Upload Quiz Items</summary>
      <section id="upload">
        <p>Upload a a list of quiz facts in JSON format (see <Link to="/about">instructions</Link>)</p>

        <form id="upload-form" onSubmit={handleUpload}>
          <input type="file" name="upload" accept=".json" />
          <button type="submit">Upload</button>
        </form>
      </section>
    </details>
  );
}

