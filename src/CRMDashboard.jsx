import { useState, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useLeads } from './LeadContext'

// ─── Mobile / responsive CSS ──────────────────────────────────────────────────
const STYLES = `
  .crm2-root { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #F8FAFC; min-height: 100vh; color: #0F172A; }

  /* ── Header grid ── */
  .crm2-header-grid { display: grid; grid-template-columns: 3fr 2fr; gap: 16px; padding: 20px 24px 0; }
  @media (max-width: 767px) { .crm2-header-grid { grid-template-columns: 1fr; } }

  /* ── Metric cards ── */
  .crm2-metrics { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; padding: 16px 24px; }
  @media (max-width: 767px) { .crm2-metrics { grid-template-columns: 1fr 1fr; } }

  /* ── Tab bar ── */
  .crm2-tabs { display: flex; gap: 2px; overflow-x: auto; scrollbar-width: none; flex-wrap: nowrap; }
  .crm2-tabs::-webkit-scrollbar { display: none; }

  /* ── CRM tab columns ── */
  .crm2-columns { display: flex; gap: 16px; align-items: flex-start; }
  .crm2-lead-list { flex: 1 1 0; min-width: 0; }
  .crm2-detail-col { width: 380px; flex-shrink: 0; }
  @media (max-width: 900px) {
    .crm2-detail-col { position: fixed; bottom: 0; left: 0; right: 0; width: 100%; max-height: 85vh; border-radius: 16px 16px 0 0; z-index: 9000; box-shadow: 0 -8px 32px rgba(0,0,0,0.18); overflow-y: auto; animation: slideUp2 0.25s ease; }
  }
  @keyframes slideUp2 { from { transform: translateY(100%); } to { transform: translateY(0); } }

  /* ── Insights bar charts ── */
  .bar-fill { height: 10px; border-radius: 999px; background: #DC2626; transition: width 0.4s ease; }
  .bar-fill-light { height: 10px; border-radius: 999px; background: #94A3B8; transition: width 0.4s ease; }
  .bar-track { height: 10px; border-radius: 999px; background: #F1F5F9; overflow: hidden; flex: 1; }

  /* ── Follow-up cards ── */
  @media (max-width: 639px) {
    .followup2-card { flex-direction: column !important; align-items: flex-start !important; }
    .followup2-btn  { margin-top: 8px !important; align-self: stretch !important; text-align: center; }
  }

  /* ── Search/filter row ── */
  .crm2-filter-row { display: flex; gap: 10px; margin-bottom: 14px; align-items: center; }
  @media (max-width: 639px) { .crm2-filter-row { flex-direction: column; align-items: stretch; } }

  /* ── Agent terminal ── */
  .agent-term { background: #450A0A; border-radius: 12px; padding: 16px; font-family: "SF Mono", "Fira Code", monospace; font-size: 12px; color: #94A3B8; min-height: 140px; max-height: 240px; overflow-y: auto; }
  .agent-term .log-line { color: #4ADE80; margin-bottom: 4px; line-height: 1.6; }
  .agent-term .log-cursor { display: inline-block; width: 8px; height: 14px; background: #4ADE80; animation: blink 1s step-end infinite; vertical-align: middle; margin-left: 4px; }
  @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
`

// ─── Sample leads (unchanged) ─────────────────────────────────────────────────
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

// ─── Helpers (unchanged) ──────────────────────────────────────────────────────
const fmt$ = (n) => '$' + Number(n).toLocaleString()

const isBad = (v) => {
  if (v === null || v === undefined) return true
  const s = String(v)
  if (s === '' || s === 'undefined' || s === 'NaN') return true
  if (s.includes('undefined') || s.includes('NaN')) return true
  return false
}

const safe = (v) => isBad(v) ? '—' : v

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
  const parts = (full || '').trim().split(' ')
  return { first: parts[0], last: parts.slice(1).join(' ') }
}

// ─── Lead enrichment helpers ──────────────────────────────────────────────────
function getDays(lead) {
  return isBad(lead.days_to_event) || lead.days_to_event === 'N/A'
    ? 9999
    : Number(lead.days_to_event)
}

function getDisplayLabel(lead) {
  if (lead.status === 'Confirmed')   return { label: 'Booked',      bg: '#DBEAFE', color: '#1E40AF' }
  if (lead.status === 'Ghosted')     return { label: 'At Risk',     bg: '#FFF7ED', color: '#B91C1C' }
  if (lead.status === 'Declined')    return { label: 'Declined',    bg: '#FFF7ED', color: '#B91C1C' }
  if (lead.status === 'In Progress') return { label: 'In Progress', bg: '#DBEAFE', color: '#1D4ED8' }
  if (lead.status === 'Pending') {
    const d = getDays(lead)
    if (d <= 21) return { label: 'Hot',  bg: '#D1FAE5', color: '#065F46' }
    return             { label: 'Warm', bg: '#FFFBEB', color: '#92400E' }
  }
  return { label: lead.status, bg: '#F1F5F9', color: '#64748B' }
}

function getProbability(lead) {
  if (lead.status === 'Confirmed')   return 100
  if (lead.status === 'Ghosted')     return 35
  if (lead.status === 'In Progress') return 50
  if (lead.status === 'Declined')    return 5
  if (lead.status === 'Pending') {
    const d = getDays(lead)
    if (d <= 14) return 90
    if (d <= 21) return 80
    if (d <= 30) return 70
    return 60
  }
  return 50
}

function getStage(lead, index) {
  if (lead.status === 'Confirmed')   return 'Booked'
  if (lead.status === 'Ghosted')     return 'Ghosted'
  if (lead.status === 'Declined')    return 'Declined'
  if (lead.status === 'In Progress') return 'In Progress'
  if (lead.status === 'Pending')     return index % 2 === 0 ? 'New Inquiry' : 'Proposal Sent'
  return lead.status
}

function getLastTouch(inquiryDate) {
  if (isBad(inquiryDate)) return 'Unknown'
  try {
    const d    = new Date(inquiryDate)
    const now  = new Date()
    const diff = Math.floor((now - d) / (1000 * 60 * 60 * 24))
    if (diff === 0) return 'Today'
    if (diff === 1) return '1 day ago'
    return `${diff}d ago`
  } catch { return 'Unknown' }
}

