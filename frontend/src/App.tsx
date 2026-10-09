import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import AskAI from './pages/AskAI'
import CycleTracker from './pages/CycleTracker'
import Dashboard from './pages/Dashboard'
import Doctors from './pages/Doctors'
import Wallet from './pages/Wallet'
import Appointments from './pages/Appointments'
import Consultation from './pages/Consultation'
import MedicalRecords from './pages/MedicalRecords'
import Insights from './pages/Insights'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Onboarding from './pages/Onboarding'
import Privacy from './pages/Privacy'
import Wellness from './pages/Wellness'
import DoctorFlow, { DoctorDashboard, DoctorLogin } from './pages/DoctorFlow'

function AppLayout() {
  return <div className="app-layout"><Sidebar /><div className="app-body"><Navbar /><main className="main-content"><Routes><Route path="/dashboard" element={<Dashboard />} /><Route path="/cycle" element={<CycleTracker />} /><Route path="/wellness" element={<Wellness />} /><Route path="/insights" element={<Insights />} /><Route path="/ask-ai" element={<AskAI />} /><Route path="/doctors" element={<Doctors />} /><Route path="/wallet" element={<Wallet />} /><Route path="/appointments" element={<Appointments />} /><Route path="/consultation/:appointmentId" element={<Consultation />} /><Route path="/medical-records" element={<MedicalRecords />} /><Route path="/privacy" element={<Privacy />} /></Routes></main></div></div>
}

function App() {
  return <BrowserRouter><Routes><Route path="/" element={<Landing />} /><Route path="/login" element={<Login />} /><Route path="/start" element={<Onboarding />} /><Route path="/doctor/login" element={<DoctorLogin />} /><Route path="/doctor/register" element={<DoctorFlow />} /><Route path="/doctor/verify" element={<DoctorFlow />} /><Route path="/doctor/profile-setup" element={<DoctorFlow />} /><Route path="/doctor/confirmed" element={<DoctorFlow />} /><Route path="/doctor/dashboard" element={<DoctorDashboard />} /><Route path="/*" element={<AppLayout />} /></Routes></BrowserRouter>
}

export default App
