import { ArrowLeft, ArrowRight, BadgeCheck, Building2, CalendarDays, CheckCircle2, Clock3, LockKeyhole, ShieldCheck, Stethoscope } from 'lucide-react'
import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import Card from '../components/Card'
import PageHeader from '../components/PageHeader'
import { getDoctorDraft, getRegisteredDoctor, saveDoctorDraft, saveRegisteredDoctor, saveDoctorSession, type ConsultationType, type DoctorProfessionalProfile, type DoctorRegistration, type DoctorSpecialization, type RegisteredDoctor } from '../services/localStorage'

const specializations: DoctorSpecialization[] = ['Gynecology', 'Obstetrics', 'Reproductive Health', 'Mental Wellness', 'Dermatology', 'Nutrition', 'Other']
const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const defaultRegistration: DoctorRegistration = { fullName: '', registrationYear: new Date().getFullYear() - 5, nmcRegistrationNumber: '', stateMedicalCouncil: '' }
const defaultProfile: DoctorProfessionalProfile = { specialization: 'Gynecology', qualifications: '', experience: 0, bio: '', clinicName: '', clinicAddress: '', city: '', openingTime: '09:00', closingTime: '17:00', clinicDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], onlineConsultations: true, consultationTypes: ['chat', 'video'], onlineAvailability: { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], slots: ['10:00 AM', '2:00 PM'] }, consultationPrices: { chat: 100, video: 150 } }

function formatDoctor(draft: Partial<RegisteredDoctor>): { registration: DoctorRegistration; profile: DoctorProfessionalProfile } {
  return { registration: { ...defaultRegistration, ...(draft.registration ?? {}) }, profile: { ...defaultProfile, ...(draft.profile ?? {}), onlineAvailability: { ...defaultProfile.onlineAvailability, ...(draft.profile?.onlineAvailability ?? {}) }, consultationPrices: { ...defaultProfile.consultationPrices, ...(draft.profile?.consultationPrices ?? {}) } } }
}

function Shell({ children, eyebrow = 'Doctor Connect' }: { children: ReactNode; eyebrow?: string }) {
  return <div className="auth-page doctor-auth-page"><div className="doctor-flow-shell"><Link to="/" className="brand"><span className="brand-mark">✦</span>HerHealth</Link><Card className="doctor-flow-card"><div className="doctor-flow-mark"><Stethoscope size={20} /></div><div className="eyebrow">{eyebrow}</div>{children}</Card></div></div>
}

export function DoctorLogin() {
  const navigate = useNavigate()
  const registered = getRegisteredDoctor()
  function enterDemo() { if (!registered) { navigate('/doctor/register'); return } saveDoctorSession(true); navigate('/doctor/dashboard') }
  return <Shell eyebrow="Doctor demo access"><h1>Welcome, doctor</h1><p>Use the frontend demo session to return to your registered profile. No password is collected or stored.</p>{registered ? <Card className="doctor-return-card"><BadgeCheck size={20} /><div><strong>{registered.registration.fullName}</strong><span>{registered.profile.specialization} · {registered.profile.city}</span></div></Card> : <p className="field-hint">No demo doctor profile has been created on this browser yet.</p>}<div className="form-actions"><Button type="button" onClick={enterDemo}>{registered ? 'Continue to demo dashboard' : 'Start doctor registration'}<ArrowRight size={16} /></Button>{registered && <Button type="button" variant="secondary" onClick={() => navigate('/doctor/register')}>Edit profile</Button>}</div><p className="privacy-note"><LockKeyhole size={15} />Demo access is not secure authentication. Never use real passwords or registration documents here.</p></Shell>
}

