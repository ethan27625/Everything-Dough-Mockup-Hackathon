import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useLeads } from './LeadContext'

// ─── Fonts ────────────────────────────────────────────────────────────────────
const FONT_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;700&family=Playfair+Display:wght@700&display=swap');
  .crm-root { font-family: 'DM Sans', sans-serif; background-color: #FAF7F2; min-height: 100vh; color: #2D2D2D; }
  .playfair  { font-family: 'Playfair Display', serif; }
  .crm-table tr:hover td { background: #FEF2F2 !important; cursor: pointer; }
  .crm-table td, .crm-table th { padding: 12px 14px; }
  .crm-row-even td { background: #FFFFFF; }
  .crm-row-odd  td { background: #F9F5F0; }
`

// ─── Sample leads ─────────────────────────────────────────────────────────────
const SAMPLE_LEADS = [
  {
    id: 1,
    inquiry_date:  '2026-05-01',
    customer_name: 'Maya Rodriguez',
    email:         'maya.r@example.com',
    phone:         '203-555-0141',
    event_type:    'Kids Pizza Class + Sweet Treat',
    add_ons:       'Apron Decoration',
    guest_count:   18,
    event_date:    '2026-05-28',
    days_to_event: 23,
    location:      "Client's Home",
    dietary_needs: 'Gluten-Free (2 kids)',
    how_heard:     'Google',
    traffic_source:'Website',
    repeat_visitor:'No',
    base_price_pp: 90,
    add_on_fee:    0,
    late_booking_fee: 0,
    estimated_quote:  1620,
    status:        'Pending',
  },
  {
    id: 2,
    inquiry_date:  '2026-05-02',
    customer_name: 'Jordan Lee',
    email:         'jordan.lee@corp.com',
    phone:         '914-555-0288',
    event_type:    'Pizza Making Class',
    add_ons:       'Mixology Class',
    guest_count:   25,
    event_date:    '2026-05-20',
    days_to_event: 15,
    location:      'Corporate Office',
    dietary_needs: 'Vegan (3 guests)',
    how_heard:     'LinkedIn',
    traffic_source:'Website',
    repeat_visitor:'No',
    base_price_pp: 100,
    add_on_fee:    70,
    late_booking_fee: 0,
    estimated_quote:  2570,
    status:        'Pending',
  },
  {
    id: 3,
    inquiry_date:  '2026-05-03',
    customer_name: 'Sofia Patel',
    email:         'sofia.p@gmail.com',
    phone:         '203-555-0399',
    event_type:    'Pizza Party',
    add_ons:       'Dessert/Sweet Treats',
    guest_count:   30,
    event_date:    '2026-06-14',
    days_to_event: 40,
    location:      'Backyard',
    dietary_needs: 'Kosher (5 guests)',
    how_heard:     'Instagram',
    traffic_source:'Website',
    repeat_visitor:'No',
    base_price_pp: 50,
    add_on_fee:    0,
    late_booking_fee: 0,
    estimated_quote:  1500,
    status:        'Pending',
  },
  {
    id: 4,
    inquiry_date:  '2026-04-28',
    customer_name: 'Eric Thompson',
    email:         'eric.t@email.com',
    phone:         '914-555-0412',
    event_type:    'Pizza Making Class',
    add_ons:       'Sip & Serve + Dessert',
    guest_count:   15,
    event_date:    '2026-05-22',
    days_to_event: 19,
    location:      'CoCreate',
    dietary_needs: 'None',
    how_heard:     'Google',
    traffic_source:'Website',
    repeat_visitor:'Yes',
    base_price_pp: 100,
    add_on_fee:    0,
    late_booking_fee: 0,
    estimated_quote:  1500,
    status:        'Confirmed',
  },
  {
    id: 5,
    inquiry_date:  '2026-05-04',
    customer_name: 'Nina Gomez',
    email:         'nina.g@yahoo.com',
    phone:         '203-555-0567',
    event_type:    'Pizza Making Class',
    add_ons:       'Coffee Tasting',
    guest_count:   10,
    event_date:    '2026-05-15',
    days_to_event: 13,
    location:      'Community Center',
    dietary_needs: 'Vegetarian',
    how_heard:     'Facebook',
    traffic_source:'Website',
    repeat_visitor:'No',
    base_price_pp: 100,
    add_on_fee:    0,
    late_booking_fee: 150,
    estimated_quote:  1150,
    status:        'Ghosted',
  },
  {
    id: 6,
    inquiry_date:  '2026-04-25',
    customer_name: 'Chris Morgan',
    email:         'chris.m@wedding.co',
    phone:         '203-555-0678',
    event_type:    'Pizza Catering',
    add_ons:       'None',
    guest_count:   80,
    event_date:    '2026-09-12',
    days_to_event: 130,
    location:      "Client's Home",
    dietary_needs: 'Vegan (10), GF (5)',
    how_heard:     'TikTok',
    traffic_source:'Website',
    repeat_visitor:'No',
    base_price_pp: 30,
    add_on_fee:    0,
    late_booking_fee: 0,
    estimated_quote:  2400,
    status:        'Pending',
  },
  {
    id: 7,
    inquiry_date:  '2026-05-05',
    customer_name: 'Priya Shah',
    email:         'priya.s@gmail.com',
    phone:         '914-555-0789',
    event_type:    'Kids Pizza Class + Sweet Treat',
    add_ons:       'Apron Decoration',
    guest_count:   12,
    event_date:    '2026-05-17',
    days_to_event: 16,
    location:      'CoCreate',
    dietary_needs: 'None',
    how_heard:     'Word of Mouth',
    traffic_source:'Website',
    repeat_visitor:'Yes',
    base_price_pp: 90,
    add_on_fee:    0,
    late_booking_fee: 0,
    estimated_quote:  1080,
    status:        'Confirmed',
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt$ = (n) => '$' + Number(n).toLocaleString()

// Returns true for any value that should be shown as a dash
const isBad = (v) => {
  if (v === null || v === undefined) return true
  const s = String(v)
  if (s === '' || s === 'undefined' || s === 'NaN') return true
  if (s.includes('undefined') || s.includes('NaN')) return true
  return false
}

// Generic safe display — returns '—' for bad values
const safe = (v) => isBad(v) ? '—' : v

// Date display — returns 'TBD' for bad/placeholder dates
const fmtDate = (iso) => {
  if (isBad(iso) || iso === 'TBD' || iso === 'N/A') return 'TBD'
  const parts = String(iso).split('-')
  if (parts.length !== 3) return 'TBD'
  const [y, m, d] = parts
  if (isBad(y) || isBad(m) || isBad(d)) return 'TBD'
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const mi = parseInt(m) - 1
  const di = parseInt(d)
  if (isNaN(mi) || isNaN(di) || mi < 0 || mi > 11) return 'TBD'
  return `${months[mi]} ${di}, ${y}`
}

const splitName = (full) => {
  const parts = full.trim().split(' ')
  return { first: parts[0], last: parts.slice(1).join(' ') }
}

const isPriority = (lead) => lead.days_to_event <= 21 && lead.status === 'Pending'
const isHot      = (lead) => lead.days_to_event <= 21 && lead.status === 'Pending'

const STATUS_STYLE = {
  'In Progress': { background: '#D1ECF1', color: '#0C5460', border: '1px solid #A2D5E0' },
  Pending:       { background: '#FFF3CD', color: '#856404' },
  Confirmed:     { background: '#D4EDDA', color: '#155724' },
  Declined:      { background: '#F8D7DA', color: '#721C24' },
  Ghosted:       { background: '#E2E3E5', color: '#495057' },
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const style = STATUS_STYLE[status] || STATUS_STYLE.Ghosted
  return (
    <span
      style={{ ...style, padding: '3px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap' }}
    >
      {status}
    </span>
  )
}

// ─── Metric Card ──────────────────────────────────────────────────────────────
function MetricCard({ label, value, sub, accent }) {
  return (
    <div
      className="bg-white rounded-2xl p-5 flex-1 min-w-0"
      style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.05)' }}
    >
      <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-1">{label}</p>
      <p
        className="text-2xl font-bold leading-tight"
        style={{ color: accent ? '#C1272D' : '#2D2D2D' }}
      >
        {value}
      </p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────
function DetailPanel({ lead, onClose }) {
  const baseTotal = lead.guest_count * lead.base_price_pp
  return (
    <div
      className="bg-white flex flex-col overflow-hidden"
      style={{
        width: '360px',
        flexShrink: 0,
        borderLeft: '1px solid #E5E7EB',
        height: '100%',
        overflowY: 'auto',
      }}
    >
      {/* Panel header */}
      <div className="flex items-center justify-between px-5 py-4 sticky top-0 bg-white z-10" style={{ borderBottom: '1px solid #F3F4F6' }}>
        <div>
          <p className="font-bold text-base text-[#2D2D2D]">{safe(lead.customer_name)}</p>
          <p className="text-xs text-gray-400">{safe(lead.email)}</p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
          aria-label="Close panel"
        >
          ✕
        </button>
      </div>

      <div className="px-5 py-4 space-y-5 text-sm">
        {/* Status + priority */}
        <div className="flex items-center gap-2">
          <StatusBadge status={lead.status} />
          {isPriority(lead) && (
            <span style={{ background: '#FEE2E2', color: '#991B1B', padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700 }}>
              PRIORITY
            </span>
          )}
          {lead.repeat_visitor === 'Yes' && (
            <span style={{ background: '#DBEAFE', color: '#1E40AF', padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700 }}>
              REPEAT
            </span>
          )}
        </div>

        {/* Contact */}
        <Section label="Contact Info">
          <Row k="Phone" v={lead.phone} />
          <Row k="How heard" v={lead.how_heard} />
          <Row k="Traffic source" v={lead.traffic_source} />
        </Section>

        {/* Event */}
        <Section label="Event Details">
          <Row k="Type" v={lead.event_type} />
          <Row k="Date" v={fmtDate(lead.event_date)} />
          <Row k="Days out" v={isBad(lead.days_to_event) || lead.days_to_event === 'N/A' ? '—' : `${lead.days_to_event} days`} />
          <Row k="Guests" v={isBad(lead.guest_count) || lead.guest_count === 0 ? '—' : lead.guest_count} />
          <Row k="Location" v={lead.location} />
          <Row k="Add-ons" v={lead.add_ons} />
          <Row k="Dietary" v={lead.dietary_needs} />
        </Section>

        {/* Pricing breakdown */}
        <Section label="Pricing Breakdown">
          {isBad(lead.guest_count) || lead.guest_count === 0 || isBad(lead.base_price_pp) || lead.base_price_pp === 0
            ? <Row k="Base" v="—" />
            : <Row k={`Base (${lead.guest_count} × $${lead.base_price_pp})`} v={fmt$(baseTotal)} />
          }
          {lead.add_on_fee > 0   && <Row k="Add-on fee"        v={fmt$(lead.add_on_fee)} />}
          {lead.late_booking_fee > 0 && <Row k="Late booking fee" v={fmt$(lead.late_booking_fee)} accent />}
          <div className="flex justify-between pt-2 mt-1 font-bold" style={{ borderTop: '1px solid #F3F4F6' }}>
            <span>Total Estimate</span>
            {isBad(lead.estimated_quote) || lead.estimated_quote === 0
              ? <span className="text-gray-400 font-normal">Pending</span>
              : <span style={{ color: '#C1272D' }}>{fmt$(lead.estimated_quote)}</span>
            }
          </div>
        </Section>

        {/* Inquiry */}
        <Section label="Inquiry">
          <Row k="Received" v={fmtDate(lead.inquiry_date)} />
          <Row k="Repeat visitor" v={lead.repeat_visitor} />
        </Section>
      </div>
    </div>
  )
}

function Section({ label, children }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">{label}</p>
      <div className="space-y-1.5">{children}</div>
    </div>
  )
}

function Row({ k, v, accent }) {
  const display = isBad(v) ? '—' : v
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-gray-500 shrink-0">{k}</span>
      <span className="text-right font-medium" style={{ color: accent ? '#C1272D' : '#2D2D2D' }}>{display}</span>
    </div>
  )
}

// ─── CSV Export ───────────────────────────────────────────────────────────────
function exportCSV(leads) {
  const headers = [
    'Inquiry Date','First Name','Last Name','Email','Phone',
    'How Heard','Traffic Source','Repeat Visitor','Event Type',
    'Add-ons','Guest Count','Date of Event','Location','Dietary Needs',
    'Base Price PP','Add-on Fee','Late Booking Fee','Estimated Quote',
    'Priority Level','Days to Event','First Email Sent','2-Day Follow-Up Sent',
    'Follow-Up Method','Next Follow-Up Date','Event Status','Notes',
  ]

  const rows = leads.map((l) => {
    const { first, last } = splitName(l.customer_name)
    return [
      l.inquiry_date, first, last, l.email, l.phone,
      l.how_heard, l.traffic_source, l.repeat_visitor, l.event_type,
      l.add_ons, l.guest_count, l.event_date, l.location, l.dietary_needs,
      l.base_price_pp, l.add_on_fee, l.late_booking_fee, l.estimated_quote,
      l.days_to_event <= 21 ? 'Yes' : 'No', l.days_to_event,
      'No', 'No', '', '', l.status, '',
    ]
  })

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `everything-dough-leads-${new Date().toISOString().slice(0,10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const STATUS_FILTERS = ['All', 'In Progress', 'Pending', 'Confirmed', 'Ghosted', 'Declined']

export default function CRMDashboard() {
  const { leads: liveLeads } = useLeads()
  const allLeads = [...SAMPLE_LEADS, ...liveLeads]
  const [selected, setSelected] = useState(null)
  const [search, setSearch]     = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  // ── Filtered leads ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return allLeads.filter((l) => {
      const matchSearch = !q ||
        l.customer_name.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.event_type.toLowerCase().includes(q)
      const matchStatus = statusFilter === 'All' || l.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [allLeads, search, statusFilter])

  // ── Metrics ─────────────────────────────────────────────────────────────────
  const metrics = useMemo(() => {
    const pipeline = allLeads
      .filter((l) => l.status === 'Pending' || l.status === 'Confirmed')
      .reduce((s, l) => s + l.estimated_quote, 0)
    return {
      pipeline,
      pending:   allLeads.filter((l) => l.status === 'Pending').length,
      confirmed: allLeads.filter((l) => l.status === 'Confirmed').length,
      ghosted:   allLeads.filter((l) => l.status === 'Ghosted').length,
      hot:       allLeads.filter(isHot).length,
    }
  }, [allLeads])

  return (
    <div className="crm-root" style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <style>{FONT_STYLES}</style>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header
        className="flex items-center justify-between px-6 py-4 flex-shrink-0"
        style={{ background: '#C1272D' }}
      >
        <div>
          <p className="playfair text-white font-bold text-xl leading-tight">Everything Dough</p>
          <p className="text-red-200 text-xs uppercase tracking-widest mt-0.5">CRM Dashboard</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => exportCSV(allLeads)}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white text-sm font-medium px-4 py-2 rounded-full transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>
          <Link
            to="/"
            className="text-white/80 hover:text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-white/10 transition-colors"
          >
            ← Back to Site
          </Link>
        </div>
      </header>

      {/* ── Metric cards ───────────────────────────────────────────────────── */}
      <div className="flex gap-4 px-6 py-4 flex-shrink-0">
        <MetricCard label="Pipeline Value"  value={fmt$(metrics.pipeline)} sub="Pending + Confirmed" accent />
        <MetricCard label="Pending"         value={metrics.pending} />
        <MetricCard label="Confirmed"       value={metrics.confirmed} />
        <MetricCard label="Ghosted"         value={metrics.ghosted} />
        <MetricCard label="Hot Leads"       value={metrics.hot} sub="Event within 21 days" accent />
      </div>

      {/* ── Filters ────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-6 pb-3 flex-shrink-0 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-48 max-w-72">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, event type…"
            className="w-full bg-white border border-gray-200 rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C1272D]/30 focus:border-[#C1272D]"
          />
        </div>

        {/* Status pills */}
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
              style={
                statusFilter === s
                  ? { background: '#C1272D', color: '#fff' }
                  : { background: '#fff', color: '#6B7280', border: '1px solid #E5E7EB' }
              }
            >
              {s}
            </button>
          ))}
        </div>

        <span className="ml-auto text-xs text-gray-400 whitespace-nowrap">
          {filtered.length} of {allLeads.length} leads
        </span>
      </div>

      {/* ── Table + Detail panel ────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden px-6 pb-6 gap-4">

        {/* Table */}
        <div className="flex-1 overflow-auto bg-white rounded-2xl" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.05)' }}>
          <table className="crm-table w-full text-sm border-collapse">
            <thead>
              <tr style={{ borderBottom: '2px solid #F3F4F6' }}>
                {['Name', 'Event Type', 'Date', 'Guests', 'Quote', 'Source', 'Status'].map((h) => (
                  <th
                    key={h}
                    className="text-left text-xs font-bold uppercase tracking-widest text-gray-400 bg-white"
                    style={{ padding: '12px 14px', position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-gray-400 py-12">No leads match your filters.</td>
                </tr>
              )}
              {filtered.map((lead, i) => (
                <tr
                  key={lead.id}
                  className={i % 2 === 0 ? 'crm-row-even' : 'crm-row-odd'}
                  onClick={() => setSelected(selected?.id === lead.id ? null : lead)}
                  style={selected?.id === lead.id ? { outline: '2px solid #C1272D', outlineOffset: '-2px' } : {}}
                >
                  {/* Name */}
                  <td>
                    <p className="font-medium text-[#2D2D2D]">{safe(lead.customer_name)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{safe(lead.email)}</p>
                  </td>

                  {/* Event type + priority badge */}
                  <td>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span>{safe(lead.event_type)}</span>
                      {isPriority(lead) && (
                        <span
                          style={{ background: '#FEE2E2', color: '#991B1B', padding: '2px 7px', borderRadius: '999px', fontSize: '10px', fontWeight: 700, whiteSpace: 'nowrap' }}
                        >
                          PRIORITY
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Date */}
                  <td className="whitespace-nowrap text-gray-600">{fmtDate(lead.event_date)}</td>

                  {/* Guests */}
                  <td className="text-center font-medium">
                    {isBad(lead.guest_count) || lead.guest_count === 0 ? '—' : lead.guest_count}
                  </td>

                  {/* Quote */}
                  <td className="font-bold">
                    {isBad(lead.estimated_quote) || lead.estimated_quote === 0
                      ? <span className="text-gray-400 font-normal">Pending</span>
                      : <span style={{ color: '#C1272D' }}>{fmt$(lead.estimated_quote)}</span>
                    }
                  </td>

                  {/* Source */}
                  <td className="text-gray-500">{safe(lead.how_heard)}</td>

                  {/* Status */}
                  <td><StatusBadge status={lead.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Detail Panel */}
        {selected && (
          <DetailPanel lead={selected} onClose={() => setSelected(null)} />
        )}
      </div>
    </div>
  )
}
