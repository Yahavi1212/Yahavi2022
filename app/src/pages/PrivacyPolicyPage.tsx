import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, Database, Globe } from 'lucide-react';

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-hack-white">
      {/* Header */}
      <div className="bg-hack-black text-hack-white py-16 lg:py-20">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-hack-yellow hover:text-hack-orange transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-hack-yellow/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-hack-yellow" />
              </div>
              <h1 className="font-display font-bold text-4xl lg:text-5xl">
                Privacy Policy
              </h1>
            </div>
            <p className="text-hack-white/60 text-lg max-w-2xl">
              How we collect, use, and protect your personal information.
            </p>
            <p className="text-white/40 text-sm mt-4">Last updated: January 2026</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="max-w-3xl mx-auto">
          <div className="prose prose-lg max-w-none">
            <p className="text-hack-black/70 text-lg leading-relaxed mb-8">
              HackKnow ("we", "us", or "our") is committed to protecting your privacy. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard 
              your information when you use our website and services.
            </p>

            {/* Data Collection */}
            <div className="bg-blue-50 rounded-2xl p-6 mb-8 border border-blue-100">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                  <Database className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-xl text-blue-700 mb-3">
                    Information We Collect
                  </h2>
                  <ul className="space-y-2 text-blue-600/80">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <span><strong>Account Information:</strong> Name, email address, password when you register</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <span><strong>Payment Information:</strong> Billing address, payment method details (processed securely by Razorpay)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <span><strong>Usage Data:</strong> Pages visited, products viewed, download history</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 mt-1">•</span>
                      <span><strong>Device Information:</strong> IP address, browser type, operating system</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* How We Use */}
            <h2 className="font-display font-bold text-2xl text-hack-black mb-4 flex items-center gap-3">
              <Eye className="w-6 h-6 text-hack-magenta" />
              How We Use Your Information
            </h2>
            <ul className="space-y-3 text-hack-black/70 mb-8">
              <li className="flex items-start gap-2">
                <span className="text-hack-yellow mt-1">•</span>
                <span>Provide and maintain our services</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-hack-yellow mt-1">•</span>
                <span>Process your transactions and purchases</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-hack-yellow mt-1">•</span>
                <span>Send order confirmations and download notifications</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-hack-yellow mt-1">•</span>
                <span>Communicate updates, offers, and newsletters (with your consent)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-hack-yellow mt-1">•</span>
                <span>Improve our website and user experience</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-hack-yellow mt-1">•</span>
                <span>Prevent fraud and ensure security</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-hack-yellow mt-1">•</span>
                <span>Comply with legal obligations</span>
              </li>
            </ul>

            {/* Data Security */}
            <h2 className="font-display font-bold text-2xl text-hack-black mb-4 flex items-center gap-3">
              <Lock className="w-6 h-6 text-green-500" />
              Data Security
            </h2>
            <p className="text-hack-black/70 mb-8">
              We implement appropriate technical and organizational security measures to 
              protect your personal information against unauthorized access, alteration, 
              disclosure, or destruction. This includes:
            </p>
            <ul className="space-y-3 text-hack-black/70 mb-8">
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span>SSL/TLS encryption for all data transmission</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span>Secure password hashing (never store plain text passwords)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span>Regular security audits and vulnerability assessments</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span>Limited employee access to personal data</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span>PCI DSS compliant payment processing through Razorpay</span>
              </li>
            </ul>

            {/* Cookies */}
            <h2 className="font-display font-bold text-2xl text-hack-black mb-4">
              Cookies and Tracking
            </h2>
            <p className="text-hack-black/70 mb-8">
              We use cookies and similar tracking technologies to enhance your browsing 
              experience, analyze website traffic, and understand user behavior. You can 
              control cookies through your browser settings. Types of cookies we use:
            </p>
            <ul className="space-y-3 text-hack-black/70 mb-8">
              <li className="flex items-start gap-2">
                <span className="text-hack-orange mt-1">•</span>
                <span><strong>Essential Cookies:</strong> Required for website functionality</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-hack-orange mt-1">•</span>
                <span><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our site</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-hack-orange mt-1">•</span>
                <span><strong>Preference Cookies:</strong> Remember your settings and choices</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-hack-orange mt-1">•</span>
                <span><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements</span>
              </li>
            </ul>

            {/* Third Parties */}
            <h2 className="font-display font-bold text-2xl text-hack-black mb-4 flex items-center gap-3">
              <Globe className="w-6 h-6 text-hack-yellow" />
              Third-Party Services
            </h2>
            <p className="text-hack-black/70 mb-8">
              We may share your information with trusted third-party service providers 
              who assist us in operating our website, conducting business, or servicing 
              you. These include:
            </p>
            <ul className="space-y-3 text-hack-black/70 mb-8">
              <li className="flex items-start gap-2">
                <span className="text-hack-yellow mt-1">•</span>
                <span><strong>Razorpay:</strong> Payment processing (PCI DSS compliant)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-hack-yellow mt-1">•</span>
                <span><strong>Google Analytics:</strong> Website analytics and user behavior</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-hack-yellow mt-1">•</span>
                <span><strong>Email Service Providers:</strong> Transactional and marketing emails</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-hack-yellow mt-1">•</span>
                <span><strong>Cloud Storage:</strong> Secure file hosting and delivery</span>
              </li>
            </ul>

            {/* Your Rights */}
            <h2 className="font-display font-bold text-2xl text-hack-black mb-4">
              Your Privacy Rights
            </h2>
            <p className="text-hack-black/70 mb-4">
              Depending on your location, you may have the following rights:
            </p>
            <ul className="space-y-3 text-hack-black/70 mb-8">
              <li className="flex items-start gap-2">
                <span className="text-hack-magenta mt-1">•</span>
                <span><strong>Access:</strong> Request a copy of your personal data</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-hack-magenta mt-1">•</span>
                <span><strong>Correction:</strong> Update inaccurate or incomplete information</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-hack-magenta mt-1">•</span>
                <span><strong>Deletion:</strong> Request deletion of your personal data</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-hack-magenta mt-1">•</span>
                <span><strong>Portability:</strong> Receive your data in a structured format</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-hack-magenta mt-1">•</span>
                <span><strong>Objection:</strong> Object to certain types of processing</span>
              </li>
            </ul>

            {/* Children's Privacy */}
            <h2 className="font-display font-bold text-2xl text-hack-black mb-4">
              Children&apos;s Privacy
            </h2>
            <p className="text-hack-black/70 mb-8">
              Our services are not intended for children under 13 years of age. We do not 
              knowingly collect personal information from children under 13. If you are a 
              parent or guardian and believe your child has provided us with personal 
              information, please contact us immediately.
            </p>

            {/* Changes */}
            <h2 className="font-display font-bold text-2xl text-hack-black mb-4">
              Changes to This Policy
            </h2>
            <p className="text-hack-black/70 mb-8">
              We may update this Privacy Policy from time to time. We will notify you of 
              any changes by posting the new policy on this page and updating the "Last 
              Updated" date. We encourage you to review this policy periodically.
            </p>

            {/* Contact */}
            <div className="bg-hack-black rounded-2xl p-6 lg:p-8 text-white text-center">
              <h2 className="font-display font-bold text-xl mb-3">Questions About Privacy?</h2>
              <p className="text-white/60 mb-4">
                Contact us if you have any questions about this Privacy Policy.
              </p>
              <Link 
                to="/contact"
                className="inline-flex items-center justify-center px-6 py-3 bg-hack-yellow text-hack-black rounded-full font-bold hover:bg-hack-yellow/90 transition-colors"
              >
                Contact Us
              </Link>
              <p className="text-white/40 text-sm mt-4">
                Email: <a href="mailto:privacy@hackknow.com" className="text-hack-yellow hover:text-hack-orange">privacy@hackknow.com</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