export default function DoctorFlow() {
  const location = useLocation()
  const navigate = useNavigate()
  const draft = getDoctorDraft() ?? {}
  const initial = formatDoctor(draft)
  const [registration, setRegistration] = useState(initial.registration)
  const [profile, setProfile] = useState(initial.profile)
  const [errors, setErrors] = useState<string[]>([])
  const [verificationError, setVerificationError] = useState('')
  const [checking, setChecking] = useState(false)
  const [step, setStep] = useState(location.pathname.includes('profile-setup') ? 2 : 1)
  const path = location.pathname

  function updateRegistration(changes: Partial<DoctorRegistration>) { setRegistration((current) => ({ ...current, ...changes })) }
  function updateProfile(changes: Partial<DoctorProfessionalProfile>) { setProfile((current) => { const next = { ...current, ...changes }; saveDoctorDraft({ registration, profile: next, verification: 'verified' }); return next }) }
  function validateRegistration() {
    const next: string[] = []
    if (registration.fullName.trim().length < 2) next.push('Enter your full name.')
    if (registration.registrationYear < 1950 || registration.registrationYear > new Date().getFullYear()) next.push('Enter a registration year between 1950 and the current year.')
    if (!/^[A-Za-z0-9][A-Za-z0-9/().\-\s]{3,39}$/.test(registration.nmcRegistrationNumber.trim())) next.push('Enter a valid-looking registration number using 4–40 letters, numbers, spaces, or registry punctuation.')
    setErrors(next)
    return next.length === 0
  }
  function submitRegistration(event: FormEvent) { event.preventDefault(); if (!validateRegistration()) return; saveDoctorDraft({ registration, verification: 'unverified' }); navigate('/doctor/verify') }
  function verify() {
    setChecking(true); setVerificationError('')
    window.setTimeout(() => {
      setChecking(false)
      const succeeds = !registration.nmcRegistrationNumber.trim().toUpperCase().endsWith('FAIL')
      if (!succeeds) { setVerificationError('Demo verification could not match this test value. Edit your details and retry. No NMC database was queried.'); return }
      saveDoctorDraft({ registration, verification: 'verified' }); setStep(2); navigate('/doctor/profile-setup')
    }, 900)
  }
  function validateProfile() {
    const next: string[] = []
    if (!profile.qualifications.trim()) next.push('Add your qualifications.')
    if (profile.experience < 0 || profile.experience > 80) next.push('Enter years of experience between 0 and 80.')
    if (profile.bio.trim().length < 30) next.push('Add a short biography of at least 30 characters.')
    if (!profile.clinicName.trim() || !profile.clinicAddress.trim() || !profile.city.trim()) next.push('Complete the clinic name, address, and city.')
    if (profile.onlineConsultations && profile.consultationTypes.length === 0) next.push('Select at least one online consultation type.')
    if (profile.onlineConsultations && profile.onlineAvailability.days.length === 0) next.push('Select at least one online availability day.')
    setErrors(next); return next.length === 0
  }
  function submitProfile(event: FormEvent) {
    event.preventDefault(); if (!validateProfile()) return
    const doctor: RegisteredDoctor = { id: `registered-doctor-${registration.nmcRegistrationNumber.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')}`, registration, profile, verification: 'verified', createdAt: new Date().toISOString() }
    saveRegisteredDoctor(doctor); saveDoctorDraft(doctor); saveDoctorSession(true); navigate('/doctor/confirmed')
  }
  const progress = step === 1 ? 'Step 1 of 2 · Registration' : 'Step 2 of 2 · Professional profile'
  if (path.endsWith('/verify')) return <Shell eyebrow="DEMO VERIFICATION"><PageHeader title={checking ? 'Checking registration details' : verificationError ? 'Verification needs attention' : 'Demo verification complete'} description="This is a mock result for presentation only. It does not query the NMC or prove medical registration." icon={ShieldCheck} />{checking ? <div className="loading" role="status">Running simulated verification…</div> : verificationError ? <><p className="form-error">{verificationError}</p><div className="form-actions"><Button type="button" variant="secondary" onClick={() => navigate('/doctor/register')}>Edit details</Button><Button type="button" onClick={verify}>Retry demo check</Button></div></> : <><div className="verification-success" role="status"><CheckCircle2 size={23} /><div><strong>Demo verification succeeded</strong><span>Test registration details passed the mock check.</span></div></div><Button type="button" onClick={() => navigate('/doctor/profile-setup')}>Set up professional profile<ArrowRight size={16} /></Button></>}</Shell>
  if (path.endsWith('/confirmed')) { const registered = getRegisteredDoctor(); return <Shell eyebrow="Doctor Connect"><div className="confirmation-icon"><CheckCircle2 size={34} /></div><h1>Entry Confirmed</h1><p>Your fictional doctor profile is ready for this browser demo.</p>{registered && <div className="confirmation-summary"><div><strong>{registered.registration.fullName}</strong><span>{registered.profile.specialization} · {registered.profile.qualifications}</span></div><div><Building2 size={16} /><span>{registered.profile.clinicName}, {registered.profile.city}</span></div><div><CalendarDays size={16} /><span>{registered.profile.onlineAvailability.days.join(', ') || 'Online availability disabled'}</span></div><div><Clock3 size={16} /><span>{registered.profile.consultationTypes.join(' + ') || 'No online mode'} · {registered.profile.onlineAvailability.slots.join(', ') || 'No slots'}</span></div></div>}<p className="privacy-note">Frontend demo only: real NMC verification, approval, secure authentication, and doctor payouts are not complete.</p><div className="form-actions"><Button type="button" onClick={() => navigate('/doctor/dashboard')}>Open doctor dashboard</Button><Link className="button button-secondary" to="/doctors">View patient doctor list</Link></div></Shell> }
  if (path.endsWith('/profile-setup')) return <ProfileSetup profile={profile} updateProfile={updateProfile} errors={errors} onSubmit={submitProfile} onBack={() => navigate('/doctor/verify')} progress={progress} />
  return <Registration registration={registration} updateRegistration={updateRegistration} errors={errors} onSubmit={submitRegistration} progress={progress} />
}

