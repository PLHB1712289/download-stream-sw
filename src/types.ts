export interface SWAction {
  type: "setup" | "push" | "close";
  data: any;
}

export interface SWResponse {
  type: "setup" | "push" | "close";
  data: any;
}
