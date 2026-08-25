export type Project = {
  name: string;
  slug: string;
  category: string;
  description: string;
  capabilities: string[];
  image: string;
  imageAlt: string;
  featured?: boolean;
  note?: string;
};

export const projects: Project[] = [
  {
    name: "American Scouser",
    slug: "american-scouser",
    category: "Sports / Media / Content",
    description:
      "A modern independent sports media platform centered on Liverpool FC news, podcasts, video, matchday coverage, supporter culture, and community.",
    capabilities: ["Sports marketing", "Digital publishing", "SEO", "Content strategy", "Podcast & video", "Community", "Audience development", "Web development"],
    image: "/projects/american-scouser.png",
    imageAlt: "American Scouser sports media website homepage",
    featured: true,
  },
  {
    name: "Step Outside",
    slug: "step-outside",
    category: "Mobile App / Product",
    description:
      "A consumer mobile product built around a simple daily outdoor habit using walks, Golden Hours, streaks, location features, and reflection.",
    capabilities: ["Mobile app development", "Product strategy", "Consumer UX", "iOS & Android", "Location & GPS", "Subscription product", "Habit design"],
    image: "/projects/step-outside.png",
    imageAlt: "Step Outside daily outdoor habit product website",
    note: "Software product",
  },
  {
    name: "Optimize Local Connect",
    slug: "optimize-local-connect",
    category: "AI / SaaS / Local Business",
    description:
      "An intelligent local business network in development to connect businesses, service providers, property managers, and customers through trusted local relationships, referrals, and smarter matching.",
    capabilities: ["SaaS", "Product strategy", "AI", "Network architecture", "Membership systems", "Lead routing", "Automation", "SEO"],
    image: "/projects/optimize-local-connect.png",
    imageAlt: "Optimize Local Connect intelligent local services network website homepage",
    note: "In development",
  },
  {
    name: "Alcohol You Later",
    slug: "alcohol-you-later",
    category: "Hospitality / Events / Mobile Experience",
    description:
      "A mobile-first digital experience for a Chicago and Rockford mobile bar concept designed around bookings, event discovery, live location, and customer engagement.",
    capabilities: ["Web & app development", "Mobile UX", "Booking", "Events", "Location strategy", "Push strategy", "Brand development", "Conversion"],
    image: "/projects/alcohol-you-later.png",
    imageAlt: "Alcohol You Later mobile bar website homepage",
  },
  {
    name: "CLA Exteriors",
    slug: "cla-exteriors",
    category: "SEO / Lead Generation / Home Services",
    description:
      "A conversion-focused digital platform for a Northern Illinois exterior contractor built around local search visibility, storm response, service discovery, and lead generation.",
    capabilities: ["Local SEO", "Website development", "Lead generation", "Service-area SEO", "Conversion optimization", "Content architecture", "Paid & organic"],
    image: "/projects/cla-exteriors.png",
    imageAlt: "CLA Exteriors roofing and storm restoration website homepage",
  },
  {
    name: "Altar'd Venue",
    slug: "altard-venue",
    category: "Hospitality / Events / Brand",
    description:
      "A premium digital experience for a modern wedding and event venue built around visual storytelling, venue discovery, pricing, galleries, and tour conversion.",
    capabilities: ["Brand presentation", "Website development", "Local SEO", "Event marketing", "Conversion", "UX", "Customer journey"],
    image: "/projects/altard-venue.png",
    imageAlt: "Altar'd Venue luxury wedding and event venue website homepage",
  },
];

export const expertise = [
  {
    title: "SEO & Organic Growth",
    description: "Search programs built around intent, architecture, visibility, and useful content.",
    services: ["Technical SEO", "Local SEO", "Content strategy", "Keyword research", "Search intent", "Information architecture", "Ecommerce SEO", "On-page optimization", "Internal linking", "SEO analytics"],
  },
  {
    title: "Performance Marketing",
    description: "Paid acquisition systems connected to landing pages, measurement, and real objectives.",
    services: ["Google Ads", "Bing Ads", "YouTube", "Display", "Retargeting", "Paid social", "Lead generation", "Cost-per-lead optimization", "Landing pages", "Conversion optimization"],
  },
  {
    title: "Digital Strategy",
    description: "The roadmap that connects channels, teams, audiences, and business priorities.",
    services: ["Customer acquisition", "Digital roadmaps", "Analytics", "Reporting", "Full-funnel strategy", "Email", "Social", "Audience development", "Content", "Executive strategy"],
  },
  {
    title: "Product & Development",
    description: "Web and mobile products designed around clear audience and business needs.",
    services: ["Web development", "Mobile apps", "SaaS", "Ecommerce", "UX", "Product strategy", "Membership platforms", "Marketplace products"],
  },
  {
    title: "AI & Automation",
    description: "Practical automation that helps businesses respond faster and operate better.",
    services: ["AI workflows", "Business process automation", "Lead routing", "Content workflows", "CRM automation", "Intelligent business tools", "Internal systems"],
  },
];

