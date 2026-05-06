import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LeadProvider } from './LeadContext'
import EverythingDough from './EverythingDough'
import CRMDashboard from './CRMDashboard'

export default function App() {
  return (
    <LeadProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<EverythingDough />} />
          <Route path="/dashboard" element={<CRMDashboard />} />
        </Routes>
      </BrowserRouter>
    </LeadProvider>
  )
}
