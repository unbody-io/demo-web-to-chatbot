export enum StreamEventMessageType {
  Processing = "processing",
  Done = "done",
  Error = "error"
}

export type StreamEventData<S extends string, P extends Record<string, any>> = {
  status: S
  message: StreamEventMessageType
  payload?: P
}

export enum StreamEventTypes_Setup_Create {
  Init = "init",
  Indexing = "indexing",
  Crawling = "crawling",
  Context = "context",
  Finished = "finished",
  Error = "error",
}