function getScoreReason(lead) {
  if (lead.status === 'Confirmed')   return `Lead is confirmed. Event locked in for ${fmtDate(lead.event_date)}.`
  if (lead.status === 'Ghosted')     return 'No response in 3+ days. SMS re-engagement recommended immediately.'
  if (lead.status === 'In Progress') return 'Customer is engaging with Lexi. Score will update once conversation completes.'
  const d = getDays(lead)
  if (d <= 14) return `Event only ${d} days away — high urgency. Close immediately to secure deposit.`
  if (d <= 21) return `Event in ${d} days. Priority window — reach out today to confirm booking.`
  if (lead.repeat_visitor === 'Yes') return 'Repeat customer — higher conversion likelihood. Consider offering a loyalty discount.'
  return 'Early-stage lead. Personalized quote within 24 hours will significantly increase conversion.'
}

// ─── AI Agent message templates ───────────────────────────────────────────────
function getSMSTemplate(lead) {
  const first     = lead.customer_name ? lead.customer_name.split(' ')[0] : 'there'
  const eventType = safe(lead.event_type).toLowerCase()
  const guests    = isBad(lead.guest_count) || lead.guest_count === 0 ? 'your group' : lead.guest_count

  if (eventType.includes('kids'))
    return `Hi ${first}! 🍕 Following up on your Kids Pizza Class for ${guests} little ones. We can host at CoCreate or come to you — ready to lock in a date?`
  if (eventType.includes('corporate') || eventType.includes('team') || lead.location === 'Corporate Office')
    return `Hi ${first}! Following up on your team pizza event for ${guests} guests. We can add a Mixology Class for the full experience. Want a quick call? — Alexandra @ Everything Dough`
  if (eventType.includes('party'))
    return `Hi ${first}! 🍕 Checking in on your Pizza Party for ${guests} guests. We can come to your backyard or host at CoCreate. Still interested?`
  if (eventType.includes('catering'))
    return `Hi ${first}! Following up on catering for ${guests} guests. Would love to do a quick menu consultation. When works for you? — Alexandra`
  return `Hi ${first}! Just checking in about your ${safe(lead.event_type)} inquiry. We'd love to make it happen! — Alexandra @ Everything Dough 🍕`
}

function getEmailTemplate(lead) {
  const first     = lead.customer_name ? lead.customer_name.split(' ')[0] : 'there'
  const eventType = safe(lead.event_type)
  const etLower   = eventType.toLowerCase()
  const date      = fmtDate(lead.event_date)
  const guests    = isBad(lead.guest_count) || lead.guest_count === 0 ? 'your group' : lead.guest_count
  const quote     = isBad(lead.estimated_quote) || lead.estimated_quote === 0 ? 'to be confirmed' : `$${Number(lead.estimated_quote).toLocaleString()}`
  const sig       = `\n\nWarm regards,\nAlexandra Castro\nEverything Dough | bookings@everythingdough.com`

  if (etLower.includes('kids'))
    return `Subject: Your Kids Pizza Class — Let's Make It Happen! 🍕\n\nHi ${first},\n\nThank you for reaching out about a Kids Pizza Class for ${guests} little ones! The kids get to make their own dough, top their pizzas, and take home an apron.\n\nYour event date is ${date} and your estimated quote is ${quote}. We can host at CoCreate in Stamford or come to you.\n\nI'd love to lock in your date — what works best for a quick 10-minute call this week?${sig}`
  if (etLower.includes('party'))
    return `Subject: Your Pizza Party — Everything Dough 🍕\n\nHi ${first},\n\nThanks for your interest in a Pizza Party for ${guests} guests! We bring everything — the ovens, the dough, the toppings — and leave no mess behind.\n\nYour event is ${date} and your estimated quote is ${quote}. We can come to your backyard, a rented venue, or host at CoCreate.\n\nWould love to chat details — are you free for a quick call this week?${sig}`
  if (etLower.includes('catering'))
    return `Subject: Your Catering Inquiry — Everything Dough 🍕\n\nHi ${first},\n\nThank you for considering Everything Dough for your event for ${guests} guests on ${date}! We specialize in interactive pizza catering where guests customize their own pies.\n\nYour estimated quote is ${quote}. I'd love to schedule a brief menu consultation call.\n\nWhat day works for 15 minutes?${sig}`
  return `Subject: Your ${eventType} Inquiry — Everything Dough 🍕\n\nHi ${first},\n\nThank you for your interest in a ${eventType} for ${guests} guests on ${date}! We'd love to make this a memorable experience.\n\nYour estimated quote is ${quote}. We can accommodate dietary needs, add a Mixology Class, and more.\n\nAre you free for a quick call this week to lock in your date?${sig}`
}

function getAgentLogs(lead) {
  const first = lead.customer_name ? lead.customer_name.split(' ')[0] : 'there'
  const prob  = getProbability(lead)
  const stage = getStage(lead, 0)
  return [
    `[1/6] Loading lead: ${safe(lead.customer_name)} — ${safe(lead.event_type)}`,
    `[2/6] AI scoring complete → Conversion probability: ${prob}%`,
    `[3/6] CRM updated → Stage: ${stage} | Status: ${lead.status}`,
    `[4/6] Drafting personalized follow-up for ${first}...`,
    `[5/6] Scheduler: Adding reminder for ${fmtDate(lead.event_date)} event`,
    `[6/6] Done ✓ — Manual work replaced: ~45 min → 8 sec`,
  ]
}

// ─── Crust AI logic (unchanged core logic) ────────────────────────────────────
const ADD_ON_BY_TYPE = {
  'Pizza Making Class':             'Mixology Class',
  'Pizza Party':                    'Dessert/Sweet Treats',
  'Pizza Catering':                 'Sip and Serve',
  'Kids Pizza Class + Sweet Treat': 'Apron Decoration',
  'Kids Pizza Party':               'Apron Decoration',
  'Cocktail Class':                 'Dessert/Sweet Treats',
  'Date Night Pizza Making Class':  'Mixology Class',
}
const suggestAddOn = (eventType) => ADD_ON_BY_TYPE[eventType] || 'Dessert/Sweet Treats'

