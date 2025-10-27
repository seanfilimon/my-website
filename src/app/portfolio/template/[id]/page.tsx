import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  IoArrowBackOutline,
  IoDownloadOutline,
  IoLogoGithub,
  IoOpenOutline
} from "react-icons/io5";

const getTemplateData = async (id: string) => {
  const templates = {
    "saas-starter": {
      id: "saas-starter",
      name: "SaaS Starter Kit",
      tagline: "Complete Next.js SaaS boilerplate",
      description: "A production-ready SaaS starter kit built with Next.js 14, featuring authentication, payments, dashboard, and everything you need to launch your SaaS product quickly.",
      image: "/bg-pattern.png",
      github: "https://github.com/seanfilimon/saas-starter",
      demo: "https://saas-starter-demo.com",
      downloadUrl: "https://github.com/seanfilimon/saas-starter/archive/main.zip",
      stats: {
        downloads: "25,000+",
        stars: "1,800",
        forks: "340",
        users: "500+"
      },
      technologies: ["Next.js 14", "TypeScript", "Tailwind CSS", "Prisma", "Stripe", "NextAuth.js"],
      features: [
        "🔐 Authentication with NextAuth.js",
        "💳 Stripe integration for payments",
        "📊 Admin dashboard with analytics", 
        "🎨 Beautiful UI with Tailwind CSS",
        "📧 Email templates with React Email",
        "🗄️ PostgreSQL database with Prisma",
        "🚀 Deployed on Vercel",
        "📱 Fully responsive design",
        "🌙 Dark/light mode support",
        "🛡️ TypeScript throughout"
      ],
      setupSteps: [
        "Clone the repository",
        "Install dependencies with npm install",
        "Configure environment variables",
        "Set up database with Prisma",
        "Configure Stripe webhooks",
        "Deploy to Vercel",
        "Start building your SaaS!"
      ],
      price: "Free",
      license: "MIT"
    }
  };

  return templates[id as keyof typeof templates] || null;
};

export async function generateMetadata({ params }: { params: { id: string } }) {
  const template = await getTemplateData(params.id);
  
  return {
    title: template ? `${template.name} | Template` : "Template Not Found",
    description: template?.description || "Template not found."
  };
}

export default async function TemplatePage({ params }: { params: { id: string } }) {
  const template = await getTemplateData(params.id);

  if (!template) {
    return (
      <div className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Template Not Found</h1>
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
        <div className="mb-8">
          <Button asChild variant="ghost" className="rounded-sm gap-2">
            <Link href="/portfolio">
              <IoArrowBackOutline className="h-4 w-4" />
              Back to Portfolio
            </Link>
          </Button>
        </div>

        {/* Template Header */}
        <div className="grid md:grid-cols-2 gap-12 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{template.name}</h1>
            <p className="text-xl text-muted-foreground mb-6">{template.tagline}</p>
            <p className="text-muted-foreground leading-relaxed mb-8">{template.description}</p>
            
            <div className="flex gap-3 mb-6">
              <Button asChild className="rounded-sm font-bold text-black dark:text-black">
                <Link href={template.downloadUrl} className="flex items-center gap-2">
                  <IoDownloadOutline className="h-4 w-4" />
                  Download Template
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-sm">
                <Link href={template.demo} target="_blank" className="flex items-center gap-2">
                  <IoOpenOutline className="h-4 w-4" />
                  Live Preview
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-sm">
                <Link href={template.github} target="_blank" className="flex items-center gap-2">
                  <IoLogoGithub className="h-4 w-4" />
                  GitHub
                </Link>
              </Button>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <span>Price: </span>
                <span className="font-bold text-green-500">{template.price}</span>
              </div>
              <div className="flex items-center gap-1">
                <span>License: </span>
                <span className="font-medium">{template.license}</span>
              </div>
            </div>
          </div>

          <div className="relative h-64 md:h-80 rounded-sm overflow-hidden border-2">
            <Image
              src={template.image}
              alt={template.name}
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {Object.entries(template.stats).map(([key, value]) => (
            <div key={key} className="border rounded-sm p-6 text-center">
              <div className="text-2xl font-bold mb-2">{value}</div>
              <div className="text-sm text-muted-foreground capitalize">
                {key.replace('_', ' ')}
              </div>
            </div>
          ))}
        </div>

        {/* Features & Setup */}
        <div className="grid md:grid-cols-2 gap-12 mb-12">
          <div>
            <h2 className="text-3xl font-bold mb-6">What&apos;s Included</h2>
            <ul className="space-y-2">
              {template.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="text-muted-foreground mt-1">{feature}</div>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-6">Quick Setup</h2>
            <ol className="space-y-3">
              {template.setupSteps.map((step, index) => (
                <li key={index} className="flex gap-3">
                  <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">
                    {index + 1}
                  </div>
                  <div className="text-sm text-muted-foreground pt-1">{step}</div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Technology Stack */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Technology Stack</h2>
          <div className="flex flex-wrap gap-2">
            {template.technologies.map((tech) => (
              <span
                key={tech}
                className="px-4 py-2 border rounded-sm text-sm font-medium hover:bg-accent transition-colors"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
