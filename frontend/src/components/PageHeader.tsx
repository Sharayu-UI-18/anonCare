import type { LucideIcon } from 'lucide-react'

export default function PageHeader({ eyebrow, title, description, icon: Icon }: { eyebrow?: string; title: string; description?: string; icon?: LucideIcon }) {
  return <header className="page-header">{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h1>{Icon && <Icon size={30} strokeWidth={1.8} />}{title}</h1>{description && <p>{description}</p>}</header>
}
