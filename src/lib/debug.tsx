const DEBUG = process.env.REACT_APP_DEBUG; 

export function debug(msg: any): void {
  if (DEBUG) {
    console.debug(msg);
  }
}

