
export interface Subcategory {
  slug: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  title: string;
  slug: string;
  itemCount: number;
  subcategories: Subcategory[];
}

// Categories from shop.hackknow.com — canonical backend slugs
export const categories: Category[] = [
  {
    id: 'powerpoint-decks',
    name: 'PowerPoint Decks',
    title: 'PowerPoint Decks',
    slug: 'powerpoint-decks',
    itemCount: 234,
    subcategories: [
      { slug: 'business', name: 'Business' },
      { slug: 'creative', name: 'Creative' },
      { slug: 'minimal', name: 'Minimal' },
      { slug: 'pitch-deck', name: 'Pitch Deck' },
    ],
  },
  {
    id: 'excel-sheets',
    name: 'Excel Sheets',
    title: 'Excel & Sheets',
    slug: 'excel-sheets',
    itemCount: 278,
    subcategories: [
      { slug: 'trackers', name: 'Trackers' },
      { slug: 'calculators', name: 'Calculators' },
      { slug: 'reports', name: 'Reports' },
      { slug: 'invoices', name: 'Invoices' },
    ],
  },
  {
    id: 'hr-finance',
    name: 'HR & Finance',
    title: 'HR & Finance',
    slug: 'hr-finance',
    itemCount: 189,
    subcategories: [
      { slug: 'hr-templates', name: 'HR Templates' },
      { slug: 'finance-sheets', name: 'Finance Sheets' },
      { slug: 'budgets', name: 'Budget Planners' },
      { slug: 'payroll', name: 'Payroll' },
    ],
  },
  {
    id: 'business-templates',
    name: 'Business Templates',
    title: 'Business Templates',
    slug: 'business-templates',
    itemCount: 145,
    subcategories: [
      { slug: 'proposals', name: 'Proposals' },
      { slug: 'contracts', name: 'Contracts' },
      { slug: 'reports', name: 'Reports' },
      { slug: 'letterheads', name: 'Letterheads' },
    ],
  },
  {
    id: 'themes-templates',
    name: 'Themes & Templates',
    title: 'Themes & Templates',
    slug: 'themes-templates',
    itemCount: 567,
    subcategories: [
      { slug: 'web-templates', name: 'Web Templates' },
      { slug: 'landing-page', name: 'Landing Pages' },
      { slug: 'portfolio', name: 'Portfolio' },
      { slug: 'admin', name: 'Admin Panels' },
    ],
  },
  {
    id: 'dashboards',
    name: 'Dashboards',
    title: 'Dashboards',
    slug: 'dashboards',
    itemCount: 198,
    subcategories: [
      { slug: 'analytics', name: 'Analytics' },
      { slug: 'sales', name: 'Sales' },
      { slug: 'finance', name: 'Finance' },
      { slug: 'project', name: 'Project Management' },
    ],
  },
  {
    id: 'data-analysis-tools',
    name: 'Data Analysis Tools',
    title: 'Data Analysis Tools',
    slug: 'data-analysis-tools',
    itemCount: 87,
    subcategories: [
      { slug: 'spreadsheets', name: 'Spreadsheets' },
      { slug: 'visualization', name: 'Visualization' },
      { slug: 'automation', name: 'Automation' },
    ],
  },
  {
    id: 'digital-marketing',
    name: 'Digital Marketing',
    title: 'Digital Marketing',
    slug: 'digital-marketing',
    itemCount: 312,
    subcategories: [
      { slug: 'seo-tools', name: 'SEO Tools' },
      { slug: 'ads-templates', name: 'Ads Templates' },
      { slug: 'email-marketing', name: 'Email Marketing' },
      { slug: 'content-calendar', name: 'Content Calendar' },
    ],
  },
  {
    id: 'social-media',
    name: 'Social Media',
    title: 'Social Media Kits',
    slug: 'social-media',
    itemCount: 445,
    subcategories: [
      { slug: 'instagram', name: 'Instagram' },
      { slug: 'youtube', name: 'YouTube' },
      { slug: 'linkedin', name: 'LinkedIn' },
      { slug: 'twitter', name: 'Twitter / X' },
    ],
  },
  {
    id: 'bundles',
    name: 'Bundles',
    title: 'Product Bundles',
    slug: 'bundles',
    itemCount: 56,
    subcategories: [
      { slug: 'starter-pack', name: 'Starter Packs' },
      { slug: 'creator-bundle', name: 'Creator Bundles' },
      { slug: 'business-kit', name: 'Business Kits' },
    ],
  },
  {
    id: 'free-resources',
    name: 'Free Resources',
    title: 'Free Resources',
    slug: 'free-resources',
    itemCount: 156,
    subcategories: [
      { slug: 'free-templates', name: 'Free Templates' },
      { slug: 'free-icons', name: 'Free Icons' },
      { slug: 'free-fonts', name: 'Free Fonts' },
    ],
  },
];
