import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  IoArrowBackOutline,
  IoOpenOutline,
  IoLogoGithub
} from "react-icons/io5";

const getProjectData = async (id: string) => {
  const projects = {
    "react-ui-pro": {
      id: "react-ui-pro",
      name: "React UI Pro",
      category: "Libraries",
      tagline: "Production-ready React component library",
      description: "A comprehensive React component library built with TypeScript, featuring accessibility-first design, comprehensive documentation, and seamless integration with popular styling frameworks.",
      image: "/bg-pattern.png",
      github: "https://github.com/seanfilimon/react-ui-pro",
      demo: "https://react-ui-pro.dev",
      stats: {
        stars: "2,400",
        downloads: "50,000+",
        components: "85",
        contributors: "12"
      },
      technologies: ["React", "TypeScript", "Storybook", "Tailwind CSS", "Vite", "Vitest"],
      features: [
        "85+ production-ready components",
        "Full TypeScript support",
        "Accessibility-first design (WCAG 2.1)",
        "Dark/light theme support",
        "Comprehensive Storybook documentation",
        "Tree-shakeable exports",
        "Zero runtime dependencies",
        "Full test coverage"
      ],
      timeline: [
        { date: "Jan 2024", event: "Project started" },
        { date: "Mar 2024", event: "First public release" },
        { date: "Jun 2024", event: "1,000 GitHub stars" },
        { date: "Sep 2024", event: "Major v2.0 release" },
        { date: "Dec 2024", event: "2,400 stars milestone" }
      ]
    }
  };

  return projects[id as keyof typeof projects] || null;
};

export async function generateMetadata({ params }: { params: { id: string } }) {
  const project = await getProjectData(params.id);
  
  return {
    title: project ? `${project.name} | Sean Filimon Portfolio` : "Project Not Found",
    description: project?.description || "Project not found."
  };
}

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const project = await getProjectData(params.id);

  if (!project) {
    return (
      <div className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Project Not Found</h1>
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

        {/* Project Header */}
        <div className="grid md:grid-cols-2 gap-12 mb-12">
          <div>
            <div className="mb-4">
              <span className="px-3 py-1 text-sm font-medium border rounded-sm bg-accent text-accent-foreground">
                {project.category}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{project.name}</h1>
            <p className="text-xl text-muted-foreground mb-6">{project.tagline}</p>
            <p className="text-muted-foreground leading-relaxed mb-8">{project.description}</p>
            
            <div className="flex gap-3">
              <Button asChild className="rounded-sm font-bold text-black dark:text-black">
                <Link href={project.demo} target="_blank" className="flex items-center gap-2">
                  <IoOpenOutline className="h-4 w-4" />
                  View Demo
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-sm">
                <Link href={project.github} target="_blank" className="flex items-center gap-2">
                  <IoLogoGithub className="h-4 w-4" />
                  Source Code
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative h-64 md:h-80 rounded-sm overflow-hidden border-2">
            <Image
              src={project.image}
              alt={project.name}
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {Object.entries(project.stats).map(([key, value]) => (
            <div key={key} className="border rounded-sm p-6 text-center">
              <div className="text-2xl font-bold mb-2">{value}</div>
              <div className="text-sm text-muted-foreground capitalize">
                {key.replace('_', ' ')}
              </div>
            </div>
          ))}
        </div>

        {/* Features & Timeline */}
        <div className="grid md:grid-cols-2 gap-12 mb-12">
          <div>
            <h2 className="text-3xl font-bold mb-6">Key Features</h2>
            <ul className="space-y-2">
              {project.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 bg-primary rounded-full mt-2 shrink-0"></div>
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-6">Project Timeline</h2>
            <div className="space-y-3">
              {project.timeline.map((item, index) => (
                <div key={index} className="flex gap-3">
                  <div className="text-sm font-medium text-muted-foreground min-w-20">
                    {item.date}
                  </div>
                  <div className="text-sm">{item.event}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Technology Stack */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Technology Stack</h2>
          <div className="flex flex-wrap gap-2">
            {project.technologies.map((tech) => (
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
