import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  IoArrowBackOutline,
  IoOpenOutline,
  IoLogoTwitter,
  IoLogoLinkedin,
  IoLocationOutline,
  IoCalendarOutline,
  IoPeopleOutline,
  IoTrendingUpOutline
} from "react-icons/io5";

// This would eventually come from a database or API
const getCompanyData = async (id: string) => {
  const companies = {
    "techflow": {
      id: "techflow",
      name: "TechFlow",
      tagline: "Building the future of developer workflows",
      description: "TechFlow is a developer workflow platform that combines AI-powered code reviews with automated deployment pipelines. We're revolutionizing how development teams collaborate and ship code.",
      logo: "/face_grayscale_nobg.png",
      website: "techflow.dev",
      founded: "2022",
      location: "San Francisco, CA",
      stage: "Series A",
      employees: "25-50",
      stats: {
        users: "25,000+",
        revenue: "$2M ARR",
        growth: "+45% MoM",
        funding: "$5M raised"
      },
      links: {
        website: "https://techflow.dev",
        twitter: "https://twitter.com/techflowdev",
        linkedin: "https://linkedin.com/company/techflow"
      },
      story: [
        "TechFlow started as a simple code review tool I built for my own team. I was frustrated with the existing solutions that were either too complex or too basic.",
        "What began as a weekend project quickly gained traction when I shared it with the developer community. Within three months, we had over 1,000 teams using the platform.",
        "The key breakthrough came when we integrated AI-powered code analysis. This wasn't just about finding bugs—it was about understanding code intent and suggesting improvements.",
        "Today, TechFlow serves over 25,000 developers and generates $2M in annual recurring revenue. We're backed by top-tier investors and continue to grow 45% month-over-month."
      ],
      technologies: ["Next.js", "TypeScript", "React", "Node.js", "PostgreSQL", "OpenAI", "Stripe"],
      milestones: [
        { date: "Jan 2022", event: "Founded TechFlow" },
        { date: "Mar 2022", event: "First 1,000 users" },
        { date: "Aug 2022", event: "Seed funding $1.2M" },
        { date: "Jan 2023", event: "10,000+ users" },
        { date: "Jun 2023", event: "Series A $5M" },
        { date: "Dec 2024", event: "$2M ARR milestone" }
      ]
    },
    "legionedge": {
      id: "legionedge",
      name: "LegionEdge",
      tagline: "AI-powered development collaboration",
      description: "LegionEdge combines artificial intelligence with developer workflows to create the most productive development environment. Our platform helps teams ship code faster with intelligent automation.",
      logo: "/face_grayscale_nobg.png",
      website: "legionedge.ai",
      founded: "2023",
      location: "Remote-first",
      stage: "Series A",
      employees: "15-25",
      stats: {
        users: "15,000+",
        growth: "+60% MoM",
        funding: "Series A",
        integrations: "50+"
      },
      links: {
        website: "https://legionedge.ai",
        twitter: "https://twitter.com/legionedgeai",
        linkedin: "https://linkedin.com/company/legionedge"
      },
      story: [
        "LegionEdge was born from the vision of making AI truly useful for developers. Not just code completion, but understanding entire project contexts.",
        "We started with a simple premise: what if AI could understand your codebase as well as your senior developers? The results exceeded our expectations.",
        "Our breakthrough came with context-aware AI that learns from your team's patterns and preferences. It's like having a senior developer pair programming with you 24/7.",
        "Now serving over 15,000 developers with 60% month-over-month growth, we're building the future of AI-assisted development."
      ],
      technologies: ["Next.js", "Python", "TensorFlow", "PostgreSQL", "Redis", "Docker", "Kubernetes"],
      milestones: [
        { date: "Mar 2023", event: "Founded LegionEdge" },
        { date: "Jun 2023", event: "First AI model deployed" },
        { date: "Sep 2023", event: "1,000 beta users" },
        { date: "Dec 2023", event: "Public launch" },
        { date: "Mar 2024", event: "Series A funding" },
        { date: "Dec 2024", event: "15K+ users" }
      ]
    }
  };

  return companies[id as keyof typeof companies] || null;
};

