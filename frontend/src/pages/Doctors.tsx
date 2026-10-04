import { MapPin, Search, Stethoscope } from 'lucide-react'
import Button from '../components/Button'
import Card from '../components/Card'
import PageHeader from '../components/PageHeader'

export default function Doctors() { return <><PageHeader eyebrow="Care when you need it" title="Find a doctor" description="A simple discovery space for finding the right kind of support." icon={Stethoscope} /><Card><div className="grid wide-grid"><label className="field">Specialty or care type<input placeholder="e.g. gynecology, mental health" /></label><label className="field">Location<div style={{ display: 'flex', gap: 8 }}><input placeholder="City or postcode" /><Button type="button"><Search size={16} />Search</Button></div></label></div><p style={{ marginTop: 22 }}><MapPin size={15} /> Doctor discovery will connect here in a future release.</p></Card></> }