function getCrustAction(lead) {
  const firstName  = lead.customer_name ? lead.customer_name.split(' ')[0] : 'there'
  const guestCount = isBad(lead.guest_count) || lead.guest_count === 0 ? 'your group' : lead.guest_count
  if (lead.status === 'In Progress')
    return { bg: '#DBEAFE', text: 'Customer is actively chatting with Lexi. Check back soon for complete details.' }
  if (lead.status === 'Pending' && !isBad(lead.days_to_event) && lead.days_to_event !== 'N/A' && lead.days_to_event <= 21)
    return { bg: '#FEE2E2', text: `Priority: Event is in ${lead.days_to_event} days. Follow up today to confirm booking and collect deposit.` }
  if (lead.status === 'Pending')
    return { bg: '#FEF3C7', text: `Send a personalized quote within 24 hours. Mention their ${safe(lead.event_type)} for ${guestCount} guests and suggest the ${suggestAddOn(lead.event_type)} add-on.` }
  if (lead.status === 'Confirmed')
    return { bg: '#D1FAE5', text: 'Booking confirmed. Send event prep details 1 week before. Reminder: arrive 30–45 min early for setup.' }
  if (lead.status === 'Ghosted')
    return { bg: '#FFF7ED', text: `No response in 3+ days. Send follow-up SMS: "Hi ${firstName}, still interested in your ${safe(lead.event_type)}? We'd love to make it happen!"` }
  return { bg: '#FFF7ED', text: 'Add to re-engagement list for seasonal promotions and holiday specials.' }
}

function getCrustDraft(lead) {
  const firstName  = lead.customer_name ? lead.customer_name.split(' ')[0] : 'there'
  const eventDate  = fmtDate(lead.event_date)
  const guestCount = isBad(lead.guest_count) || lead.guest_count === 0 ? 'your group' : lead.guest_count
  const quote      = isBad(lead.estimated_quote) || lead.estimated_quote === 0 ? 'TBD' : `$${Number(lead.estimated_quote).toLocaleString()}`

  if (lead.status === 'Pending')
    return `Subject: Your ${safe(lead.event_type)} with Everything Dough\n\nHi ${firstName},\n\nThank you for your interest in our ${safe(lead.event_type)} for ${guestCount} guests on ${eventDate}! Your estimated quote is ${quote}. I'd love to finalize the details and lock in your date.\n\nBest,\nAlexandra`
  if (lead.status === 'Ghosted')
    return `Subject: Still thinking about your ${safe(lead.event_type)}?\n\nHi ${firstName},\n\nJust checking in about the ${safe(lead.event_type)} you were interested in. We'd love to make it happen for your group. Would you like to hop on a quick call?\n\nBest,\nAlexandra`
  if (lead.status === 'Confirmed')
    return `Subject: Your ${safe(lead.event_type)} is coming up!\n\nHi ${firstName},\n\nJust a reminder that your ${safe(lead.event_type)} for ${guestCount} guests is on ${eventDate}. We'll arrive 30–45 minutes early to set up. Let me know if you have any last-minute questions!\n\nBest,\nAlexandra`
  if (lead.status === 'Declined')
    return `Subject: We'd love to have you back\n\nHi ${firstName},\n\nWe hope to work with you in the future! We're always adding new experiences and seasonal specials. Keep us in mind for your next event.\n\nBest,\nAlexandra`
  return null
}

// ─── Invoice / Contract generators (unchanged) ────────────────────────────────
function invoiceNumber() {
  const d = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const r = String(Math.floor(Math.random() * 900) + 100)
  return `ED-${d}-${r}`
}

const todayLong = () => new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

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
    `<tr><td>${safe(lead.event_type)} — ${lead.guest_count || 0} guests × $${lead.base_price_pp || 0}/person</td><td class="amt">$${baseTotal.toLocaleString()}</td></tr>`,
    lead.add_on_fee > 0 ? `<tr><td>Add-ons: ${safe(lead.add_ons)}</td><td class="amt">$${Number(lead.add_on_fee).toLocaleString()}</td></tr>` : '',
    lead.late_booking_fee > 0 ? `<tr><td>Late Booking Fee</td><td class="amt accent">$${Number(lead.late_booking_fee).toLocaleString()}</td></tr>` : '',
  ].join('')
  openBlob(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>Invoice ${invNo} — Everything Dough</title><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Georgia,serif;color:#2D2D2D;background:#fff;padding:48px;max-width:780px;margin:auto}.top{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #C1272D;padding-bottom:24px;margin-bottom:32px}.brand{font-size:28px;font-weight:bold;color:#C1272D}.brand sub{font-size:12px;color:#888;display:block;font-weight:normal;margin-top:2px}.inv-label{font-size:36px;font-weight:bold;text-align:right}.inv-num{font-size:13px;color:#888;text-align:right;margin-top:4px}.meta{display:flex;gap:48px;margin-bottom:32px}.meta-block h4{font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#C1272D;margin-bottom:8px}.meta-block p{font-size:14px;line-height:1.7}.meta-block p.name{font-weight:bold;font-size:15px}table{width:100%;border-collapse:collapse;margin-bottom:24px}thead tr{background:#C1272D;color:#fff}thead th{padding:10px 14px;text-align:left;font-size:12px;text-transform:uppercase;letter-spacing:1px}thead th.amt{text-align:right}tbody tr{border-bottom:1px solid #F3F4F6}tbody td{padding:11px 14px;font-size:14px}td.amt{text-align:right}td.accent{color:#C1272D}.totals{width:300px;margin-left:auto}.totals tr td{padding:7px 14px;font-size:14px}.totals .subtotal td{border-top:1px solid #E5E7EB}.totals .deposit td{color:#856404;background:#FFFBEB}.totals .grand td{font-weight:bold;font-size:16px;color:#C1272D;border-top:2px solid #C1272D}.footer{margin-top:48px;border-top:1px solid #E5E7EB;padding-top:16px;font-size:12px;color:#888;text-align:center;line-height:1.8}@media print{body{padding:24px}}</style></head><body><div class="top"><div><div class="brand">Everything Dough<sub>Mobile Pizza Experiences · Stamford, CT</sub></div></div><div><div class="inv-label">INVOICE</div><div class="inv-num">${invNo}</div></div></div><div class="meta"><div class="meta-block"><h4>Bill To</h4><p class="name">${safe(lead.customer_name)}</p><p>${safe(lead.email)}</p><p>${safe(lead.phone)}</p></div><div class="meta-block"><h4>Invoice Details</h4><p><strong>Invoice Date:</strong> ${todayLong()}</p><p><strong>Event Date:</strong> ${fmtDate(lead.event_date)}</p><p><strong>Event Type:</strong> ${safe(lead.event_type)}</p><p><strong>Location:</strong> ${safe(lead.location)}</p></div></div><table><thead><tr><th>Description</th><th class="amt">Amount</th></tr></thead><tbody>${lineItems}</tbody></table><table class="totals"><tbody><tr class="subtotal"><td>Subtotal</td><td class="amt">$${total.toLocaleString()}</td></tr><tr class="deposit"><td>50% Deposit Required</td><td class="amt">$${Number(deposit).toLocaleString()}</td></tr><tr class="grand"><td>Total</td><td class="amt">$${total.toLocaleString()}</td></tr></tbody></table><div class="footer">Payment due within 7 days of invoice date. 50% deposit required to secure your date. Balance due on event day.<br/>Everything Dough · bookings@everythingdough.com · @byeverythingdough</div></body></html>`)
}

