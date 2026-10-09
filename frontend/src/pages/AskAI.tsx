
import { useState, type FormEvent } from 'react'
import { LockKeyhole, Send } from 'lucide-react'
import Button from '../components/Button'
import Card from '../components/Card'
import PageHeader from '../components/PageHeader'
import {
  askHealthQuestion,
  type AskResponse,
  type HealthLanguage,
} from '../services/api'

const UI_TEXT = {
  English: {
    disclaimer:
      'This information is for educational purposes only and is not a substitute for professional medical advice.',
    doctor:
      'Please consult a qualified healthcare professional for personalized advice.',
    urgent:
      'If you may be experiencing a medical emergency, seek emergency medical care immediately.',
    sources: 'Trusted Sources',
    heading: 'General information',
    pageEyebrow: 'Private guidance',
    pageTitle: 'Ask anonymously',
    pageDescription:
      'Get general health information grounded in trusted sources. Your tracking history is never sent with your question.',
    questionHeading: 'What is on your mind?',
    questionDescription:
      'Share a question in your own words. Don’t include your name or other identifying details.',
    languageLabel: 'Response language',
    questionLabel: 'Your health question',
    placeholder: 'e.g. What can cause changes in my cycle?',
    privacy:
      'Only your question and selected response language are sent to the health assistant. Cycle, wellness, and other tracking data stay on this device.',
    loading: 'Getting information…',
    submit: 'Ask anonymously',
    error:
      "We couldn't connect to the health assistant right now. Please try again.",
  },
  Hindi: {
    disclaimer:
      'यह जानकारी केवल शैक्षिक उद्देश्यों के लिए है और पेशेवर चिकित्सा सलाह का विकल्प नहीं है।',
    doctor:
      'व्यक्तिगत चिकित्सा सलाह के लिए किसी योग्य स्वास्थ्य विशेषज्ञ से परामर्श लें।',
    urgent:
      'यदि आपको चिकित्सा आपातकाल की आशंका है, तो तुरंत आपातकालीन चिकित्सा सहायता लें।',
    sources: 'विश्वसनीय स्रोत',
    heading: 'सामान्य जानकारी',
    pageEyebrow: 'निजी स्वास्थ्य मार्गदर्शन',
    pageTitle: 'गुमनाम रूप से पूछें',
    pageDescription:
      'विश्वसनीय स्रोतों पर आधारित सामान्य स्वास्थ्य जानकारी प्राप्त करें। आपके ट्रैकिंग इतिहास को आपके प्रश्न के साथ नहीं भेजा जाता।',
    questionHeading: 'आप क्या जानना चाहती हैं?',
    questionDescription:
      'अपने शब्दों में प्रश्न पूछें। अपना नाम या पहचान बताने वाली जानकारी साझा न करें।',
    languageLabel: 'उत्तर की भाषा',
    questionLabel: 'आपका स्वास्थ्य संबंधी प्रश्न',
    placeholder: 'उदाहरण: मेरे मासिक धर्म चक्र में बदलाव क्यों हो सकते हैं?',
    privacy:
      'केवल आपका प्रश्न और चुनी गई उत्तर की भाषा स्वास्थ्य सहायक को भेजी जाती है। मासिक धर्म, स्वास्थ्य और अन्य ट्रैकिंग डेटा इसी डिवाइस पर रहता है।',
    loading: 'जानकारी प्राप्त की जा रही है…',
    submit: 'गुमनाम रूप से पूछें',
    error:
      'अभी स्वास्थ्य सहायक से कनेक्ट नहीं हो पा रहा है। कृपया फिर से कोशिश करें।',
  },
  Marathi: {
    disclaimer:
      'ही माहिती केवळ शैक्षणिक उद्देशांसाठी आहे आणि व्यावसायिक वैद्यकीय सल्ल्याचा पर्याय नाही.',
    doctor:
      'वैयक्तिक वैद्यकीय सल्ल्यासाठी पात्र आरोग्यतज्ज्ञांचा सल्ला घ्या.',
    urgent:
      'वैद्यकीय आणीबाणीची शक्यता असल्यास त्वरित आपत्कालीन वैद्यकीय मदत घ्या.',
    sources: 'विश्वसनीय स्रोत',
    heading: 'सामान्य माहिती',
    pageEyebrow: 'खाजगी आरोग्य मार्गदर्शन',
    pageTitle: 'निनावीपणे प्रश्न विचारा',
    pageDescription:
      'विश्वसनीय स्रोतांवर आधारित सामान्य आरोग्य माहिती मिळवा. तुमचा ट्रॅकिंग इतिहास प्रश्नासोबत पाठवला जात नाही.',
    questionHeading: 'तुम्हाला काय जाणून घ्यायचे आहे?',
    questionDescription:
      'तुमचा प्रश्न स्वतःच्या शब्दांत विचारा. तुमचे नाव किंवा ओळख पटवणारी माहिती देऊ नका.',
    languageLabel: 'उत्तराची भाषा',
    questionLabel: 'तुमचा आरोग्यविषयक प्रश्न',
    placeholder: 'उदा. माझ्या मासिक पाळीच्या चक्रात बदल का होऊ शकतात?',
    privacy:
      'फक्त तुमचा प्रश्न आणि निवडलेली उत्तराची भाषा आरोग्य सहाय्यकाकडे पाठवली जाते. मासिक पाळी, आरोग्य आणि इतर ट्रॅकिंग डेटा याच डिव्हाइसवर राहतो.',
    loading: 'माहिती मिळवत आहे…',
    submit: 'निनावीपणे प्रश्न विचारा',
    error:
      'सध्या आरोग्य सहाय्यकाशी जोडता येत नाही. कृपया पुन्हा प्रयत्न करा.',
  },
} as const

