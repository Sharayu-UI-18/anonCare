import { ArrowRight, HeartPulse, Stethoscope } from 'lucide-react'
import { Link } from 'react-router-dom'
import Card from '../components/Card'

export default function Login() {
  return <div className="auth-page"><Card className="role-card"><Link to="/" className="brand"><span className="brand-mark">✦</span>HerHealth</Link><h1>How would you like to continue?</h1><p>Choose the space that matches your HerHealth journey.</p><div className="role-grid"><Link className="role-option" to="/ask-ai"><HeartPulse size={25} /><span><strong>Continue as Patient</strong><small>Enter the anonymous care space immediately</small></span><ArrowRight size={17} /></Link><Link className="role-option doctor-role-option" to="/doctor/login"><Stethoscope size={25} /><span><strong>Continue as Doctor</strong><small>Register or open your demo professional profile</small></span><ArrowRight size={17} /></Link></div><p className="privacy-note"><HeartPulse size={15} />Patient access does not require an account, name, email, phone number, or password.</p></Card></div>
}
