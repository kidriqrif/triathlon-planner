import React from 'react'
import StreloMark from '../components/StreloMark'

export default function TermsPage({ onBack }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center">
          <button onClick={onBack} className="flex items-center gap-2.5">
            <StreloMark size={28} />
            <span className="font-display font-bold text-slate-800 text-lg tracking-tight">Strelo</span>
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-black text-slate-800 mb-2">Terms of Service</h1>
        <p className="text-sm text-slate-400 mb-8">Last updated: March 25, 2026</p>

        <div className="prose prose-slate prose-sm max-w-none space-y-6">
          <section>
            <h2 className="text-lg font-bold text-slate-800">1. Acceptance of Terms</h2>
            <p className="text-slate-600 leading-relaxed">
              By creating an account or using Strelo, you agree to these Terms of Service. If you do not agree, do not use the service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800">2. Description of Service</h2>
            <p className="text-slate-600 leading-relaxed">
              Strelo is a triathlon training planner that allows users to log workouts, track races, manage athlete profiles, and receive Ace-generated training plans. The service is provided on a free tier with optional paid upgrades.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800">3. Accounts</h2>
            <p className="text-slate-600 leading-relaxed">
              You are responsible for maintaining the confidentiality of your account credentials. You must provide accurate information when creating your account. You must be at least 13 years old to use Strelo.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800">4. Subscriptions and Payments</h2>
            <p className="text-slate-600 leading-relaxed">
              Pro subscriptions are billed monthly ($12.99/month) or annually ($123.99/year) through LemonSqueezy. Subscriptions automatically renew unless cancelled before the renewal date. Refunds are handled in accordance with LemonSqueezy's refund policy. We reserve the right to change pricing with 30 days' notice to existing subscribers.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800">5. Ace Training Plans</h2>
            <p className="text-slate-600 leading-relaxed">
              Ace-generated training plans are provided for informational purposes only. They do not constitute medical advice, professional coaching, or a substitute for consultation with qualified health and fitness professionals. You acknowledge that:
            </p>
            <ul className="list-disc pl-5 text-slate-600 space-y-1">
              <li>Ace suggestions may not be suitable for your specific health conditions</li>
              <li>You should consult a doctor before starting any training programme</li>
              <li>You follow Ace suggestions at your own risk</li>
              <li>Strelo is not liable for injuries or health issues arising from Ace suggestions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800">6. Acceptable Use</h2>
            <p className="text-slate-600 leading-relaxed">You agree not to:</p>
            <ul className="list-disc pl-5 text-slate-600 space-y-1">
              <li>Use the service for any unlawful purpose</li>
              <li>Attempt to gain unauthorised access to our systems</li>
              <li>Interfere with or disrupt the service</li>
              <li>Share your account credentials with others</li>
              <li>Resell or redistribute the service without permission</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800">7. Intellectual Property</h2>
            <p className="text-slate-600 leading-relaxed">
              The Strelo name, logo, and all associated content are owned by Strelo. Your training data remains yours. By using the service, you grant us a limited licence to process your data solely for providing the service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800">8. Service Availability</h2>
            <p className="text-slate-600 leading-relaxed">
              We aim to provide reliable uptime but do not guarantee uninterrupted access. The service may experience downtime for maintenance, updates, or factors beyond our control. We are not liable for any loss resulting from service unavailability.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800">9. Limitation of Liability</h2>
            <p className="text-slate-600 leading-relaxed">
              To the maximum extent permitted by law, Strelo shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service. Our total liability shall not exceed the amount you paid for the service in the 12 months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800">10. Termination</h2>
            <p className="text-slate-600 leading-relaxed">
              We may suspend or terminate your account if you violate these terms. You may delete your account at any time. Upon termination, your data will be deleted in accordance with our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800">11. Changes to Terms</h2>
            <p className="text-slate-600 leading-relaxed">
              We may update these terms from time to time. Continued use of the service after changes constitutes acceptance of the new terms. We will notify registered users of significant changes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-slate-800">12. Contact</h2>
            <p className="text-slate-600 leading-relaxed">
              For questions about these terms, contact us at <strong>support@strelo.app</strong>.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
