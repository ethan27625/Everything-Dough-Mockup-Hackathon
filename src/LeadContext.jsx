import { createContext, useContext, useState } from 'react'

const LeadContext = createContext()

export function LeadProvider({ children }) {
  const [leads, setLeads] = useState([])

  const addLead = (lead) => {
    setLeads((prev) => [...prev, { ...lead, id: Date.now() }])
  }

  return (
    <LeadContext.Provider value={{ leads, addLead }}>
      {children}
    </LeadContext.Provider>
  )
}

export function useLeads() {
  return useContext(LeadContext)
}
