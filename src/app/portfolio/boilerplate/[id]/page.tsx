import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  IoArrowBackOutline,
  IoDownloadOutline,
  IoLogoGithub,
  IoOpenOutline
} from "react-icons/io5";

const getBoilerplateData = async (id: string) => {
  const boilerplates = {
    "ecommerce-starter": {
      id: "ecommerce-starter",
      name: "E-Commerce Starter",
      tagline: "Full-featured e-commerce boilerplate",
      description: "Complete e-commerce solution with cart, payments, admin panel, and inventory management. Built with Next.js and Stripe.",
      image: "/bg-pattern.png",
      github: "https://github.com/seanfilimon/ecommerce-starter",
      demo: "https://ecommerce-demo.dev",
      stats: {
        downloads: "15,000+",
        stars: "890",
        stores: "200+"
      },
      technologies: ["Next.js", "TypeScript", "Stripe", "Prisma", "Tailwind CSS"],
      features: [
        "🛒 Shopping cart functionality",
        "💳 Stripe payment integration",
        "📦 Inventory management",
        "👨‍💼 Admin dashboard",
        "📧 Order confirmation emails",
        "🔍 Product search & filtering",
        "📱 Mobile-responsive design",
        "🌙 Dark/light mode"
      ]
    }
  };

  return boilerplates[id as keyof typeof boilerplates] || null;
};

export async function generateMetadata({ params }: { params: { id: string } }) {
  const boilerplate = await getBoilerplateData(params.id);
  
  return {
    title: boilerplate ? `${boilerplate.name} | Boilerplate` : "Boilerplate Not Found",
    description: boilerplate?.description || "Boilerplate not found."
  };
}

export default async function BoilerplatePage({ params }: { params: { id: string } }) {
  const boilerplate = await getBoilerplateData(params.id);

  if (!boilerplate) {
    return (
      <div className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Boilerplate Not Found</h1>
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

        <div className="grid md:grid-cols-2 gap-12 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{boilerplate.name}</h1>
            <p className="text-xl text-muted-foreground mb-6">{boilerplate.tagline}</p>
            <p className="text-muted-foreground leading-relaxed mb-8">{boilerplate.description}</p>
            
            <div className="flex gap-3">
              <Button asChild className="rounded-sm font-bold text-black dark:text-black">
                <Link href={boilerplate.github} className="flex items-center gap-2">
                  <IoDownloadOutline className="h-4 w-4" />
                  Get Started
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-sm">
                <Link href={boilerplate.demo} target="_blank" className="flex items-center gap-2">
                  <IoOpenOutline className="h-4 w-4" />
                  Live Demo
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative h-64 md:h-80 rounded-sm overflow-hidden border-2">
            <Image
              src={boilerplate.image}
              alt={boilerplate.name}
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 mb-12">
          {Object.entries(boilerplate.stats).map(([key, value]) => (
            <div key={key} className="border rounded-sm p-6 text-center">
              <div className="text-2xl font-bold mb-2">{value}</div>
              <div className="text-sm text-muted-foreground capitalize">
                {key.replace('_', ' ')}
              </div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Features Included</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {boilerplate.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3 p-4 border rounded-sm">
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Built With</h2>
          <div className="flex flex-wrap gap-2">
            {boilerplate.technologies.map((tech) => (
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
