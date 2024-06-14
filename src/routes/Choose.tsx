import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import BackendRequest from "../classes/BackendRequest";
import TimelineList from "../components/TimelineList";
import Keywords from "../components/Keywords";

export default function Choose() {
  let [timelineList, setTimelineList] = useState([]);

  let [keywords, setKeywordList] = useState([]);

  useEffect(() => {
    async function loadTimelineList() {
      let request = new BackendRequest({ url: "timelines/", method: "GET" });
      let response = await request.fetch();
      if (response.ok) {
        let json = await response.json();
        setTimelineList(json);
      }
    }

    async function loadKeywordList() {
      let request = new BackendRequest({ url: "keywords/", method: "GET" });
      let response = await request.fetch();
      if (response.ok) {
        let json = await response.json();
        setKeywordList(json);
      }
    }

    loadTimelineList();
    loadKeywordList();
  }, []);
  
  return(
    <main>
      <p className="instructions">Test your historical knowledge by placing fact cards on a chronological timeline</p>
      <p><Link to="/admin">Log in or sign up</Link> to create and share your own quizzes</p>

      <h1>Choose a Quiz</h1>
      <h2>By Title</h2>
      <TimelineList data={timelineList} />

      <h2>By Topic</h2>
      <Keywords data={keywords} />

    </main>
  );
}
