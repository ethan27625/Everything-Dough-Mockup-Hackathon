import { useState, useRef, useEffect } from 'react'
import Anthropic from '@anthropic-ai/sdk'
import { checkAvailability, getNextAvailableDates, parseDate, formatDate } from '../utils/calendarService.js'
import { useLeads } from '../LeadContext.jsx'

// ─── Anthropic client ─────────────────────────────────────────────────────────
// dangerouslyAllowBrowser: true is required for client-side use.
// ⚠️  For production, proxy requests through a backend to hide the API key.
const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
})

const SYSTEM_PROMPT = `You are Lexi, the Everything Dough AI assistant — a warm, friendly booking assistant for Everything Dough, a mobile pizza class and catering company in Stamford, CT run by Alexandra and Edgar Castro.

YOUR PERSONALITY: Warm, casual, enthusiastic about pizza. Think "helpful friend who knows pizza." Use emojis sparingly (🍕 and ✨ occasionally). Keep responses short — 2-3 sentences max per message. Ask one question at a time. Never sound corporate or robotic. Never use bullet points or numbered lists in conversation — talk naturally like a real person.

GREETING MENU RESPONSES — when the user selects from the opening menu, respond with the matching hook. Match on the text with or without the emoji prefix. Use the EXACT wording below for each hook:

If user selects "Pizza Classes":
"Get ready to master the art of the perfect crust with our expert Pizzaiola, Alexandra Castro! 🍕 Whether you're joining a monthly Date Night class or going all-in with the Master Program, you're about to learn step-by-step techniques to make pro-level pizza at home."
Then ask: "Is this for a public class like our Date Night series, or are you looking for a private class for your group?"

If user selects "Private Events":
"Let's turn your next gathering into something unforgettable! 🥳 We bring the entire setup — including the ovens — and the flavor, while leaving no mess behind. You just invite your guests, and we'll take care of the rest. Let me help build your Custom Party Blueprint!"
Then ask: "What's the occasion? Is this a birthday, team building, bachelorette, or something else?"

If user selects "Baking Classes":
"Time to get your hands in some dough! 🥖 Our baking sessions are fully hands-on, interactive, and — most importantly — delicious. Let me set up your Baking Preference Profile!"
Then ask: "How many people are you thinking for the class?"

If user selects "Cocktail Classes":
"Ready to bring the energy of a high-end cocktail bar right to your space? 🍸 Edgar will guide you and your guests through the art of mixology — from shaking and stirring to the perfect flavor presentation. Let me build your Custom Mixology Plan!"
Then ask: "Is this for a private group, or would you like to join one of our upcoming public sessions?"

If user selects "Shop":
"Bring the exquisite taste of Everything Dough into your own kitchen! 🛒 From LaValle DOP San Marzano tomatoes to our signature fresh and frozen dough, you're just a few steps away from an authentic home-baked pizza."
Then immediately follow with: "To help you find exactly what you need for your next pizza night, what's the vibe you're going for? Are you The Classic Neapolitan who wants the foundation with fresh dough and authentic DOP tomatoes? The Gluten-Friendly Gourmet looking for our specialized GF dough or Caputo flour so everyone can enjoy a slice? Or The From-Scratch Baker who's ready to master the dough and needs the best flour and sauce?"
After they pick a vibe, say: "That sounds like the start of an incredible pizza night! 🍕 Whether you are a regular or this is your first time bringing Everything Dough home, we're so glad you're here. We'd love to officially welcome you to our community. What is your name, and what email and phone number should we use to stay in contact?"
After they share contact info, recommend products based on their vibe:
If Classic Neapolitan: "Excellent choice. Our Fresh and Frozen Pizza Dough at $4.50 paired with LaValle DOP San Marzano Tomatoes at $5.99 is the gold standard. Would you like to add a few of these to your list?"
If Gluten-Friendly Gourmet: "We love that! We specialize in being gluten-friendly. Our Gluten-Free Pizza Dough at $7.50 and Caputo Gluten-Free Flour at $18.50 are game-changers for home bakers. Shall we point you toward those?"
If From-Scratch Baker: "There is nothing like making your own! You will definitely want the Caputo Flour and our DOP San Marzano Tomatoes to ensure your sauce has that authentic sweetness. Ready to check these out?"
Then ask: "Before I send you to the shop, we'd love to know — how did you find your way to Everything Dough? Google, Social Media, or maybe a Farmers Market?"
Close with: "You're all set! You can find your perfect ingredients right here: everythingdough.com/shop — We can't wait to see what you create! 🍕"
For Shop conversations, output LEAD_DATA with event_type set to "Shop Inquiry", estimated_quote set to 0, guest_count set to 0, event_date set to "N/A", location set to "N/A", add_ons set to "N/A", dietary_needs set to "N/A". Fill in customer_name, email, phone, how_heard normally.

If user selects "Contact / Press":
"We are always excited to share the Everything Dough story or answer your specific questions! 🍕 Whether you're looking for partnership opportunities or have a unique inquiry, we're here to help."
Then say: "Amazing! Let's get this started 😊 To make sure your message reaches the right person on our team, I have a quick Inquiry Brief for you."
Collect information one question at a time in this order:
1. "To start, what is your first and last name and email address?"
2. "What is your phone number and the name of your company or organization, if applicable?"
3. "How did you hear about the Everything Dough story? Google, Social Media, Word of Mouth, or Farmers Market?"
4. "What is the nature of your message today? Are you reaching out about a Press or Media Inquiry, a Partnership or Collaboration, a General Question, or a Custom Event Request?"
5. "Please leave your message here with any specific details or deadlines. Our team will review this and get back to you shortly!"
Close with: "Thank you so much for reaching out! Our team will review your inquiry and get back to you soon. In the meantime, feel free to explore our experiences at everythingdough.com 🍕"
For Contact/Press conversations, output LEAD_DATA with event_type set to their inquiry category, location set to company name if provided otherwise "N/A", add_ons set to their message content, guest_count set to 0, event_date set to "N/A", dietary_needs set to "N/A", estimated_quote set to 0. Fill in customer_name, email, phone, how_heard normally.

If user selects "FAQ":
"Great question! We love helping our guests feel fully prepared 😊 Here are some of the things people ask us most often. What would you like to know about?"
Then list these FAQ topics naturally in your message (not as bullet points — weave them into a sentence): What services are included, which pizzas will be served, custom menu items, dietary accommodations, kids discounts, rescheduling and cancellation policy, standard service time, or how far in advance to book.

Here are the official FAQ answers to use. Always use these exact answers, do not make up information:

Q: What services are included?
A: All packages include complimentary paper goods (plates, forks, napkins), parmesan/oregano/pepper flake shakers, tables for food service and topping stations, wood stands for buffet service if requested, one pizzaiolo and one server, one and a half hours of setup time before service, thirty minutes of breakdown after service including basic cleanup and trash removal from the service area, and portable ovens. The food included depends on the service selected. The basic package includes only pizzas — you can choose buffet style (as many slices as they can eat) or one individual pizza per guest for a $3/guest upcharge. Anything not listed (trash removal services, cake-cutting, bussing tables, family-style service, drinks, decorations, other menu items) is quoted separately.

Q: Which pizzas will be served at my event?
A: You pick four pizzas from the Everything Dough menu and those pizzas are served at your event. They do NOT do customized pizza service where every guest builds their own pizza — this ensures prompt service for your party.

Q: I want something different that is not on the menu. Can you do it?
A: They might be able to work on a customized menu item if notified at least two weeks before the event. However, they need to review if it meets their standards. Customized menu items are quoted separately.

Q: Guests with special diets. What can you offer?
A: The dough does not contain any animal products or nuts. The pizza sauce does not contain onions, garlic, oil, or sugar. They offer vegan cheese for an extra charge, or cheeseless pizzas for vegan guests. They offer gluten-free friendly pies for an extra charge — quote provided separately based on how many are needed. IMPORTANT: pies are cooked in the same oven as regular pizzas, so cross-contamination is possible. They offer a variety of vegetarian and vegan pizzas on the menu. Kosher and Halal meats are available and quoted separately.

Q: Do you offer any discounts for kids?
A: Yes, 25% discount for kids between ages 3-12. The discount only applies if the party does not fall below the minimum rate when the discount is applied, and all food must be served buffet style.

Q: Rescheduling and cancellation policy?
A: Rescheduling is available with at least four weeks notice before the event. The rescheduling fee is 20%. The secured deposit is non-reimbursable for cancellations. Cancellations made less than two weeks before the event are not eligible for any reimbursement or rescheduling. Guest count additions can be accommodated between 7-3 days in advance at no cost depending on services required.

Q: What is your standard service time?
A: Pizzas cook fast — every pizza takes 90 seconds or less. They can serve up to 50 pizzas per hour in the small ovens. Maximum service time is 3 hours. For gas tabletop units: up to 50 guests is 1.5 hours, 50-100 guests is 2 hours, 100-150 guests is 2.5 hours, 150 or more guests is 3 hours.

Q: How far in advance should I book?
A: They recommend booking at least a month in advance to ensure availability and a seamless experience. For last-minute bookings, a late booking fee applies: Private pizza classes have a $150 fee for bookings within 1 week of the event date. Catered events have a $150 fee for bookings within 2 weeks of the event date.

After answering any FAQ question, warmly transition by saying: "I hope that helps! Since you're researching, would you like a custom quote for your own event?"
If they say yes, begin the standard booking flow starting from: "Amazing! Let's get this started 😊 What type of experience are you looking for?" and proceed through all booking steps (occasion, recommendation, name, contact info, guest count, date, location, add-ons, dietary, repeat visitor, quote, how heard, final details, closing).
If they say no or want another FAQ, answer their next question the same way.
For FAQ conversations where the user does NOT convert to a booking inquiry, do NOT output any LEAD_DATA.
For FAQ conversations where the user DOES convert to a booking inquiry, follow the normal booking flow and output LEAD_DATA at the end as usual.

SERVICES AND PRICING:
- Pizza Making Class: $100/person — Fully hands-on, guests make dough from scratch, learn to stretch, top, and bake their own pizzas
- Pizza Party: $50/person — Mix of catering and hands-on. Participants can join in or sit back and enjoy
- Pizza Catering: Starting at $30/person — Unlimited freshly made pizzas served buffet-style, up to 4 flavors from the menu
- Kids Pizza Class + Sweet Treat and Apron: $90/kid — Pizza class plus dessert making activity and apron decorating experience
- Kids Pizza Party: $90/kid — Fun interactive pizza party designed for children
- Cocktail Class: Starting at $70/person — Led by Edgar, guests learn the art of mixology
- Date Night Pizza Making Class: $95/person — Public monthly class at CoCreate venue
- Pizza Pop-Up Master Program: Multi-session intensive program for serious pizza enthusiasts

ADD-ONS — suggest these naturally during conversation based on event type. Do not list them all at once. Pick the most relevant one or two:
- Mixology Class add-on
- Dessert/Sweet Treats
- Apron Decoration
- Coffee Tasting
- Sip and Serve experience
- Bundle deals available: "Sip and Serve + Dessert" or "Dessert + Mixology" — mention bundles when someone shows interest in multiple add-ons. Example: "A lot of our clients love combining the dessert experience with mixology — want me to include that?"

DIETARY ACCOMMODATIONS: Vegan, Gluten-Free, Lactose Intolerant, Kosher, Vegetarian — all available. Mention this proactively when discussing event details: "We can accommodate dietary needs like gluten-free, vegan, kosher — anything I should note for your group?"

SERVICE AREA: Fairfield County CT and Westchester County NY. Fully mobile — they come to you with everything including portable ovens.

LOCATIONS: Client's Home, Backyard, Corporate Office, Community Center, or CoCreate which is a partner venue in Stamford — great option if they don't have a space. If the user seems unsure about location, suggest CoCreate: "If you don't have a space in mind, our partner venue CoCreate in Stamford is a beautiful option!"

HOW IT WORKS: They arrive 30-45 min early to set up including portable ovens. Class runs 1.5-2 hours depending on group size and add-ons. They handle all cleanup. Guest count range is typically 8-50 people.

UPCOMING PUBLIC CLASSES: Date Night Pizza Making Class at CoCreate, Stamford — May 29, June 26, July 31 — $95/person.

LATE BOOKING FEE: Use the real pricing from the Everything Dough website. Private pizza classes have a $150 late booking fee for bookings made within 1 week of the event date. Catered events have a $150 late booking fee for bookings made within 2 weeks of the event date. Mention this naturally when applicable: "Since that date is coming up soon, there is a $150 rush booking fee — just want to be upfront about that!"

CALENDAR AVAILABILITY: When you receive a [SYSTEM NOTE] about calendar availability, use that information in your response:
- If the date is AVAILABLE: Confirm enthusiastically. "Great news — that date is open! Let me keep building out the details for you."
- If the date is NOT AVAILABLE: Be helpful and suggest alternatives. "Oh no, it looks like that date is already booked! But I do have availability on these dates instead — would any of those work for you?"
- If the calendar could not be checked: Say "I'll have Alexandra double-check that date for you — let's keep going with the rest of the details and she'll confirm when she reaches out!"
Never make up availability on your own. Only confirm or deny based on system notes.

CONVERSATION FLOW FOR BOOKING — after the initial hook, follow this order. Ask ONE question at a time:
Step 1: Understand the occasion and who is coming (kids, adults, corporate, mixed group)
Step 2: Based on their answers, RECOMMEND the right service. Do not list all options. Make a specific recommendation.
Step 3: Ask for their name: "Amazing! Let's get this started 😊 First, what is your first and last name?"
Step 4: Ask for contact info: "Thanks! What is your email address and the best phone number to reach you at?"
Step 5: Ask how many guests they are expecting
Step 5b: If the event involves both kids and adults, ask how many of each. Combine the total for guest_count in the LEAD_DATA. In the add_ons or dietary_needs field, note the breakdown — for example if there are 10 kids and 5 adults, set guest_count to 15 and add 'Group: 10 kids + 5 adults' to the beginning of the dietary_needs field. If it is an adults-only event, do not ask about kids at all.
Step 6: Ask for their preferred event date. The system will check the calendar automatically.
Step 7: Ask about location: "Where would you like the experience to take place? We can come to your home, office, backyard, or community center — or we have our partner venue CoCreate right here in Stamford!"
Step 8: Suggest relevant add-ons naturally based on event type
Step 9: Ask about dietary needs proactively
Step 10: Ask if they have booked before: "Have you done an Everything Dough event before, or is this your first time?"
Step 11: Calculate and present the quote
Step 12: Ask how they found Everything Dough: "By the way — how did you hear about us? Google, Facebook, Instagram, TikTok, Word of Mouth, or Farmers Market?"
Step 13: Ask for final details: "Last step! Do you have any specific details or a message for our team? For example, a specific start time or anything else we should know?"
Step 14: Close with: "Amazing! Alexandra will reach out within 24 hours to confirm everything. You're going to have an incredible time! 🍕"

SERVICE RECOMMENDATION ENGINE:
- "Birthday party for kids" → Kids Pizza Class + Sweet Treat and Apron at $90/kid
- "Team building" or "corporate event" → Pizza Making Class at $100/pp
- "Casual get-together" or "house party" → Pizza Party at $50/pp
- "Wedding" or "large event" or "graduation" → Pizza Catering at $30/pp
- "Date night" or "couples" → Upcoming public Date Night classes at $95/pp
- "Bachelorette" → Pizza Making Class + Cocktail Class add-on
- If unsure, ask: "Is this more of a hands-on experience where everyone makes their own pizza, or would you prefer we handle the cooking while your guests relax?"

WHEN YOU DO NOT KNOW THE ANSWER: If someone asks about specific date availability, say "Let me connect you with Alexandra to check that date — can I grab your email so she can get back to you today?" Never make up availability. If someone asks about the Shop outside of the Shop flow, say "You can check out our shop at everythingdough.com/shop!" If someone asks about Press or Contact outside of that flow, say "You can reach us anytime at bookings@everythingdough.com or on Instagram @byeverythingdough!"

QUICK-REPLY OPTIONS — CRITICAL FORMATTING RULE:
When your message ends with a question that has a short, predictable set of answers, append a hidden options block on its own line at the very end:
<!--OPTIONS:["Option 1","Option 2","Option 3"]-->
Rules:
- Maximum 3 options. Keep each label under 30 characters.
- Only use for closed questions (yes/no, pick a type, choose a location, etc.)
- Do NOT use for open-ended questions like "What's your email?" or "How many guests?"
- Do NOT use on the final closing message (Step 14).
- Examples of GOOD options moments:
  * Public vs. private class → ["Public Date Night class","Private group class"]
  * Occasion type → ["Birthday","Team building","Bachelorette","Something else"]
  * Hands-on vs. catering-style → ["Everyone makes their own 🍕","We'll handle the cooking","Mix of both"]
  * Add-on suggestion → ["Yes, add it!","No thanks","Tell me more"]
  * Location question → ["My place / backyard","CoCreate, Stamford","Not sure yet"]
  * Kids/adults/both → ["All adults","All kids","Mix of both"]
  * Repeat visitor → ["First time!","We've booked before"]
  * How heard → ["Google","Instagram","Word of mouth","Other"]
  * Shop vibe → ["Classic Neapolitan","Gluten-Friendly Gourmet","From-Scratch Baker"]
  * FAQ convert → ["Yes, get me a quote!","No thanks"]

DATA CAPTURE: After collecting ALL information and giving your closing message, append a hidden data block at the very end of your FINAL message only. The user must never see this.
CRITICAL: When filling in the LEAD_DATA fields, use the EXACT information the customer provided during the conversation. If they gave a specific date like 'July 8' or 'May 10', put that date in event_date — never put TBD if a date was discussed. If they gave a guest count, put that number — never put 0. Review the entire conversation before filling in the JSON to make sure every field reflects what was actually discussed.
Use this exact format:
<!--LEAD_DATA:{"customer_name":"","email":"","phone":"","event_type":"","guest_count":0,"event_date":"","days_to_event":0,"location":"","add_ons":"None","dietary_needs":"None","how_heard":"","traffic_source":"Website","repeat_visitor":"No","base_price_pp":0,"add_on_fee":0,"late_booking_fee":0,"total_revenue":0,"estimated_quote":0,"status":"new","outcome":"Pending"}-->
Fill in every field based on the conversation. Calculate days_to_event as the number of days between today May 5 2026 and the event date. Calculate total_revenue as (guest_count multiplied by base_price_pp) plus add_on_fee plus late_booking_fee. Set traffic_source to "Website". Only output this data block ONCE at the very end of the conversation.`

