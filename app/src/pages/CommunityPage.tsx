import { Link } from 'react-router-dom';
import { ArrowLeft, Users, Heart, MessageCircle, Star, CheckCircle, Twitter, Instagram, Youtube, Linkedin, Facebook, Gift, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const socialLinks = [
  { icon: Twitter, name: 'Twitter', url: 'https://twitter.com/hackknow', color: 'hover:bg-blue-500/20 hover:text-blue-500' },
  { icon: Instagram, name: 'Instagram', url: 'https://instagram.com/hackknow', color: 'hover:bg-pink-500/20 hover:text-pink-500' },
  { icon: Youtube, name: 'YouTube', url: 'https://youtube.com/hackknow', color: 'hover:bg-red-500/20 hover:text-red-500' },
  { icon: Linkedin, name: 'LinkedIn', url: 'https://linkedin.com/company/hackknow', color: 'hover:bg-blue-700/20 hover:text-blue-700' },
  { icon: Facebook, name: 'Facebook', url: 'https://facebook.com/hackknow', color: 'hover:bg-blue-600/20 hover:text-blue-600' },
];

const terms = [
  {
    icon: Heart,
    title: 'Follow All Social Media',
    description: 'You must follow HackKnow on ALL our social media platforms: Twitter, Instagram, YouTube, LinkedIn, and Facebook.',
    action: 'Click icons below to follow'
  },
  {
    icon: MessageCircle,
    title: 'Write Honest Review',
    description: 'After downloading, write an honest review about the product on ANY ONE social media platform (Twitter, Instagram, LinkedIn, etc.)',
    action: 'Tag us @hackknow in your post'
  },
  {
    icon: Star,
    title: 'Review on Website',
    description: 'Leave a review on our website for the product you downloaded. Your feedback helps other creators!',
    action: 'Rate and review on product page'
  }
];

const benefits = [
  'Access to 1000+ free premium templates',
  'Weekly new freebies added',
  'Community support and tips',
  'Early access to new products',
  'Exclusive member discounts'
];

const CommunityPage = () => {
  return (
    <div className="min-h-screen bg-hack-white">
      {/* Hero */}
      <div className="bg-gradient-to-br from-hack-black via-hack-magenta/20 to-hack-orange/20 text-white py-16 lg:py-24">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-hack-yellow hover:text-hack-orange transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-hack-yellow/20 rounded-full text-hack-yellow text-sm font-bold mb-6 animate-pulse">
              <Sparkles className="w-4 h-4" />
              Join Our Creative Community
            </div>
            <h1 className="font-display font-bold text-4xl lg:text-6xl mb-6">
              HackKnow Community
            </h1>
            <p className="text-white/60 text-lg max-w-2xl mx-auto mb-8">
              Join 50,000+ creators getting free premium resources. 
              Follow us, share your experience, and get access to exclusive freebies!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/shop?filter=free">
                <Button className="h-14 px-8 bg-gradient-to-r from-hack-yellow to-hack-orange text-hack-black font-bold rounded-full text-lg hover:scale-105 transition-transform">
                  <Gift className="w-5 h-5 mr-2" />
                  Browse Freebies
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Social Links Bar */}
      <div className="bg-hack-yellow py-6">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <p className="text-center text-hack-black/70 text-sm mb-4 font-medium">
              Follow us on all platforms to unlock free downloads
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 px-4 py-3 bg-hack-black/10 rounded-full text-hack-black transition-all hover:scale-105 ${social.color}`}
                >
                  <social.icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{social.name}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Terms & Conditions */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-hack-magenta/10 rounded-full text-hack-magenta text-sm font-bold mb-4">
              <CheckCircle className="w-4 h-4" />
              Terms & Conditions for Free Downloads
            </div>
            <h2 className="font-display font-bold text-3xl lg:text-4xl mb-4">
              How to Get Free Access
            </h2>
            <p className="text-hack-black/60 max-w-2xl mx-auto">
              To download our premium freebies, please complete these simple steps. 
              It helps us grow and create more amazing resources for you!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {terms.map((term, index) => (
              <div 
                key={index}
                className="bg-white rounded-3xl p-8 border border-hack-black/5 hover:border-hack-yellow/50 transition-all hover:shadow-lg group"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-hack-yellow to-hack-orange flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <term.icon className="w-8 h-8 text-hack-black" />
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-8 h-8 rounded-full bg-hack-black text-white flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <h3 className="font-display font-bold text-lg">{term.title}</h3>
                </div>
                <p className="text-hack-black/60 text-sm mb-4 leading-relaxed">
                  {term.description}
                </p>
                <div className="inline-flex items-center gap-1 px-3 py-1 bg-hack-yellow/20 rounded-full text-xs font-bold text-hack-black">
                  <CheckCircle className="w-3 h-3" />
                  {term.action}
                </div>
              </div>
            ))}
          </div>

          {/* What You Get */}
          <div className="bg-gradient-to-br from-hack-black to-hack-magenta/20 rounded-3xl p-8 lg:p-12 text-white mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="font-display font-bold text-2xl lg:text-3xl mb-4">
                  What You Get as a Community Member
                </h3>
                <p className="text-white/60 mb-6">
                  Join our community today and unlock these exclusive benefits:
                </p>
                <ul className="space-y-3">
                  {benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-hack-yellow/20 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-hack-yellow" />
                      </div>
                      <span className="text-white/80">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-hack-yellow to-hack-orange flex items-center justify-center">
                    <Users className="w-10 h-10 text-hack-black" />
                  </div>
                  <div className="font-display font-bold text-4xl text-white mb-1">50,000+</div>
                  <div className="text-white/60">Active Community Members</div>
                </div>
              </div>
            </div>
          </div>

          {/* Review Guidelines */}
          <div className="bg-white rounded-3xl p-8 border border-hack-black/5 mb-12">
            <h3 className="font-display font-bold text-2xl mb-6 text-center">
              Review Guidelines
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-bold text-lg flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-hack-magenta" />
                  On Social Media
                </h4>
                <ul className="space-y-2 text-hack-black/60 text-sm">
                  <li>• Post on Twitter, Instagram, LinkedIn, or Facebook</li>
                  <li>• Include screenshots of the product</li>
                  <li>• Tag @hackknow in your post</li>
                  <li>• Use hashtag #HackKnowFreebies</li>
                  <li>• Share your honest experience</li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="font-bold text-lg flex items-center gap-2">
                  <Star className="w-5 h-5 text-hack-yellow" />
                  On Website
                </h4>
                <ul className="space-y-2 text-hack-black/60 text-sm">
                  <li>• Go to the product page</li>
                  <li>• Click "Write a Review" button</li>
                  <li>• Rate the product (1-5 stars)</li>
                  <li>• Write detailed feedback</li>
                  <li>• Mention what you liked/disliked</li>
                </ul>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <h3 className="font-display font-bold text-2xl mb-4">
              Ready to Join?
            </h3>
            <p className="text-hack-black/60 mb-6 max-w-lg mx-auto">
              Follow the steps above and start downloading premium resources for free today!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/shop?filter=free">
                <Button className="h-14 px-8 bg-gradient-to-r from-hack-yellow to-hack-orange text-hack-black font-bold rounded-full text-lg hover:scale-105 transition-transform">
                  <Gift className="w-5 h-5 mr-2" />
                  Get Freebies Now
                </Button>
              </Link>
              <a 
                href="https://twitter.com/intent/tweet?text=Just%20joined%20%40hackknow%20community!%20Excited%20to%20get%20premium%20freebies%20%23HackKnowFreebies"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button 
                  variant="outline" 
                  className="h-14 px-8 border-hack-black/20 text-hack-black hover:bg-hack-black/5 rounded-full"
                >
                  <Twitter className="w-5 h-5 mr-2" />
                  Share on Twitter
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;
