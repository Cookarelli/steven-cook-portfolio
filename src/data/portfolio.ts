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
      "An independent sports media site for Liverpool FC supporters. It brings together news, podcasts, video, and matchday coverage. Supporter culture and community are part of the site, alongside the football.",
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
      "A mobile app built around getting outdoors each day. Walks, Golden Hours, and streaks are part of the routine. Location features and reflection help people keep track of where they go and what they notice.",
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
      "A local business network in development for businesses, service providers, property managers, and customers. It is being built to support referrals and help people find a local provider for the job. The focus is on local relationships and matching people with relevant services.",
    capabilities: ["SaaS", "Product strategy", "AI", "Network architecture", "Membership systems", "Lead routing", "Automation", "SEO"],
    image: "/projects/optimize-local-connect.png",
    imageAlt: "Optimize Local Connect local services network website homepage",
    note: "In development",
  },
  {
    name: "Alcohol You Later",
    slug: "alcohol-you-later",
    category: "Hospitality / Events / Mobile Experience",
    description:
      "A mobile-friendly website and app concept for a mobile bar in Chicago and Rockford. It brings bookings, event discovery, and live location into the same place. Customers can find event details and ways to get in touch from their phone.",
    capabilities: ["Web & app development", "Mobile UX", "Booking", "Events", "Location strategy", "Push strategy", "Brand development", "Conversion"],
    image: "/projects/alcohol-you-later.png",
    imageAlt: "Alcohol You Later mobile bar website homepage",
  },
  {
    name: "CLA Exteriors",
    slug: "cla-exteriors",
    category: "SEO / Lead Generation / Home Services",
    description:
      "A website for a Northern Illinois exterior contractor. It combines local search work with information about services and storm response. The pages help visitors find the service they need and send an inquiry.",
    capabilities: ["Local SEO", "Website development", "Lead generation", "Service-area SEO", "Conversion optimization", "Content architecture", "Paid & organic"],
    image: "/projects/cla-exteriors.png",
    imageAlt: "CLA Exteriors roofing and storm restoration website homepage",
  },
  {
    name: "Altar'd Venue",
    slug: "altard-venue",
    category: "Hospitality / Events / Brand",
    description:
      "A website for a modern wedding and event venue. Photos, galleries, and pricing help people get a sense of the space before a visit. The site gives interested couples and event planners a way to request a tour.",
    capabilities: ["Brand presentation", "Website development", "Local SEO", "Event marketing", "Conversion", "UX", "Customer journey"],
    image: "/projects/altard-venue.png",
    imageAlt: "Altar'd Venue luxury wedding and event venue website homepage",
  },
];

