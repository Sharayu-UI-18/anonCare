import { Activity, CalendarDays, CircleHelp, Coins, FileHeart, FileText, HeartPulse, LayoutDashboard, LockKeyhole, Stethoscope } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const links = [{ to: '/dashboard', label: 'Overview', icon: LayoutDashboard }, { to: '/cycle', label: 'Cycle tracker', icon: CalendarDays }, { to: '/wellness', label: 'Wellness', icon: HeartPulse }, { to: '/insights', label: 'Insights', icon: Activity }, { to: '/ask-ai', label: 'Ask anonymously', icon: CircleHelp }, { to: '/doctors', label: 'Find a doctor', icon: Stethoscope }, { to: '/wallet', label: 'HerCoins wallet', icon: Coins }, { to: '/appointments', label: 'My appointments', icon: CalendarDays }, { to: '/medical-records', label: 'Medical records', icon: FileText }]

export default function Sidebar() {
  return <aside className="sidebar"><NavLink to="/dashboard" className="logo"><span className="brand-mark">✦</span>HerHealth</NavLink><nav className="nav-list" aria-label="Main navigation">{links.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} className="nav-link"><Icon size={17} />{label}</NavLink>)}<NavLink to="/privacy" className="nav-link"><LockKeyhole size={17} />Privacy</NavLink></nav><div className="sidebar-footer"><FileHeart size={16} /> Your space is private by design.</div></aside>
}
