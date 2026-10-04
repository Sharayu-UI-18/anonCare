import { LockKeyhole, Send } from 'lucide-react'
import Button from '../components/Button'
import Card from '../components/Card'
import PageHeader from '../components/PageHeader'

export default function AskAI() { return <><PageHeader eyebrow="Private guidance" title="Ask anonymously" description="Ask a health question without attaching it to your personal profile." /><Card><div className="card-top"><div><h2>What is on your mind?</h2><p>Share a question in your own words. This is a placeholder for the future ask flow.</p></div><LockKeyhole className="card-icon" size={22} /></div><form style={{ marginTop: 24 }}><label className="field"><span className="sr-only">Your anonymous health question</span><textarea placeholder="e.g. What can cause changes in my cycle?" /></label><Button type="submit"><Send size={16} />Ask anonymously</Button></form></Card></> }
