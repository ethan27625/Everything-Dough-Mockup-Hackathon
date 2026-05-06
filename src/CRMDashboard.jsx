import { useState, useMemo, useRef } from 'react'
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

// ─── Crust AI helpers ─────────────────────────────────────────────────────────
const ADD_ON_BY_TYPE = {
  'Pizza Making Class':           'Mixology Class',
  'Pizza Party':                  'Dessert/Sweet Treats',
  'Pizza Catering':               'Sip and Serve',
  'Kids Pizza Class + Sweet Treat': 'Apron Decoration',
  'Kids Pizza Party':             'Apron Decoration',
  'Cocktail Class':               'Dessert/Sweet Treats',
  'Date Night Pizza Making Class':'Mixology Class',
}
const suggestAddOn = (eventType) =>
  ADD_ON_BY_TYPE[eventType] || 'Dessert/Sweet Treats'

function CrustAI({ lead }) {
  const [copied, setCopied] = useState(false)
  const firstName = lead.customer_name
    ? lead.customer_name.split(' ')[0]
    : 'there'
  const eventDate = fmtDate(lead.event_date)
  const guestCount = isBad(lead.guest_count) || lead.guest_count === 0 ? 'your group' : lead.guest_count
  const quote = isBad(lead.estimated_quote) || lead.estimated_quote === 0 ? 'TBD' : `$${Number(lead.estimated_quote).toLocaleString()}`

  // ── Recommended Action ──────────────────────────────────────────────────────
  let actionBg, actionText
  if (lead.status === 'In Progress') {
    actionBg  = '#D1ECF1'
    actionText = 'Customer is actively chatting with Lexi. Check back soon for complete details.'
  } else if (lead.status === 'Pending' && (lead.days_to_event <= 21 && !isBad(lead.days_to_event) && lead.days_to_event !== 'N/A')) {
    actionBg  = '#FEE2E2'
    actionText = `Priority: Event is in ${lead.days_to_event} days. Follow up today to confirm booking and collect deposit.`
  } else if (lead.status === 'Pending') {
    actionBg  = '#FFFBEB'
    actionText = `Send a personalized quote email within 24 hours. Mention their ${safe(lead.event_type)} for ${guestCount} guests and suggest the ${suggestAddOn(lead.event_type)} add-on.`
  } else if (lead.status === 'Confirmed') {
    actionBg  = '#D4EDDA'
    actionText = 'Booking confirmed. Send event prep details 1 week before. Reminder: arrive 30-45 min early for setup.'
  } else if (lead.status === 'Ghosted') {
    actionBg  = '#E2E3E5'
    actionText = `No response in 3+ days. Send a follow-up SMS: "Hi ${firstName}, still interested in your ${safe(lead.event_type)}? We'd love to make it happen! Reply or call us anytime."`
  } else if (lead.status === 'Declined') {
    actionBg  = '#E2E3E5'
    actionText = 'Lead declined. Add to re-engagement list for seasonal promotions and holiday specials.'
  } else {
    actionBg  = '#F3F4F6'
    actionText = 'No recommendation available for this lead.'
  }

  // ── Draft Follow-Up ─────────────────────────────────────────────────────────
  let draftText
  if (lead.status === 'Pending') {
    draftText = `Subject: Your ${safe(lead.event_type)} with Everything Dough\n\nHi ${firstName},\n\nThank you for your interest in our ${safe(lead.event_type)} for ${guestCount} guests on ${eventDate}! Your estimated quote is ${quote}. I'd love to finalize the details and lock in your date.\n\nBest,\nAlexandra`
  } else if (lead.status === 'Ghosted') {
    draftText = `Subject: Still thinking about your ${safe(lead.event_type)}?\n\nHi ${firstName},\n\nJust checking in about the ${safe(lead.event_type)} you were interested in. We'd love to make it happen for your group. Would you like to hop on a quick call to go over the details?\n\nBest,\nAlexandra`
  } else if (lead.status === 'Confirmed') {
    draftText = `Subject: Your ${safe(lead.event_type)} is coming up!\n\nHi ${firstName},\n\nJust a reminder that your ${safe(lead.event_type)} for ${guestCount} guests is on ${eventDate}. We'll arrive 30-45 minutes early to set up. Let me know if you have any last-minute questions!\n\nBest,\nAlexandra`
  } else if (lead.status === 'Declined') {
    draftText = `Subject: We'd love to have you back\n\nHi ${firstName},\n\nWe hope to work with you in the future! We're always adding new experiences and seasonal specials. Keep us in mind for your next event.\n\nBest,\nAlexandra`
  } else {
    draftText = null
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(draftText).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <>
      <div style={{ borderTop: '1px solid #E5E7EB', marginTop: '4px' }} />
      <div>
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#C1272D' }}>
          ✨ Crust AI
        </p>

        {/* Recommended Action */}
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5">Recommended Action</p>
        <div
          className="text-xs leading-relaxed rounded-lg px-3 py-2.5 mb-4"
          style={{ background: actionBg, color: '#2D2D2D' }}
        >
          {actionText}
        </div>

        {/* Draft Follow-Up */}
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1.5">Draft Follow-Up</p>
        {draftText ? (
          <div
            className="relative rounded-lg px-3 py-2.5 text-xs leading-relaxed"
            style={{ background: '#FAF7F2', border: '1px solid #E5DDD0', fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
          >
            {draftText}
            <button
              onClick={handleCopy}
              className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded font-medium transition-colors"
              style={copied
                ? { background: '#D4EDDA', color: '#155724' }
                : { background: '#E5E7EB', color: '#4B5563' }
              }
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        ) : (
          <p className="text-xs text-gray-400 italic">
            Draft will be generated once the conversation is complete.
          </p>
        )}
      </div>
    </>
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

        {/* Crust AI */}
        <CrustAI lead={lead} />

        {/* Documents */}
        <DocumentButtons lead={lead} />
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

// ─── Invoice / Contract generators ───────────────────────────────────────────
function invoiceNumber() {
  const d = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const r = String(Math.floor(Math.random() * 900) + 100)
  return `ED-${d}-${r}`
}

const todayLong = () => {
  const d = new Date()
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

function openBlob(html) {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url  = URL.createObjectURL(blob)
  window.open(url, '_blank')
  setTimeout(() => URL.revokeObjectURL(url), 60000)
}

function generateInvoice(lead) {
  const invNo     = invoiceNumber()
  const baseTotal = (lead.guest_count || 0) * (lead.base_price_pp || 0)
  const total     = lead.estimated_quote || 0
  const deposit   = (total / 2).toFixed(2)

  const lineItems = [
    `<tr>
      <td>${safe(lead.event_type)} — ${lead.guest_count || 0} guests × $${lead.base_price_pp || 0}/person</td>
      <td class="amt">$${baseTotal.toLocaleString()}</td>
    </tr>`,
    lead.add_on_fee > 0 ? `<tr>
      <td>Add-ons: ${safe(lead.add_ons)}</td>
      <td class="amt">$${Number(lead.add_on_fee).toLocaleString()}</td>
    </tr>` : '',
    lead.late_booking_fee > 0 ? `<tr>
      <td>Late Booking Fee</td>
      <td class="amt accent">$${Number(lead.late_booking_fee).toLocaleString()}</td>
    </tr>` : '',
  ].join('')

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Invoice ${invNo} — Everything Dough</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Georgia, serif; color: #2D2D2D; background: #fff; padding: 48px; max-width: 780px; margin: auto; }
  .top { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #C1272D; padding-bottom: 24px; margin-bottom: 32px; }
  .brand { font-size: 28px; font-weight: bold; color: #C1272D; letter-spacing: -0.5px; }
  .brand sub { font-size: 12px; color: #888; display: block; font-weight: normal; letter-spacing: 0; margin-top: 2px; }
  .inv-label { font-size: 36px; font-weight: bold; color: #2D2D2D; text-align: right; }
  .inv-num { font-size: 13px; color: #888; text-align: right; margin-top: 4px; }
  .meta { display: flex; gap: 48px; margin-bottom: 32px; }
  .meta-block h4 { font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #C1272D; margin-bottom: 8px; }
  .meta-block p { font-size: 14px; line-height: 1.7; }
  .meta-block p.name { font-weight: bold; font-size: 15px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  thead tr { background: #C1272D; color: #fff; }
  thead th { padding: 10px 14px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
  thead th.amt { text-align: right; }
  tbody tr { border-bottom: 1px solid #F3F4F6; }
  tbody tr:nth-child(even) { background: #FAF7F2; }
  tbody td { padding: 11px 14px; font-size: 14px; }
  td.amt { text-align: right; font-variant-numeric: tabular-nums; }
  td.accent { color: #C1272D; }
  .totals { width: 300px; margin-left: auto; }
  .totals tr td { padding: 7px 14px; font-size: 14px; }
  .totals .subtotal td { border-top: 1px solid #E5E7EB; }
  .totals .deposit td { color: #856404; background: #FFFBEB; }
  .totals .grand td { font-weight: bold; font-size: 16px; color: #C1272D; border-top: 2px solid #C1272D; }
  .footer { margin-top: 48px; border-top: 1px solid #E5E7EB; padding-top: 16px; font-size: 12px; color: #888; text-align: center; line-height: 1.8; }
  @media print { body { padding: 24px; } }
</style>
</head>
<body>
  <div class="top">
    <div>
      <div class="brand">Everything Dough<sub>Mobile Pizza Experiences · Stamford, CT</sub></div>
    </div>
    <div>
      <div class="inv-label">INVOICE</div>
      <div class="inv-num">${invNo}</div>
    </div>
  </div>

  <div class="meta">
    <div class="meta-block">
      <h4>Bill To</h4>
      <p class="name">${safe(lead.customer_name)}</p>
      <p>${safe(lead.email)}</p>
      <p>${safe(lead.phone)}</p>
    </div>
    <div class="meta-block">
      <h4>Invoice Details</h4>
      <p><strong>Invoice Date:</strong> ${todayLong()}</p>
      <p><strong>Event Date:</strong> ${fmtDate(lead.event_date)}</p>
      <p><strong>Event Type:</strong> ${safe(lead.event_type)}</p>
      <p><strong>Location:</strong> ${safe(lead.location)}</p>
    </div>
  </div>

  <table>
    <thead>
      <tr><th>Description</th><th class="amt">Amount</th></tr>
    </thead>
    <tbody>
      ${lineItems}
    </tbody>
  </table>

  <table class="totals">
    <tbody>
      <tr class="subtotal"><td>Subtotal</td><td class="amt">$${total.toLocaleString()}</td></tr>
      <tr class="deposit"><td>50% Deposit Required</td><td class="amt">$${Number(deposit).toLocaleString()}</td></tr>
      <tr class="grand"><td>Total</td><td class="amt">$${total.toLocaleString()}</td></tr>
    </tbody>
  </table>

  <div class="footer">
    Payment due within 7 days of invoice date. 50% deposit required to secure your date. Balance due on event day.<br/>
    Everything Dough &nbsp;·&nbsp; bookings@everythingdough.com &nbsp;·&nbsp; @byeverythingdough
  </div>
</body>
</html>`

  openBlob(html)
}

function generateContract(lead) {
  const baseTotal = (lead.guest_count || 0) * (lead.base_price_pp || 0)
  const total     = lead.estimated_quote || 0
  const deposit   = (total / 2).toFixed(2)

  const pricingRows = [
    `<tr><td>${safe(lead.event_type)} — ${lead.guest_count || 0} guests × $${lead.base_price_pp || 0}/person</td><td class="amt">$${baseTotal.toLocaleString()}</td></tr>`,
    lead.add_on_fee > 0 ? `<tr><td>Add-ons: ${safe(lead.add_ons)}</td><td class="amt">$${Number(lead.add_on_fee).toLocaleString()}</td></tr>` : '',
    lead.late_booking_fee > 0 ? `<tr><td>Late Booking Fee</td><td class="amt">$${Number(lead.late_booking_fee).toLocaleString()}</td></tr>` : '',
    `<tr class="grand"><td><strong>Total</strong></td><td class="amt"><strong>$${total.toLocaleString()}</strong></td></tr>`,
    `<tr class="deposit"><td>50% Deposit Required</td><td class="amt">$${Number(deposit).toLocaleString()}</td></tr>`,
  ].join('')

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Event Agreement — Everything Dough</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Georgia, serif; color: #2D2D2D; background: #fff; padding: 48px; max-width: 780px; margin: auto; }
  .header { border-bottom: 3px solid #C1272D; padding-bottom: 20px; margin-bottom: 32px; }
  .brand { font-size: 26px; font-weight: bold; color: #C1272D; }
  .brand sub { font-size: 12px; color: #888; font-weight: normal; display: block; margin-top: 2px; letter-spacing: 0; }
  .doc-title { font-size: 20px; font-weight: bold; color: #2D2D2D; margin-top: 8px; letter-spacing: 0.5px; }
  .doc-date { font-size: 12px; color: #888; margin-top: 2px; }
  h3 { font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #C1272D; margin: 28px 0 10px; }
  p, li { font-size: 14px; line-height: 1.75; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 24px; }
  .info-row { display: flex; gap: 8px; font-size: 14px; }
  .info-row .lbl { color: #888; min-width: 130px; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  thead tr { background: #C1272D; color: #fff; }
  thead th { padding: 9px 14px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
  thead th.amt { text-align: right; }
  tbody tr { border-bottom: 1px solid #F3F4F6; }
  tbody tr:nth-child(even) { background: #FAF7F2; }
  tbody td { padding: 10px 14px; font-size: 14px; }
  td.amt { text-align: right; }
  tr.grand td { border-top: 2px solid #C1272D; color: #C1272D; }
  tr.deposit td { background: #FFFBEB; color: #856404; }
  ol { padding-left: 18px; }
  ol li { margin-bottom: 6px; }
  .sigs { margin-top: 48px; display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
  .sig-block p { font-size: 13px; margin-bottom: 32px; }
  .sig-line { border-bottom: 1px solid #2D2D2D; margin-bottom: 4px; }
  .sig-label { font-size: 11px; color: #888; }
  .footer { margin-top: 40px; border-top: 1px solid #E5E7EB; padding-top: 14px; font-size: 11px; color: #aaa; text-align: center; }
  @media print { body { padding: 24px; } }
</style>
</head>
<body>
  <div class="header">
    <div class="brand">Everything Dough<sub>Mobile Pizza Experiences · Stamford, CT</sub></div>
    <div class="doc-title">Event Agreement</div>
    <div class="doc-date">Date: ${todayLong()}</div>
  </div>

  <h3>Client Information</h3>
  <div class="info-grid">
    <div class="info-row"><span class="lbl">Name:</span><span>${safe(lead.customer_name)}</span></div>
    <div class="info-row"><span class="lbl">Email:</span><span>${safe(lead.email)}</span></div>
    <div class="info-row"><span class="lbl">Phone:</span><span>${safe(lead.phone)}</span></div>
  </div>

  <h3>Event Details</h3>
  <div class="info-grid">
    <div class="info-row"><span class="lbl">Event Type:</span><span>${safe(lead.event_type)}</span></div>
    <div class="info-row"><span class="lbl">Event Date:</span><span>${fmtDate(lead.event_date)}</span></div>
    <div class="info-row"><span class="lbl">Location:</span><span>${safe(lead.location)}</span></div>
    <div class="info-row"><span class="lbl">Guest Count:</span><span>${lead.guest_count || '—'}</span></div>
    <div class="info-row"><span class="lbl">Add-ons:</span><span>${safe(lead.add_ons)}</span></div>
    <div class="info-row"><span class="lbl">Dietary Needs:</span><span>${safe(lead.dietary_needs)}</span></div>
  </div>

  <h3>Pricing</h3>
  <table>
    <thead><tr><th>Description</th><th class="amt">Amount</th></tr></thead>
    <tbody>${pricingRows}</tbody>
  </table>

  <h3>Terms and Conditions</h3>
  <ol>
    <li>A 50% deposit is required to secure your event date. The remaining balance is due on the day of the event.</li>
    <li>Rescheduling is available with at least 4 weeks notice. A 20% rescheduling fee applies.</li>
    <li>Cancellations made less than 2 weeks before the event are not eligible for refund.</li>
    <li>Guest count additions can be accommodated 3–7 days in advance depending on services.</li>
    <li>Everything Dough provides all equipment, setup, and cleanup. Client provides the venue space.</li>
    <li>Gluten-free friendly options are available for an extra charge. Cross-contamination is possible as all items are cooked in the same oven.</li>
  </ol>

  <div class="sigs">
    <div class="sig-block">
      <p><strong>Client</strong></p>
      <div class="sig-line">&nbsp;</div>
      <div class="sig-label">Signature &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Date</div>
    </div>
    <div class="sig-block">
      <p><strong>Everything Dough Representative</strong></p>
      <div class="sig-line">&nbsp;</div>
      <div class="sig-label">Signature &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Date</div>
    </div>
  </div>

  <div class="footer">
    Everything Dough &nbsp;·&nbsp; bookings@everythingdough.com &nbsp;·&nbsp; @byeverythingdough
  </div>
</body>
</html>`

  openBlob(html)
}

// ─── Document Buttons (Invoice + Contract) ────────────────────────────────────
function DocumentButtons({ lead }) {
  if (lead.status !== 'Confirmed' && lead.status !== 'Pending') return null
  return (
    <>
      <div style={{ borderTop: '1px solid #E5E7EB', marginTop: '4px' }} />
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Documents</p>
        <div className="flex gap-2">
          <button
            onClick={() => generateInvoice(lead)}
            className="flex-1 text-xs font-medium py-2 px-3 rounded-lg transition-colors hover:bg-gray-50"
            style={{ border: '1px solid #E5E7EB', color: '#2D2D2D' }}
          >
            📄 Generate Invoice
          </button>
          <button
            onClick={() => generateContract(lead)}
            className="flex-1 text-xs font-medium py-2 px-3 rounded-lg transition-colors hover:bg-gray-50"
            style={{ border: '1px solid #E5E7EB', color: '#2D2D2D' }}
          >
            📋 Generate Contract
          </button>
        </div>
      </div>
    </>
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

// ─── Analytics Tabs ───────────────────────────────────────────────────────────
const ANALYTICS_TABS = ['Pipeline', 'Insights', 'Trends', 'Follow-Ups']

function PipelineTab({ leads, onSelect }) {
  const pending   = leads.filter((l) => l.status === 'Pending')
  const newInq    = pending.filter((_, i) => i % 2 === 0)
  const quoted    = pending.filter((_, i) => i % 2 !== 0)
  const confirmed = leads.filter((l) => l.status === 'Confirmed')
  const completed = []

  const PipelineCol = ({ title, items, bg, color }) => (
    <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-2 flex-shrink-0">
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color }}>{title}</p>
        <span className="text-xs font-bold rounded-full px-2 py-0.5" style={{ background: bg, color }}>{items.length}</span>
      </div>
      <div className="overflow-y-auto flex-1 space-y-2 pr-1">
        {items.length === 0 && <p className="text-xs text-gray-400 italic text-center py-3">No leads</p>}
        {items.map((lead) => (
          <div
            key={lead.id}
            className="rounded-xl px-3 py-2 cursor-pointer transition-opacity hover:opacity-75"
            style={{ background: bg, border: `1px solid ${color}33` }}
            onClick={() => onSelect(lead)}
          >
            <p className="font-medium text-xs text-[#2D2D2D] truncate">{safe(lead.customer_name)}</p>
            <p className="text-xs text-gray-500 truncate mt-0.5">{safe(lead.event_type)}</p>
            {!isBad(lead.estimated_quote) && lead.estimated_quote > 0 && (
              <p className="text-xs font-bold mt-1" style={{ color: '#C1272D' }}>{fmt$(lead.estimated_quote)}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="flex gap-3 h-full overflow-hidden">
      <PipelineCol title="New Inquiry" items={newInq}    bg="#EFF6FF" color="#1D4ED8" />
      <PipelineCol title="Quoted"      items={quoted}    bg="#FFFBEB" color="#92400E" />
      <PipelineCol title="Confirmed"   items={confirmed} bg="#F0FDF4" color="#15803D" />
      <PipelineCol title="Completed"   items={completed} bg="#F3F4F6" color="#6B7280" />
    </div>
  )
}

function InsightsTab({ leads }) {
  const channelMap = {}
  leads.forEach((l) => {
    const src = isBad(l.how_heard) ? 'Unknown' : l.how_heard
    if (!channelMap[src]) channelMap[src] = { count: 0, total: 0 }
    channelMap[src].count++
    channelMap[src].total += isBad(l.estimated_quote) ? 0 : Number(l.estimated_quote)
  })
  const channels = Object.entries(channelMap)
    .map(([src, d]) => ({ src, ...d }))
    .sort((a, b) => b.total - a.total)

  const serviceMap = {}
  leads.forEach((l) => {
    const svc = isBad(l.event_type) ? 'Unknown' : l.event_type
    if (!serviceMap[svc]) serviceMap[svc] = { count: 0, total: 0 }
    serviceMap[svc].count++
    serviceMap[svc].total += isBad(l.estimated_quote) ? 0 : Number(l.estimated_quote)
  })
  const services = Object.entries(serviceMap)
    .map(([svc, d]) => ({ svc, count: d.count, avg: d.count > 0 ? Math.round(d.total / d.count) : 0 }))
    .sort((a, b) => b.count - a.count)
  const topService = services[0]?.svc || '—'

  const vip       = leads.filter((l) => l.repeat_visitor === 'Yes')
  const highValue = leads.filter((l) => !isBad(l.estimated_quote) && Number(l.estimated_quote) > 2000)
  const atRisk    = leads.filter((l) => l.status === 'Ghosted')
  const sumQ      = (arr) => arr.reduce((s, l) => s + (isBad(l.estimated_quote) ? 0 : Number(l.estimated_quote)), 0)

  const InsightCard = ({ title, children }) => (
    <div className="flex-1 min-w-0 bg-white rounded-2xl p-4 flex flex-col overflow-hidden" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.06)', border: '1px solid #F3F4F6' }}>
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 flex-shrink-0">{title}</p>
      <div className="flex-1 overflow-y-auto">{children}</div>
    </div>
  )

  return (
    <div className="flex gap-3 h-full overflow-hidden">
      <InsightCard title="Top Performing Channels">
        <div className="space-y-2">
          {channels.map((c, i) => (
            <div key={c.src} className="flex items-center justify-between gap-2 text-xs">
              <span className={`truncate ${i === 0 ? 'font-bold text-[#2D2D2D]' : 'text-gray-600'}`}>
                {i === 0 ? '🏆 ' : ''}{c.src}
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-gray-400">{c.count} lead{c.count !== 1 ? 's' : ''}</span>
                <span className="font-bold" style={{ color: '#C1272D' }}>{fmt$(c.total)}</span>
              </div>
            </div>
          ))}
        </div>
      </InsightCard>

      <InsightCard title="Popular Services">
        <div className="space-y-2">
          {services.map((s) => (
            <div key={s.svc} className="flex items-center justify-between gap-2 text-xs">
              <span className="truncate text-gray-600">{s.svc}</span>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-gray-400">{s.count}×</span>
                <span className="font-medium text-[#2D2D2D]">avg {fmt$(s.avg)}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 italic mt-3 pt-2" style={{ borderTop: '1px solid #F3F4F6' }}>
          Crust recommends: Feature <strong>{topService}</strong> prominently on your website and social media.
        </p>
      </InsightCard>

      <InsightCard title="Customer Segments">
        <div className="space-y-2">
          {[
            { label: 'VIP / Repeat', arr: vip,       color: '#1E40AF', bg: '#DBEAFE' },
            { label: 'High Value',   arr: highValue,  color: '#065F46', bg: '#D1FAE5' },
            { label: 'At Risk',      arr: atRisk,     color: '#991B1B', bg: '#FEE2E2' },
          ].map((seg) => (
            <div key={seg.label} className="flex items-center justify-between rounded-lg px-3 py-2 text-xs" style={{ background: seg.bg }}>
              <span className="font-medium" style={{ color: seg.color }}>{seg.label}</span>
              <span style={{ color: seg.color }}>{seg.arr.length} · {fmt$(sumQ(seg.arr))}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 italic mt-3 pt-2" style={{ borderTop: '1px solid #F3F4F6' }}>
          Crust recommends: Offer a 10% loyalty discount to repeat customers. Send a re-engagement campaign to At Risk leads.
        </p>
      </InsightCard>
    </div>
  )
}

function TrendsTab({ leads }) {
  const typeMap = {}
  leads.forEach((l) => {
    const t = isBad(l.event_type) ? 'Unknown' : l.event_type
    typeMap[t] = (typeMap[t] || 0) + 1
  })
  const types    = Object.entries(typeMap).sort((a, b) => b[1] - a[1])
  const maxCount = types[0]?.[1] || 1

  return (
    <div className="flex gap-3 h-full overflow-hidden">
      <div className="flex-1 min-w-0 bg-white rounded-2xl p-4 overflow-y-auto" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.06)', border: '1px solid #F3F4F6' }}>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Event Type Demand</p>
        <div className="space-y-3">
          {types.map(([type, count]) => (
            <div key={type}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-[#2D2D2D] truncate pr-2">{type}</span>
                <span className="font-bold shrink-0" style={{ color: '#C1272D' }}>{count}</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${(count / maxCount) * 100}%`, background: '#C1272D' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 min-w-0 bg-white rounded-2xl p-4 overflow-y-auto" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.06)', border: '1px solid #F3F4F6', borderLeft: '4px solid #7C3AED' }}>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Seasonal Recommendations</p>
        <div className="space-y-3 text-xs leading-relaxed" style={{ color: '#4B5563' }}>
          {[
            { season: '🌸 Spring (May–June)',          text: 'Push corporate team building packages — 2 of your current leads are corporate events. Partner with local businesses for end-of-quarter celebrations.' },
            { season: '☀️ Summer (July–August)',        text: 'Promote outdoor backyard pizza parties and kids birthday packages. Peak season for family events.' },
            { season: '🍂 Fall (September–October)',    text: "Wedding and catering season — Chris Morgan's September wedding is your largest lead at $2,400. Create a wedding catering showcase package." },
            { season: '🎄 Holiday (November–December)', text: 'Launch a holiday party package bundling Pizza Making Class + Cocktail Class. Target corporate holiday parties and family gatherings.' },
          ].map((r) => (
            <div key={r.season}><span className="font-bold text-[#2D2D2D]">{r.season}:</span> {r.text}</div>
          ))}
        </div>
      </div>
    </div>
  )
}

function FollowUpsTab({ leads, onSelect }) {
  const getDays = (l) =>
    isBad(l.days_to_event) || l.days_to_event === 'N/A' ? 9999 : Number(l.days_to_event)

  const actionable = leads
    .filter((l) => l.status === 'Pending' || l.status === 'Ghosted' || l.status === 'In Progress')
    .sort((a, b) => getDays(a) - getDays(b))

  const urgency = (lead) => {
    const d = getDays(lead)
    if (d <= 14) return { label: 'Urgent', bg: '#FEE2E2', color: '#991B1B' }
    if (d <= 30) return { label: 'Soon',   bg: '#FFFBEB', color: '#92400E' }
    return          { label: 'Normal',  bg: '#D4EDDA', color: '#155724' }
  }

  const action = (lead) => {
    const first = lead.customer_name ? lead.customer_name.split(' ')[0] : 'there'
    if (lead.status === 'In Progress') return 'Customer is chatting with Lexi — check back soon.'
    if (lead.status === 'Ghosted')     return `Send follow-up SMS to ${first} — no response in 3+ days.`
    const d = getDays(lead)
    if (d <= 21) return `Priority: Event in ${lead.days_to_event} days. Confirm booking and collect deposit.`
    return 'Send personalized quote email within 24 hours.'
  }

  const urgentCount = actionable.filter((l) => getDays(l) <= 14).length

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <p className="text-xs text-gray-500 mb-2 flex-shrink-0">
        <strong className="text-[#2D2D2D]">{actionable.length}</strong> leads need follow-up.{' '}
        <strong style={{ color: '#991B1B' }}>{urgentCount}</strong> are urgent (event within 2 weeks).
      </p>
      <div className="overflow-y-auto flex-1 space-y-2 pr-1">
        {actionable.length === 0 && (
          <p className="text-xs text-gray-400 italic text-center py-6">No leads need follow-up right now.</p>
        )}
        {actionable.map((lead) => {
          const u = urgency(lead)
          const d = getDays(lead)
          return (
            <div
              key={lead.id}
              className="bg-white rounded-xl px-4 py-2.5 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors"
              style={{ border: '1px solid #F3F4F6' }}
              onClick={() => onSelect(lead)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="font-medium text-sm text-[#2D2D2D]">{safe(lead.customer_name)}</span>
                  <StatusBadge status={lead.status} />
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: u.bg, color: u.color }}>{u.label}</span>
                </div>
                <p className="text-xs text-gray-500 truncate">
                  {safe(lead.event_type)} · {d < 9999 ? `${lead.days_to_event} days out` : 'No date set'}
                </p>
                <p className="text-xs text-gray-400 mt-0.5 truncate">{action(lead)}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); onSelect(lead) }}
                className="shrink-0 text-xs font-medium px-3 py-1.5 rounded-full transition-colors"
                style={{ background: '#FAF7F2', border: '1px solid #E5E7EB', color: '#C1272D' }}
              >
                Draft Email
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function AnalyticsTabs({ allLeads, onSelect }) {
  const [activeTab, setActiveTab] = useState('Pipeline')
  const [isOpen,    setIsOpen]    = useState(false)

  return (
    <div
      className="flex flex-col flex-shrink-0 rounded-2xl overflow-hidden"
      style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.05)' }}
    >
      {/* ── Toggle bar ─────────────────────────────────────────────────────── */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="flex items-center justify-between w-full px-4 py-3 transition-colors"
        style={{
          background: '#FAF7F2',
          borderBottom: isOpen ? '1px solid #F3F4F6' : 'none',
        }}
      >
        <span className="text-sm font-bold" style={{ color: '#C1272D' }}>
          ✨ Crust AI — Analytics & Actions
        </span>
        <svg
          className="w-4 h-4 transition-transform duration-300"
          style={{ color: '#C1272D', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
          fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* ── Collapsible content ─────────────────────────────────────────────── */}
      <div style={{ height: isOpen ? '280px' : '0px', overflow: 'hidden', transition: 'height 0.3s ease' }}>
        <div className="bg-white p-4 flex flex-col" style={{ height: '280px' }}>
          <div className="flex items-center gap-2 mb-3 flex-shrink-0">
            {ANALYTICS_TABS.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
                style={
                  activeTab === t
                    ? { background: '#C1272D', color: '#fff' }
                    : { background: '#F3F4F6', color: '#6B7280', border: '1px solid #E5E7EB' }
                }
              >
                {t}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-hidden">
            {activeTab === 'Pipeline'   && <PipelineTab  leads={allLeads} onSelect={onSelect} />}
            {activeTab === 'Insights'   && <InsightsTab  leads={allLeads} />}
            {activeTab === 'Trends'     && <TrendsTab    leads={allLeads} />}
            {activeTab === 'Follow-Ups' && <FollowUpsTab leads={allLeads} onSelect={onSelect} />}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const STATUS_FILTERS = ['All', 'In Progress', 'Pending', 'Confirmed', 'Ghosted', 'Declined']

export default function CRMDashboard() {
  const { leads: liveLeads } = useLeads()
  const allLeads = [...SAMPLE_LEADS, ...liveLeads]
  const [selected, setSelected] = useState(null)
  const [search, setSearch]     = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const tableRef = useRef(null)

  // Select a lead from the bottom tabs and scroll the table back to the top
  const handleSelectFromTab = (lead) => {
    setSelected(lead)
    if (tableRef.current) tableRef.current.scrollTop = 0
  }

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
    <div className="crm-root" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <style>{FONT_STYLES}</style>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header
        className="flex items-center justify-between px-6 py-4 flex-shrink-0"
        style={{ background: '#C1272D' }}
      >
        <div>
          <p className="playfair text-white font-bold text-xl leading-tight">Everything Dough</p>
          <p className="text-red-200 text-xs uppercase tracking-widest mt-0.5">Crust — CRM Dashboard</p>
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
      <div className="flex flex-wrap gap-3 px-4 sm:px-6 py-4 flex-shrink-0">
        <MetricCard label="Pipeline Value"  value={fmt$(metrics.pipeline)} sub="Pending + Confirmed" accent />
        <MetricCard label="Pending"         value={metrics.pending} />
        <MetricCard label="Confirmed"       value={metrics.confirmed} />
        <MetricCard label="Ghosted"         value={metrics.ghosted} />
        <MetricCard label="Hot Leads"       value={metrics.hot} sub="Event within 21 days" accent />
      </div>

      {/* ── Filters ────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 sm:px-6 pb-3 flex-shrink-0 flex-wrap">
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

      {/* ── Crust AI summary bar ────────────────────────────────────────────── */}
      {(() => {
        const priorityCount = allLeads.filter((l) => l.status === 'Pending' && !isBad(l.days_to_event) && l.days_to_event !== 'N/A' && l.days_to_event <= 21).length
        const ghostedCount  = allLeads.filter((l) => l.status === 'Ghosted').length
        return (
          <div
            className="mx-4 sm:mx-6 mb-3 flex-shrink-0 px-4 py-2 rounded-xl text-xs flex items-center gap-1.5"
            style={{ background: '#FFFBEB', border: '1px solid #FDE68A', color: '#92400E' }}
          >
            <span>✨</span>
            <span>
              <strong>Crust AI:</strong>{' '}
              <strong>{priorityCount}</strong> priority follow-up{priorityCount !== 1 ? 's' : ''} needed today
              {' · '}
              <strong>{ghostedCount}</strong> lead{ghostedCount !== 1 ? 's' : ''} need re-engagement
            </span>
          </div>
        )
      })()}

      {/* ── Table + Analytics ────────────────────────────────────────────────── */}
      <div className="flex flex-col px-4 sm:px-6 pb-6 gap-3" style={{ flex: '1 0 auto' }}>
        <div className="flex gap-4" style={{ minHeight: '420px' }}>

        {/* Table */}
        <div ref={tableRef} className="flex-1 min-w-0 overflow-auto bg-white rounded-2xl" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.05)' }}>
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
        <AnalyticsTabs allLeads={allLeads} onSelect={handleSelectFromTab} />
      </div>
    </div>
  )
}
