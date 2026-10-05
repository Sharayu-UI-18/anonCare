import { ArrowLeft, ArrowRight, LockKeyhole, ShieldCheck } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import Card from '../components/Card'
import { saveUserProfile, type UserProfile } from '../services/localStorage'

const regularOptions = [['yes', 'Yes'], ['no', 'No'], ['sometimes', 'Sometimes'], ['not_sure', 'Not sure'], ['prefer_not_to_say', 'Prefer not to say']] as const
const painOptions = [['never', 'Never'], ['rarely', 'Rarely'], ['sometimes', 'Sometimes'], ['often', 'Often'], ['almost_every_period', 'Almost every period'], ['prefer_not_to_say', 'Prefer not to say']] as const
const flowOptions = [['light', 'Light'], ['medium', 'Medium'], ['heavy', 'Heavy'], ['varies', 'Varies significantly'], ['not_sure', 'Not sure'], ['prefer_not_to_say', 'Prefer not to say']] as const
const moodOptions = [['never', 'Never'], ['sometimes', 'Sometimes'], ['often', 'Often'], ['almost_every_cycle', 'Almost every cycle'], ['not_sure', 'Not sure'], ['prefer_not_to_say', 'Prefer not to say']] as const
const pregnancyOptions = [['no', 'No'], ['pregnant', 'Pregnant'], ['recently_postpartum', 'Recently postpartum'], ['prefer_not_to_say', 'Prefer not to say']] as const
const symptomOptions = ['Cramps', 'Headaches', 'Back pain', 'Bloating', 'Breast tenderness', 'Acne', 'Fatigue', 'Mood changes', 'Nausea', 'None', 'Prefer not to say']
const trackingOptions = ['Periods', 'Pain', 'Mood', 'Energy', 'Sleep', 'Appetite/cravings', 'Symptoms', "General women's health", 'Other']
type FormState = Omit<UserProfile, 'anonymousId' | 'createdAt'>

function ChoiceGroup({ label, value, options, onChange }: { label: string; value?: string; options: readonly (readonly [string, string])[]; onChange: (value: string) => void }) {
  return <fieldset><legend>{label}</legend><div className="choice-row">{options.map(([option, text]) => <label className="choice" key={option}><input type="radio" name={label} checked={value === option} onChange={() => onChange(option)} />{text}</label>)}</div></fieldset>
}

function MultiChoice({ label, values = [], options, onChange }: { label: string; values?: string[]; options: readonly string[]; onChange: (values: string[]) => void }) {
  function toggle(option: string) { onChange(values.includes(option) ? values.filter((item) => item !== option) : [...values, option]) }
  return <fieldset><legend>{label}</legend><div className="choice-row">{options.map((option) => <label className="choice" key={option}><input type="checkbox" checked={values.includes(option)} onChange={() => toggle(option)} />{option}</label>)}</div></fieldset>
}

export default function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [values, setValues] = useState<FormState>({})
  const update = (changes: Partial<FormState>) => setValues((current) => ({ ...current, ...changes }))
  function finish() { const profile = saveUserProfile(values); navigate('/dashboard', { replace: true, state: { anonymousId: profile.anonymousId } }) }
  function handleSubmit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); if (step === 3) finish(); else setStep((current) => current + 1) }
  return <div className="onboarding-page"><div className="onboarding-shell"><Link to="/" className="brand"><span className="brand-mark">✦</span>HerHealth</Link><Card className="onboarding-card"><div className="onboarding-intro"><div className="onboarding-icon"><ShieldCheck size={22} /></div><div><div className="eyebrow">Private setup · Step {step} of 3</div><h1>Let's personalize your HerHealth experience</h1><p>You don't need to share your name, email, or phone number. These questions are optional and help personalize your experience.</p></div></div><div className="progress-track" aria-label={`Step ${step} of 3`}><span className="progress-fill" style={{ width: `${(step / 3) * 100}%` }} /></div><form className="onboarding-form" onSubmit={handleSubmit}>
      {step === 1 && <><label className="field" htmlFor="age">How old are you? <span className="field-hint">optional</span><input id="age" type="number" min="1" max="120" value={values.age ?? ''} onChange={(event) => update({ age: event.target.value ? Number(event.target.value) : undefined })} /></label><ChoiceGroup label="Are your periods usually regular?" value={values.periodsRegular} options={regularOptions} onChange={(value) => update({ periodsRegular: value as UserProfile['periodsRegular'] })} /></>}
      {step === 2 && <><ChoiceGroup label="Do you usually experience significant pain during your periods?" value={values.periodPain} options={painOptions} onChange={(value) => update({ periodPain: value as UserProfile['periodPain'] })} /><ChoiceGroup label="How would you describe your usual period flow?" value={values.periodFlow} options={flowOptions} onChange={(value) => update({ periodFlow: value as UserProfile['periodFlow'] })} /><MultiChoice label="What symptoms do you commonly experience around your period?" values={values.periodSymptoms} options={symptomOptions} onChange={(periodSymptoms) => update({ periodSymptoms })} /><ChoiceGroup label="Have you noticed significant mood changes around your menstrual cycle?" value={values.cycleMoodChanges} options={moodOptions} onChange={(value) => update({ cycleMoodChanges: value as UserProfile['cycleMoodChanges'] })} /></>}
      {step === 3 && <><ChoiceGroup label="Are you currently pregnant or recently postpartum?" value={values.pregnancyStatus} options={pregnancyOptions} onChange={(value) => update({ pregnancyStatus: value as UserProfile['pregnancyStatus'] })} /><MultiChoice label="What would you like HerHealth to help you track?" values={values.trackingPreferences} options={trackingOptions} onChange={(trackingPreferences) => update({ trackingPreferences })} /></>}
      <div className="onboarding-actions"><Button type="button" variant="ghost" disabled={step === 1} onClick={() => setStep((current) => current - 1)}><ArrowLeft size={16} />Back</Button><button type="button" className="skip-link" onClick={finish}>Skip all &amp; Start Privately</button><Button type="submit">{step === 3 ? 'Start Privately' : 'Next'}<ArrowRight size={16} /></Button></div>
    </form><button className="skip-secondary" type="button" onClick={finish}>Skip for now</button><p className="privacy-note"><LockKeyhole size={15} />Your answers stay in this browser and are never sent to the backend or AI assistant.</p></Card></div></div>
}