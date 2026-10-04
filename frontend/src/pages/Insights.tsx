import { Lightbulb } from 'lucide-react'
import EmptyState from '../components/EmptyState'
import PageHeader from '../components/PageHeader'

export default function Insights() { return <><PageHeader eyebrow="Patterns over time" title="Insights" description="Gentle observations will appear here as you build your health history." icon={Lightbulb} /><EmptyState title="Insights grow with you" message="Keep tracking your cycle, mood, sleep, and symptoms to see meaningful patterns." /></> }
