import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import AskAI from './pages/AskAI'
import CycleTracker from './pages/CycleTracker'
import Dashboard from './pages/Dashboard'
import Doctors from './pages/Doctors'
import Insights from './pages/Insights'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Privacy from './pages/Privacy'
import Signup from './pages/Signup'
import Wellness from './pages/Wellness'

function AppLayout() {
  return <div className="app-layout"><Sidebar /><div className="app-body"><Navbar /><main className="main-content"><Routes><Route path="/dashboard" element={<Dashboard />} /><Route path="/cycle" element={<CycleTracker />} /><Route path="/wellness" element={<Wellness />} /><Route path="/insights" element={<Insights />} /><Route path="/ask-ai" element={<AskAI />} /><Route path="/doctors" element={<Doctors />} /><Route path="/privacy" element={<Privacy />} /></Routes></main></div></div>
}

function App() {
  return <BrowserRouter><Routes><Route path="/" element={<Landing />} /><Route path="/login" element={<Login />} /><Route path="/signup" element={<Signup />} /><Route path="/*" element={<AppLayout />} /></Routes></BrowserRouter>
}

export default App
