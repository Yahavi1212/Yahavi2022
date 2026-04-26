import { Link } from 'react-router-dom';
import { ArrowLeft, Briefcase, MapPin, Clock, DollarSign, CheckCircle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const openings = [
  {
    title: 'Full-Stack Developer',
    department: 'Engineering',
    location: 'Remote (India)',
    type: 'Full-time',
    salary: '₹8-15 LPA',
    description: 'Build and maintain our marketplace platform using React, Node.js, and modern web technologies.',
    requirements: ['3+ years experience', 'React & TypeScript', 'Node.js & GraphQL', 'Database design']
  },
  {
    title: 'Product Designer',
    department: 'Design',
    location: 'Bangalore / Remote',
    type: 'Full-time',
    salary: '₹6-12 LPA',
    description: 'Design beautiful user experiences for our digital marketplace and creator tools.',
    requirements: ['2+ years experience', 'Figma mastery', 'Design systems', 'User research']
  },
  {
    title: 'Marketing Manager',
    department: 'Growth',
    location: 'Remote (India)',
    type: 'Full-time',
    salary: '₹7-14 LPA',
    description: 'Drive user acquisition and retention through digital marketing, content, and partnerships.',
    requirements: ['3+ years experience', 'Digital marketing', 'Content strategy', 'Analytics']
  },
  {
    title: 'Customer Success Specialist',
    department: 'Support',
    location: 'Remote (India)',
    type: 'Full-time',
    salary: '₹4-8 LPA',
    description: 'Help our creators and buyers succeed by providing exceptional support and guidance.',
    requirements: ['1+ years experience', 'Communication skills', 'Problem solving', 'Empathy']
  },
  {
    title: 'Content Creator',
    department: 'Marketing',
    location: 'Remote (India)',
    type: 'Part-time / Contract',
    salary: 'Per project',
    description: 'Create engaging blog posts, tutorials, and social media content about digital products.',
    requirements: ['Writing skills', 'Digital products knowledge', 'SEO basics', 'Social media']
  }
];

const benefits = [
  {
    icon: Zap,
    title: 'Remote-First',
    description: 'Work from anywhere in India. Flexible hours and async communication.'
  },
  {
    icon: DollarSign,
    title: 'Competitive Pay',
    description: 'Industry-leading salaries with regular reviews and bonuses.'
  },
  {
    icon: Briefcase,
    title: 'Growth Opportunities',
    description: 'Learning budget, conference tickets, and clear career progression.'
  },
  {
    icon: Clock,
    title: 'Unlimited PTO',
    description: 'Take time off when you need it. We care about results, not hours.'
  }
];

const CareersPage = () => {
  return (
    <div className="min-h-screen bg-hack-white">
      {/* Hero */}
      <div className="bg-hack-black text-hack-white py-16 lg:py-24">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-hack-yellow hover:text-hack-orange transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-hack-yellow/20 rounded-full text-hack-yellow text-sm font-bold mb-6">
              <Briefcase className="w-4 h-4" />
              We are Hiring!
            </div>
            <h1 className="font-display font-bold text-4xl lg:text-6xl mb-6">
              Join the HackKnow Team
            </h1>
            <p className="text-hack-white/60 text-lg max-w-2xl mx-auto mb-8">
              Help us build the future of digital commerce. We are looking for passionate 
              people who want to make a difference.
            </p>
            <Button 
              onClick={() => document.getElementById('openings')?.scrollIntoView({ behavior: 'smooth' })}
              className="h-14 px-8 bg-gradient-to-r from-hack-yellow to-hack-orange text-hack-black font-bold rounded-full text-lg"
            >
              View Open Positions
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-hack-yellow py-12">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <div className="font-display font-bold text-3xl lg:text-4xl text-hack-black">15+</div>
              <div className="text-hack-black/60 text-sm">Team Members</div>
            </div>
            <div>
              <div className="font-display font-bold text-3xl lg:text-4xl text-hack-black">100%</div>
              <div className="text-hack-black/60 text-sm">Remote</div>
            </div>
            <div>
              <div className="font-display font-bold text-3xl lg:text-4xl text-hack-black">5</div>
              <div className="text-hack-black/60 text-sm">Open Roles</div>
            </div>
            <div>
              <div className="font-display font-bold text-3xl lg:text-4xl text-hack-black">∞</div>
              <div className="text-hack-black/60 text-sm">Learning Budget</div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-3xl lg:text-4xl mb-4">
              Why Work With Us?
            </h2>
            <p className="text-hack-black/60 max-w-2xl mx-auto">
              We believe happy people do great work. Here is what you can expect:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className="flex items-start gap-4 p-6 bg-white rounded-2xl border border-hack-black/5 card-hover"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-hack-yellow to-hack-orange flex items-center justify-center shrink-0">
                  <benefit.icon className="w-6 h-6 text-hack-black" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg mb-2">{benefit.title}</h3>
                  <p className="text-hack-black/60 text-sm">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Culture */}
      <div className="bg-hack-black text-white py-16 lg:py-20">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-display font-bold text-3xl lg:text-4xl mb-6">
                  Our Culture
                </h2>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-hack-yellow shrink-0 mt-0.5" />
                    <span className="text-white/80"><strong>Results over hours:</strong> We care about what you achieve, not how long you work.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-hack-yellow shrink-0 mt-0.5" />
                    <span className="text-white/80"><strong>Async first:</strong> Work when you are most productive. Meetings are optional.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-hack-yellow shrink-0 mt-0.5" />
                    <span className="text-white/80"><strong>Learn and grow:</strong> ₹50,000/year learning budget for every team member.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-hack-yellow shrink-0 mt-0.5" />
                    <span className="text-white/80"><strong>Make an impact:</strong> Your work directly impacts thousands of creators.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-hack-yellow shrink-0 mt-0.5" />
                    <span className="text-white/80"><strong>Transparent:</strong> Open salaries, open metrics, open communication.</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white/5 rounded-3xl p-8 border border-white/10">
                <blockquote className="text-xl italic text-white/80 mb-4">
                  "Working at HackKnow has been the best career decision. The freedom to work remotely 
                  and the trust from leadership is unmatched."
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-hack-yellow to-hack-orange flex items-center justify-center text-hack-black font-bold">
                    AS
                  </div>
                  <div>
                    <div className="font-bold">Ankit Sharma</div>
                    <div className="text-white/40 text-sm">Senior Developer</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Job Openings */}
      <div id="openings" className="w-full px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-3xl lg:text-4xl mb-4">
              Open Positions
            </h2>
            <p className="text-hack-black/60">
              Find your perfect role and join our growing team.
            </p>
          </div>

          <div className="space-y-4">
            {openings.map((job, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl p-6 border border-hack-black/5 hover:border-hack-yellow/50 transition-colors"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-display font-bold text-xl">{job.title}</h3>
                      <span className="px-3 py-1 bg-hack-yellow/20 text-hack-black text-xs font-bold rounded-full">
                        {job.department}
                      </span>
                    </div>
                    <p className="text-hack-black/60 mb-4">{job.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.requirements.map((req, idx) => (
                        <span 
                          key={idx}
                          className="px-3 py-1 bg-hack-black/5 text-hack-black/70 text-xs rounded-full"
                        >
                          {req}
                        </span>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-hack-black/50">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {job.type}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {job.salary}
                      </span>
                    </div>
                  </div>
                  <Button className="h-12 px-6 bg-hack-black text-white font-bold rounded-xl hover:bg-hack-black/80 shrink-0">
                    Apply Now
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* No match */}
          <div className="mt-12 text-center p-8 bg-hack-black/5 rounded-2xl">
            <p className="text-hack-black/60 mb-2">Do not see a role that fits?</p>
            <p className="text-hack-black mb-4">
              We are always looking for talented people. Send us your resume!
            </p>
            <a 
              href="mailto:careers@hackknow.com"
              className="inline-flex items-center gap-2 text-hack-magenta hover:text-hack-orange font-bold"
            >
              careers@hackknow.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CareersPage;
