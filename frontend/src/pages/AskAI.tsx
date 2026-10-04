import { useState, type FormEvent } from 'react'
import { LockKeyhole, Send } from 'lucide-react'
import Button from '../components/Button'
import Card from '../components/Card'
import PageHeader from '../components/PageHeader'
import { askHealthQuestion, type AskResponse } from '../services/api'

export default function AskAI() {
  const [question, setQuestion] = useState('')
  const [anonymous, setAnonymous] = useState(true)
  const [answer, setAnswer] = useState<AskResponse | null>(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setAnswer(null)
    setIsLoading(true)

    try {
      setAnswer(await askHealthQuestion({ question: question.trim(), anonymous }))
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <PageHeader eyebrow="Private guidance" title="Ask anonymously" description="Get general health information grounded in trusted sources. Your tracking history is never sent with your question." />
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
          <label className="anonymous-option">
            <input type="checkbox" checked={anonymous} onChange={(event) => setAnonymous(event.target.checked)} />
            Ask in Anonymous Mode
          </label>
          <p className="privacy-note">Only your question and Anonymous Mode setting are sent to the answer service. Cycle, mood, sleep, and symptom history stay on this device.</p>
          {error && <p className="form-error" role="alert">{error}</p>}
          <Button type="submit" disabled={isLoading || !question.trim()}>
            <Send size={16} />{isLoading ? 'Getting information…' : 'Ask anonymously'}
          </Button>
        </form>
      </Card>
      {answer && (
        <Card className="answer-card">
          <h2>General information</h2>
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
