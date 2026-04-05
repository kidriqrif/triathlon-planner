import React from 'react'

export default function PrivacyPage({ onBack }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center">
          <button onClick={onBack} className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M5 14L8 4" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
                <path d="M8.5 14L11.5 4" stroke="rgba(255,255,255,0.6)" strokeWidth="2.2" strokeLinecap="round"/>
                <path d="M12 14L15 4" stroke="rgba(255,255,255,0.3)" strokeWidth="2.2" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="font-black text-slate-800 text-lg tracking-tight">Strelo</span>
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-black text-slate-800 mb-2">Privacy Policy</h1>
        <p className="text-sm text-slate-400 mb-8">Last updated: March 25, 2026</p>

        <div className="prose prose-slate prose-sm max-w-none space-y-6">
          <section>
            <h2 className="text-lg font-bold text-slate-800">1. Information We Collect</h2>
            <p className="text-slate-600 leading-relaxed">
              When you create an account, we collect your name, email address, and password (stored as a secure hash). When you use Strelo, we collect training data you provide including workouts, races, athlete profile information (age, weight, fitness metrics), goals, and injury notes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800">2. How We Use Your Information</h2>
            <p className="text-slate-600 leading-relaxed">We use your information to:</p>
            <ul className="list-disc pl-5 text-slate-600 space-y-1">
              <li>Provide and maintain your Strelo account and training data</li>
              <li>Generate personalised Ace training plans (Pro plan)</li>
              <li>Process payments through our payment provider (LemonSqueezy)</li>
              <li>Send essential account-related communications</li>
              <li>Improve and develop our services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800">3. AI-Generated Content</h2>
            <p className="text-slate-600 leading-relaxed">
              Pro subscribers' athlete profiles and training history are sent to a third-party AI provider (Groq) to generate training suggestions. This data is used solely for generating your training plan and is not stored by the AI provider beyond the request. AI suggestions are for informational purposes only and do not constitute medical or professional coaching advice.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800">4. Data Storage and Security</h2>
            <p className="text-slate-600 leading-relaxed">
              Your data is stored on secure servers hosted by Neon (database) and Render (application). Passwords are hashed using bcrypt and are never stored in plain text. We use JWT tokens for authentication and HTTPS for all data transmission.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800">5. Third-Party Services</h2>
            <p className="text-slate-600 leading-relaxed">We use the following third-party services:</p>
            <ul className="list-disc pl-5 text-slate-600 space-y-1">
              <li><strong>Neon</strong> — database hosting</li>
              <li><strong>Render</strong> — application hosting</li>
              <li><strong>Vercel</strong> — frontend hosting</li>
              <li><strong>LemonSqueezy</strong> — payment processing</li>
              <li><strong>Groq</strong> — Ace training engine (Pro plan only)</li>
            </ul>
            <p className="text-slate-600 leading-relaxed mt-2">
              Each provider has their own privacy policy governing their handling of data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800">6. Data Retention and Deletion</h2>
            <p className="text-slate-600 leading-relaxed">
              Your data is retained for as long as your account is active. You may request deletion of your account and all associated data by contacting us. Upon deletion, all personal data, workouts, races, and profile information will be permanently removed.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800">7. Cookies</h2>
            <p className="text-slate-600 leading-relaxed">
              Strelo uses localStorage to store your authentication token and user preferences. We do not use tracking cookies or third-party analytics cookies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800">8. Your Rights</h2>
            <p className="text-slate-600 leading-relaxed">You have the right to:</p>
            <ul className="list-disc pl-5 text-slate-600 space-y-1">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your training data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800">9. Changes to This Policy</h2>
            <p className="text-slate-600 leading-relaxed">
              We may update this policy from time to time. We will notify registered users of significant changes via email or in-app notification.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800">10. Contact</h2>
            <p className="text-slate-600 leading-relaxed">
              For privacy-related questions, contact us at <strong>support@strelo.app</strong>.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
