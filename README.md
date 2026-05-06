# 🍕 Everything Dough AI — Lexi & Crust

**AI-powered booking assistant and CRM dashboard for a mobile pizza class business**

Built for the AI for Impact: Small Business Challenge Hackathon at Synchrony Skills Academy, May 2026.

---

## 🔗 Live Demo

**[everything-dough-mockup-hackathon.vercel.app](https://everything-dough-mockup-hackathon.vercel.app)**

---

## 📋 The Challenge

Everything Dough is a mobile pizza class and catering company in Stamford, CT operated by a team of two. The majority of administrative responsibilities — customer inquiries, lead follow-up, scheduling, booking management, and client communication — are handled manually by one person.

**Challenge Statement:** How can Everything Dough use AI, CRM automation, chatbot support, and customer data to automate operations, improve response time, increase qualified leads, improve customer retention, and build a scalable system that can support future expansion into new cities?

---

## 🤖 Our Solution

### Lexi — AI Booking Assistant
A conversational AI chatbot embedded on the website that handles the entire customer inquiry process:

- **6 conversation flows:** Pizza Classes, Private Events, Baking Classes, Cocktail Classes, Shop, Contact/Press, and FAQ
- **Service recommendation engine:** Matches customer descriptions to the optimal service and pricing
- **Real-time calendar integration:** Checks Google Calendar availability before confirming dates
- **Smart lead capture:** Collects structured customer data through natural conversation
- **Add-on suggestions:** Recommends relevant add-ons based on event type
- **Instant quotes:** Calculates pricing including late booking fees automatically
- **FAQ support:** Answers common questions using real data from the Everything Dough website

### Crust — AI CRM Dashboard
An intelligent dashboard that gives Alexandra instant visibility into her lead pipeline:

- **Lead pipeline:** Searchable, filterable table with color-coded statuses (Pending, Confirmed, Ghosted, Declined)
- **Real-time data flow:** Leads captured by Lexi appear on the dashboard immediately via shared React context
- **AI recommendations:** Per-lead recommended actions and draft follow-up emails
- **Invoice & contract generation:** One-click professional document generation with customer data pre-filled
- **Analytics tabs:**
  - Pipeline — visual kanban board of lead stages
  - Insights — top channels, popular services, customer segmentation (VIP, high-value, at-risk)
  - Trends — event type demand charts and seasonal recommendations
  - Follow-Ups — prioritized action queue with urgency flags
- **Social media reply generator:** AI-powered response tool for Instagram/Facebook comments
- **CSV export:** Download all leads in a format matching Alexandra's existing spreadsheet

---

## 🛠 Tech Stack

| Technology | Purpose |
|---|---|
| React + Vite | Frontend framework |
| Anthropic Claude API (Haiku 4.5) | Powers Lexi chatbot and social media reply generator |
| Google Calendar API | Real-time event availability checking |
| React Router | Client-side routing (site + dashboard) |
| React Context | Shared state between chatbot and CRM |
| Tailwind CSS | Styling |
| Vercel | Deployment |

---

## 🏗 Architecture

```
Customer visits site → Lexi chatbot engages → Captures lead data as structured JSON
                                                          ↓
                                              React Context (shared state)
                                                          ↓
Crust Dashboard ← Displays leads, analytics, AI recommendations
                                                          ↓
                                          CSV Export → Google Sheets (Alexandra's workflow)
```

Lexi captures lead data through natural conversation and outputs structured JSON. This data flows into Crust via React Context in real time. Crust displays the data, generates AI recommendations, and allows export to CSV matching Alexandra's existing spreadsheet format.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Anthropic API key
- Google Calendar API key (optional, for availability checking)

### Setup

```bash
git clone https://github.com/ethan27625/Everything-Dough-Mockup-Hackathon.git
cd Everything-Dough-Mockup-Hackathon
npm install
```

Create a `.env` file in the project root:

```
VITE_ANTHROPIC_API_KEY=your-anthropic-api-key
VITE_GOOGLE_CALENDAR_API_KEY=your-google-calendar-api-key
VITE_GOOGLE_CALENDAR_ID=your-google-calendar-id
```

Run the development server:

```bash
npm run dev
```

Visit `http://localhost:5173` for the main site and `http://localhost:5173/dashboard` for the CRM.

---

## 📊 Impact

- **Eliminates the #1 bottleneck:** Automates customer inquiry handling that was 100% manual
- **Recovers lost leads:** Data analysis showed 40% of inquiries were lost to no-response — Lexi responds instantly 24/7
- **Actionable insights:** Crust surfaces which channels drive the most revenue, which services are trending, and which leads need immediate attention
- **Scalable by design:** When expanding to a new city, update Lexi's knowledge base and the same system serves the new market without adding headcount

---

## 🔮 Phase 2 Roadmap

- Gmail integration for automated follow-up emails
- SMS notifications via Twilio
- Invoice and contract auto-generation triggered by payment status
- Google Sheets live sync (two-way data flow)
- Social media monitoring and auto-engagement
- Multi-city expansion with per-location configuration
- Customer lifetime value tracking and churn prediction

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 🏆 Hackathon

**AI for Impact: Small Business Challenge**
Synchrony Skills Academy | The Knowledge House | May 4–7, 2026

*All AI-generated content in this project is clearly labeled in compliance with hackathon AI ethics requirements.*
