import { Activity, CalendarDays, CircleHelp, Moon, Smile, Stethoscope } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../components/Card'
import PageHeader from '../components/PageHeader'
import { getCycleData, type CycleRecord } from '../services/localStorage'

const cards = [{ title: 'Cycle', value: 'Not logged', text: 'Add your latest cycle details', icon: CalendarDays, to: '/cycle' }, { title: 'Mood', value: '—', text: 'How are you feeling today?', icon: Smile, to: '/wellness' }, { title: 'Sleep', value: '—', text: 'Track your rest and recovery', icon: Moon, to: '/wellness' }, { title: 'Symptoms', value: '0 logged', text: 'Notice something worth tracking?', icon: Activity, to: '/wellness' }, { title: 'Ask AI', value: 'Private answers', text: 'Explore a health question anonymously', icon: CircleHelp, to: '/ask-ai' }, { title: 'Care team', value: 'Find support', text: 'Discover doctors when you are ready', icon: Stethoscope, to: '/doctors' }]

function formatDate(date: string): string {
	return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`))
}

export default function Dashboard() {
	const [cycleData] = useState<CycleRecord | null>(() => getCycleData())
	return <><PageHeader eyebrow="Good morning" title="Your health, in one place" description="A calm overview of the signals and questions that matter to you." /><div className="grid dashboard-grid">{cycleData && <Card className="stat cycle-overview"><CalendarDays className="card-icon" size={24} /><div className="card-top"><div><h2>Cycle Overview</h2><span className="stat-value">{cycleData.cycleLength} days</span><p>Last period: {formatDate(cycleData.startDate)}</p><p>Period length: {cycleData.periodLength} days</p></div><Link className="button button-secondary" to="/cycle">View</Link></div></Card>}{!cycleData && <Card className="stat"><CalendarDays className="card-icon" size={24} /><div className="card-top"><div><h2>Start tracking your cycle</h2><p>Save your cycle details to see them here.</p></div><Link className="button button-primary" to="/cycle">Start tracking</Link></div></Card>}{cards.slice(1).map(({ title, value, text, icon: Icon, to }) => <Card className="stat" key={title}><Icon className="card-icon" size={24} /><div className="card-top"><div><h2>{title}</h2><span className="stat-value">{value}</span><p>{text}</p></div><Link className="card-link" to={to}>Open</Link></div></Card>)}</div></>
}
