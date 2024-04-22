const DEBUG = true;
// const DEBUG = process.env.REACT_APP_DEBUG; // TODO doesn't work

export default function debug(msg: any): void {
  if (DEBUG) {
    console.debug(msg);
  }
}
