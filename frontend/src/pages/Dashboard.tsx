import { Activity, CalendarDays, CircleHelp, HeartPulse, Moon, Stethoscope } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../components/Card'
import PageHeader from '../components/PageHeader'
import { getCycleData, getWellnessHistory, type CycleRecord, type WellnessRecord } from '../services/localStorage'

const cards = [
  { title: 'Sleep', value: '—', text: 'Track your rest and recovery', icon: Moon, to: '/wellness' },
  { title: 'Symptoms', value: '0 logged', text: 'Notice something worth tracking?', icon: Activity, to: '/wellness' },
  { title: 'Ask AI', value: 'Private answers', text: 'Explore a health question anonymously', icon: CircleHelp, to: '/ask-ai' },
  { title: 'Care team', value: 'Find support', text: 'Discover doctors when you are ready', icon: Stethoscope, to: '/doctors' },
]

function formatDate(date: string): string {
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`))
}

export default function Dashboard() {
  const [cycleData] = useState<CycleRecord | null>(() => getCycleData())
  const [wellnessData] = useState<WellnessRecord | null>(() => getWellnessHistory().find((record) => record.date === new Date().toISOString().slice(0, 10)) ?? null)

  return <>
    <PageHeader eyebrow="Good morning" title="Your health, in one place" description="A calm overview of the signals and questions that matter to you." />
    <div className="grid dashboard-grid">
      {cycleData ? <Card className="stat cycle-overview"><CalendarDays className="card-icon" size={24} /><div className="card-top"><div><h2>Cycle Overview</h2><span className="stat-value">{cycleData.cycleLength} days</span><p>Last period: {formatDate(cycleData.startDate)}</p><p>Period length: {cycleData.periodLength} days</p></div><Link className="button button-secondary" to="/cycle">View</Link></div></Card> : <Card className="stat"><CalendarDays className="card-icon" size={24} /><div className="card-top"><div><h2>Start tracking your cycle</h2><p>Save your cycle details to see them here.</p></div><Link className="button button-primary" to="/cycle">Start tracking</Link></div></Card>}
      <Card className="stat wellness-overview"><HeartPulse className="card-icon" size={24} /><div className="card-top"><div><h2>Today's Wellness</h2>{wellnessData ? <><span className="stat-value">{wellnessData.mood}</span><p>Energy: {wellnessData.energy}/5</p><p>Sleep: {wellnessData.sleepHours} hrs</p><p>Sleep quality: {wellnessData.sleepQuality}</p><p>Appetite: {wellnessData.appetite}</p></> : <p>How are you feeling today?</p>}</div><Link className="button button-secondary" to="/wellness">{wellnessData ? 'View Wellness' : 'Log Wellness'}</Link></div></Card>
      {cards.map(({ title, value, text, icon: Icon, to }) => <Card className="stat" key={title}><Icon className="card-icon" size={24} /><div className="card-top"><div><h2>{title}</h2><span className="stat-value">{value}</span><p>{text}</p></div><Link className="card-link" to={to}>Open</Link></div></Card>)}
    </div>
  </>
}