export const expertise = [
  {
    title: "SEO & Organic Growth",
    description: "Help people find the right page when they search. I work on the site structure, search terms, and content behind that visit. The page needs to answer the question that brought someone there.",
    services: ["Technical SEO", "Local SEO", "Content strategy", "Keyword research", "Search intent", "Information architecture", "Ecommerce SEO", "On-page optimization", "Internal linking", "SEO analytics"],
  },
  {
    title: "Performance Marketing",
    description: "Plan ads around what you want a customer to do. The ad, the page it leads to, and the way we measure the response need to agree. Otherwise, a busy report can hide a disappointing result.",
    services: ["Google Ads", "Bing Ads", "YouTube", "Display", "Retargeting", "Paid social", "Lead generation", "Cost-per-lead optimization", "Landing pages", "Conversion optimization"],
  },
  {
    title: "Digital Strategy",
    description: "Work out where your marketing effort should go and how to tell whether it helps. Search, email, social, and advertising need a reason to be in the plan. I help put those choices in order so the team knows what it is trying to achieve.",
    services: ["Customer acquisition", "Digital roadmaps", "Analytics", "Reporting", "Full-funnel strategy", "Email", "Social", "Audience development", "Content", "Executive strategy"],
  },
  {
    title: "Product & Development",
    description: "Build a website or app around a job people need to do. That means considering the customer and the person who runs the business. Features belong in the plan when they help one of those people get something done.",
    services: ["Web development", "Mobile apps", "SaaS", "Ecommerce", "UX", "Product strategy", "Membership platforms", "Marketplace products"],
  },
  {
    title: "AI & Automation",
    description: "Look at the steps your team repeats and decide which ones a tool could help with. That may mean drafting a response, routing an inquiry, or moving approved information between systems. The setup needs to fit the work and leave people able to check what happened.",
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
    description: "I founded Optimize Local to build websites, applications, and tools for local and growing companies. The work includes digital marketing and AI automation. Current projects include Optimize Local Connect alongside client web, mobile, and automation work.",
    areas: ["AI automation", "Web development", "App development", "SaaS & product", "SEO", "Digital strategy", "Local business growth"],
  },
  {
    year: "2020",
    label: "Digital Leadership",
    role: "Head of Digital",
    company: "Rareview",
    dates: "2022 – 2026",
    location: "Irvine, California / Hybrid",
    description: "I led the digital division of a full-service advertising agency. The work covered paid media, SEO, email, analytics, and customer acquisition. I managed and worked with digital marketers, creative teams, designers, and developers on those programs.",
    areas: ["Digital strategy", "Paid media", "SEO", "Email", "Analytics", "Full-funnel marketing", "Cross-functional leadership", "Executive advisory"],
    brands: ["UnitedHealthcare", "Fathead", "Wagly", "HairClub for Men", "Bosch / Sweetworxx", "ThedaCare"],
    secondary: {
      role: "Senior Director of Marketing / Head of Digital Marketing",
      company: "Spark Ad",
      dates: "2020 – 2026",
      description: "Held senior digital strategy and marketing leadership roles during this period.",
    },
  },
  {
    year: "2015",
    label: "Consulting + Agency",
    role: "Digital Marketing Consultant / Strategist",
    company: "Independent / Upwork",
    dates: "2015 – 2022",
    description: "I worked with businesses on digital marketing strategy and the work needed to carry it out. Projects covered SEO, paid acquisition, lead generation, conversion optimization, and websites. Some agency and consulting engagements overlapped during these years.",
    areas: ["SEO", "Paid acquisition", "Lead generation", "Conversion optimization", "Web strategy"],
  },
  {
    year: "2013",
    label: "Performance Marketing",
    role: "Senior Online Marketing Manager",
    company: "Spireon",
    dates: "2014 – 2015",
    location: "Irvine, California",
    description: "I managed SEO and SEM strategy across the small-business, mid-market, and enterprise divisions. That included analytics, conversion tracking, and cost-per-lead analysis. The work also covered demand generation and improvements to the website.",
    areas: ["SEO", "Paid search", "Display", "Social advertising", "Retargeting", "Content optimization", "Analytics", "Conversion tracking"],
    secondary: {
      role: "PPC Manager & Social Media Specialist",
      company: "IsoTree",
      dates: "2013 – 2014",
      description: "Managed Google Ads and Bing and Yahoo paid search in the Greater Chicago Area, including keywords, budgets, display, reporting, and analytics.",
    },
  },
  {
    year: "2008",
    label: "Entrepreneurship",
    role: "CEO / Founder",
    company: "Stellar Social",
    dates: "2008 – 2015",
    description: "I founded and ran Stellar Social, a web design, hosting, and digital marketing company. The work included SEO, search advertising, and websites. The company served more than 100 clients worldwide.",
    areas: ["SEO", "SEM", "PPC", "Web design", "Hosting", "Digital marketing"],
    metric: "100+ clients worldwide",
  },
  {
    year: "2006",
    label: "Search + Community",
    role: "VP Business Development",
    company: "Poker Affiliate Listings",
    dates: "2006 – 2013",
    description: "I started in search marketing in the online poker affiliate industry. Poker Affiliate Listings began with an email list of more than 1,500 poker affiliates. It grew into an international vBulletin forum, blog, and news outlet for online gaming webmasters and affiliate marketers.",
    areas: ["Community development", "Affiliate marketing", "SEO", "Content", "Business development", "Webmaster relationships", "Digital publishing"],
    stats: ["1,500+ original affiliate email audience", "8,000+ active community members", "30,000+ monthly unique visits", "Multiple industry award nominations"],
  },
];

export const consultingEngagements = [
  { company: "Rareview", role: "Digital Marketing Strategist", dates: "2017 – 2019", detail: "Digital strategy and marketing work with the agency’s design and advertising teams." },
  { company: "MX Advertising & Consulting", role: "Director of Acquisition & Analytics", dates: "2017 – 2018", detail: "Acquisition, analytics, and performance strategy." },
  { company: "RentalMiles", role: "Digital Marketing Consultant", dates: "2017 – 2018", detail: "SEO, SEM, paid search, lead generation, and social media." },
  { company: "REM Loyalty", role: "Digital Marketing Manager", dates: "2017 – 2018", detail: "Digital marketing management." },
  { company: "Ascensus Interactive", role: "Vice President Marketing", dates: "2017 – 2018", detail: "Marketing organization, team building, vendor management, design resources, content, paid search, and digital strategy." },
  { company: "Wagly", role: "Digital Marketing Manager", dates: "2016", detail: "Digital acquisition for pet-service locations across Seattle, San Francisco, and Orange County, including PPC, Yelp advertising, retargeting, conversion optimization, demand generation, and more than 60 Unbounce landing pages." },
];
