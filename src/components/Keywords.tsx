import { Link } from "react-router-dom";
import { interpolate } from "../lib/utilities";

export default function Keywords({ data }) {

  function timelineLink({ id, title }) {
    return(
      <Link to={`../game/${id}/`}>{title}</Link>
    );
  }

  function listTimelineLinks(timelines) {
    return interpolate(timelines.map(timelineLink), ", ");
  }

  return(
    <table className="index">
      <thead>
        <tr><th>Keyword</th><th>Timelines</th></tr>
      </thead>
      <tbody>
      {Object.entries(data).map(([keyword, timelines]) =>
        <tr key={keyword}>
          <td>{keyword}</td>
          <td>{listTimelineLinks(timelines)}</td>
      </tr>)}
    </tbody>
  </table>
  );
}
