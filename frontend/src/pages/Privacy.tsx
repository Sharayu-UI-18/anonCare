import { LockKeyhole, ShieldCheck, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/Card'
import PageHeader from '../components/PageHeader'
import { clearCycleData, clearUserProfile, clearWellnessHistory } from '../services/localStorage'

export default function Privacy() {
	const navigate = useNavigate()
	function resetProfile() { if (window.confirm('This will remove your local HerHealth profile and locally stored tracking data from this browser.')) { clearUserProfile(); clearCycleData(); clearWellnessHistory(); navigate('/') } }
	return <><PageHeader eyebrow="Your information" title="Privacy by design" description="HerHealth is built around clarity, control, and respect for sensitive health information." icon={LockKeyhole} /><div className="grid wide-grid"><Card><ShieldCheck className="card-icon" size={22} /><h2>No identity required</h2><p>Your private profile uses a random anonymous ID. No email, phone number, or real name is requested.</p></Card><Card><LockKeyhole className="card-icon" size={22} /><h2>Stored on this device</h2><p>Your profile, cycle records, and wellness check-ins stay in this browser for this prototype.</p></Card><Card><h2>Information, not diagnosis</h2><p>HerHealth offers general information and descriptive views of your records. It does not diagnose or replace a healthcare professional.</p></Card><Card className="reset-card"><Trash2 className="card-icon" size={22} /><h2>Reset Private Profile</h2><p>Remove your local HerHealth profile and tracking data from this browser.</p><button className="button button-secondary" type="button" onClick={resetProfile}>Reset Private Profile</button></Card></div></>
}
