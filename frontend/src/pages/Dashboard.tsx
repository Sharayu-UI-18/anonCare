import { Activity, CalendarDays, CircleHelp, Moon, Smile, Stethoscope } from 'lucide-react'
import { Link } from 'react-router-dom'
import Card from '../components/Card'
import PageHeader from '../components/PageHeader'

const cards = [{ title: 'Cycle', value: 'Not logged', text: 'Add your latest cycle details', icon: CalendarDays, to: '/cycle' }, { title: 'Mood', value: '—', text: 'How are you feeling today?', icon: Smile, to: '/wellness' }, { title: 'Sleep', value: '—', text: 'Track your rest and recovery', icon: Moon, to: '/wellness' }, { title: 'Symptoms', value: '0 logged', text: 'Notice something worth tracking?', icon: Activity, to: '/wellness' }, { title: 'Ask AI', value: 'Private answers', text: 'Explore a health question anonymously', icon: CircleHelp, to: '/ask-ai' }, { title: 'Care team', value: 'Find support', text: 'Discover doctors when you are ready', icon: Stethoscope, to: '/doctors' }]

export default function Dashboard() { return <><PageHeader eyebrow="Good morning" title="Your health, in one place" description="A calm overview of the signals and questions that matter to you." /><div className="grid dashboard-grid">{cards.map(({ title, value, text, icon: Icon, to }) => <Card className="stat" key={title}><Icon className="card-icon" size={24} /><div className="card-top"><div><h2>{title}</h2><span className="stat-value">{value}</span><p>{text}</p></div><Link className="card-link" to={to}>Open</Link></div></Card>)}</div></> }
