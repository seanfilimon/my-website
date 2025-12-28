import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  IoArrowBackOutline,
  IoOpenOutline,
  IoLogoGithub,
  IoLocationOutline,
  IoCalendarOutline,
  IoBriefcaseOutline,
  IoPlayOutline,
} from "react-icons/io5";
import { db } from "@/src/lib/db";

// Map Experience types to display labels
const TYPE_LABELS: Record<string, string> = {
  WORK: "Company",
  PROJECT: "Project",
  EDUCATION: "Education",
  CERTIFICATION: "Certification",
  VOLUNTEER: "Volunteer",
  ACHIEVEMENT: "Achievement",
  SPEAKING: "Speaking",
  PUBLICATION: "Publication",
};

const STATUS_LABELS: Record<string, string> = {
  CURRENT: "Current",
  COMPLETED: "Completed",
  UPCOMING: "Upcoming",
  ON_HOLD: "On Hold",
};

// Format date for display
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(date);
}

// Calculate duration between dates
function calculateDuration(startDate: Date, endDate?: Date | null): string {
  const end = endDate || new Date();
  const months = (end.getFullYear() - startDate.getFullYear()) * 12 + (end.getMonth() - startDate.getMonth());
  
  if (months < 1) return "Less than a month";
  if (months < 12) return `${months} month${months > 1 ? "s" : ""}`;
  
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  
  if (remainingMonths === 0) return `${years} year${years > 1 ? "s" : ""}`;
  return `${years} year${years > 1 ? "s" : ""}, ${remainingMonths} month${remainingMonths > 1 ? "s" : ""}`;
}

async function getExperience(slug: string) {
  const experience = await db.experience.findUnique({
    where: { slug },
    include: {
      user: {
        select: { id: true, name: true, email: true, image: true, bio: true },
      },
      resource: true,
      skills: true,
      technologies: true,
      highlights: {
        orderBy: { order: "asc" },
      },
      metrics: {
        orderBy: { order: "asc" },
      },
      tags: true,
      testimonials: {
        where: { featured: true },
        take: 3,
      },
    },
  });

  return experience;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const experience = await getExperience(slug);
  
  if (!experience) {
    return {
      title: "Experience Not Found | Sean Filimon Portfolio",
      description: "The requested experience could not be found.",
    };
  }

  return {
    title: experience.metaTitle || `${experience.title} | Sean Filimon Portfolio`,
    description: experience.metaDescription || experience.summary || experience.description.slice(0, 160),
    openGraph: {
      title: experience.title,
      description: experience.summary || experience.description.slice(0, 160),
      images: experience.coverImage || experience.thumbnail ? [experience.coverImage || experience.thumbnail!] : [],
    },
  };
}

