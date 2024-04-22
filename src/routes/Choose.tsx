import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import BackendRequest from "../classes/BackendRequest";
import TimelineList from "../components/TimelineList";

export default function Choose() {
  let [timelineList, setTimelineList] = useState([]);

  useEffect(() => {
    async function loadTimelineList() {
      let request = new BackendRequest({ url: "timelines/" , method: "GET" });
      let response = await request.fetch();
      if (response.ok) {
        let json = await response.json();
        setTimelineList(json);
      }
    }

    loadTimelineList();
  }, []);
  
  return(
    <main>
      <p className="instructions">Test your historical knowledge by placing fact cards on a chronological timeline</p>
      <p><Link to="/admin">Log in or sign up</Link> to create and share your own quizzes</p>

      <h1>Choose a Quiz</h1>
      <TimelineList data={timelineList} />
    </main>
  );
}