function Registration({ registration, updateRegistration, errors, onSubmit, progress }: { registration: DoctorRegistration; updateRegistration: (changes: Partial<DoctorRegistration>) => void; errors: string[]; onSubmit: (event: FormEvent) => void; progress: string }) {
  return <Shell eyebrow={progress}><h1>Register as a doctor</h1><p>Tell us about your professional registration to create a demo doctor profile.</p><form className="doctor-form" onSubmit={onSubmit}><label className="field" htmlFor="doctor-name">Full name<input id="doctor-name" value={registration.fullName} onChange={(event) => updateRegistration({ fullName: event.target.value })} placeholder="Dr. Priya Sharma" /></label><label className="field" htmlFor="registration-year">Medical registration year<input id="registration-year" type="number" min="1950" max={new Date().getFullYear()} value={registration.registrationYear} onChange={(event) => updateRegistration({ registrationYear: Number(event.target.value) })} /></label><label className="field" htmlFor="nmc-number">NMC registration number<input id="nmc-number" value={registration.nmcRegistrationNumber} onChange={(event) => updateRegistration({ nmcRegistrationNumber: event.target.value })} placeholder="Use your registry's format" /><span className="field-hint">Formats vary by registry; letters, numbers, spaces, and common punctuation are accepted.</span></label><label className="field" htmlFor="state-council">State medical council <span className="field-hint">optional</span><input id="state-council" value={registration.stateMedicalCouncil} onChange={(event) => updateRegistration({ stateMedicalCouncil: event.target.value })} placeholder="If applicable" /></label>{errors.length > 0 && <ErrorList errors={errors} />}<Button type="submit">Continue to demo verification<ArrowRight size={16} /></Button></form><p className="privacy-note"><LockKeyhole size={15} />Professional details are requested for the prototype's verification UX. Do not enter sensitive documents or passwords.</p></Shell>
}

