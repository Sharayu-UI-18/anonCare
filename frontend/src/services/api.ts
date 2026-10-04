export interface AskRequest {
  question: string
  anonymous: boolean
}

export interface AskSource {
  title: string
  url: string
}

export interface AskResponse {
  answer: string
  sources: AskSource[]
  disclaimer: string
  should_consult_doctor: boolean
}

export type AskEndpoint = '/api/ask'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

export async function askHealthQuestion(request: AskRequest): Promise<AskResponse> {
  const response = await fetch(`${API_BASE_URL}/api/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error(
      response.status === 503 || response.status === 502
        ? 'The answer service is temporarily unavailable. Please try again shortly.'
        : 'Your question could not be submitted. Please try again.',
    )
  }

  return response.json() as Promise<AskResponse>
}
