import { ArrowRight, CircleHelp } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Landing() {
  return <div className="landing"><nav className="landing-nav"><Link to="/" className="brand"><span className="brand-mark">✦</span>HerHealth</Link><Link to="/login" className="button button-ghost">Log in</Link></nav><main className="landing-content"><div className="eyebrow">Care that meets you where you are</div><h1>A smarter way to access <span>women's healthcare.</span></h1><p className="landing-copy">A private, thoughtful space to understand your health, track what matters, and find your next step with confidence.</p><div className="landing-actions"><Link to="/signup" className="button button-primary">Get started <ArrowRight size={17} /></Link><Link to="/ask-ai" className="button button-secondary"><CircleHelp size={17} />Ask anonymously</Link></div></main></div>
}
