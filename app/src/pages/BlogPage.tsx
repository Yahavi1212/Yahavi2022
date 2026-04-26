import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Clock } from 'lucide-react';

const blogPosts = [
  {
    id: 1,
    title: '10 Free Excel Templates to Boost Your Productivity in 2026',
    excerpt: 'Discover the best free Excel templates for project management, budgeting, and data analysis that will transform your workflow.',
    author: 'HackKnow Team',
    date: 'Jan 15, 2026',
    readTime: '5 min read',
    category: 'Productivity',
    image: 'https://placehold.co/600x400/FFF055/1A1A1A?text=Excel+Templates'
  },
  {
    id: 2,
    title: 'How to Create Stunning Presentations with PowerPoint Templates',
    excerpt: 'Learn the secrets of professional designers and create presentations that captivate your audience every time.',
    author: 'Design Expert',
    date: 'Jan 12, 2026',
    readTime: '8 min read',
    category: 'Design',
    image: 'https://placehold.co/600x400/FF00A0/FFFFFF?text=PowerPoint'
  },
  {
    id: 3,
    title: 'Digital Marketing Trends You Cannot Ignore in 2026',
    excerpt: 'Stay ahead of the curve with these emerging digital marketing strategies and tools for the modern marketer.',
    author: 'Marketing Pro',
    date: 'Jan 10, 2026',
    readTime: '6 min read',
    category: 'Marketing',
    image: 'https://placehold.co/600x400/FF7700/FFFFFF?text=Marketing'
  },
  {
    id: 4,
    title: 'Building a Successful Side Hustle with Digital Products',
    excerpt: 'Learn how creators are earning passive income by selling templates, themes, and digital assets online.',
    author: 'Success Stories',
    date: 'Jan 8, 2026',
    readTime: '10 min read',
    category: 'Business',
    image: 'https://placehold.co/600x400/1A1A1A/FFF055?text=Side+Hustle'
  },
  {
    id: 5,
    title: 'The Complete Guide to Social Media Content Calendars',
    excerpt: 'Organize your social media strategy with these proven templates and planning frameworks.',
    author: 'Social Media Guru',
    date: 'Jan 5, 2026',
    readTime: '7 min read',
    category: 'Social Media',
    image: 'https://placehold.co/600x400/FF00A0/FFFFFF?text=Social+Media'
  },
  {
    id: 6,
    title: 'Free Resources Every Startup Founder Needs',
    excerpt: 'Essential templates, trackers, and tools to help you launch and grow your startup on a budget.',
    author: 'Startup Advisor',
    date: 'Jan 3, 2026',
    readTime: '4 min read',
    category: 'Startup',
    image: 'https://placehold.co/600x400/FF7700/FFFFFF?text=Startup'
  }
];

const BlogPage = () => {
  return (
    <div className="min-h-screen bg-hack-white">
      {/* Header */}
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
            <h1 className="font-display font-bold text-4xl lg:text-6xl mb-4">
              HackKnow Blog
            </h1>
            <p className="text-hack-white/60 text-lg max-w-2xl mx-auto">
              Insights, tips, and resources for digital creators, marketers, and entrepreneurs.
            </p>
          </div>
        </div>
      </div>

      {/* Blog Grid */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <article 
                key={post.id}
                className="group bg-white rounded-2xl overflow-hidden border border-hack-black/5 card-hover"
              >
                {/* Image */}
                <div className="aspect-[16/10] overflow-hidden">
                  <img 
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Category */}
                  <span className="inline-block px-3 py-1 bg-hack-yellow/20 text-hack-black text-xs font-bold rounded-full mb-3">
                    {post.category}
                  </span>

                  {/* Title */}
                  <h2 className="font-display font-bold text-xl mb-3 line-clamp-2 group-hover:text-hack-magenta transition-colors">
                    {post.title}
                  </h2>

                  {/* Excerpt */}
                  <p className="text-hack-black/60 text-sm mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-xs text-hack-black/40">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {post.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {post.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Newsletter CTA */}
          <div className="mt-16 bg-gradient-to-br from-hack-black to-hack-magenta/20 rounded-3xl p-8 lg:p-12 text-center text-white">
            <h2 className="font-display font-bold text-2xl lg:text-3xl mb-4">
              Subscribe to Our Newsletter
            </h2>
            <p className="text-white/60 mb-6 max-w-md mx-auto">
              Get the latest tips, free resources, and exclusive deals delivered to your inbox weekly.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input 
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-5 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-hack-yellow"
              />
              <button className="px-6 py-3 bg-hack-yellow text-hack-black rounded-full font-bold hover:bg-hack-yellow/90 transition-colors">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