export async function generateMetadata({ params }: { params: { id: string } }) {
  const company = await getCompanyData(params.id);
  
  if (!company) {
    return {
      title: "Company Not Found | Sean Filimon",
      description: "The requested company could not be found."
    };
  }

  return {
    title: `${company.name} | Sean Filimon Portfolio`,
    description: `${company.description.slice(0, 160)}...`
  };
}

export default async function CompanyPage({ params }: { params: { id: string } }) {
  const company = await getCompanyData(params.id);

  if (!company) {
    return (
      <div className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Company Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The requested company could not be found.
          </p>
          <Button asChild variant="outline" className="rounded-sm">
            <Link href="/portfolio">Back to Portfolio</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-20">
      <div className="max-w-6xl mx-auto px-4">
        {/* Back Button */}
        <div className="mb-8">
          <Button asChild variant="ghost" className="rounded-sm gap-2">
            <Link href="/portfolio">
              <IoArrowBackOutline className="h-4 w-4" />
              Back to Portfolio
            </Link>
          </Button>
        </div>

        {/* Company Header */}
        <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
          <div className="relative h-32 w-32 overflow-hidden rounded-sm border-2 shrink-0">
            <Image
              src={company.logo}
              alt={`${company.name} logo`}
              fill
              className="object-cover"
            />
          </div>
          
          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">{company.name}</h1>
              <p className="text-xl text-muted-foreground mb-4">{company.tagline}</p>
              <p className="text-muted-foreground leading-relaxed">{company.description}</p>
            </div>

            {/* Company Info */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <IoCalendarOutline className="h-4 w-4 text-muted-foreground" />
                <span>Founded {company.founded}</span>
              </div>
              <div className="flex items-center gap-2">
                <IoLocationOutline className="h-4 w-4 text-muted-foreground" />
                <span>{company.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <IoTrendingUpOutline className="h-4 w-4 text-muted-foreground" />
                <span>{company.stage}</span>
              </div>
              <div className="flex items-center gap-2">
                <IoPeopleOutline className="h-4 w-4 text-muted-foreground" />
                <span>{company.employees} employees</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button asChild className="rounded-sm font-bold text-black dark:text-black">
                <Link href={company.links.website} target="_blank" className="flex items-center gap-2">
                  <IoOpenOutline className="h-4 w-4" />
                  Visit Website
                </Link>
              </Button>
              {company.links.twitter && (
                <Button asChild size="icon" className="rounded-sm bg-blue-500 hover:bg-blue-600 text-white">
                  <Link href={company.links.twitter} target="_blank">
                    <IoLogoTwitter className="h-4 w-4" />
                  </Link>
                </Button>
              )}
              {company.links.linkedin && (
                <Button asChild size="icon" className="rounded-sm bg-blue-600 hover:bg-blue-700 text-white">
                  <Link href={company.links.linkedin} target="_blank">
                    <IoLogoLinkedin className="h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {Object.entries(company.stats).map(([key, value]) => (
            <div key={key} className="border rounded-sm p-6 text-center">
              <div className="text-3xl font-bold mb-2">{value}</div>
              <div className="text-sm text-muted-foreground capitalize">
                {key.replace('_', ' ')}
              </div>
            </div>
          ))}
        </div>

        {/* Company Story */}
        <div className="grid md:grid-cols-2 gap-12 mb-12">
          <div>
            <h2 className="text-3xl font-bold mb-6">The Story</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              {company.story.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            {/* Technology Stack */}
            <div>
              <h3 className="text-xl font-bold mb-4">Technology Stack</h3>
              <div className="flex flex-wrap gap-2">
                {company.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 text-sm font-medium border rounded-sm bg-accent text-accent-foreground"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Milestones */}
            <div>
              <h3 className="text-xl font-bold mb-4">Key Milestones</h3>
              <div className="space-y-3">
                {company.milestones.map((milestone, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="text-sm font-medium text-muted-foreground min-w-20">
                      {milestone.date}
                    </div>
                    <div className="text-sm">{milestone.event}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="border-2 border-border rounded-sm p-8 text-center space-y-4">
          <h2 className="text-2xl font-bold">Interested in {company.name}?</h2>
          <p className="text-muted-foreground">
            Learn more about our journey, technology, and vision for the future.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Button asChild className="rounded-sm font-bold text-black dark:text-black uppercase">
              <Link href={company.links.website} target="_blank">Visit {company.name}</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-sm">
              <Link href="/contact">Get In Touch</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
