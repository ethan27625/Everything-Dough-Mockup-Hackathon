import { useState } from 'react'
import { Link } from 'react-router-dom'
import ChatbotWidget from './components/ChatbotWidget'

// ─── Google Fonts + global overrides ─────────────────────────────────────────
const FONT_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&family=Lato:wght@300;400;700;900&display=swap');

  :root {
    --red:     #C1272D;
    --cream:   #FAF7F2;
    --charcoal:#2D2D2D;
    --burgundy:#6B2737;
  }

  * { box-sizing: border-box; }

  body {
    font-family: 'Lato', sans-serif;
    background-color: var(--cream);
    color: var(--charcoal);
  }

  .serif { font-family: 'Playfair Display', Georgia, serif; }

  /* Smooth dropdown transitions */
  .dropdown-enter { opacity: 0; transform: translateY(-6px); }
  .dropdown-visible { opacity: 1; transform: translateY(0); transition: opacity .18s ease, transform .18s ease; }

  /* Card hover */
  .card-hover { transition: transform .25s ease, box-shadow .25s ease; }
  .card-hover:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.12); }
`

// ─── Nav data ─────────────────────────────────────────────────────────────────
const NAV = [
  {
    label: 'Pizza Classes',
    items: ['Monthly Classes', 'Pizza Pop-Up Master Program'],
  },
  {
    label: 'Private Events',
    items: [
      'Kids',
      'Team Building',
      'Pizza Making Class',
      'Pizza Party',
      'Pizza Catering',
      'Menu',
      'Bachelorette Cooking Party',
    ],
  },
  { label: 'Baking Classes' },
  { label: 'Cocktail Class' },
  { label: 'Shop' },
  { label: 'Contact', items: ['Press'] },
]

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  const [open, setOpen] = useState(null)       // desktop dropdown
  const [mobile, setMobile] = useState(false)  // hamburger
  const [mExp, setMExp] = useState(null)        // mobile sub-expanded

  const closeAll = () => { setOpen(null); setMobile(false); setMExp(null) }

  return (
    <nav
      className="sticky top-0 z-50 bg-[#FAF7F2]"
      style={{ boxShadow: '0 1px 0 rgba(0,0,0,0.08)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-[68px]">

        {/* Logo */}
        <a href="#hero" onClick={closeAll} className="flex-shrink-0">
          <img
            src="https://www.everythingdough.com/wp-content/uploads/2025/01/cropped-Diseno-sin-titulo-1-e1738356087237-1.png"
            alt="Everything Dough"
            className="h-[52px] w-auto object-contain"
          />
        </a>

        {/* Desktop links */}
        <div className="hidden lg:flex items-center gap-1">
          {NAV.map((item) => (
            <div
              key={item.label}
              className="relative"
              onMouseEnter={() => item.items && setOpen(item.label)}
              onMouseLeave={() => setOpen(null)}
            >
              <a
                href={item.items ? '#' : `#${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={(e) => item.items && e.preventDefault()}
                className="flex items-center gap-0.5 px-3 py-2 text-sm font-medium text-[#2D2D2D] hover:text-[#C1272D] transition-colors rounded"
              >
                {item.label}
                {item.items && (
                  <svg className="w-3 h-3 mt-0.5 opacity-60" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" />
                  </svg>
                )}
              </a>

              {item.items && open === item.label && (
                <div
                  className="absolute top-full left-0 bg-white rounded-xl shadow-xl py-1.5 min-w-[210px] dropdown-visible"
                  style={{ border: '1px solid rgba(0,0,0,0.06)', marginTop: '2px' }}
                  onMouseEnter={() => setOpen(item.label)}
                  onMouseLeave={() => setOpen(null)}
                >
                  {item.items.map((sub) => (
                    <a
                      key={sub}
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      className="block px-4 py-2 text-sm text-[#2D2D2D] hover:bg-[#FAF7F2] hover:text-[#C1272D] transition-colors"
                    >
                      {sub}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Cart + hamburger */}
        <div className="flex items-center gap-3">
          {/* Cart */}
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="hidden lg:flex items-center gap-1.5 text-sm text-[#2D2D2D] font-medium hover:text-[#C1272D] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="text-xs">$0.00&nbsp;0 Cart</span>
          </a>

          {/* Admin — CRM Dashboard link */}
          <Link
            to="/dashboard"
            className="hidden lg:flex items-center gap-1 text-xs text-gray-400 hover:text-[#C1272D] transition-colors px-2 py-1 rounded-full hover:bg-red-50"
            title="CRM Dashboard"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>CRM</span>
          </Link>

          {/* Hamburger */}
          <button
            className="lg:hidden p-2 text-[#2D2D2D] hover:text-[#C1272D] transition-colors"
            onClick={() => setMobile((v) => !v)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              {mobile
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobile && (
        <div className="lg:hidden bg-white border-t border-gray-100 px-4 pb-4">
          {NAV.map((item) => (
            <div key={item.label}>
              <button
                className="w-full flex justify-between items-center py-2.5 text-sm font-medium text-[#2D2D2D] border-b border-gray-50"
                onClick={() => {
                  if (item.items) {
                    setMExp(mExp === item.label ? null : item.label)
                  } else {
                    closeAll()
                    window.location.hash = item.label.toLowerCase().replace(/\s+/g, '-')
                  }
                }}
              >
                {item.label}
                {item.items && (
                  <svg className={`w-3.5 h-3.5 transition-transform ${mExp === item.label ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" />
                  </svg>
                )}
              </button>
              {item.items && mExp === item.label && (
                <div className="pl-4 py-1 space-y-1">
                  {item.items.map((sub) => (
                    <a
                      key={sub}
                      href="#"
                      onClick={(e) => { e.preventDefault(); closeAll() }}
                      className="block py-1.5 text-sm text-gray-500 hover:text-[#C1272D]"
                    >
                      {sub}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="flex items-center gap-2 mt-3 pt-3 border-t text-sm text-[#2D2D2D]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            $0.00 0 Cart
          </div>
        </div>
      )}
    </nav>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section
      id="hero"
      className="relative flex items-center justify-center text-center px-4 py-24 md:py-0"
      style={{
        minHeight: '92vh',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2D2D2D 30%, #6B2737 65%, #C1272D 100%)',
      }}
    >
      {/* Subtle grain overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: '128px',
        }}
      />

      <div className="relative max-w-4xl">
        <p className="text-red-300 text-sm uppercase tracking-[0.25em] mb-6 font-light">
          Mobile Pizza Experiences
        </p>
        <h1
          className="serif text-white mb-6 leading-[1.1]"
          style={{ fontSize: 'clamp(2.6rem, 7vw, 5.5rem)', fontWeight: 700 }}
        >
          Make your next event{' '}
          <br className="hidden sm:block" />
          <em
            className="italic not-italic"
            style={{
              fontStyle: 'italic',
              color: 'transparent',
              WebkitTextStroke: '2px rgba(255,255,255,0.9)',
              textShadow: '0 0 60px rgba(193,39,45,0.6)',
            }}
          >
            unforgettable
          </em>
        </h1>
        <p className="text-white/70 text-lg md:text-xl mb-10 font-light tracking-wide">
          Pizza experiences in NY &amp; CT
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#events"
            className="inline-block bg-white text-[#C1272D] font-bold px-8 py-4 rounded-full text-sm uppercase tracking-widest hover:bg-[#FAF7F2] transition-all hover:scale-105"
            style={{ boxShadow: '0 4px 20px rgba(255,255,255,0.25)' }}
          >
            Buy Tickets for Class
          </a>
          <a
            href="#contact"
            className="inline-block bg-transparent border-2 border-white/60 text-white font-bold px-8 py-4 rounded-full text-sm uppercase tracking-widest hover:bg-white/10 hover:border-white transition-all"
          >
            Book Private Event
          </a>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-40">
        <span className="text-white text-xs tracking-widest uppercase">Scroll</span>
        <svg className="w-4 h-4 text-white animate-bounce" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </section>
  )
}

// ─── About ────────────────────────────────────────────────────────────────────
function About() {
  return (
    <section id="about" className="py-20 md:py-28 bg-[#FAF7F2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
        <div>
          <p className="text-[#C1272D] text-xs uppercase tracking-[0.2em] font-bold mb-4">Our Story</p>
          <h2
            className="serif font-bold text-[#2D2D2D] mb-6 leading-tight"
            style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)' }}
          >
            We{' '}
            <strong className="italic text-[#C1272D]" style={{ fontStyle: 'italic' }}>
              create memories
            </strong>{' '}
            one pizza at a time
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-6">
            Pizza Classes and Catering fully mobile across{' '}
            <strong>Fairfield &amp; Westchester county</strong> for residential and commercial
            clients. We bring the setup (including the ovens), the flavor, and leave no mess
            behind.
          </p>
          <p className="text-gray-600 text-lg leading-relaxed">
            Just invite your guests —{' '}
            <strong>we'll take care of the rest.</strong>
          </p>
          <div className="flex gap-8 mt-10">
            <div>
              <p className="serif text-4xl font-bold text-[#C1272D]">500+</p>
              <p className="text-sm text-gray-500 mt-1">Happy Guests</p>
            </div>
            <div className="w-px bg-gray-200" />
            <div>
              <p className="serif text-4xl font-bold text-[#C1272D]">5★</p>
              <p className="text-sm text-gray-500 mt-1">Average Rating</p>
            </div>
            <div className="w-px bg-gray-200" />
            <div>
              <p className="serif text-4xl font-bold text-[#C1272D]">NY&amp;CT</p>
              <p className="text-sm text-gray-500 mt-1">Service Area</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <img
            src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=700&h=520&fit=crop&q=80"
            alt="Pizza making class in action"
            className="rounded-2xl w-full object-cover shadow-xl"
            style={{ height: '420px' }}
          />
          {/* Accent badge */}
          <div
            className="absolute -bottom-5 -left-5 bg-[#C1272D] text-white px-6 py-4 rounded-2xl shadow-lg hidden md:block"
            style={{ boxShadow: '0 8px 30px rgba(193,39,45,0.35)' }}
          >
            <p className="serif font-bold text-2xl leading-none">100%</p>
            <p className="text-xs text-red-200 mt-1 uppercase tracking-wide">Hands-on</p>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Why Us ───────────────────────────────────────────────────────────────────
const REASONS = [
  {
    emoji: '🏕️',
    title: 'Flexible Setup',
    desc: 'We bring everything needed and can fit almost anywhere — backyards, offices, venues, or small spaces.',
  },
  {
    emoji: '🎨',
    title: 'Fully Customizable',
    desc: 'Make it your own with fun add-ons like dessert-making, apron decorating, or mixology.',
  },
  {
    emoji: '👨‍👩‍👧‍👦',
    title: 'Perfect for All Ages',
    desc: "From kids' birthdays to adult celebrations and corporate team-building, everyone gets hands-on.",
  },
  {
    emoji: '🌿',
    title: 'Premium Ingredients',
    desc: 'We use high-quality local and Italian ingredients, with options for gluten-sensitive guests.',
  },
]

function WhyUs() {
  return (
    <section id="why-us" className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <p className="text-[#C1272D] text-xs uppercase tracking-[0.2em] font-bold mb-4">Why Choose Us</p>
          <h2
            className="serif font-bold text-[#2D2D2D]"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
          >
            4 Reasons Our Clients{' '}
            <em className="text-[#C1272D]" style={{ fontStyle: 'italic' }}>
              Love Us
            </em>
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {REASONS.map((r) => (
            <div
              key={r.title}
              className="bg-[#FAF7F2] rounded-2xl p-8 card-hover"
              style={{ border: '1px solid rgba(0,0,0,0.04)' }}
            >
              <div className="text-4xl mb-5">{r.emoji}</div>
              <h3 className="serif font-bold text-xl text-[#2D2D2D] mb-3">{r.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── How It Works ─────────────────────────────────────────────────────────────
const STEPS = [
  { n: '01', title: 'Choose your experience', desc: 'Pizza Making Class, Party or Catering and/or add-ons' },
  { n: '02', title: 'We arrive early to set up', desc: '30–45 minutes before start time' },
  { n: '03', title: 'Hands-on class time', desc: 'Learn techniques step-by-step' },
  { n: '04', title: 'Eat + enjoy', desc: 'Each guest makes and eats their own pizza' },
  { n: '05', title: 'We handle cleanup', desc: 'We pack up and leave the space as we found it' },
  { n: '06', title: 'Duration of class', desc: '1.5–2 hours depending on experience and group size' },
]

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-[#2D2D2D]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <p className="text-red-300/70 text-xs uppercase tracking-[0.2em] font-bold mb-4">The Process</p>
          <h2
            className="serif font-bold text-white"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
          >
            How does it{' '}
            <em className="text-[#F4A7A9]" style={{ fontStyle: 'italic' }}>
              work?
            </em>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-x-16 gap-y-0">
          {STEPS.map((step, i) => (
            <div key={step.n} className="flex gap-5 pb-10 relative">
              {/* Connector line */}
              {i < STEPS.length - 1 && i !== Math.floor(STEPS.length / 2) - 1 && (
                <div
                  className="absolute left-[22px] top-10 w-px bg-[#C1272D]/20"
                  style={{ height: 'calc(100% - 8px)' }}
                />
              )}
              <div className="flex-shrink-0 w-11 h-11 rounded-full bg-[#C1272D]/15 border border-[#C1272D]/30 flex items-center justify-center">
                <span className="serif text-[#C1272D] font-bold text-sm">{step.n}</span>
              </div>
              <div className="pt-1">
                <h3 className="serif font-bold text-white text-lg mb-1">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-4">
          <a
            href="#contact"
            className="inline-block bg-[#C1272D] text-white font-bold px-10 py-4 rounded-full text-sm uppercase tracking-widest hover:bg-[#A01F23] transition-all hover:scale-105"
            style={{ boxShadow: '0 4px 20px rgba(193,39,45,0.4)' }}
          >
            Book Now
          </a>
        </div>
      </div>
    </section>
  )
}

// ─── Pizza Experiences ────────────────────────────────────────────────────────
const EXPERIENCES = [
  {
    title: 'Pizza Making Class',
    desc: 'Fully hands-on experience where your guests will make their dough from scratch, learn to stretch, top, and bake their own pizzas.',
    price: '$100 per person',
    img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&h=340&fit=crop&q=80',
  },
  {
    title: 'Pizza Party',
    desc: "A mix between a catering-style event and a hands-on class. Those who want to participate can, those who'd rather sit back won't need to lift a finger.",
    price: '$50 per person',
    img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&h=340&fit=crop&q=80',
  },
  {
    title: 'Pizza Catering',
    desc: 'Unlimited variety of freshly made pizzas served buffet-style. Choose up to 4 flavors from our menu.',
    price: 'Starting at $30 pp',
    img: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=500&h=340&fit=crop&q=80',
  },
  {
    title: 'Kids: Pizza Class + Sweet Treat & Apron',
    desc: 'All the perks of our pizza class plus a dessert making activity and apron design experience.',
    price: '$90 per kid',
    img: 'https://images.unsplash.com/photo-1588666309990-d68f08e3d4a6?w=500&h=340&fit=crop&q=80',
  },
  {
    title: 'Cocktail Class',
    desc: 'Experience the energy of a cocktail bar. Edgar will guide you through the art of mixology.',
    price: 'Starting at $70 per person',
    img: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=500&h=340&fit=crop&q=80',
  },
]

function PizzaExperiences() {
  return (
    <section id="experiences" className="py-20 md:py-28 bg-[#FAF7F2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <p className="text-[#C1272D] text-xs uppercase tracking-[0.2em] font-bold mb-4">What We Offer</p>
          <h2
            className="serif font-bold text-[#2D2D2D]"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
          >
            Pizza{' '}
            <em className="text-[#C1272D]" style={{ fontStyle: 'italic' }}>
              Experiences
            </em>
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {EXPERIENCES.map((exp) => (
            <div
              key={exp.title}
              className="bg-white rounded-2xl overflow-hidden card-hover"
              style={{ border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
            >
              <div className="relative overflow-hidden" style={{ height: '200px' }}>
                <img
                  src={exp.img}
                  alt={exp.title}
                  className="w-full h-full object-cover"
                  style={{ transition: 'transform 0.4s ease' }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                />
              </div>
              <div className="p-6">
                <h3 className="serif font-bold text-lg text-[#2D2D2D] mb-2 leading-snug">{exp.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-5">{exp.desc}</p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="font-bold text-[#C1272D] text-sm">{exp.price}</span>
                  <a
                    href="#contact"
                    className="text-sm font-medium text-[#C1272D] hover:underline underline-offset-2"
                  >
                    Learn more →
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── CoCreate Venue ───────────────────────────────────────────────────────────
function CoCreateVenue() {
  return (
    <section id="cocreate" className="py-20 md:py-28 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <p className="text-[#C1272D] text-xs uppercase tracking-[0.2em] font-bold mb-4">Venue Partnership</p>
          <h2
            className="serif font-bold text-[#2D2D2D]"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
          >
            no space?{' '}
            <em className="text-[#C1272D]" style={{ fontStyle: 'italic' }}>
              no problem
            </em>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-gray-600 text-lg leading-relaxed">
              Through our partnership with{' '}
              <strong className="text-[#2D2D2D]">CoCreate</strong>, a contemporary creative venue
              in Stamford, we can host your private event in a stunning, professionally designed
              space. No need to worry about logistics — we handle everything.
            </p>
            <a
              href="#contact"
              className="inline-block mt-8 bg-[#C1272D] text-white font-bold px-8 py-3.5 rounded-full text-sm uppercase tracking-widest hover:bg-[#A01F23] transition-all hover:scale-105"
            >
              Reserve the Space
            </a>
          </div>

          {/* PMQ Quote */}
          <div
            className="bg-[#FAF7F2] rounded-2xl p-8"
            style={{ borderLeft: '4px solid #C1272D' }}
          >
            <svg
              className="w-8 h-8 text-[#C1272D]/30 mb-4"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
            <p className="serif text-[#2D2D2D] text-xl italic leading-relaxed mb-5">
              "The rising star that is shaping the future of pizza"
            </p>
            <div>
              <p className="font-bold text-[#C1272D] text-sm">— PMQ Magazine</p>
              <p className="text-gray-400 text-xs mt-1">About Alexandra Castro, Pizzaiola</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Upcoming Events ──────────────────────────────────────────────────────────
const EVENTS = [
  {
    date: 'May 29',
    year: '2025',
    name: 'Date Night: Pizza Making Class',
    price: '$95.00',
    img: 'https://images.unsplash.com/photo-1555072956-7758afb20e8f?w=500&h=320&fit=crop&q=80',
    spots: '4 spots left',
  },
  {
    date: 'June 26',
    year: '2025',
    name: 'Date Night: Pizza Making Class',
    price: '$95.00',
    img: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=500&h=320&fit=crop&q=80',
    spots: 'Available',
  },
  {
    date: 'July 31',
    year: '2025',
    name: 'Date Night: Pizza Making Class',
    price: '$95.00',
    img: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=500&h=320&fit=crop&q=80',
    spots: 'Available',
  },
]

function UpcomingEvents() {
  return (
    <section id="events" className="py-20 md:py-28 bg-[#FAF7F2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <p className="text-[#C1272D] text-xs uppercase tracking-[0.2em] font-bold mb-4">Monthly Events</p>
          <h2
            className="serif font-bold text-[#2D2D2D] mb-4"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}
          >
            Discover Our{' '}
            <em className="text-[#C1272D]" style={{ fontStyle: 'italic' }}>
              upcoming events
            </em>
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            All our public offerings are hosted at{' '}
            <strong className="text-[#2D2D2D]">Cocreate, Stamford</strong>, once a month.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {EVENTS.map((ev) => (
            <div
              key={ev.date}
              className="bg-white rounded-2xl overflow-hidden card-hover"
              style={{ border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
            >
              <div className="relative" style={{ height: '200px' }}>
                <img src={ev.img} alt={ev.name} className="w-full h-full object-cover" />
                <div
                  className="absolute top-3 left-3 bg-[#C1272D] text-white px-3 py-1.5 rounded-lg text-sm font-bold"
                  style={{ boxShadow: '0 2px 10px rgba(193,39,45,0.4)' }}
                >
                  {ev.date}
                </div>
                <div
                  className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold ${
                    ev.spots === 'Available'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {ev.spots}
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">
                  {ev.date}, {ev.year} · CoCreate, Stamford CT
                </p>
                <h3 className="serif font-bold text-lg text-[#2D2D2D] mb-4 leading-snug">{ev.name}</h3>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="font-bold text-[#C1272D] text-lg serif">{ev.price}</span>
                  <a
                    href="#contact"
                    className="bg-[#C1272D] text-white text-sm font-bold px-5 py-2 rounded-full hover:bg-[#A01F23] transition-colors"
                  >
                    Read more
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Contact Form ─────────────────────────────────────────────────────────────
const INITIAL_FORM = {
  firstName: '', lastName: '', email: '', phone: '',
  howHeard: '', eventDate: '', location: 'cocreate',
  guestCount: '', eventType: '', message: '',
  consentContact: false, newsletter: false,
}

function ContactForm() {
  const [form, setForm] = useState(INITIAL_FORM)

  const set = (e) => {
    const { name, value, type, checked } = e.target
    setForm((p) => ({ ...p, [name]: type === 'checkbox' ? checked : value }))
  }

  const submit = (e) => e.preventDefault()

  const field = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#C1272D]/30 focus:border-[#C1272D] transition-colors'
  const label = 'block text-xs font-bold uppercase tracking-wide text-gray-500 mb-1.5'

  return (
    <section id="contact" className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid md:grid-cols-5 gap-12 lg:gap-20 items-start">

        {/* Left col */}
        <div className="md:col-span-2">
          <p className="text-[#C1272D] text-xs uppercase tracking-[0.2em] font-bold mb-4">Get a Quote</p>
          <h2
            className="serif font-bold text-[#2D2D2D] mb-6 leading-tight"
            style={{ fontSize: 'clamp(2rem, 3.5vw, 2.8rem)' }}
          >
            fill this form to{' '}
            <em className="text-[#C1272D]" style={{ fontStyle: 'italic' }}>
              get a quote
            </em>
          </h2>
          <p className="text-gray-500 leading-relaxed mb-8">
            Tell us about your event and we'll get back to you with a custom quote. We serve the
            greater <strong className="text-[#2D2D2D]">Fairfield &amp; Westchester County</strong>{' '}
            area.
          </p>
          <div className="space-y-4">
            <a
              href="mailto:bookings@everythingdough.com"
              className="flex items-center gap-3 text-gray-600 hover:text-[#C1272D] transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-[#FAF7F2] flex items-center justify-center group-hover:bg-red-50 transition-colors">
                <svg className="w-4 h-4 text-[#C1272D]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-sm">bookings@everythingdough.com</span>
            </a>
            <div className="flex items-center gap-3 text-gray-600">
              <div className="w-10 h-10 rounded-full bg-[#FAF7F2] flex items-center justify-center">
                <svg className="w-4 h-4 text-[#C1272D]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className="text-sm">Stamford, CT &amp; surrounding areas</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={submit} className="md:col-span-3 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={label}>First Name</label>
              <input type="text" name="firstName" value={form.firstName} onChange={set} className={field} placeholder="Jane" />
            </div>
            <div>
              <label className={label}>Last Name</label>
              <input type="text" name="lastName" value={form.lastName} onChange={set} className={field} placeholder="Smith" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={label}>Email</label>
              <input type="email" name="email" value={form.email} onChange={set} className={field} placeholder="jane@email.com" />
            </div>
            <div>
              <label className={label}>Phone #</label>
              <input type="tel" name="phone" value={form.phone} onChange={set} className={field} placeholder="(203) 555-0100" />
            </div>
          </div>
          <div>
            <label className={label}>How did you hear about us?</label>
            <select name="howHeard" value={form.howHeard} onChange={set} className={field}>
              <option value="">Select one…</option>
              {['Google', 'Facebook', 'Instagram', 'TikTok', 'Word of Mouth', 'Farmers Market'].map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={label}>Event Date</label>
              <input type="date" name="eventDate" value={form.eventDate} onChange={set} className={field} />
            </div>
            <div>
              <label className={label}>Guest #</label>
              <input type="number" name="guestCount" value={form.guestCount} onChange={set} className={field} placeholder="e.g. 20" min="1" />
            </div>
          </div>
          <div>
            <label className={label}>Location</label>
            <div className="flex gap-6 mt-2">
              {[['cocreate', 'CoCreate'], ['my-location', 'My Location']].map(([val, lbl]) => (
                <label key={val} className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                  <input
                    type="radio"
                    name="location"
                    value={val}
                    checked={form.location === val}
                    onChange={set}
                    className="accent-[#C1272D]"
                  />
                  {lbl}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className={label}>Event Type</label>
            <select name="eventType" value={form.eventType} onChange={set} className={field}>
              <option value="">Select event type…</option>
              {['Private Pizza Class', 'Private Pizza Party', 'Catering', 'Kids Pizza Party', 'Other'].map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={label}>Your Message</label>
            <textarea
              name="message"
              value={form.message}
              onChange={set}
              rows={4}
              className={field}
              placeholder="Tell us more about your event, date ideas, group size, etc."
            />
          </div>
          <div className="space-y-3 pt-1">
            {[
              ['consentContact', 'I consent to being contacted about my inquiry.'],
              ['newsletter', 'Subscribe me to the Everything Dough newsletter for updates and exclusive offers.'],
            ].map(([name, text]) => (
              <label key={name} className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name={name}
                  checked={form[name]}
                  onChange={set}
                  className="accent-[#C1272D] mt-0.5 flex-shrink-0"
                />
                <span className="text-sm text-gray-500 leading-relaxed">{text}</span>
              </label>
            ))}
          </div>
          <button
            type="submit"
            className="w-full bg-[#C1272D] text-white font-bold py-4 rounded-full text-sm uppercase tracking-widest hover:bg-[#A01F23] transition-all hover:scale-[1.02] mt-2"
            style={{ boxShadow: '0 4px 20px rgba(193,39,45,0.3)' }}
          >
            Get My Quote
          </button>
        </form>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-[#1a1a1a] text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid sm:grid-cols-3 gap-10 pb-12 border-b border-white/10">
        {/* Brand */}
        <div>
          <img
            src="https://www.everythingdough.com/wp-content/uploads/2025/01/cropped-Diseno-sin-titulo-1-e1738356087237-1.png"
            alt="Everything Dough"
            className="h-12 w-auto mb-5 brightness-0 invert opacity-90"
          />
          <p className="text-gray-400 text-sm leading-relaxed">
            Private Pizza Classes and Catering in Stamford CT. Get in touch and Book today!
          </p>
        </div>

        {/* Links */}
        <div>
          <h4 className="serif font-bold text-base mb-5 text-white/90">Quick Links</h4>
          <ul className="space-y-2.5">
            {['FAQ', 'Refund Policy'].map((link) => (
              <li key={link}>
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="text-gray-400 text-sm hover:text-white transition-colors"
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="serif font-bold text-base mb-5 text-white/90">Get In Touch</h4>
          <div className="space-y-3">
            <a
              href="mailto:bookings@everythingdough.com"
              className="flex items-center gap-2 text-gray-400 text-sm hover:text-white transition-colors"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              bookings@everythingdough.com
            </a>
            <a
              href="https://instagram.com/byeverythingdough"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-gray-400 text-sm hover:text-white transition-colors"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
              @byeverythingdough
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 text-center">
        <p className="text-gray-600 text-sm">
          © 2025 Everything Dough. All Rights Reserved.
        </p>
      </div>
    </footer>
  )
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function EverythingDough() {
  return (
    <>
      <style>{FONT_STYLES}</style>
      <Navbar />
      <main>
        <Hero />
        <About />
        <WhyUs />
        <HowItWorks />
        <PizzaExperiences />
        <CoCreateVenue />
        <UpcomingEvents />
        <ContactForm />
      </main>
      <Footer />
      <ChatbotWidget />
    </>
  )
}
