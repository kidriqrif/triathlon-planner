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

export default function TermsPage({ onBack }) {
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
        <h1 className="font-display text-3xl font-bold text-slate-800 dark:text-white mb-2">Terms of Service</h1>
        <p className="text-sm text-slate-400 dark:text-zinc-500 mb-2">Last updated: 25 April 2026</p>
        <p className="text-sm text-slate-500 dark:text-zinc-400 mb-8 leading-relaxed">
          These Terms govern your access to and use of Strelo. By creating an account or using the service,
          you accept these Terms. If you do not accept them, do not use Strelo.
        </p>

        <div className="space-y-6">
          <Section n="1" title="Definitions">
            <UL>
              <li><strong>"Strelo"</strong>, <strong>"we"</strong>, <strong>"us"</strong> — the operator of strelo.vercel.app and related services.</li>
              <li><strong>"Service"</strong> — the Strelo web application, AI coaching engine ("Ace"), and any associated features.</li>
              <li><strong>"You"</strong> — the individual creating an account or using the Service.</li>
              <li><strong>"Pro Plan"</strong> — the paid subscription tier.</li>
              <li><strong>"Free Plan"</strong> — the no-cost tier with limited features.</li>
            </UL>
          </Section>

          <Section n="2" title="Eligibility">
            <P>
              You must be at least 16 years old if you reside in the EU/UK, or at least 13 years old elsewhere.
              By using the Service you confirm that you meet this requirement and that nothing prevents you
              from entering into a binding contract.
            </P>
          </Section>

          <Section n="3" title="Account registration and security">
            <P>
              You must provide accurate, current information when creating an account and keep it up to date.
              You are responsible for keeping your password confidential and for all activity that occurs under
              your account. Notify us immediately at <strong>support@strelo.app</strong> if you suspect
              unauthorised access.
            </P>
          </Section>

          <Section n="4" title="Description of Service">
            <P>
              Strelo lets you log workouts, plan races, import structured training plans, sync completed
              activities from Strava, and receive AI-generated training suggestions and load metrics on the
              Pro Plan. Available features and their behaviour may change over time as the Service evolves.
            </P>
          </Section>

          <Section n="5" title="Acceptable use">
            <P>You agree not to:</P>
            <UL>
              <li>Use the Service for any unlawful, harmful, or fraudulent purpose.</li>
              <li>Attempt to access, probe, or test the integrity of our infrastructure without permission.</li>
              <li>Interfere with, disrupt, or impose unreasonable load on the Service.</li>
              <li>Reverse-engineer or attempt to extract source code, except where the law permits.</li>
              <li>Share your account credentials, sell access to your account, or impersonate another user.</li>
              <li>Resell, sublicence, or commercially redistribute the Service without our written permission.</li>
              <li>Use automated agents (scrapers, bots) to access the Service in a way that violates rate limits.</li>
            </UL>
          </Section>

          <Section n="6" title="Subscriptions, billing, and refunds">
            <P>
              Pro Plan subscriptions are billed by LemonSqueezy at $12.99/month or $123.99/year and renew
              automatically until you cancel. You may cancel at any time from the billing portal; cancellation
              takes effect at the end of the current billing period and you retain Pro access until then.
            </P>
            <P>
              <strong>EU/UK consumer cooling-off.</strong> If you are a consumer in the EU/UK, you have a
              statutory 14-day right of withdrawal from a new subscription. By starting to use Pro features
              within that window, you expressly request immediate provision of the digital service and
              acknowledge that you lose the right of withdrawal once provision begins.
            </P>
            <P>
              <strong>Refunds.</strong> Outside the EU/UK cooling-off period, refunds are at our discretion
              and are processed through LemonSqueezy. We may issue prorated refunds in cases of extended
              service unavailability.
            </P>
            <P>
              <strong>Pricing changes.</strong> We may change subscription pricing with at least 30 days'
              notice to existing subscribers. Continued subscription after the change constitutes acceptance
              of the new price.
            </P>
            <P>
              <strong>Failed payments.</strong> If a renewal payment fails, we may downgrade your account to
              the Free Plan after a grace period.
            </P>
          </Section>

          <Section n="7" title="Free Plan and beta features">
            <P>
              The Free Plan is provided as-is and may have feature, usage, or storage limits. Some features
              may be marked beta or experimental — they may change, break, or be removed without notice and
              are not covered by any uptime expectation.
            </P>
          </Section>

          <Section n="8" title="Medical disclaimer and assumption of risk">
            <P>
              Triathlon training involves swimming, cycling, and running, often at high intensity and for long
              durations. These activities carry inherent risks including but not limited to injury, drowning,
              traffic incidents, cardiovascular events, heat illness, dehydration, and death.
            </P>
            <P>
              <strong>Strelo is not a medical device, healthcare provider, or licensed coach.</strong> All
              training plans, AI suggestions, intensity targets, pace targets, power targets, recovery
              recommendations, and load metrics provided by Strelo are general informational tools, not
              medical or coaching advice. They are not tailored to your specific medical history.
            </P>
            <P>You acknowledge and agree that:</P>
            <UL>
              <li>You should consult a qualified physician before starting any training programme, especially if you have a pre-existing condition, are pregnant, or are over 35.</li>
              <li>You are solely responsible for evaluating whether any prescribed session is safe for you on a given day.</li>
              <li>You must stop a session immediately if you experience pain, dizziness, chest pressure, breathing difficulty, or any other warning sign.</li>
              <li>You assume all risk arising from your participation in the training activities Strelo suggests.</li>
              <li>Strelo, its operators, contributors, and providers are not liable for any injury, illness, or death you sustain while training.</li>
            </UL>
          </Section>

          <Section n="9" title="AI coaching (Ace)">
            <P>
              Ace generates training suggestions and recovery recommendations using a large language model.
              Outputs may be inaccurate, incomplete, or unsuitable for your situation. You retain full control
              to accept, reject, or modify any suggestion. You should not act on Ace output as a substitute
              for personalised coaching from a qualified professional.
            </P>
          </Section>

          <Section n="10" title="Third-party integrations">
            <P>
              Strelo can connect to Strava, Garmin, COROS, and other third-party services. Your use of those
              services is governed by their own terms. We are not responsible for their availability,
              accuracy, or any data they handle on their side. You may disconnect any integration at any time.
            </P>
            <P>
              <strong>Strava attribution.</strong> Where data from Strava is displayed, we comply with
              Strava's brand and API guidelines, including the requirement to indicate that data is "Powered
              by Strava" where applicable.
            </P>
          </Section>

          <Section n="11" title="Your data and content">
            <P>
              You retain all rights to the training data you create or upload. By using the Service, you grant
              Strelo a limited, worldwide, royalty-free licence to host, process, transmit, display, and
              compute derived metrics from your data solely for the purpose of providing the Service to you.
              You may export your data at any time and delete your account to revoke this licence.
            </P>
          </Section>

          <Section n="12" title="Intellectual property">
            <P>
              The Strelo name, logo, branding, source code, design, and the Ace coaching engine are owned by
              Strelo and protected by intellectual property law. Nothing in these Terms transfers any
              ownership of our intellectual property to you. You may not use our trademarks without our prior
              written consent.
            </P>
          </Section>

          <Section n="13" title="Service availability">
            <P>
              We strive for high availability but do not guarantee uninterrupted access. The Service may be
              temporarily unavailable due to maintenance, third-party outages, or factors beyond our control.
              We are not liable for any loss caused by such unavailability.
            </P>
          </Section>

          <Section n="14" title="Termination">
            <P>
              You may delete your account at any time from Settings. We may suspend or terminate your account
              if you breach these Terms, attempt to harm the Service or other users, or fail to pay a
              subscription. We will provide reasonable notice except where immediate action is required to
              protect the Service or other users. On termination, your data will be deleted in accordance
              with the Privacy Policy.
            </P>
          </Section>

          <Section n="15" title="Disclaimer of warranties">
            <P>
              To the maximum extent permitted by law, the Service is provided "as is" and "as available",
              without warranties of any kind, whether express or implied, including warranties of
              merchantability, fitness for a particular purpose, accuracy, or non-infringement. We do not
              warrant that training plans or AI suggestions will produce any particular result, including
              improvement in fitness, race time, or health outcomes.
            </P>
          </Section>

          <Section n="16" title="Limitation of liability">
            <P>
              To the maximum extent permitted by law, Strelo and its operators shall not be liable for any
              indirect, incidental, special, consequential, exemplary, or punitive damages, including loss of
              profits, data, training history, race performance, or goodwill, arising out of or in connection
              with your use of the Service.
            </P>
            <P>
              Our total cumulative liability for any claim arising out of or related to the Service shall not
              exceed the greater of (a) the amount you paid us for the Service in the 12 months preceding the
              event giving rise to the claim, or (b) USD 50.
            </P>
            <P>
              Nothing in these Terms limits liability for fraud, gross negligence, wilful misconduct, death or
              personal injury caused by negligence, or any other liability that cannot be excluded by law.
            </P>
          </Section>

          <Section n="17" title="Indemnification">
            <P>
              You agree to indemnify and hold harmless Strelo and its operators from any claim, demand, or
              damages, including reasonable legal fees, arising out of your breach of these Terms, your
              violation of any law, or your infringement of a third party's rights.
            </P>
          </Section>

          <Section n="18" title="Governing law and disputes">
            <P>
              These Terms are governed by the laws of the operator's country of residence, without regard to
              conflict-of-law principles. To the extent permitted by mandatory consumer-protection law, any
              dispute will be resolved exclusively by the courts of that jurisdiction. EU/UK consumers retain
              the right to bring proceedings in their own country of residence.
            </P>
          </Section>

          <Section n="19" title="Changes to these Terms">
            <P>
              We may update these Terms from time to time. We will notify registered users of material
              changes by email or in-app notice, and post the updated version with a new "Last updated" date.
              Continued use of the Service after a change constitutes acceptance of the new Terms.
            </P>
          </Section>

          <Section n="20" title="Miscellaneous">
            <P>
              <strong>Entire agreement.</strong> These Terms and the Privacy Policy form the entire agreement
              between you and Strelo and supersede any prior agreement on the same subject.
            </P>
            <P>
              <strong>Severability.</strong> If any provision is found unenforceable, the remainder remains
              in full force and effect.
            </P>
            <P>
              <strong>No waiver.</strong> Our failure to enforce any provision is not a waiver of that
              provision or our right to enforce it later.
            </P>
            <P>
              <strong>Assignment.</strong> You may not assign these Terms without our consent. We may assign
              these Terms in connection with a merger, acquisition, or sale of assets.
            </P>
            <P>
              <strong>Force majeure.</strong> Neither party is liable for failure to perform caused by events
              beyond reasonable control, including natural disasters, war, government action, network outages,
              or third-party service failures.
            </P>
          </Section>

          <Section n="21" title="Contact">
            <P>
              For questions about these Terms, contact <strong>support@strelo.app</strong>.
            </P>
          </Section>
        </div>
      </main>
    </div>
  )
}
