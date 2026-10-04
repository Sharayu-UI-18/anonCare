import { Link } from 'react-router-dom'
import Button from '../components/Button'
import Card from '../components/Card'

export default function Signup() {
  return <div className="auth-page"><Card className="auth-card"><Link to="/" className="brand"><span className="brand-mark">✦</span>HerHealth</Link><h1>Make space for your health</h1><p>Start a private, personal care journey.</p><form><label className="field">Your name<input type="text" placeholder="First name" /></label><label className="field">Email address<input type="email" placeholder="you@example.com" /></label><label className="field">Create a password<input type="password" placeholder="At least 8 characters" /></label><Button type="submit">Create account</Button></form><div className="auth-foot">Already have an account? <Link to="/login">Log in</Link></div></Card></div>
}
