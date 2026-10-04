import { Link } from 'react-router-dom'

export default function Navbar() {
  return <header className="navbar"><Link to="/dashboard" className="brand"><span className="brand-mark">✦</span>HerHealth</Link><div className="user-chip"><span>My care space</span><span className="avatar">A</span></div></header>
}
