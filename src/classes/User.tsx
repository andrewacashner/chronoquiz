import debug from "../lib/debug";
import BackendRequest from "../classes/BackendRequest";

// TODO could you include the token as a member?
interface UserInput {
  username: string,
  password: string,
} 

export default class User {
  username: string;
  password: string;

  constructor({ username = "", password = "", }: UserInput = {}) {
    this.username = username;
    this.password = password;
  }

  get isEmpty(): boolean {
    return (this.username === "" && this.password === "");
  }

  profile(): object {
    return {
      username: this.username,
      password: this.password
    };
  }

  json(): string {
    return JSON.stringify(this.profile());
  }

  async exists(): boolean {
    let answer = false;
    let request = new BackendRequest({
      url: "check_user/", 
      method: "POST", 
      bodyObject: this.profile()
    });

    let response = await request.fetch();

    if (response.ok) {
      answer = true;
    } else {
      debug("User not found");
    }
    return answer;
  }

  async register(): boolean {
    let answer = false;
    let request = new BackendRequest({
      url: "register/", 
      method: "POST", 
      bodyObject: this.profile()
    });
    let response = await request.fetch();

    if (response.ok) {
      answer = true;
    } else {
      debug("Could not register user");
    }
    return answer;
  }

  async authenticate(): string {
    let token = null;
    let request = new BackendRequest({
      url: "login/", 
      method: "POST", 
      bodyObject: this.profile()
    });

    let response = await request.fetch();

    if (response.ok) {
      let json = await response.json();
      token = json.token;
      debug(`Authenticated user ${this.username}`);
    } else {
      debug(`Problem authenticating user ${this.username}: Response status ${response.status}, ${response.statusText}`);
    }
    return token;
  }

}