function ProfileSetup({ profile, updateProfile, errors, onSubmit, onBack, progress }: { profile: DoctorProfessionalProfile; updateProfile: (changes: Partial<DoctorProfessionalProfile>) => void; errors: string[]; onSubmit: (event: FormEvent) => void; onBack: () => void; progress: string }) {
  const toggle = (values: string[], value: string) => values.includes(value) ? values.filter((item) => item !== value) : [...values, value]
  const toggleType = (type: ConsultationType) => updateProfile({ consultationTypes: profile.consultationTypes.includes(type) ? profile.consultationTypes.filter((item) => item !== type) : [...profile.consultationTypes, type] })
  return <Shell eyebrow={progress}><h1>Set up your professional profile</h1><p>This information powers your fictional Doctor Connect listing.</p><form className="doctor-form" onSubmit={onSubmit}><div className="form-section-title">Professional details</div><label className="field">Specialization<select value={profile.specialization} onChange={(event) => updateProfile({ specialization: event.target.value as DoctorSpecialization })}>{specializations.map((item) => <option key={item}>{item}</option>)}</select></label><label className="field">Qualifications<input value={profile.qualifications} onChange={(event) => updateProfile({ qualifications: event.target.value })} placeholder="MBBS, MD..." /></label><label className="field">Years of experience<input type="number" min="0" max="80" value={profile.experience} onChange={(event) => updateProfile({ experience: Number(event.target.value) })} /></label><label className="field">Short professional biography<textarea value={profile.bio} onChange={(event) => updateProfile({ bio: event.target.value })} placeholder="Describe your approach and areas of care." /></label><div className="form-section-title">Clinic information</div><div className="form-columns"><label className="field">Clinic/hospital name<input value={profile.clinicName} onChange={(event) => updateProfile({ clinicName: event.target.value })} /></label><label className="field">City<input value={profile.city} onChange={(event) => updateProfile({ city: event.target.value })} /></label></div><label className="field">Clinic location/address<input value={profile.clinicAddress} onChange={(event) => updateProfile({ clinicAddress: event.target.value })} /></label><div className="form-columns"><label className="field">Opening time<input type="time" value={profile.openingTime} onChange={(event) => updateProfile({ openingTime: event.target.value })} /></label><label className="field">Closing time<input type="time" value={profile.closingTime} onChange={(event) => updateProfile({ closingTime: event.target.value })} /></label></div><fieldset><legend>Clinic operating days</legend><div className="choice-row">{weekDays.map((day) => <label className="choice" key={day}><input type="checkbox" checked={profile.clinicDays.includes(day)} onChange={() => updateProfile({ clinicDays: toggle(profile.clinicDays, day) })} />{day.slice(0, 3)}</label>)}</div></fieldset><div className="form-section-title">Online consultation availability</div><label className="choice"><input type="checkbox" checked={profile.onlineConsultations} onChange={(event) => updateProfile({ onlineConsultations: event.target.checked })} />Enable online consultations</label>{profile.onlineConsultations && <><fieldset><legend>Consultation modes</legend><div className="choice-row">{(['chat', 'video'] as ConsultationType[]).map((type) => <label className="choice" key={type}><input type="checkbox" checked={profile.consultationTypes.includes(type)} onChange={() => toggleType(type)} />{type}</label>)}</div></fieldset><fieldset><legend>Available online days</legend><div className="choice-row">{weekDays.map((day) => <label className="choice" key={day}><input type="checkbox" checked={profile.onlineAvailability.days.includes(day)} onChange={() => updateProfile({ onlineAvailability: { ...profile.onlineAvailability, days: toggle(profile.onlineAvailability.days, day) } })} />{day.slice(0, 3)}</label>)}</div></fieldset><label className="field">Available time slots <span className="field-hint">comma-separated</span><input value={profile.onlineAvailability.slots.join(', ')} onChange={(event) => updateProfile({ onlineAvailability: { ...profile.onlineAvailability, slots: event.target.value.split(',').map((slot) => slot.trim()).filter(Boolean) } })} placeholder="10:00 AM, 2:00 PM" /></label><div className="form-columns">{(['chat', 'video'] as const).map((type) => <label className="field" key={type}>{type} price in HerCoins<input type="number" min="0" value={profile.consultationPrices[type] ?? 0} onChange={(event) => updateProfile({ consultationPrices: { ...profile.consultationPrices, [type]: Number(event.target.value) } })} /></label>)}</div></>}{errors.length > 0 && <ErrorList errors={errors} />}<div className="form-actions"><Button type="button" variant="secondary" onClick={onBack}><ArrowLeft size={16} />Back</Button><Button type="submit">Review and confirm<ArrowRight size={16} /></Button></div></form></Shell>
}

function ErrorList({ errors }: { errors: string[] }) { return <div className="form-error doctor-errors" role="alert"><strong>Please check the following:</strong><ul>{errors.map((error) => <li key={error}>{error}</li>)}</ul></div> }

export function DoctorDashboard() {
  const navigate = useNavigate()
  const registered = getRegisteredDoctor()
  if (!registered) return <Shell><h1>No doctor profile yet</h1><p>Complete the demo registration before opening this dashboard.</p><Button type="button" onClick={() => navigate('/doctor/register')}>Register as a doctor</Button></Shell>
  return <><PageHeader eyebrow="Doctor demo dashboard" title={`Welcome, ${registered.registration.fullName}`} description="Manage the fictional professional profile you created on this browser." icon={Stethoscope} /><div className="doctor-dashboard-grid"><Card><BadgeCheck className="card-icon" /><h2>Demo verification</h2><p className="success-message">Passed simulated check</p><p>No live NMC registry was queried.</p></Card><Card><Building2 className="card-icon" /><h2>{registered.profile.clinicName}</h2><p>{registered.profile.clinicAddress}, {registered.profile.city}</p><p>{registered.profile.clinicDays.join(', ')}</p></Card><Card><CalendarDays className="card-icon" /><h2>Online availability</h2><p>{registered.profile.onlineConsultations ? `${registered.profile.consultationTypes.join(' + ')} · ${registered.profile.onlineAvailability.slots.join(', ')}` : 'Disabled'}</p><p>{registered.profile.onlineAvailability.days.join(', ')}</p></Card></div><div className="form-actions"><Button type="button" onClick={() => navigate('/doctor/confirmed')}>View confirmed entry</Button><Button type="button" variant="secondary" onClick={() => { saveDoctorSession(false); navigate('/doctor/login') }}>End demo session</Button></div></>
}
