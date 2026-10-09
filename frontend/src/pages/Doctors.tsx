import { CalendarDays, Check, Clock3, MessageCircle, Search, Stethoscope, Video, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../components/Button'
import Card from '../components/Card'
import PageHeader from '../components/PageHeader'
import { DEMO_DOCTORS, type DemoDoctor } from '../services/doctorData'
import { getAppointments, getRegisteredDoctor, getWallet, saveAppointment, spendWalletCoins, type Appointment, type ConsultationType } from '../services/localStorage'

function formatDate(date: string): string { return new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`)) }

export default function Doctors() {
  const [query, setQuery] = useState('')
  const [specialization, setSpecialization] = useState('All specializations')
  const [type, setType] = useState<'all' | ConsultationType>('all')
  const [selected, setSelected] = useState<DemoDoctor | null>(null)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [consultationType, setConsultationType] = useState<ConsultationType>('chat')
  const [notice, setNotice] = useState('')
  const [walletBalance, setWalletBalance] = useState(() => getWallet().balance)
  const appointments = getAppointments()
  const allDoctors = useMemo(() => {
    const registered = getRegisteredDoctor()
    if (!registered) return DEMO_DOCTORS
    const profile = registered.profile
    const registeredDoctor = { id: registered.id, name: registered.registration.fullName, initials: registered.registration.fullName.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase(), color: '#dcefe5', specialization: profile.specialization, qualifications: profile.qualifications, experience: profile.experience, rating: 5, reviews: 0, bio: profile.bio, duration: 30, coins: profile.consultationPrices.chat ?? profile.consultationPrices.video ?? 0, consultationTypes: profile.consultationTypes, availability: [{ date: '2026-10-22', slots: profile.onlineAvailability.slots }] }
    return [...DEMO_DOCTORS.filter((doctor) => doctor.id !== registered.id), registeredDoctor]
  }, [])
  const filteredDoctors = useMemo(() => allDoctors.filter((doctor) => {
    const matchesQuery = `${doctor.name} ${doctor.specialization}`.toLowerCase().includes(query.toLowerCase())
    const matchesSpecialization = specialization === 'All specializations' || doctor.specialization === specialization
    const matchesType = type === 'all' || doctor.consultationTypes.includes(type)
    return matchesQuery && matchesSpecialization && matchesType
  }), [allDoctors, query, specialization, type])

  function openDoctor(doctor: DemoDoctor) {
    setSelected(doctor); setDate(doctor.availability[0]?.date ?? ''); setTime(doctor.availability[0]?.slots[0] ?? ''); setConsultationType(doctor.consultationTypes[0]); setNotice('')
  }

  function bookDoctor() {
    if (!selected || !date || !time) return
    const alreadyBooked = appointments.some((item) => item.doctorId === selected.id && item.date === date && item.time === time && item.status !== 'cancelled')
    if (alreadyBooked) { setNotice('This demo slot is already booked. Please choose another time.'); return }
    if (!spendWalletCoins(selected.coins, `Consultation with ${selected.name}`)) { setNotice(`You need ${selected.coins} HerCoins, but your balance is ${walletBalance}. Open the wallet to purchase more.`); return }
    const appointment: Appointment = { id: `appointment-${Date.now()}`, doctorId: selected.id, doctorName: selected.name, date, time, consultationType, duration: selected.duration, coins: selected.coins, status: 'upcoming', createdAt: new Date().toISOString() }
    saveAppointment(appointment); setWalletBalance(getWallet().balance); setNotice('Booking confirmed! Your HerCoins were deducted once.'); setSelected(null)
  }

  return <><PageHeader eyebrow="Demo care network" title="Find a doctor" description="Browse fictional demo profiles and book a simulated chat or video consultation. No doctor is verified or connected through this prototype." icon={Stethoscope} /><Card className="demo-banner"><strong>Demo data only</strong><span>These profiles, ratings, availability, and consultations are fictional examples for exploring the product.</span><Link className="card-link" to="/wallet">Wallet: {walletBalance} HerCoins</Link></Card><Card className="doctor-filters"><div className="doctor-filter-search"><Search size={17} /><input aria-label="Search doctors" placeholder="Search by name or specialty" value={query} onChange={(event) => setQuery(event.target.value)} /></div><select aria-label="Filter by specialization" value={specialization} onChange={(event) => setSpecialization(event.target.value)}><option>All specializations</option>{Array.from(new Set(allDoctors.map((doctor) => doctor.specialization))).map((item) => <option key={item}>{item}</option>)}</select><select aria-label="Filter by consultation type" value={type} onChange={(event) => setType(event.target.value as 'all' | ConsultationType)}><option value="all">Any consultation</option><option value="chat">Chat</option><option value="video">Video</option></select></Card><div className="doctor-grid">{filteredDoctors.map((doctor) => <Card className="doctor-card" key={doctor.id}><div className="doctor-card-top"><div className="doctor-avatar" style={{ background: doctor.color }}>{doctor.initials}</div><span className="rating">★ {doctor.rating} <small>({doctor.reviews})</small></span></div><h2>{doctor.name}</h2><strong className="specialty">{doctor.specialization}</strong><p>{doctor.qualifications} · {doctor.experience} years experience</p><p className="doctor-bio">{doctor.bio}</p><div className="doctor-meta"><span><Clock3 size={15} />{doctor.duration} min</span><span className="coin-price">◈ {doctor.coins} coins</span></div><div className="availability-line"><CalendarDays size={15} /> Next: {formatDate(doctor.availability[0].date)}</div><Button type="button" onClick={() => openDoctor(doctor)}>View profile &amp; book</Button></Card>)}</div>{filteredDoctors.length === 0 && <Card className="empty-state"><Stethoscope size={30} /><h2>No demo doctors found</h2><p>Try a different name, specialty, or consultation type.</p></Card>}{selected && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null) }}><div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="doctor-modal-title"><button className="modal-close" type="button" aria-label="Close profile" onClick={() => setSelected(null)}><X size={18} /></button><div className="doctor-profile-heading"><div className="doctor-avatar large" style={{ background: selected.color }}>{selected.initials}</div><div><h2 id="doctor-modal-title">{selected.name}</h2><strong className="specialty">{selected.specialization}</strong><p>{selected.qualifications} · {selected.experience} years experience</p></div></div><p className="modal-copy">{selected.bio}</p><div className="booking-options"><label className="field">Date<select value={date} onChange={(event) => { setDate(event.target.value); setTime(selected.availability.find((item) => item.date === event.target.value)?.slots[0] ?? '') }}>{selected.availability.map((item) => <option key={item.date} value={item.date}>{formatDate(item.date)}</option>)}</select></label><label className="field">Time<select value={time} onChange={(event) => setTime(event.target.value)}>{selected.availability.find((item) => item.date === date)?.slots.map((slot) => <option key={slot}>{slot}</option>)}</select></label></div><fieldset><legend>Consultation type</legend><div className="choice-row">{selected.consultationTypes.map((item) => <label className="choice" key={item}><input type="radio" checked={consultationType === item} onChange={() => setConsultationType(item)} />{item === 'chat' ? <MessageCircle size={14} /> : <Video size={14} />}{item}</label>)}</div></fieldset><div className="booking-summary"><span>{selected.duration} minutes · ◈ {selected.coins} HerCoins</span><span>Balance after booking: {walletBalance - selected.coins >= 0 ? walletBalance - selected.coins : 'insufficient'}</span></div>{notice && <div className={notice.startsWith('Booking') ? 'success-message' : 'form-error'}><p>{notice}</p>{notice.includes('Open the wallet') && <Link className="button button-secondary" to="/wallet">Open wallet</Link>}</div>}<div className="form-actions"><Button type="button" variant="secondary" onClick={() => setSelected(null)}>Cancel</Button><Button type="button" onClick={bookDoctor}><Check size={16} />Confirm simulated booking</Button></div><p className="privacy-note">Coins are only demo points and no real payment or medical service is involved.</p></div></div>}</>
}