export const careerChapters = [
  {
    year: "2025",
    label: "Product + AI",
    role: "Founder",
    company: "Optimize Local",
    dates: "2025 – Present",
    location: "Rockford, Illinois",
    description: "Founded Optimize Local to build websites, digital growth systems, applications, AI automation, and intelligent business tools for local and growing companies. Current work includes Optimize Local Connect alongside client web, mobile, and automation projects.",
    areas: ["AI automation", "Web development", "App development", "SaaS & product", "SEO", "Digital strategy", "Local business growth"],
  },
  {
    year: "2020",
    label: "Digital Leadership",
    role: "Head of Digital",
    company: "Rareview",
    dates: "2022 – 2026",
    location: "Irvine, California / Hybrid",
    description: "Led the digital division of a full-service advertising agency, overseeing strategy across paid media, SEO, email, analytics, and customer acquisition. Managed and collaborated with digital marketers, creative teams, designers, and developers to deliver integrated growth programs.",
    areas: ["Digital strategy", "Paid media", "SEO", "Email", "Analytics", "Full-funnel marketing", "Cross-functional leadership", "Executive advisory"],
    brands: ["UnitedHealthcare", "Fathead", "Wagly", "HairClub for Men", "Bosch / Sweetworxx", "ThedaCare"],
    secondary: {
      role: "Senior Director of Marketing / Head of Digital Marketing",
      company: "Spark Ad",
      dates: "2020 – 2026",
      description: "Senior digital strategy and marketing leadership during the broader agency leadership era.",
    },
  },
  {
    year: "2015",
    label: "Consulting + Agency",
    role: "Digital Marketing Consultant / Strategist",
    company: "Independent / Upwork",
    dates: "2015 – 2022",
    description: "Provided digital marketing strategy and execution for businesses across SEO, paid acquisition, lead generation, conversion optimization, and web strategy. This chapter intentionally includes overlapping agency and consulting engagements.",
    areas: ["SEO", "Paid acquisition", "Lead generation", "Conversion optimization", "Web strategy"],
  },
  {
    year: "2013",
    label: "Performance Marketing",
    role: "Senior Online Marketing Manager",
    company: "Spireon",
    dates: "2014 – 2015",
    location: "Irvine, California",
    description: "Managed SEO and SEM strategy across SMB, mid-market, and enterprise business units, connecting acquisition channels with analytics, conversion tracking, cost-per-lead analysis, demand generation, and web optimization.",
    areas: ["SEO", "Paid search", "Display", "Social advertising", "Retargeting", "Content optimization", "Analytics", "Conversion tracking"],
    secondary: {
      role: "PPC Manager & Social Media Specialist",
      company: "IsoTree",
      dates: "2013 – 2014",
      description: "Managed Google Ads, Bing and Yahoo paid search, keywords, budgets, display, reporting, and analytics in the Greater Chicago Area.",
    },
  },
  {
    year: "2008",
    label: "Entrepreneurship",
    role: "CEO / Founder",
    company: "Stellar Social",
    dates: "2008 – 2015",
    description: "Founded and operated a web design, hosting, and digital marketing company serving more than 100 clients worldwide.",
    areas: ["SEO", "SEM", "PPC", "Web design", "Hosting", "Digital marketing"],
    metric: "100+ clients worldwide",
  },
  {
    year: "2006",
    label: "Search + Community",
    role: "VP Business Development",
    company: "Poker Affiliate Listings",
    dates: "2006 – 2013",
    description: "Steven's search marketing roots began in the highly competitive online poker affiliate industry. Starting with an email list of more than 1,500 poker affiliates, Poker Affiliate Listings grew into an international vBulletin-based forum, blog, and news outlet for online gaming webmasters and affiliate marketers.",
    areas: ["Community development", "Affiliate marketing", "SEO", "Content", "Business development", "Webmaster relationships", "Digital publishing"],
    stats: ["1,500+ original affiliate email audience", "8,000+ active community members", "30,000+ monthly unique visits", "Multiple industry award nominations"],
  },
];

export const consultingEngagements = [
  { company: "Rareview", role: "Digital Marketing Strategist", dates: "2017 – 2019", detail: "Digital strategy and integrated marketing within a multidisciplinary design and advertising agency." },
  { company: "MX Advertising & Consulting", role: "Director of Acquisition & Analytics", dates: "2017 – 2018", detail: "Acquisition, analytics, and performance strategy." },
  { company: "RentalMiles", role: "Digital Marketing Consultant", dates: "2017 – 2018", detail: "SEO, SEM, paid search, lead generation, and social media." },
  { company: "REM Loyalty", role: "Digital Marketing Manager", dates: "2017 – 2018", detail: "A concise digital marketing management engagement." },
  { company: "Ascensus Interactive", role: "Vice President Marketing", dates: "2017 – 2018", detail: "Marketing organization, team building, vendor management, design resources, content, paid search, and digital strategy." },
  { company: "Wagly", role: "Digital Marketing Manager", dates: "2016", detail: "Digital acquisition for pet-service locations across Seattle, San Francisco, and Orange County, including PPC, Yelp advertising, retargeting, conversion optimization, demand generation, and more than 60 Unbounce landing pages." },
];
