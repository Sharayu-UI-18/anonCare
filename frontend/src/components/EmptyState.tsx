import { Sparkles } from 'lucide-react'
import Card from './Card'

export default function EmptyState({ title, message }: { title: string; message: string }) {
  return <Card className="empty-state"><Sparkles size={28} /><h2>{title}</h2><p>{message}</p></Card>
}
