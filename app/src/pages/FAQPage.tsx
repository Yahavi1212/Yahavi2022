import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronDown, HelpCircle, MessageCircle } from 'lucide-react';
import { useState } from 'react';

const faqs = [
  {
    category: 'General',
    questions: [
      {
        q: 'What is HackKnow?',
        a: 'HackKnow is a digital marketplace where creators can buy and sell premium digital products including templates, themes, Excel sheets, PowerPoint decks, and more.'
      },
      {
        q: 'How do I create an account?',
        a: 'Click the "Sign Up" button in the top right corner, fill in your details, and verify your email address. It takes less than a minute!'
      },
      {
        q: 'Is HackKnow free to use?',
        a: 'Yes! Creating an account and browsing products is completely free. You only pay when you purchase a product.'
      }
    ]
  },
  {
    category: 'Purchases',
    questions: [
      {
        q: 'How do downloads work?',
        a: 'After purchase, you will receive an email with a download link. You can also access your downloads anytime from your account dashboard under "My Orders".'
      },
      {
        q: 'What payment methods do you accept?',
        a: 'We accept all major credit/debit cards, UPI, net banking, and wallets through our secure payment partner Razorpay.'
      },
      {
        q: 'Can I get a refund?',
        a: 'Due to the digital nature of our products, we generally do not offer refunds once the download has been accessed. However, if you face technical issues, contact our support team within 7 days.'
      }
    ]
  },
  {
    category: 'Selling',
    questions: [
      {
        q: 'How do I become a seller?',
        a: 'Anyone can sell on HackKnow! Simply create an account, go to your seller dashboard, and upload your first product. We review all submissions within 24-48 hours.'
      },
      {
        q: 'What are the fees for selling?',
        a: 'We charge a 15% commission on each sale. This covers payment processing, hosting, and marketing your products.'
      },
      {
        q: 'When do I get paid?',
        a: 'Payments are processed weekly. Once your balance reaches ₹500, you can request a payout to your bank account or PayPal.'
      }
    ]
  },
  {
    category: 'Technical',
    questions: [
      {
        q: 'What file formats are supported?',
        a: 'We support a wide range of formats including: .zip, .pdf, .pptx, .xlsx, .docx, .fig, .sketch, .psd, and more. Each product listing shows the included formats.'
      },
      {
        q: 'How do I open the downloaded files?',
        a: 'Most files can be opened with standard software like Microsoft Office, Google Workspace, or design tools like Figma and Adobe Creative Suite.'
      },
      {
        q: 'Is there a file size limit?',
        a: 'Individual files can be up to 500MB. For larger files, we recommend splitting them or using cloud storage links.'
      }
    ]
  }
];

const FAQPage = () => {
  const [openItems, setOpenItems] = useState<{[key: string]: boolean}>({});

  const toggleItem = (key: string) => {
    setOpenItems(prev => ({...prev, [key]: !prev[key]}));
  };

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
                <HelpCircle className="w-6 h-6 text-hack-yellow" />
              </div>
              <h1 className="font-display font-bold text-4xl lg:text-5xl">
                Frequently Asked Questions
              </h1>
            </div>
            <p className="text-hack-white/60 text-lg max-w-2xl">
              Find answers to common questions about buying, selling, and using HackKnow.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="max-w-4xl mx-auto">
          {faqs.map((section, sectionIdx) => (
            <div key={section.category} className="mb-12">
              <h2 className="font-display font-bold text-2xl mb-6 text-hack-black">
                {section.category}
              </h2>
              <div className="space-y-4">
                {section.questions.map((item, idx) => {
                  const key = `${sectionIdx}-${idx}`;
                  const isOpen = openItems[key];
                  return (
                    <div 
                      key={key}
                      className="bg-white rounded-2xl border border-hack-black/5 overflow-hidden"
                    >
                      <button
                        onClick={() => toggleItem(key)}
                        className="w-full flex items-center justify-between p-5 text-left hover:bg-hack-black/5 transition-colors"
                      >
                        <span className="font-bold text-hack-black pr-4">{item.q}</span>
                        <ChevronDown 
                          className={`w-5 h-5 text-hack-black/40 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
                        />
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-5">
                          <p className="text-hack-black/70 leading-relaxed">
                            {item.a}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Still Need Help */}
          <div className="bg-gradient-to-br from-hack-yellow to-hack-orange rounded-3xl p-8 lg:p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-hack-black/10 flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-hack-black" />
            </div>
            <h2 className="font-display font-bold text-2xl lg:text-3xl text-hack-black mb-4">
              Still Have Questions?
            </h2>
            <p className="text-hack-black/70 mb-6 max-w-md mx-auto">
              Can not find what you are looking for? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link 
                to="/contact"
                className="inline-flex items-center justify-center px-6 py-3 bg-hack-black text-white rounded-full font-bold hover:bg-hack-black/80 transition-colors"
              >
                Contact Support
              </Link>
              <Link 
                to="/support"
                className="inline-flex items-center justify-center px-6 py-3 bg-white/20 text-hack-black rounded-full font-bold hover:bg-white/30 transition-colors"
              >
                Help Center
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
