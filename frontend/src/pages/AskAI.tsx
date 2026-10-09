import { useState, type FormEvent } from 'react'
import { LockKeyhole, Send } from 'lucide-react'
import Button from '../components/Button'
import Card from '../components/Card'
import PageHeader from '../components/PageHeader'
import { buildPersonalContext, getContextOptIn, setContextOptIn } from '../services/personalContext'
import { askHealthQuestion, type AskResponse } from '../services/api'

export default function AskAI() {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState<AskResponse | null>(null)
  const [error, setError] = useState('')
  const [shareContext, setShareContext] = useState(getContextOptIn)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedQuestion = question.trim()
    if (!trimmedQuestion) return

    setError('')
    setAnswer(null)
    setIsLoading(true)

    try {
      setAnswer(await askHealthQuestion({ question: trimmedQuestion, ...(shareContext ? { context: buildPersonalContext() } : {}) }))
    } catch {
      setError("We couldn't connect to the health assistant right now. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <PageHeader eyebrow="Private guidance" title="Ask anonymously" description="Get general health information grounded in trusted sources. Your tracking history is never sent. You can optionally share a coarse summary." />
      <Card>
        <div className="card-top">
          <div>
            <h2>What is on your mind?</h2>
            <p>Share a question in your own words. Don’t include your name or other identifying details.</p>
          </div>
          <LockKeyhole className="card-icon" size={22} />
        </div>
        <form className="ask-form" onSubmit={handleSubmit}>
          <label className="field" htmlFor="health-question">
            <span>Your health question</span>
            <textarea
              id="health-question"
              required
              maxLength={1000}
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="e.g. What can cause changes in my cycle?"
            />
          </label>
          <label className="field-checkbox">
            <input
              type="checkbox"
              checked={shareContext}
              onChange={(event) => { setShareContext(event.target.checked); setContextOptIn(event.target.checked) }}
            />
            <span>Personalize with a general summary (e.g. cycle phase, this week’s average sleep, energy and mood). No dates, notes, or raw logs are shared.</span>
          </label>
          <p className="privacy-note">{shareContext ? 'Your question plus a coarse summary derived on this device is sent. Identifiers like emails, phone numbers and your anonymous ID are removed.' : 'Only your question is sent to the health assistant. Cycle, wellness, and other tracking data stay on this device.'}</p>
          {error && <p className="form-error" role="alert">{error}</p>}
          <Button type="submit" disabled={isLoading || !question.trim()}>
            <Send size={16} />{isLoading ? 'Getting information…' : 'Ask anonymously'}
          </Button>
        </form>
      </Card>
      {answer && (
        <Card className="answer-card">
          <h2>General information</h2>
          {answer.urgent && (
            <p className="urgent-guidance" role="alert">
              Your symptoms may need urgent attention. Please seek immediate medical care or contact your local emergency services now.
            </p>
          )}
          <p className="answer-text">{answer.answer}</p>
          {answer.sources.length > 0 && (
            <div className="answer-sources">
              <h3>Trusted sources</h3>
              <ul>
                {answer.sources.map((source) => (
                  <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.title}</a></li>
                ))}
              </ul>
            </div>
          )}
          {answer.should_consult_doctor && <p className="doctor-guidance">Consider contacting a healthcare professional for advice about your concern.</p>}
          <p className="answer-disclaimer">{answer.disclaimer}</p>
        </Card>
      )}
    </>
  )
}
