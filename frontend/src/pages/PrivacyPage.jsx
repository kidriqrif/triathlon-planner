import React from 'react'
import StreloMark from '../components/StreloMark'

const Section = ({ n, title, children }) => (
  <section>
    <h2 className="text-lg font-bold text-slate-800 dark:text-white">{n}. {title}</h2>
    <div className="mt-2 space-y-2">{children}</div>
  </section>
)

const P = ({ children }) => <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{children}</p>
const UL = ({ children }) => <ul className="list-disc pl-5 text-slate-600 dark:text-slate-400 space-y-1">{children}</ul>

export default function PrivacyPage({ onBack }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-900/70 backdrop-blur-lg border-b border-slate-100 dark:border-white/5">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center">
          <button onClick={onBack} className="flex items-center gap-2.5">
            <StreloMark size={28} />
            <span className="font-display font-bold text-slate-800 dark:text-white text-lg tracking-tight">Strelo</span>
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="font-display text-3xl font-bold text-slate-800 dark:text-white mb-2">Privacy Policy</h1>
        <p className="text-sm text-slate-400 dark:text-zinc-500 mb-2">Last updated: 25 April 2026</p>
        <p className="text-sm text-slate-500 dark:text-zinc-400 mb-8 leading-relaxed">
          This Privacy Policy explains what personal data Strelo ("we", "us") collects, how we use it,
          and the rights you have over your data. It applies to <strong>strelo.vercel.app</strong> and any
          related Strelo services. If you are in the EU, UK, or California, additional rights apply — see
          Section 9.
        </p>

        <div className="space-y-6">
          <Section n="1" title="Who we are">
            <P>
              Strelo is a triathlon training planner operated by an independent developer. For the purposes
              of EU/UK GDPR, the data controller is the operator of the service. You can reach us at{' '}
              <strong>support@strelo.app</strong> for any privacy-related question, including formal data
              subject requests.
            </P>
          </Section>

          <Section n="2" title="Information we collect">
            <P><strong>Account information.</strong> Name, email address, and a hashed password (bcrypt).</P>
            <P><strong>Athlete profile.</strong> Optional fields including age, weight, fitness level, FTP, run paces (easy / threshold / 5k), threshold heart rate, swim CSS pace, weekly hour target, preferred training days, injury notes, and goal description.</P>
            <P><strong>Training data.</strong> Workouts you log or import (sport, date, type, status, duration, distance, RPE, notes), races, body log entries (weight, resting HR, sleep), journal entries, and saved templates.</P>
            <P><strong>Strava-derived data (if you connect Strava).</strong> For each imported activity we store the activity ID, start date, sport type, moving time, distance, average heart rate, max heart rate, average power, and normalized power. We do <em>not</em> store raw GPS streams or full-resolution time-series data.</P>
            <P><strong>Payment data.</strong> Subscription status and a customer/subscription ID issued by LemonSqueezy. We do <em>not</em> see or store your card number, CVV, or billing address — those live only with LemonSqueezy.</P>
            <P><strong>Local-only data.</strong> Your profile picture (if you upload one), sidebar collapsed state, and theme preference are stored only in your browser's localStorage and never transmitted to our servers.</P>
            <P><strong>Technical data.</strong> Server logs may include IP address, user-agent, and timestamps for security and rate-limiting purposes. We do not run analytics or tracking pixels.</P>
          </Section>

          <Section n="3" title="How we use your information">
            <UL>
              <li>Provide the core service: store, display, and let you edit your training data.</li>
              <li>Generate personalised workouts and AI coaching suggestions (Pro plan).</li>
              <li>Compute fitness/fatigue/form metrics (CTL, ATL, TSB) from your training data.</li>
              <li>Process and renew your subscription via LemonSqueezy.</li>
              <li>Send essential transactional emails (password reset, billing receipts, security alerts).</li>
              <li>Detect abuse, fraud, and rate-limit excessive API requests.</li>
              <li>Investigate and respond to support requests you initiate.</li>
            </UL>
          </Section>

          <Section n="4" title="Legal basis for processing (EU/UK)">
            <P>If you are in the EU/UK, we rely on the following legal bases under GDPR Art. 6:</P>
            <UL>
              <li><strong>Contract</strong> — to provide the service you signed up for, including account, training data storage, and subscription billing.</li>
              <li><strong>Legitimate interest</strong> — to keep the service secure, prevent abuse, and improve features. You may object at any time (Section 9).</li>
              <li><strong>Consent</strong> — for optional integrations (Strava connection) and for any future marketing communications. You can withdraw consent at any time.</li>
              <li><strong>Legal obligation</strong> — to retain billing records for tax/accounting purposes.</li>
            </UL>
          </Section>

          <Section n="5" title="Sharing your information (subprocessors)">
            <P>We share data with the following processors strictly to operate the service:</P>
            <UL>
              <li><strong>Neon</strong> (US) — managed PostgreSQL database hosting.</li>
              <li><strong>Render</strong> (US) — backend application hosting.</li>
              <li><strong>Vercel</strong> (US) — frontend application hosting.</li>
              <li><strong>LemonSqueezy</strong> (US) — payment processing and tax handling.</li>
              <li><strong>Groq / Anthropic</strong> (US) — AI inference for the Ace coaching engine. Only Pro subscribers' aggregated training data and athlete profile (name, fitness level, paces, recent workouts, races) is sent per request.</li>
              <li><strong>Strava</strong> (US) — only if you actively connect it. We send OAuth tokens; we do not push data <em>to</em> Strava.</li>
            </UL>
            <P>We never sell or rent your personal data.</P>
          </Section>

          <Section n="6" title="International data transfers">
            <P>
              All of our subprocessors are located in the United States. If you are based in the EU, UK,
              or another jurisdiction with data-export restrictions, your personal data is transferred
              outside your home country. We rely on Standard Contractual Clauses or equivalent safeguards
              published by each subprocessor. You can request a copy of these clauses by contacting us.
            </P>
          </Section>

          <Section n="7" title="Automated decision-making and AI">
            <P>
              The Ace coaching engine produces training suggestions, intensity classifications, and recovery
              recommendations using a large language model. These outputs are recommendations only — they do
              not produce legal or similarly significant effects on you under GDPR Art. 22. You retain full
              control to accept, reject, or modify any suggestion before it is added to your plan.
            </P>
          </Section>

          <Section n="8" title="Data retention">
            <P>
              We retain your account and training data for as long as your account is active. If you delete
              your account, we permanently erase personal and training data within 30 days. Billing records
              are retained for a longer period as required by tax law (typically 6–10 years depending on
              jurisdiction). Server logs are rotated within 90 days.
            </P>
          </Section>

          <Section n="9" title="Your rights">
            <P>You have the following rights with respect to your personal data:</P>
            <UL>
              <li><strong>Access</strong> — request a copy of the data we hold about you.</li>
              <li><strong>Rectification</strong> — correct inaccurate or incomplete data (you can do most of this directly in your profile).</li>
              <li><strong>Erasure</strong> — delete your account and all associated personal data.</li>
              <li><strong>Portability</strong> — export your training data in a machine-readable format (CSV / FIT).</li>
              <li><strong>Restriction and objection</strong> — limit how we process your data or object to processing based on legitimate interest.</li>
              <li><strong>Withdraw consent</strong> — disconnect optional integrations at any time.</li>
              <li><strong>Lodge a complaint</strong> — EU/UK residents may complain to their national data protection authority.</li>
              <li><strong>California residents (CCPA/CPRA)</strong> — right to know, delete, correct, and opt out of any "sale" or "sharing" of personal information. We do not sell or share your data for cross-context behavioral advertising.</li>
            </UL>
            <P>
              To exercise any right, email <strong>support@strelo.app</strong>. We respond within 30 days
              and may require you to verify your identity for security.
            </P>
          </Section>

          <Section n="10" title="Children's privacy">
            <P>
              Strelo is not intended for children. You must be at least 16 years old (EU/UK) or 13 years
              old (US and most other regions) to create an account. If we learn that we have inadvertently
              collected data from a child below the applicable age, we will delete it promptly.
            </P>
          </Section>

          <Section n="11" title="Cookies and local storage">
            <P>
              We do not use third-party tracking cookies, advertising cookies, or analytics scripts. We
              use your browser's localStorage to store the following keys, all of which stay on your device:
            </P>
            <UL>
              <li><code>strelo_token</code> — JWT authentication token (essential).</li>
              <li><code>strelo_user</code> — cached profile snapshot (essential).</li>
              <li><code>strelo_theme</code> — light/dark preference.</li>
              <li><code>strelo_sidebar_collapsed</code> — sidebar layout preference.</li>
              <li><code>strelo_avatar</code> — profile picture you uploaded (base64).</li>
            </UL>
          </Section>

          <Section n="12" title="Notifications">
            <P>
              If you grant browser notification permission, we use it only to remind you of planned workouts.
              You can revoke this permission in your browser settings at any time.
            </P>
          </Section>

          <Section n="13" title="Security">
            <P>
              Passwords are hashed with bcrypt. Sessions use signed JWT tokens. All traffic is served over
              HTTPS. We follow industry-standard practices for backend hardening, but no system can be
              guaranteed perfectly secure. If we discover a personal data breach affecting your data, we
              will notify you and the relevant supervisory authority within 72 hours, as required by GDPR
              Art. 33–34.
            </P>
          </Section>

          <Section n="14" title="Marketing communications">
            <P>
              We currently do not send marketing emails. If we introduce them in the future, they will be
              opt-in only and every message will include an unsubscribe link.
            </P>
          </Section>

          <Section n="15" title="Changes to this policy">
            <P>
              We may update this policy from time to time. We will notify registered users of significant
              changes via email or an in-app notice. The "Last updated" date at the top reflects the most
              recent revision.
            </P>
          </Section>

          <Section n="16" title="Contact">
            <P>
              For privacy questions, data subject requests, or to report a suspected breach, contact{' '}
              <strong>support@strelo.app</strong>.
            </P>
          </Section>
        </div>
      </main>
    </div>
  )
}
