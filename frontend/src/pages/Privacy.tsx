import { LockKeyhole } from 'lucide-react'
import Card from '../components/Card'
import PageHeader from '../components/PageHeader'

export default function Privacy() { return <><PageHeader eyebrow="Your information" title="Privacy by design" description="HerHealth is being built around clarity, control, and respect for sensitive health information." icon={LockKeyhole} /><div className="grid wide-grid"><Card><h2>Anonymous health questions</h2><p>Questions asked through the anonymous experience are designed to stand apart from your personal care space.</p></Card><Card><h2>Privacy-first design</h2><p>We will make it clear what information is collected, why it is used, and what choices you have.</p></Card><Card><h2>Separate by default</h2><p>Health tracking data will be handled separately from AI requests. This foundation does not connect either flow to a backend yet.</p></Card></div></> }
