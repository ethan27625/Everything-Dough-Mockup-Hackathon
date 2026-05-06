const CALENDAR_API_KEY = import.meta.env.VITE_GOOGLE_CALENDAR_API_KEY
const CALENDAR_ID      = import.meta.env.VITE_GOOGLE_CALENDAR_ID

// ─── Date parsing ─────────────────────────────────────────────────────────────
// Handles natural language like "June 14", "July 4th 2026", "06/14/2026", "2026-06-14"
export function parseDate(dateString) {
  if (!dateString || typeof dateString !== 'string') return null

  const s = dateString.trim()

  // ISO or slash-delimited: "2026-06-14" or "06/14/2026"
  const direct = new Date(s)
  if (!isNaN(direct.getTime())) {
    // Make sure it's not just a plain number being coerced
    if (/\d{4}/.test(s)) return direct
  }

  // "Month Day[st/nd/rd/th][, Year]" — e.g. "June 14", "July 4th 2026", "August 3rd, 2026"
  const monthDay = s.match(
    /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(?:st|nd|rd|th)?(?:[,\s]+(\d{4}))?\b/i
  )
  if (monthDay) {
    const [, month, day, year] = monthDay
    const y = year ? parseInt(year) : new Date().getFullYear()
    const parsed = new Date(`${month} ${day}, ${y}`)
    if (!isNaN(parsed.getTime())) {
      // If no year given and the date is in the past, roll forward one year
      if (!year && parsed < new Date()) parsed.setFullYear(parsed.getFullYear() + 1)
      return parsed
    }
  }

  // "Day Month [Year]" — e.g. "14 June 2026"
  const dayMonth = s.match(
    /\b(\d{1,2})(?:st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december)(?:[,\s]+(\d{4}))?\b/i
  )
  if (dayMonth) {
    const [, day, month, year] = dayMonth
    const y = year ? parseInt(year) : new Date().getFullYear()
    const parsed = new Date(`${month} ${day}, ${y}`)
    if (!isNaN(parsed.getTime())) {
      if (!year && parsed < new Date()) parsed.setFullYear(parsed.getFullYear() + 1)
      return parsed
    }
  }

  return null
}

// ─── Display formatting ───────────────────────────────────────────────────────
export function formatDate(date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month:   'long',
    day:     'numeric',
    year:    'numeric',
  })
  // e.g. "Saturday, June 14, 2026"
}

// ─── Internal: fetch calendar events for a time range (single API call) ──────
async function fetchEvents(timeMin, timeMax) {
  const encodedId  = encodeURIComponent(CALENDAR_ID)
  const params = new URLSearchParams({
    key:           CALENDAR_API_KEY,
    timeMin:       timeMin.toISOString(),
    timeMax:       timeMax.toISOString(),
    singleEvents:  'true',
    orderBy:       'startTime',
  })
  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodedId}/events?${params}`

  console.log('[Calendar] API URL:', url)

  const res = await fetch(url)
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Calendar API ${res.status}: ${body}`)
  }
  const data = await res.json()
  console.log('[Calendar] API response:', data)
  return data.items || []
}

// ─── Exported: check a single date ───────────────────────────────────────────
export async function checkAvailability(dateString) {
  try {
    console.log('[Calendar] Date string received:', dateString)

    const date = parseDate(dateString)
    console.log('[Calendar] Parsed date:', date)
    if (!date) return { available: null, error: 'Could not parse date' }

    const timeMin = new Date(date); timeMin.setHours(0,  0,  0,   0)
    const timeMax = new Date(date); timeMax.setHours(23, 59, 59, 999)
    console.log('[Calendar] timeMin:', timeMin.toISOString(), '| timeMax:', timeMax.toISOString())

    const events = await fetchEvents(timeMin, timeMax)

    const result = events.length > 0
      ? { available: false, eventsCount: events.length, parsedDate: date }
      : { available: true, parsedDate: date }

    console.log('[Calendar] Result:', result)
    return result
  } catch (err) {
    console.error('[calendarService] checkAvailability error:', err)
    return { available: null, error: 'Could not check calendar' }
  }
}

// ─── Exported: find next N available dates after a given date ────────────────
// Uses a single API call covering the next 30 days for efficiency.
export async function getNextAvailableDates(startDate, count = 3) {
  try {
    const timeMin = new Date(startDate)
    timeMin.setDate(timeMin.getDate() + 1) // start looking the day after
    timeMin.setHours(0, 0, 0, 0)

    const timeMax = new Date(timeMin)
    timeMax.setDate(timeMax.getDate() + 30)
    timeMax.setHours(23, 59, 59, 999)

    const events = await fetchEvents(timeMin, timeMax)

    // Build a set of busy day strings for O(1) lookup
    const busyDays = new Set(
      events.map((ev) => {
        const d = new Date(ev.start?.dateTime || ev.start?.date)
        return d.toDateString()
      })
    )

    // Walk forward collecting free days
    const available = []
    const cursor = new Date(timeMin)
    while (available.length < count && cursor <= timeMax) {
      if (!busyDays.has(cursor.toDateString())) {
        available.push(new Date(cursor))
      }
      cursor.setDate(cursor.getDate() + 1)
    }

    return available
  } catch (err) {
    console.error('[calendarService] getNextAvailableDates error:', err)
    return []
  }
}