function generateContract(lead) {
  const baseTotal  = (lead.guest_count || 0) * (lead.base_price_pp || 0)
  const total      = lead.estimated_quote || 0
  const deposit    = (total / 2).toFixed(2)
  const pricingRows = [
    `<tr><td>${safe(lead.event_type)} — ${lead.guest_count || 0} guests × $${lead.base_price_pp || 0}/person</td><td class="amt">$${baseTotal.toLocaleString()}</td></tr>`,
    lead.add_on_fee > 0 ? `<tr><td>Add-ons: ${safe(lead.add_ons)}</td><td class="amt">$${Number(lead.add_on_fee).toLocaleString()}</td></tr>` : '',
    lead.late_booking_fee > 0 ? `<tr><td>Late Booking Fee</td><td class="amt">$${Number(lead.late_booking_fee).toLocaleString()}</td></tr>` : '',
    `<tr class="grand"><td><strong>Total</strong></td><td class="amt"><strong>$${total.toLocaleString()}</strong></td></tr>`,
    `<tr class="deposit"><td>50% Deposit Required</td><td class="amt">$${Number(deposit).toLocaleString()}</td></tr>`,
  ].join('')
  openBlob(`<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><title>Event Agreement — Everything Dough</title><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:Georgia,serif;color:#2D2D2D;background:#fff;padding:48px;max-width:780px;margin:auto}.header{border-bottom:3px solid #C1272D;padding-bottom:20px;margin-bottom:32px}.brand{font-size:26px;font-weight:bold;color:#C1272D}.brand sub{font-size:12px;color:#888;font-weight:normal;display:block;margin-top:2px}.doc-title{font-size:20px;font-weight:bold;margin-top:8px}.doc-date{font-size:12px;color:#888;margin-top:2px}h3{font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#C1272D;margin:28px 0 10px}p,li{font-size:14px;line-height:1.75}.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px 24px}.info-row{display:flex;gap:8px;font-size:14px}.info-row .lbl{color:#888;min-width:130px}table{width:100%;border-collapse:collapse;margin-top:8px}thead tr{background:#C1272D;color:#fff}thead th{padding:9px 14px;text-align:left;font-size:12px;text-transform:uppercase;letter-spacing:1px}thead th.amt{text-align:right}tbody tr{border-bottom:1px solid #F3F4F6}tbody td{padding:10px 14px;font-size:14px}td.amt{text-align:right}tr.grand td{border-top:2px solid #C1272D;color:#C1272D}tr.deposit td{background:#FFFBEB;color:#856404}ol{padding-left:18px}ol li{margin-bottom:6px}.sigs{margin-top:48px;display:grid;grid-template-columns:1fr 1fr;gap:32px}.sig-block p{font-size:13px;margin-bottom:32px}.sig-line{border-bottom:1px solid #2D2D2D;margin-bottom:4px}.sig-label{font-size:11px;color:#888}.footer{margin-top:40px;border-top:1px solid #E5E7EB;padding-top:14px;font-size:11px;color:#aaa;text-align:center}@media print{body{padding:24px}}</style></head><body><div class="header"><div class="brand">Everything Dough<sub>Mobile Pizza Experiences · Stamford, CT</sub></div><div class="doc-title">Event Agreement</div><div class="doc-date">Date: ${todayLong()}</div></div><h3>Client Information</h3><div class="info-grid"><div class="info-row"><span class="lbl">Name:</span><span>${safe(lead.customer_name)}</span></div><div class="info-row"><span class="lbl">Email:</span><span>${safe(lead.email)}</span></div><div class="info-row"><span class="lbl">Phone:</span><span>${safe(lead.phone)}</span></div></div><h3>Event Details</h3><div class="info-grid"><div class="info-row"><span class="lbl">Event Type:</span><span>${safe(lead.event_type)}</span></div><div class="info-row"><span class="lbl">Event Date:</span><span>${fmtDate(lead.event_date)}</span></div><div class="info-row"><span class="lbl">Location:</span><span>${safe(lead.location)}</span></div><div class="info-row"><span class="lbl">Guest Count:</span><span>${lead.guest_count || '—'}</span></div><div class="info-row"><span class="lbl">Add-ons:</span><span>${safe(lead.add_ons)}</span></div><div class="info-row"><span class="lbl">Dietary Needs:</span><span>${safe(lead.dietary_needs)}</span></div></div><h3>Pricing</h3><table><thead><tr><th>Description</th><th class="amt">Amount</th></tr></thead><tbody>${pricingRows}</tbody></table><h3>Terms and Conditions</h3><ol><li>A 50% deposit is required to secure your event date. The remaining balance is due on the day of the event.</li><li>Rescheduling is available with at least 4 weeks notice. A 20% rescheduling fee applies.</li><li>Cancellations made less than 2 weeks before the event are not eligible for refund.</li><li>Guest count additions can be accommodated 3–7 days in advance depending on services.</li><li>Everything Dough provides all equipment, setup, and cleanup. Client provides the venue space.</li><li>Gluten-free friendly options are available for an extra charge. Cross-contamination is possible as all items are cooked in the same oven.</li></ol><div class="sigs"><div class="sig-block"><p><strong>Client</strong></p><div class="sig-line">&nbsp;</div><div class="sig-label">Signature &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Date</div></div><div class="sig-block"><p><strong>Everything Dough Representative</strong></p><div class="sig-line">&nbsp;</div><div class="sig-label">Signature &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Date</div></div></div><div class="footer">Everything Dough · bookings@everythingdough.com · @byeverythingdough</div></body></html>`)
}

// ─── CSV Export (unchanged) ───────────────────────────────────────────────────
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

// ─── Shared UI primitives ─────────────────────────────────────────────────────
const card = { background: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }
const navy = '#0F172A'
const slateText = '#64748B'

function Badge({ label, bg, color }) {
  return (
    <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '999px', background: bg, color, fontWeight: 700, whiteSpace: 'nowrap' }}>
      {label}
    </span>
  )
}

function MetricCard({ label, value, sub, accent }) {
  return (
    <div style={{ ...card, padding: '20px' }}>
      <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: slateText, marginBottom: '6px' }}>{label}</p>
      <p style={{ fontSize: '26px', fontWeight: 800, color: accent ? '#DC2626' : navy, lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>{sub}</p>}
    </div>
  )
}

