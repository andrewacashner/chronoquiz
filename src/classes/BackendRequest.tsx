interface BackendRequestInput {
  url: string;
  method: string;
  token: string;
  bodyObject: object
}

export default class BackendRequest {
  url: string;
  method: string;
  bodyObject: object;
  authorization: string;

  constructor({ 
    url, method, bodyObject = null, token = null
  }: BackendRequestInput) {

    this.url = url
    this.method = method;
    this.authorization = token ? { Authorization: `Token ${token}` } : null;
    this.bodyObject = bodyObject;
  }

  static SERVER = process.env.REACT_APP_BACKEND_SERVER; 
  
  get fullUrl(): string {
    return `${BackendRequest.SERVER}/${this.url}`;
  }

  async fetch() {
    let body = this.bodyObject ? JSON.stringify(this.bodyObject) : null;

    let response = await fetch(this.fullUrl, {
      method: this.method,
      headers: new Headers({
        "Content-Type": "application/json",
        "Accept": "application/json",
        ...this.authorization
      }),
      body: body
    });
    return response;
  }
    
}
