import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-300">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="font-display font-bold text-3xl text-white mb-2">Privacy Policy</h1>
        <p className="text-gray-500 text-sm mb-10">Last updated: May 2026</p>

        <section className="space-y-8 text-sm leading-relaxed">

          <div>
            <h2 className="text-white font-semibold text-lg mb-2">1. Introduction</h2>
            <p>Welcome to JobFresh.in ("we", "our", "us"). We are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you visit <strong className="text-white">jobfresh.in</strong>.</p>
          </div>

          <div>
            <h2 className="text-white font-semibold text-lg mb-2">2. Information We Collect</h2>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li><strong className="text-gray-300">Email address</strong> — when you subscribe to job alerts</li>
              <li><strong className="text-gray-300">Job category / location preference</strong> — to personalise alerts</li>
              <li><strong className="text-gray-300">Usage data</strong> — pages visited, browser type, IP address (via analytics)</li>
              <li><strong className="text-gray-300">Cookies</strong> — used by Google AdSense and analytics services</li>
            </ul>
          </div>

          <div>
            <h2 className="text-white font-semibold text-lg mb-2">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>Send you job alert emails based on your subscription preferences</li>
              <li>Improve the website and user experience</li>
              <li>Display relevant advertisements via Google AdSense</li>
              <li>Analyse site traffic with Google Analytics</li>
            </ul>
          </div>

          <div>
            <h2 className="text-white font-semibold text-lg mb-2">4. Google AdSense &amp; Cookies</h2>
            <p className="text-gray-400">We use Google AdSense to display advertisements. Google may use cookies to serve ads based on your prior visits to this or other websites. You can opt out of personalised advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">Google Ads Settings</a>. For more information, see <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">Google's advertising policies</a>.</p>
          </div>

          <div>
            <h2 className="text-white font-semibold text-lg mb-2">5. Email Subscriptions</h2>
            <p className="text-gray-400">If you subscribe to job alerts, we store your email address to send you notifications of new job postings. You can unsubscribe at any time by clicking the "Unsubscribe" link in any email we send.</p>
          </div>

          <div>
            <h2 className="text-white font-semibold text-lg mb-2">6. Data Sharing</h2>
            <p className="text-gray-400">We do not sell, trade, or share your personal information with third parties except as required by law or to operate the services described above (e.g. email delivery via our mail provider).</p>
          </div>

          <div>
            <h2 className="text-white font-semibold text-lg mb-2">7. Data Retention</h2>
            <p className="text-gray-400">We retain your email address as long as your subscription is active. You may request deletion at any time by emailing us.</p>
          </div>

          <div>
            <h2 className="text-white font-semibold text-lg mb-2">8. Your Rights</h2>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>Access the personal data we hold about you</li>
              <li>Request correction or deletion of your data</li>
              <li>Unsubscribe from email alerts at any time</li>
            </ul>
          </div>

          <div>
            <h2 className="text-white font-semibold text-lg mb-2">9. Contact Us</h2>
            <p className="text-gray-400">For any privacy-related questions or data requests, contact us at: <a href="mailto:admin@jobfresh.in" className="text-orange-400 hover:underline">admin@jobfresh.in</a></p>
          </div>

          <div>
            <h2 className="text-white font-semibold text-lg mb-2">10. Changes to This Policy</h2>
            <p className="text-gray-400">We may update this policy from time to time. Changes will be posted on this page with an updated date.</p>
          </div>

        </section>

        <div className="mt-12 pt-8 border-t border-gray-800">
          <Link to="/" className="text-orange-400 hover:underline text-sm">← Back to JobFresh.in</Link>
        </div>
      </div>

      <footer className="border-t border-gray-800/50 py-8 text-center text-gray-600 text-sm">
        © {new Date().getFullYear()} JobFresh.in — Fresh jobs, every day.
      </footer>
    </div>
  )
}