export default function AskAI() {
  const [question, setQuestion] = useState('')
  const [language, setLanguage] = useState<HealthLanguage>('English')
  const [answer, setAnswer] = useState<AskResponse | null>(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const ui = UI_TEXT[language]

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedQuestion = question.trim()
    if (!trimmedQuestion) return

    setError('')
    setAnswer(null)
    setIsLoading(true)

    try {
      setAnswer(
        await askHealthQuestion({
          question: trimmedQuestion,
          language,
        })
      )
    } catch {
      setError(ui.error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <PageHeader
        eyebrow={ui.pageEyebrow}
        title={ui.pageTitle}
        description={ui.pageDescription}
      />

      <Card>
        <div className="card-top">
          <div>
            <h2>{ui.questionHeading}</h2>
            <p>{ui.questionDescription}</p>
          </div>
          <LockKeyhole className="card-icon" size={22} />
        </div>

        <form className="ask-form" onSubmit={handleSubmit}>
          <label className="field" htmlFor="response-language">
            <span>{ui.languageLabel}</span>
            <select
              id="response-language"
              value={language}
              onChange={(event) =>
                setLanguage(event.target.value as HealthLanguage)
              }
            >
              <option value="English">English</option>
              <option value="Hindi">हिन्दी (Hindi)</option>
              <option value="Marathi">मराठी (Marathi)</option>
            </select>
          </label>

          <label className="field" htmlFor="health-question">
            <span>{ui.questionLabel}</span>
            <textarea
              id="health-question"
              required
              maxLength={1000}
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder={ui.placeholder}
            />
          </label>

          <p className="privacy-note">{ui.privacy}</p>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" disabled={isLoading || !question.trim()}>
            <Send size={16} />
            {isLoading ? ui.loading : ui.submit}
          </Button>
        </form>
      </Card>

      {answer && (
        <Card className="answer-card">
          <h2>{ui.heading}</h2>

          {answer.urgent && (
            <p className="urgent-guidance" role="alert">
              {ui.urgent}
            </p>
          )}

          <p className="answer-text">{answer.answer}</p>

          {answer.sources.length > 0 && (
            <div className="answer-sources">
              <h3>{ui.sources}</h3>
              <ul>
                {answer.sources.map((source) => (
                  <li key={source.url}>
                    <a href={source.url} target="_blank" rel="noreferrer">
                      {source.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {answer.should_consult_doctor && (
            <p className="doctor-guidance">{ui.doctor}</p>
          )}

          <p className="answer-disclaimer">{ui.disclaimer}</p>
        </Card>
      )}
    </>
  )
}
