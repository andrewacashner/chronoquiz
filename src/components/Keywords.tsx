import { Link } from "react-router-dom";

export default function Keywords({ data }) {

  function timelineLink({ id, title }) {
    return(
      <Link to={`../game/${id}/`}>{title}</Link>
    );
  }

  function listTimelineLinks(timelines) {
    return timelines.map((t, index) => 
                         [ index > 0 && ", ",
                           timelineLink(t) ]);
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