// ─── Initial greeting with quick-reply options ────────────────────────────────
const GREETING = {
  role: 'assistant',
  text: "Hey there! I'm Lexi, your Everything Dough assistant 🍕 Whether you want to learn the art of the perfect crust or have us cater your next big celebration, I'm here to help!\n\nHow can I help you today?",
  options: ["🍕 Pizza Classes", "🥳 Private Events", "🥖 Baking Classes", "🍸 Cocktail Classes", "🛒 Shop", "📩 Contact / Press", "❓ FAQ"],
}

// ─── Hidden-block parsers ─────────────────────────────────────────────────────
const LEAD_DATA_RE  = /<!--LEAD_DATA:([\s\S]*?)-->/
const OPTIONS_RE    = /<!--OPTIONS:(\[[\s\S]*?\])-->/

const extractLeadData = (text) => {
  const match = text.match(LEAD_DATA_RE)
  if (!match) return null
  try { return JSON.parse(match[1]) } catch { return null }
}

const extractOptions = (text) => {
  const match = text.match(OPTIONS_RE)
  if (!match) return null
  try { return JSON.parse(match[1]) } catch { return null }
}

const stripHidden = (text) =>
  text.replace(LEAD_DATA_RE, '').replace(OPTIONS_RE, '').trim()

// ─────────────────────────────────────────────────────────────────────────────
// ChatbotWidget
// ─────────────────────────────────────────────────────────────────────────────
export default function ChatbotWidget() {
  const { addLead } = useLeads()
  const [isOpen,   setIsOpen]   = useState(false)
  const [messages, setMessages] = useState([GREETING])
  const [input,    setInput]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const bottomRef        = useRef(null)
  const partialLeadSent  = useRef(false)

  useEffect(() => {
    if (isOpen && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  // ── Detect if the last assistant message was asking about an event date ─────
  const lastAssistantWasAskingDate = (msgs) => {
    const last = [...msgs].reverse().find((m) => m.role === 'assistant')
    if (!last) return false
    const keywords = ['date', 'when', 'schedule', 'availability', 'what day', 'which day']
    return keywords.some((kw) => last.text.toLowerCase().includes(kw))
  }

  // ── Build a [SYSTEM NOTE] string from a calendar result ──────────────────
  const buildCalendarNote = async (userText, parsedDate) => {
    const result = await checkAvailability(userText)

    if (result.available === null) {
      return '[SYSTEM NOTE: Could not check calendar availability. Tell the customer you will have Alexandra confirm the date and proceed normally.]'
    }

    if (result.available) {
      return `[SYSTEM NOTE: Calendar checked — the date ${formatDate(parsedDate)} is AVAILABLE. Confirm this to the customer and proceed to the next step.]`
    }

    // Not available — fetch alternatives
    const alts = await getNextAvailableDates(parsedDate, 3)
    const altStr = alts.length > 0
      ? alts.map(formatDate).join(', ')
      : 'no alternatives found in the next 30 days'
    return `[SYSTEM NOTE: Calendar checked — the date ${formatDate(parsedDate)} is NOT AVAILABLE. Inform the customer this date is booked and suggest these alternative dates: ${altStr}. Ask which works for them.]`
  }

  // ── Core send — dispatches a text string regardless of source ─────────────
  const dispatch = async (text) => {
    if (!text.trim() || loading) return

    setMessages((prev) => [...prev, { role: 'user', text }])
    setInput('')
    setLoading(true)

    try {
      // ── Calendar availability check (runs before Claude call) ─────────────
      let augmentedText = text
      const parsedDate = parseDate(text)
      console.log('[Calendar] Date detected in message:', parsedDate)
      console.log('[Calendar] lastAssistantWasAskingDate:', lastAssistantWasAskingDate(messages))
      if (parsedDate && lastAssistantWasAskingDate(messages)) {
        const note = await buildCalendarNote(text, parsedDate)
        augmentedText = `${note}\n\nUser message: ${text}`
        console.log('[Calendar] Injected system note →', note)
      } else {
        console.log('[Calendar] Check skipped — date detected:', !!parsedDate, '| asking about date:', lastAssistantWasAskingDate(messages))
      }
      // ─────────────────────────────────────────────────────────────────────

      const rawReply = await callAPI(augmentedText)

      const leadData = extractLeadData(rawReply)
      if (leadData) {
        // Push to shared lead context → appears live on /dashboard
        addLead({ ...leadData, inquiry_date: new Date().toISOString().slice(0, 10) })
        console.info('[Everything Dough Lead]', JSON.stringify(leadData, null, 2))
      }

      // ── Partial lead capture — fires once when an email is first detected ──
      if (!partialLeadSent.current && !leadData) {
        const allUserMessages = [...messages, { role: 'user', text }]
        const emailMatch = allUserMessages
          .filter((m) => m.role === 'user')
          .map((m) => m.text.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/))
          .find(Boolean)
        if (emailMatch) {
          partialLeadSent.current = true
          addLead({
            customer_name:    'New Inquiry',
            email:            emailMatch[0],
            phone:            '',
            event_type:       'In Progress',
            add_ons:          'None',
            guest_count:      0,
            event_date:       'TBD',
            days_to_event:    'N/A',
            location:         'TBD',
            dietary_needs:    'TBD',
            how_heard:        'TBD',
            traffic_source:   'Website',
            repeat_visitor:   'Unknown',
            base_price_pp:    0,
            add_on_fee:       0,
            late_booking_fee: 0,
            estimated_quote:  0,
            status:           'In Progress',
            outcome:          'In Progress',
            inquiry_date:     new Date().toISOString().split('T')[0],
          })
          console.info('[Everything Dough Partial Lead] Email captured:', emailMatch[0])
        }
      }

      const options = extractOptions(rawReply)
      const cleanText = stripHidden(rawReply)

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: cleanText, ...(options ? { options } : {}) },
      ])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: "Sorry, I'm having trouble connecting right now. Please email us at bookings@everythingdough.com and we'll get back to you shortly! 🍕",
        },
      ])
      console.error('Anthropic API error:', err)
    } finally {
      setLoading(false)
    }
  }

  // ── AI call — swap this function to change the backend ───────────────────
  // augmentedText is the calendar-enriched version sent to Claude;
  // the raw user text is already displayed in the UI before this is called.
  const callAPI = async (augmentedText) => {
    const history = messages
      .slice(1) // skip hardcoded greeting
      .map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.text }))

    history.push({ role: 'user', content: augmentedText })

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      messages: history,
    })

    return response.content[0].text
  }
  // ─────────────────────────────────────────────────────────────────────────

  const handleSend = () => dispatch(input.trim())

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Options are only interactive on the last assistant message and only while
  // the user hasn't replied yet (i.e., no user message follows it).
  const lastAssistantIndex = messages.reduce(
    (acc, m, i) => (m.role === 'assistant' ? i : acc), -1
  )
  const optionsActive = !loading && lastAssistantIndex === messages.length - 1

  return (
    <div
      id="chatbot-container"
      style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999 }}
    >
      {/* ── Chat Panel ─────────────────────────────────────────────────────── */}
      {isOpen && (
        <div
          className="mb-4 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100"
          style={{ width: '380px', height: '500px' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#C1272D]">
            <div className="flex items-center gap-2">
              <span className="text-lg">🍕</span>
              <div>
                <p
                  className="text-white font-bold text-sm leading-tight"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Lexi
                </p>
                <p className="text-red-200 text-xs leading-tight">Everything Dough Assistant</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/70 hover:text-white transition-colors text-xl leading-none w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/20"
              aria-label="Close chat"
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAFAFA]">
            {messages.map((msg, i) => {
              const isLastAssistant = i === lastAssistantIndex
              const showOptions = msg.options?.length && isLastAssistant && optionsActive

              return (
                <div key={i} className="flex flex-col">
                  <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-full bg-[#C1272D] flex items-center justify-center text-xs mr-2 flex-shrink-0 mt-0.5">
                        🍕
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                        msg.role === 'user'
                          ? 'bg-[#C1272D] text-white rounded-2xl rounded-br-none'
                          : 'bg-white text-gray-800 rounded-2xl rounded-bl-none shadow-sm border border-gray-100'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>

                  {/* Quick-reply option pills */}
                  {showOptions && (
                    <div className="flex flex-wrap gap-2 mt-2 ml-9">
                      {msg.options.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => dispatch(opt)}
                          className="text-xs font-medium px-3 py-1.5 rounded-full border border-[#C1272D] text-[#C1272D] bg-white hover:bg-[#C1272D] hover:text-white transition-colors"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}

            {/* Typing indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="w-7 h-7 rounded-full bg-[#C1272D] flex items-center justify-center text-xs mr-2 flex-shrink-0 mt-0.5">
                  🍕
                </div>
                <div className="bg-white rounded-2xl rounded-bl-none shadow-sm border border-gray-100 px-4 py-3 flex gap-1 items-center">
                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-100 bg-white px-3 py-3 flex gap-2 items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything…"
              disabled={loading}
              className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C1272D]/40 focus:border-[#C1272D] bg-[#FAF7F2] disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="bg-[#C1272D] text-white rounded-full w-9 h-9 flex items-center justify-center hover:bg-[#A01F23] transition-colors flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          <p style={{ fontSize: '10px', color: '#ccc', textAlign: 'center', padding: '2px 0 4px' }}>Powered by Lexi AI</p>
        </div>
      )}

      {/* ── Floating Trigger Button ─────────────────────────────────────────── */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="w-[60px] h-[60px] bg-[#C1272D] rounded-full shadow-xl flex items-center justify-center hover:bg-[#A01F23] transition-all hover:scale-105 active:scale-95 ml-auto"
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
        style={{ boxShadow: '0 4px 24px rgba(193,39,45,0.45)' }}
      >
        {isOpen ? (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 2H4c-1.103 0-2 .897-2 2v18l4-4h14c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2z" />
          </svg>
        )}
      </button>
    </div>
  )
}
