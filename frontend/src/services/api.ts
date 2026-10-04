export interface AskRequest {
  question: string
}

export interface AskResponse {
  answer: string
  disclaimer?: string
}

export type AskEndpoint = '/api/ask'