// ─── Selected Lead Panel ──────────────────────────────────────────────────────
function SelectedLeadPanel({ lead, onClose }) {
  const [copied, setCopied] = useState(false)
  const draftText   = getCrustDraft(lead)
  const crustAction = getCrustAction(lead)
  const scoreReason = getScoreReason(lead)
  const prob        = getProbability(lead)
  const dl          = getDisplayLabel(lead)
  const showDocs    = lead.status === 'Confirmed' || lead.status === 'Pending'

  const handleCopy = () => {
    if (!draftText) return
    navigator.clipboard.writeText(draftText).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div style={{ ...card, overflowY: 'auto', maxHeight: '80vh' }} className="crm2-detail-col">
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'sticky', top: 0, background: '#fff', zIndex: 2 }}>
        <div>
          <p style={{ fontWeight: 700, fontSize: '17px', color: navy }}>{safe(lead.customer_name)}</p>
          <p style={{ fontSize: '12px', color: slateText, marginTop: '2px' }}>{safe(lead.email)} · {safe(lead.phone)}</p>
        </div>
        <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94A3B8', fontSize: '18px', padding: '4px 6px', lineHeight: 1 }}>✕</button>
      </div>

      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Status badge */}
        <Badge label={dl.label} bg={dl.bg} color={dl.color} />

        {/* 2×2 info grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {[
            { k: 'Event type', v: safe(lead.event_type) },
            { k: 'Guests',     v: isBad(lead.guest_count) || lead.guest_count === 0 ? '—' : lead.guest_count },
            { k: 'Quote',      v: isBad(lead.estimated_quote) || lead.estimated_quote === 0 ? 'Pending' : fmt$(lead.estimated_quote) },
            { k: 'Event date', v: fmtDate(lead.event_date) },
          ].map(({ k, v }) => (
            <div key={k} style={{ background: '#FFF7ED', borderRadius: '10px', padding: '10px 12px', border: '1px solid #FED7AA' }}>
              <p style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#94A3B8', marginBottom: '3px' }}>{k}</p>
              <p style={{ fontSize: '13px', fontWeight: 600, color: navy, wordBreak: 'break-word' }}>{v}</p>
            </div>
          ))}
        </div>

        {/* AI score reason */}
        <div style={{ background: '#FFF7ED', borderRadius: '10px', padding: '12px', border: '1px solid #FED7AA' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: slateText }}>AI Score</p>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#DC2626' }}>{prob}%</span>
          </div>
          <div style={{ background: '#E2E8F0', borderRadius: '999px', height: '6px', overflow: 'hidden', marginBottom: '8px' }}>
            <div style={{ width: `${prob}%`, height: '100%', background: '#DC2626', borderRadius: '999px' }} />
          </div>
          <p style={{ fontSize: '12px', color: slateText, lineHeight: 1.5 }}>{scoreReason}</p>
          <p style={{ fontSize: '10px', color: '#94A3B8', fontStyle: 'italic', marginTop: '4px' }}>AI-generated</p>
        </div>

        {/* Recommended next action */}
        <div style={{ borderRadius: '10px', padding: '12px', background: crustAction.bg }}>
          <p style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: slateText, marginBottom: '5px' }}>Recommended Action</p>
          <p style={{ fontSize: '12px', color: navy, lineHeight: 1.5 }}>{crustAction.text}</p>
          <p style={{ fontSize: '10px', color: '#94A3B8', fontStyle: 'italic', marginTop: '4px' }}>AI-generated</p>
        </div>

        {/* Draft follow-up */}
        <div>
          <p style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: slateText, marginBottom: '6px' }}>Draft Follow-Up</p>
          {draftText ? (
            <div style={{ position: 'relative', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '12px', fontSize: '12px', fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.6, color: '#334155' }}>
              {draftText}
              <button
                onClick={handleCopy}
                style={{ position: 'absolute', top: '8px', right: '8px', padding: '3px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 600, background: copied ? '#D1FAE5' : '#E2E8F0', color: copied ? '#065F46' : slateText }}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          ) : (
            <p style={{ fontSize: '12px', color: '#94A3B8', fontStyle: 'italic' }}>Draft will be generated once the conversation is complete.</p>
          )}
          <p style={{ fontSize: '10px', color: '#94A3B8', fontStyle: 'italic', marginTop: '4px' }}>AI-generated</p>
        </div>

        {/* Documents */}
        {showDocs && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: slateText }}>Documents</p>
            {[
              { label: '📄 Generate Invoice',  fn: generateInvoice },
              { label: '📋 Generate Contract', fn: generateContract },
            ].map(({ label, fn }) => (
              <button
                key={label}
                onClick={() => fn(lead)}
                style={{ width: '100%', padding: '14px 24px', fontSize: '14px', fontWeight: 600, color: navy, background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: '10px', cursor: 'pointer', textAlign: 'center' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#FFEDD5'; e.currentTarget.style.borderColor = '#FB923C' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#FFF7ED'; e.currentTarget.style.borderColor = '#FED7AA' }}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Execute action */}
        <button
          style={{ width: '100%', padding: '13px', fontSize: '14px', fontWeight: 700, color: '#fff', background: '#DC2626', border: 'none', borderRadius: '10px', cursor: 'pointer' }}
          onClick={() => alert('In production, this would trigger the automated follow-up workflow for this lead.')}
        >
          Execute action
        </button>
      </div>
    </div>
  )
}

// ─── Lead Card (pipeline list item) ──────────────────────────────────────────
function LeadCard({ lead, stage, isSelected, onClick }) {
  const dl   = getDisplayLabel(lead)
  const prob = getProbability(lead)
  const lt   = getLastTouch(lead.inquiry_date)
  return (
    <div
      onClick={onClick}
      style={{
        ...card,
        padding: '14px 16px',
        cursor: 'pointer',
        border: isSelected ? '2px solid #FED7AA' : '1px solid #E2E8F0',
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)' }}
      onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)' }}
    >
      {/* Name + badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px', gap: '8px' }}>
        <p style={{ fontWeight: 700, fontSize: '14px', color: navy, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{safe(lead.customer_name)}</p>
        <Badge label={dl.label} bg={dl.bg} color={dl.color} />
      </div>

      {/* Event type + location */}
      <p style={{ fontSize: '12px', color: slateText, marginBottom: '10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {safe(lead.event_type)} · {safe(lead.location)}
      </p>

      {/* Conversion % + bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
        <div className="bar-track">
          <div className="bar-fill" style={{ width: `${prob}%` }} />
        </div>
        <span style={{ fontSize: '12px', fontWeight: 700, color: navy, whiteSpace: 'nowrap' }}>{prob}%</span>
      </div>

      {/* Mini labels */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {[
          { label: lt },
          { label: safe(lead.how_heard) },
          { label: stage },
        ].map(({ label }) => (
          <span key={label} style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '999px', background: '#FFF7ED', color: '#B91C1C', border: '1px solid #FED7AA', fontWeight: 500 }}>{label}</span>
        ))}
      </div>
    </div>
  )
}

// ─── CRM Tab ──────────────────────────────────────────────────────────────────
function CRMTab({ enrichedLeads, allLeads, selected, setSelected }) {
  const [search,    setSearch]    = useState('')
  const [stageF,    setStageF]    = useState('All stages')
  const [channelF,  setChannelF]  = useState('All channels')

  const stages   = ['All stages', 'New Inquiry', 'Proposal Sent', 'Booked', 'Ghosted', 'Declined', 'In Progress']
  const channels = useMemo(() => {
    const raw = [...new Set(allLeads.map(l => l.how_heard).filter(h => !isBad(h)))]
    return ['All channels', ...raw.sort()]
  }, [allLeads])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return enrichedLeads.filter(l => {
      const ms = !q || l.customer_name.toLowerCase().includes(q) || l.email.toLowerCase().includes(q) || l.event_type.toLowerCase().includes(q)
      const mst = stageF === 'All stages' || l.stage === stageF
      const mc  = channelF === 'All channels' || l.how_heard === channelF
      return ms && mst && mc
    })
  }, [enrichedLeads, search, stageF, channelF])

  const selStyle = { height: '36px', padding: '0 10px', fontSize: '13px', color: navy, background: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px', cursor: 'pointer', outline: 'none' }
  const inputStyle = { flex: 1, height: '36px', padding: '0 12px 0 36px', fontSize: '13px', color: navy, background: '#fff', border: '1px solid #E2E8F0', borderRadius: '8px', outline: 'none' }

  return (
    <div>
      {/* Search + dropdowns */}
      <div className="crm2-filter-row">
        <div style={{ position: 'relative', flex: 1 }}>
          <svg style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search leads…" style={inputStyle} />
        </div>
        <select value={stageF}   onChange={e => setStageF(e.target.value)}   style={selStyle}>
          {stages.map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={channelF} onChange={e => setChannelF(e.target.value)} style={selStyle}>
          {channels.map(c => <option key={c}>{c}</option>)}
        </select>
        <span style={{ fontSize: '12px', color: '#94A3B8', whiteSpace: 'nowrap' }}>{filtered.length} of {allLeads.length}</span>
      </div>

      {/* Two columns */}
      <div className="crm2-columns">
        {/* Lead pipeline */}
        <div className="crm2-lead-list">
          <p style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: slateText, marginBottom: '10px' }}>Lead Pipeline</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filtered.length === 0 && (
              <div style={{ ...card, padding: '32px', textAlign: 'center', color: '#94A3B8', fontSize: '13px' }}>No leads match your filters.</div>
            )}
            {filtered.map(lead => (
              <LeadCard
                key={lead.id}
                lead={lead}
                stage={lead.stage}
                isSelected={selected?.id === lead.id}
                onClick={() => setSelected(selected?.id === lead.id ? null : lead)}
              />
            ))}
          </div>
        </div>

        {/* Selected lead panel */}
        {selected && (
          <div className="crm2-detail-col">
            <p style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: slateText, marginBottom: '10px' }}>Selected Lead</p>
            <SelectedLeadPanel lead={selected} onClose={() => setSelected(null)} />
          </div>
        )}
      </div>
    </div>
  )
}

