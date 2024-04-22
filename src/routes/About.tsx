export default function About() {
  return(
    <main>
      <h1>About</h1>
      <div className="prose">
        <section id="overview">
          <p>
            Chronoquiz is a game testing your knowledge of historical facts.
            Move the clue cards onto the timeline in the correct chronological order to earn points.
            You lose points when you guess wrong.
          </p>
          <p>
            You can play one of the premade timelines, or you can log in to create and share your own timelines.
          </p>
          <p>
            This game was created by Andrew Cashner based on an idea of Devin Burke and inspired by the Wikitrivia game.
            It uses the Javascript React framework for the front end and the Python Django framework with a SQLite database for the back end.
          </p>
        </section>
        <section id="json">
          <h1>Creating Your Own Timeline</h1>
          <section>
            <p>
              The game can read input files in JSON format with the following characteristics:
            </p>
            <ol>
              <li>The contents should be a single JSON array.</li>
              <li>Each item in the array should be a JSON object.</li>
              <li>Each object must have at least a <code>date</code> field and an <code>info</code> field. The date should be entered as a numeric year, and the info field is a brief description (too long and users will have to scroll on the card to read it).</li>
              <li>Dates must be entered as four-digit years. For dates BC, use negative numbers. If there are multiple events with the same year, users can put the events for that year on the timeline in any order.</li>
              <li>Each object may also include an optional <code>img</code> field with a URL to an image (online, not a local file). The thumbnail images on Wikipedia articles work well.</li>
            </ol>
            <p>
              Note that all items except numbers must be enclosed in quotation marks.
              A comma separates each key-value pair in the objects, and each object in the array.
            </p>
            <p>
              Here is an example timeline (<code>music.json</code>):
            </p>
            <blockquote>
              <pre>{`
[
  {
    "date": -2350,
    "info": "Enheduanna, high priestess of Ur in Sumeria, composes the world’s oldest written hymns",
    "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Enheduanna%2C_daughter_of_Sargon_of_Akkad.jpg"
  },
  {
    "date": 1943,
    "info": "Duke Ellington premieres “Black, Brown, and Beige” at Carnegie Hall",
    "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Duke_Ellington_-_publicity.JPG"
  },
  {
    "date": 2016,
    "info": "Beyoncé releases “Lemonade” as a visual album",
    "img": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Beyonce.jpg"
  }
]
                `}
              </pre>
            </blockquote>
          </section> 
          <section id="spreadsheet">
            <h2>Exporting Data from a Spreadsheet</h2>
            <p>
            Another option is to store your timeline data in a spreadsheet.
              There should be only three columns, headed <code>date</code>, <code>info</code>, and <code>img</code>.
            </p>
            <ul>
              <li>From Excel, you can export JSON directly.</li>
              <li>From Numbers or Google Sheets, you can export a CSV file and then use a converter like <a href="https://csvjson.com">csvjson</a> to convert that to JSON.</li>
            </ul>
            <p>
              Make sure the resulting JSON matches the format shown above.
            </p>
          </section>
        </section>

      </div>
    </main>
  );
}
