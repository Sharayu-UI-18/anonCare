import { CalendarDays } from 'lucide-react'
import Card from '../components/Card'
import EmptyState from '../components/EmptyState'
import PageHeader from '../components/PageHeader'

export default function CycleTracker() { return <><PageHeader eyebrow="Your patterns" title="Cycle tracker" description="Keep a simple record of your cycle and learn what feels normal for you." icon={CalendarDays} /><div className="grid wide-grid"><Card><h2>Current cycle</h2><p>Nothing logged yet. Your cycle history will appear here as you add entries.</p><div style={{ marginTop: 24 }}><button className="button button-primary" type="button">Log a cycle</button></div></Card><EmptyState title="Your calendar is ready" message="Cycle insights will be available once you have a little history." /></div></> }