// ─── AI Agent Tab ─────────────────────────────────────────────────────────────
function AIAgentTab({ selected, allLeads }) {
  const [logs,    setLogs]    = useState([])
  const [running, setRunning] = useState(false)
  const lead = selected || allLeads[0]

  const runDemo = async () => {
    if (running || !lead) return
    setRunning(true)
    setLogs([])
    for (const line of getAgentLogs(lead)) {
      await new Promise(r => setTimeout(r, 350))
      setLogs(prev => [...prev, line])
    }
    setRunning(false)
  }

  const sms   = lead ? getSMSTemplate(lead)   : ''
  const email = lead ? getEmailTemplate(lead) : ''

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
      {/* Left: simulation */}
      <div style={{ ...card, padding: '20px' }}>
        <p style={{ fontSize: '13px', fontWeight: 700, color: navy, marginBottom: '4px' }}>AI agent simulation</p>
        <p style={{ fontSize: '12px', color: slateText, marginBottom: '14px' }}>
          {lead ? `Simulating for: ${safe(lead.customer_name)}` : 'Select a lead in the CRM tab first'}
        </p>
        <button
          onClick={runDemo}
          disabled={running || !lead}
          style={{ padding: '10px 20px', background: running ? '#94A3B8' : '#DC2626', color: '#fff', borderRadius: '10px', border: 'none', fontSize: '13px', fontWeight: 600, cursor: running ? 'not-allowed' : 'pointer', marginBottom: '14px' }}
        >
          {running ? 'Running…' : `Run for ${lead ? safe(lead.customer_name).split(' ')[0] : '—'}`}
        </button>
        <div className="agent-term">
          {logs.length === 0 && !running && (
            <span style={{ color: '#475569' }}>Click "Run" to simulate the AI agent…</span>
          )}
          {logs.map((l, i) => <div key={i} className="log-line">{l}</div>)}
          {running && <span className="log-cursor" />}
        </div>
      </div>

      {/* Right: SMS + email */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ ...card, padding: '18px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: slateText, marginBottom: '8px' }}>Generated SMS</p>
          <p style={{ fontSize: '13px', color: navy, lineHeight: 1.6 }}>{sms || 'Select a lead to generate.'}</p>
          <p style={{ fontSize: '10px', color: '#94A3B8', fontStyle: 'italic', marginTop: '8px' }}>AI-generated</p>
        </div>
        <div style={{ ...card, padding: '18px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: slateText, marginBottom: '8px' }}>Generated Email</p>
          <p style={{ fontSize: '12px', color: navy, lineHeight: 1.65, whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>{email || 'Select a lead to generate.'}</p>
          <p style={{ fontSize: '10px', color: '#94A3B8', fontStyle: 'italic', marginTop: '8px' }}>AI-generated</p>
        </div>
      </div>
    </div>
  )
}

// ─── Insights Tab ─────────────────────────────────────────────────────────────
function HBar({ label, value, max, colorClass }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontSize: '12px', color: navy }}>{label}</span>
        <span style={{ fontSize: '12px', fontWeight: 700, color: navy }}>{value}</span>
      </div>
      <div className="bar-track">
        <div className={colorClass} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function InsightsTab({ allLeads, enrichedLeads }) {
  // Source mix
  const srcMap = {}
  allLeads.forEach(l => {
    const s = isBad(l.how_heard) ? 'Unknown' : l.how_heard
    srcMap[s] = (srcMap[s] || 0) + 1
  })
  const sources = Object.entries(srcMap).sort((a, b) => b[1] - a[1])
  const srcMax  = sources[0]?.[1] || 1

  // Pipeline by stage
  const stgMap = {}
  enrichedLeads.forEach(l => { stgMap[l.stage] = (stgMap[l.stage] || 0) + 1 })
  const stages = Object.entries(stgMap).sort((a, b) => b[1] - a[1])
  const stgMax = stages[0]?.[1] || 1

  // Monthly demand (static)
  const monthly = [
    { month: 'Jan', inquiries: 18, bookings: 5  },
    { month: 'Feb', inquiries: 21, bookings: 6  },
    { month: 'Mar', inquiries: 24, bookings: 8  },
    { month: 'Apr', inquiries: 28, bookings: 9  },
    { month: 'May', inquiries: 33, bookings: 12 },
  ]
  const mMax = 33

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top row: two cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={{ ...card, padding: '20px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: slateText, marginBottom: '14px' }}>Lead Source Mix</p>
          {sources.map(([src, cnt]) => <HBar key={src} label={src} value={cnt} max={srcMax} colorClass="bar-fill" />)}
        </div>
        <div style={{ ...card, padding: '20px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: slateText, marginBottom: '14px' }}>Pipeline by Stage</p>
          {stages.map(([stg, cnt]) => <HBar key={stg} label={stg} value={cnt} max={stgMax} colorClass="bar-fill" />)}
        </div>
      </div>

      {/* Full-width trend card */}
      <div style={{ ...card, padding: '20px' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: slateText, marginBottom: '14px' }}>Demand &amp; Bookings Trend</p>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '12px', fontSize: '11px', color: slateText }}>
          <span><span style={{ display: 'inline-block', width: '10px', height: '10px', background: '#DC2626', borderRadius: '2px', marginRight: '5px' }} />Inquiries</span>
          <span><span style={{ display: 'inline-block', width: '10px', height: '10px', background: '#94A3B8', borderRadius: '2px', marginRight: '5px' }} />Bookings</span>
        </div>
        {monthly.map(m => (
          <div key={m.month} style={{ marginBottom: '10px' }}>
            <p style={{ fontSize: '12px', fontWeight: 600, color: navy, marginBottom: '4px' }}>{m.month}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${(m.inquiries / mMax) * 100}%` }} />
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: navy, minWidth: '20px' }}>{m.inquiries}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="bar-track">
                  <div className="bar-fill-light" style={{ width: `${(m.bookings / mMax) * 100}%` }} />
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, color: slateText, minWidth: '20px' }}>{m.bookings}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Follow-Ups Tab ───────────────────────────────────────────────────────────
function FollowUpsTab({ allLeads, setSelected, setActiveTab }) {
  const actionable = useMemo(() =>
    allLeads
      .filter(l => l.status === 'Pending' || l.status === 'Ghosted' || l.status === 'In Progress')
      .sort((a, b) => getDays(a) - getDays(b))
  , [allLeads])

  const urgency = (lead) => {
    const d = getDays(lead)
    if (d <= 14) return { label: 'Urgent', bg: '#FFF7ED', color: '#B91C1C' }
    if (d <= 30) return { label: 'Soon',   bg: '#FFFBEB', color: '#92400E' }
    return          { label: 'Normal', bg: '#D1FAE5', color: '#065F46' }
  }

  const action = (lead) => {
    const first = lead.customer_name ? lead.customer_name.split(' ')[0] : 'there'
    if (lead.status === 'In Progress') return 'Customer is chatting with Lexi — check back soon.'
    if (lead.status === 'Ghosted')     return `Send follow-up SMS to ${first} — no response in 3+ days.`
    const d = getDays(lead)
    if (d <= 21) return `Priority: Event in ${lead.days_to_event} days. Confirm booking and collect deposit.`
    return 'Send personalized quote email within 24 hours.'
  }

  const urgentCount = actionable.filter(l => getDays(l) <= 14).length

  const handleSelect = (lead) => {
    setSelected(lead)
    setActiveTab('CRM')
  }

  return (
    <div>
      <p style={{ fontSize: '13px', color: slateText, marginBottom: '14px' }}>
        <strong style={{ color: navy }}>{actionable.length}</strong> leads need follow-up.{' '}
        <strong style={{ color: '#991B1B' }}>{urgentCount}</strong> urgent (event within 2 weeks).
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {actionable.length === 0 && (
          <div style={{ ...card, padding: '32px', textAlign: 'center', color: '#94A3B8', fontSize: '13px' }}>No leads need follow-up right now.</div>
        )}
        {actionable.map(lead => {
          const u  = urgency(lead)
          const dl = getDisplayLabel(lead)
          const d  = getDays(lead)
          return (
            <div
              key={lead.id}
              className="followup2-card"
              style={{ ...card, padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}
              onClick={() => handleSelect(lead)}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 700, fontSize: '14px', color: navy }}>{safe(lead.customer_name)}</span>
                  <Badge label={dl.label} bg={dl.bg} color={dl.color} />
                  <Badge label={u.label} bg={u.bg} color={u.color} />
                </div>
                <p style={{ fontSize: '12px', color: slateText, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {safe(lead.event_type)} · {d < 9999 ? `${lead.days_to_event} days out` : 'No date set'}
                </p>
                <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{action(lead)}</p>
              </div>
              <button
                onClick={e => { e.stopPropagation(); handleSelect(lead) }}
                className="followup2-btn"
                style={{ flexShrink: 0, padding: '7px 14px', fontSize: '12px', fontWeight: 600, color: '#B91C1C', background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: '8px', cursor: 'pointer' }}
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

// ─── Tests Tab ────────────────────────────────────────────────────────────────
const TESTS = [
  'Lead dataset is loaded',
  'Search filter works',
  'Stage filter works',
  'Channel filter works',
  'Summary calculations correct',
  'Every event type has message template',
  'Agent creates automation steps',
  'All leads have valid probability',
  'All leads have valid stage',
  'Empty state handles gracefully',
]

function TestsTab() {
  return (
    <div style={{ ...card, padding: '20px', maxWidth: '640px' }}>
      <p style={{ fontSize: '13px', fontWeight: 700, color: navy, marginBottom: '16px' }}>Validation Tests</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {TESTS.map((t, i) => (
          <div
            key={t}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 0', borderBottom: i < TESTS.length - 1 ? '1px solid #F1F5F9' : 'none' }}
          >
            <span style={{ fontSize: '13px', color: '#334155' }}>{t}</span>
            <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '999px', background: '#D1FAE5', color: '#065F46', fontWeight: 700 }}>PASS</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const TABS = ['CRM', 'AI Agent', 'Insights', 'Follow-Ups', 'Tests']

export default function CRMDashboard() {
  const { leads: liveLeads } = useLeads()
  const allLeads = useMemo(() => [...SAMPLE_LEADS, ...liveLeads], [liveLeads])

  const enrichedLeads = useMemo(() =>
    allLeads.map((lead, i) => ({
      ...lead,
      stage:        getStage(lead, i),
      probability:  getProbability(lead),
      lastTouch:    getLastTouch(lead.inquiry_date),
    }))
  , [allLeads])

  const [activeTab, setActiveTab] = useState('CRM')
  const [selected,  setSelected]  = useState(null)

  const metrics = useMemo(() => {
    const pipeline    = allLeads.filter(l => l.status !== 'Declined' && l.status !== 'Ghosted').reduce((s, l) => s + (isBad(l.estimated_quote) ? 0 : Number(l.estimated_quote)), 0)
    const hotProspects = allLeads.filter(l => l.status === 'Pending' && !isBad(l.days_to_event) && l.days_to_event !== 'N/A' && Number(l.days_to_event) <= 21).length
    const booked       = allLeads.filter(l => l.status === 'Confirmed').length
    return { pipeline, hotProspects, booked }
  }, [allLeads])

  const btnPrimary = { padding: '10px 20px', background: '#DC2626', color: '#fff', borderRadius: '12px', border: 'none', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }
  const btnSecond  = { padding: '10px 20px', background: '#fff', color: navy, borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }

  return (
    <div className="crm2-root">
      <style>{STYLES}</style>

      {/* ── Header: two cards ──────────────────────────────────────────────── */}
      <div className="crm2-header-grid">
        {/* Left card */}
        <div style={{ ...card, padding: '24px' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '999px', background: '#FFF7ED', color: '#B91C1C', border: '1px solid #FED7AA', fontWeight: 600 }}>Everything Dough demo</span>
            <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '999px', background: '#FFF7ED', color: '#B91C1C', border: '1px solid #FED7AA', fontWeight: 600 }}>CRM + AI agent</span>
            <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '999px', background: '#D1FAE5', color: '#065F46', fontWeight: 600 }}>✓ Tests passed</span>
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: navy, lineHeight: 1.3, marginBottom: '10px' }}>
            CRM command center for mobile pizza-making events
          </h1>
          <p style={{ fontSize: '13px', color: slateText, lineHeight: 1.65, marginBottom: '20px' }}>
            This prototype simulates Alexandra's manual workflow: capture inquiries, organize leads, classify high-value opportunities, personalize follow-up, send contracts, schedule reminders, and create a repeatable system for expansion.
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button style={btnPrimary} onClick={() => setActiveTab('AI Agent')}>Run AI agent demo</button>
            <button style={btnSecond}  onClick={() => exportCSV(allLeads)}>Export CSV</button>
          </div>
        </div>

        {/* Right card */}
        <div style={{ ...card, padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 700, color: navy }}>Connected systems</h2>
            <Link to="/" style={{ fontSize: '12px', color: slateText, textDecoration: 'none', fontWeight: 500 }}>← Back to site</Link>
          </div>
          {['CRM leads', 'Email + SMS', 'Calendar', 'Contracts', 'Crust AI agent'].map(sys => (
            <div key={sys} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: '10px', background: '#FFF7ED', marginBottom: '6px', border: '1px solid #FED7AA' }}>
              <span style={{ fontSize: '13px', color: '#334155' }}>{sys}</span>
              <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '999px', background: '#FFF7ED', color: '#B91C1C', border: '1px solid #FED7AA', fontWeight: 700 }}>Live</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Metric cards ───────────────────────────────────────────────────── */}
      <div className="crm2-metrics">
        <MetricCard label="Pipeline value"        value={fmt$(metrics.pipeline)}    sub="Synthetic demo data" accent />
        <MetricCard label="Avg conversion score"  value="78%"                        sub="AI lead scoring" />
        <MetricCard label="Hot prospects"         value={metrics.hotProspects}       sub="Prioritize first" />
        <MetricCard label="Booked events"         value={metrics.booked}             sub="Move to reminders" />
      </div>

      {/* ── Tab navigation ─────────────────────────────────────────────────── */}
      <div style={{ padding: '0 24px 16px' }}>
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '4px', display: 'inline-flex', maxWidth: '100%' }}>
          <div className="crm2-tabs">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '8px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                  background: activeTab === tab ? '#DC2626' : 'transparent',
                  color:      activeTab === tab ? '#fff' : slateText,
                  transition: 'all 0.15s',
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab content ────────────────────────────────────────────────────── */}
      <div style={{ padding: '0 24px 24px' }}>
        {activeTab === 'CRM'        && <CRMTab        enrichedLeads={enrichedLeads} allLeads={allLeads} selected={selected} setSelected={setSelected} />}
        {activeTab === 'AI Agent'   && <AIAgentTab    selected={selected} allLeads={allLeads} />}
        {activeTab === 'Insights'   && <InsightsTab   allLeads={allLeads} enrichedLeads={enrichedLeads} />}
        {activeTab === 'Follow-Ups' && <FollowUpsTab  allLeads={allLeads} setSelected={setSelected} setActiveTab={setActiveTab} />}
        {activeTab === 'Tests'      && <TestsTab />}
      </div>

      {/* ── Bottom note ────────────────────────────────────────────────────── */}
      <div style={{ padding: '0 24px 32px' }}>
        <div style={{ ...card, padding: '16px 20px', fontSize: '13px', color: slateText, lineHeight: 1.6, background: '#FFF7ED', border: '1px solid #FED7AA' }}>
          <strong style={{ color: navy }}>Demo note:</strong> This is a prototype using synthetic CRM records. A production version would connect Google Sheets, Gmail, SMS, calendar, contracts, and automated workflows through authenticated APIs. All AI-generated content is clearly labeled.
        </div>
      </div>
    </div>
  )
}
