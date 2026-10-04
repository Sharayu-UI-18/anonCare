import type { PropsWithChildren } from 'react'

export default function Card({ children, className = '' }: PropsWithChildren<{ className?: string }>) {
  return <section className={`card ${className}`}>{children}</section>
}