export default async function ExperienceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const experience = await getExperience(slug);

  if (!experience || !experience.published) {
    notFound();
  }

  const typeLabel = TYPE_LABELS[experience.type] || experience.type;
  const statusLabel = STATUS_LABELS[experience.status] || experience.status;
  const duration = experience.duration || calculateDuration(experience.startDate, experience.endDate);
  const dateRange = experience.endDate 
    ? `${formatDate(experience.startDate)} - ${formatDate(experience.endDate)}`
    : `${formatDate(experience.startDate)} - Present`;

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

        {/* Header Section */}
        <div className="grid md:grid-cols-2 gap-12 mb-12">
          <div>
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="outline" className="rounded-sm">
                {typeLabel}
              </Badge>
              <Badge 
                variant={experience.status === "CURRENT" ? "default" : "secondary"} 
                className="rounded-sm"
              >
                {statusLabel}
              </Badge>
              {experience.featured && (
                <Badge className="rounded-sm bg-primary/10 text-primary border-primary/20">
                  Featured
                </Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold mb-2">{experience.title}</h1>
            
            {/* Subtitle (Organization/Company) */}
            {(experience.subtitle || experience.organization) && (
              <p className="text-xl text-muted-foreground mb-4">
                {experience.subtitle || experience.organization}
              </p>
            )}

            {/* Meta Info */}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
              <div className="flex items-center gap-1.5">
                <IoCalendarOutline className="h-4 w-4" />
                <span>{dateRange}</span>
                <span className="text-muted-foreground/60">({duration})</span>
              </div>
              {experience.location && (
                <div className="flex items-center gap-1.5">
                  <IoLocationOutline className="h-4 w-4" />
                  <span>{experience.location}</span>
                  {experience.isRemote && <Badge variant="outline" className="text-xs">Remote</Badge>}
                </div>
              )}
              {experience.employmentType && (
                <div className="flex items-center gap-1.5">
                  <IoBriefcaseOutline className="h-4 w-4" />
                  <span>{experience.employmentType.replace("_", " ")}</span>
                </div>
              )}
            </div>

            {/* Summary */}
            {experience.summary && (
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                {experience.summary}
              </p>
            )}
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              {(experience.projectUrl || experience.demoUrl || experience.organizationUrl) && (
                <Button asChild className="rounded-sm font-bold text-black dark:text-black">
                  <Link 
                    href={experience.projectUrl || experience.demoUrl || experience.organizationUrl!} 
                    target="_blank" 
                    className="flex items-center gap-2"
                  >
                    <IoOpenOutline className="h-4 w-4" />
                    {experience.type === "WORK" ? "Visit Website" : "View Project"}
                  </Link>
                </Button>
              )}
              {experience.githubUrl && (
                <Button asChild variant="outline" className="rounded-sm">
                  <Link href={experience.githubUrl} target="_blank" className="flex items-center gap-2">
                    <IoLogoGithub className="h-4 w-4" />
                    Source Code
                  </Link>
                </Button>
              )}
              {experience.videoUrl && (
                <Button asChild variant="outline" className="rounded-sm">
                  <Link href={experience.videoUrl} target="_blank" className="flex items-center gap-2">
                    <IoPlayOutline className="h-4 w-4" />
                    Watch Video
                  </Link>
                </Button>
              )}
            </div>
          </div>

          {/* Cover Image */}
          <div className="relative h-64 md:h-80 rounded-lg overflow-hidden border-2 bg-muted">
            {(experience.coverImage || experience.thumbnail) ? (
              <Image
                src={experience.coverImage || experience.thumbnail!}
                alt={experience.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-6xl">
                  {experience.type === "WORK" ? "🏢" : "🚀"}
                </span>
              </div>
            )}
            {/* Organization Logo Overlay */}
            {experience.organizationLogo && (
              <div className="absolute bottom-4 left-4 h-12 w-12 rounded-full overflow-hidden border-2 border-background shadow-lg">
                <Image
                  src={experience.organizationLogo}
                  alt={experience.organization || experience.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </div>
        </div>

        {/* Metrics/Stats */}
        {experience.metrics && experience.metrics.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {experience.metrics.map((metric) => (
              <div key={metric.id} className="border rounded-lg p-6 text-center">
                <div className="text-2xl font-bold mb-2">{metric.value}</div>
                <div className="text-sm text-muted-foreground capitalize">
                  {metric.label}
                </div>
                {metric.unit && (
                  <div className="text-xs text-muted-foreground/60">{metric.unit}</div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Description & Highlights */}
        <div className="grid md:grid-cols-2 gap-12 mb-12">
          {/* Full Description */}
          <div>
            <h2 className="text-2xl font-bold mb-6">About This {typeLabel}</h2>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {experience.description}
              </p>
            </div>
          </div>

          {/* Highlights */}
          {experience.highlights && experience.highlights.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Key Highlights</h2>
              <ul className="space-y-3">
                {experience.highlights.map((highlight) => (
                  <li key={highlight.id} className="flex items-start gap-3">
                    <div className="h-2 w-2 bg-primary rounded-full mt-2 shrink-0"></div>
                    <span className="text-muted-foreground">{highlight.content}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Technologies & Skills */}
        <div className="grid md:grid-cols-2 gap-12 mb-12">
          {/* Technologies */}
          {experience.technologies && experience.technologies.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Technologies Used</h2>
              <div className="flex flex-wrap gap-2">
                {experience.technologies.map((tech) => (
                  <span
                    key={tech.id}
                    className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-accent transition-colors"
                  >
                    {tech.name}
                    {tech.category && (
                      <span className="text-muted-foreground/60 ml-1 text-xs">
                        ({tech.category})
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {experience.skills && experience.skills.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Skills Applied</h2>
              <div className="flex flex-wrap gap-2">
                {experience.skills.map((skill) => (
                  <span
                    key={skill.id}
                    className="px-4 py-2 bg-accent rounded-lg text-sm font-medium"
                  >
                    {skill.name}
                    {skill.level && (
                      <span className="text-muted-foreground/60 ml-1 text-xs">
                        • {skill.level}
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tags */}
        {experience.tags && experience.tags.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Tags</h2>
            <div className="flex flex-wrap gap-2">
              {experience.tags.map((tag) => (
                <Badge key={tag.id} variant="secondary" className="rounded-sm">
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Gallery */}
        {experience.gallery && experience.gallery.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Gallery</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {experience.gallery.map((imageUrl, index) => (
                <div key={index} className="relative aspect-video rounded-lg overflow-hidden border">
                  <Image
                    src={imageUrl}
                    alt={`${experience.title} gallery image ${index + 1}`}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Testimonials */}
        {experience.testimonials && experience.testimonials.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Testimonials</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {experience.testimonials.map((testimonial) => (
                <div key={testimonial.id} className="border rounded-lg p-6">
                  <p className="text-muted-foreground italic mb-4">
                    &ldquo;{testimonial.excerpt || testimonial.content}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    {testimonial.authorImage && (
                      <div className="relative h-10 w-10 rounded-full overflow-hidden">
                        <Image
                          src={testimonial.authorImage}
                          alt={testimonial.authorName}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <div className="font-medium">{testimonial.authorName}</div>
                      {(testimonial.authorTitle || testimonial.authorCompany) && (
                        <div className="text-sm text-muted-foreground">
                          {testimonial.authorTitle}
                          {testimonial.authorTitle && testimonial.authorCompany && " at "}
                          {testimonial.authorCompany}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Resource */}
        {experience.resource && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Related Technology</h2>
            <Link 
              href={`/resources/${experience.resource.slug}`}
              className="inline-flex items-center gap-3 border rounded-lg p-4 hover:bg-accent transition-colors"
            >
              <span className="text-2xl">{experience.resource.icon}</span>
              <div>
                <div className="font-medium">{experience.resource.name}</div>
                <div className="text-sm text-muted-foreground">View resource page</div>
              </div>
            </Link>
          </div>
        )}

        {/* CTA */}
        <div className="border-2 border-border rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">
            Interested in Working Together?
          </h2>
          <p className="text-muted-foreground mb-6">
            I&apos;m always open to discussing new opportunities and collaborations.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild className="rounded-sm font-bold text-black dark:text-black uppercase">
              <Link href="/contact">Get in Touch</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-sm">
              <Link href="/portfolio">View More Work</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
