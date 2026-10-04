import { Link } from 'react-router-dom'
import Button from '../components/Button'
import Card from '../components/Card'

export default function Login() {
  return <div className="auth-page"><Card className="auth-card"><Link to="/" className="brand"><span className="brand-mark">✦</span>HerHealth</Link><h1>Welcome back</h1><p>Continue to your private care space.</p><form><label className="field">Email address<input type="email" placeholder="you@example.com" /></label><label className="field">Password<input type="password" placeholder="Enter your password" /></label><Button type="submit">Log in</Button></form><div className="auth-foot">New to HerHealth? <Link to="/signup">Create an account</Link></div></Card></div>
}
