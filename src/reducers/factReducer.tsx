import Fact from "../classes/Fact";

const defaultFact = new Fact({
  date: new Date(),
  info: "Description", 
  img: "https://picsum.photos/200.jpg"
});

function factReducer(state: Fact, action: object): Fact {
  let obj = action.payload;
  let newState = null;

  switch(action.type) {
    case "set":
      newState = new Fact({ ...state, ...obj });
    break;

    case "reset":
      newState = defaultFact;
    break;

    default:
      newState = state;
  };

  return newState;
}

export { factReducer, defaultFact };
