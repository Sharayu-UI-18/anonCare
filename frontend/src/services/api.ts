
export type HealthLanguage = 'English' | 'Hindi' | 'Marathi'

export interface AskRequest {
  question: string
  language?: HealthLanguage
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
  urgent: boolean
}

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000'
).replace(/\/+$/, '')

const ASK_ERROR_MESSAGE =
  "We couldn't connect to the health assistant right now. Please try again."

export async function askHealthQuestion(
  request: AskRequest
): Promise<AskResponse> {
  const response = await fetch(`${API_BASE_URL}/api/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...request,
      language: request.language ?? 'English',
    }),
  })

  if (!response.ok) {
    throw new Error(ASK_ERROR_MESSAGE)
  }

  return response.json() as Promise<AskResponse>
}
