// Unified content types for the admin panel

export type ContentType = 
  | "blogs" 
  | "articles" 
  | "courses" 
  | "videos" 
  | "resources" 
  | "experiences"
  | "authors"
  | "assets";

export type ContentStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type DifficultyLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";

export type ExperienceType = 
  | "WORK" 
  | "PROJECT" 
  | "EDUCATION" 
  | "CERTIFICATION" 
  | "VOLUNTEER" 
  | "ACHIEVEMENT" 
  | "SPEAKING" 
  | "PUBLICATION";

export type ExperienceStatus = "CURRENT" | "COMPLETED" | "UPCOMING" | "ON_HOLD";

export type EmploymentType = 
  | "FULL_TIME" 
  | "PART_TIME" 
  | "CONTRACT" 
  | "FREELANCE" 
  | "INTERNSHIP" 
  | "REMOTE" 
  | "HYBRID";

// Base content item interface
export interface BaseContentItem {
  id: string;
  title: string;
  slug: string;
  status?: ContentStatus;
  featured?: boolean;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date | null;
}

// Blog item
export interface BlogItem extends BaseContentItem {
  excerpt: string;
  content: string;
  resourceId?: string | null;
  categoryId?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  thumbnail?: string | null;
  coverImage?: string | null;
  readTime: string;
  views: number;
  likes: number;
  authorId: string;
  author?: {
    id: string;
    name: string | null;
    image: string | null;
  };
  resource?: {
    id: string;
    name: string;
    slug: string;
    icon: string;
    color: string;
  } | null;
  category?: {
    id: string;
    name: string;
    slug: string;
    color?: string | null;
  } | null;
  tags?: { id: string; name: string; slug: string }[];
  _count?: {
    comments: number;
  };
}

// Article item
export interface ArticleItem extends BaseContentItem {
  excerpt: string;
  content: string;
  resourceId: string;
  categoryId: string;
  difficulty: DifficultyLevel;
  metaTitle?: string | null;
  metaDescription?: string | null;
  thumbnail?: string | null;
  coverImage?: string | null;
  readTime: string;
  views: number;
  likes: number;
  authorId: string;
  author?: {
    id: string;
    name: string | null;
    image: string | null;
  };
  resource?: {
    id: string;
    name: string;
    slug: string;
    icon: string;
    color: string;
  };
  category?: {
    id: string;
    name: string;
    slug: string;
    color?: string | null;
  };
  tags?: { id: string; name: string; slug: string }[];
  _count?: {
    comments: number;
  };
}

// Course item
export interface CourseItem extends BaseContentItem {
  subtitle?: string | null;
  description: string;
  resourceId: string;
  level: DifficultyLevel;
  language: string;
  price: number;
  discountPrice?: number | null;
  thumbnail?: string | null;
  promoVideo?: string | null;
  duration: string;
  lessonCount: number;
  rating: number;
  ratingCount: number;
  enrollments: number;
  views: number;
  lastUpdated: Date;
  instructorId: string;
  instructor?: {
    id: string;
    name: string | null;
    image: string | null;
  };
  resource?: {
    id: string;
    name: string;
    slug: string;
    icon: string;
    color: string;
  };
  tags?: { id: string; name: string; slug: string }[];
}

// Video item
export interface VideoItem extends BaseContentItem {
  description: string;
  resourceId: string;
  videoUrl: string;
  thumbnail: string;
  duration: string;
  views: number;
  likes: number;
  chapters?: { title: string; time: string }[] | null;
  resources?: { name: string; url: string }[] | null;
  authorId: string;
  author?: {
    id: string;
    name: string | null;
    image: string | null;
  };
  resource?: {
    id: string;
    name: string;
    slug: string;
    icon: string;
    color: string;
  };
  tags?: { id: string; name: string; slug: string }[];
}

// Resource item
export interface ResourceItem {
  id: string;
  name: string;
  slug: string;
  icon: string;
  iconUrl?: string | null;
  color: string;
  description: string;
  typeId: string;
  categoryId: string;
  officialUrl?: string | null;
  docsUrl?: string | null;
  githubUrl?: string | null;
  featured?: boolean;
  articleCount: number;
  blogCount: number;
  courseCount: number;
  videoCount: number;
  createdAt: Date;
  updatedAt: Date;
  type?: {
    id: string;
    name: string;
    slug: string;
  };
  category?: {
    id: string;
    name: string;
    slug: string;
    color?: string | null;
  };
  tags?: { id: string; name: string; slug: string }[];
  // OG Image Customization
  ogBackgroundColor?: string | null;
  ogBorderColor?: string | null;
  ogTextPrimary?: string | null;
  ogTextSecondary?: string | null;
  ogAccentStart?: string | null;
  ogAccentEnd?: string | null;
  ogResourceBgColor?: string | null;
  ogFontWeight?: number | null;
  ogBorderWidth?: number | null;
}

// Asset types
export type AssetType = "IMAGE" | "VIDEO" | "DOCUMENT" | "AUDIO" | "OTHER";
export type AssetCategory = "THUMBNAIL" | "COVER_IMAGE" | "AVATAR" | "ICON" | "GALLERY" | "ATTACHMENT" | "OTHER";

// SEO entity types
export type SEOEntityType = "blog" | "article" | "resource" | "course" | "video";

// SEO data interface
export interface SEOData {
  id?: string;
  entityType: SEOEntityType;
  entityId: string;
  
  // Basic SEO
  metaTitle?: string | null;
  metaDescription?: string | null;
  canonicalUrl?: string | null;
  
  // Open Graph
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  ogType?: string | null;
  
  // Twitter Cards
  twitterTitle?: string | null;
  twitterDescription?: string | null;
  twitterImage?: string | null;
  twitterCard?: "summary" | "summary_large_image" | "app" | "player" | null;
  
  // Advanced
  robots?: string | null;
  keywords?: string | null;
  author?: string | null;
  publishedTime?: Date | null;
  modifiedTime?: Date | null;
  
  // Schema.org
  schemaType?: string | null;
  schemaData?: Record<string, unknown> | null;
  
  createdAt?: Date;
  updatedAt?: Date;
}

// Category with icon support
export interface CategoryWithIcon {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  color?: string | null;
  icon?: string | null;
  iconUrl?: string | null;
}

// Resource category
export interface ResourceCategoryItem extends CategoryWithIcon {
  _count?: {
    resources: number;
  };
}

// Content category (for blogs/articles)
export interface ContentCategoryItem extends CategoryWithIcon {
  _count?: {
    articles: number;
    blogs: number;
  };
}

// Asset item
export interface AssetItem {
  id: string;
  name: string;
  title?: string | null;
  url: string;
  key: string;
  filename: string;
  size: number;
  mimeType: string;
  type: AssetType;
  category: AssetCategory;
  alt?: string | null;
  caption?: string | null;
  width?: number | null;
  height?: number | null;
  uploadedById?: string | null;
  uploadedBy?: {
    id: string;
    name: string | null;
    image: string | null;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

// Experience item
export interface ExperienceItem {
  id: string;
  title: string;
  subtitle?: string | null;
  description: string;
  summary?: string | null;
  type: ExperienceType;
  employmentType?: EmploymentType | null;
  status: ExperienceStatus;
  startDate: Date;
  endDate?: Date | null;
  duration?: string | null;
  location?: string | null;
  isRemote: boolean;
  organization?: string | null;
  organizationLogo?: string | null;
  organizationUrl?: string | null;
  thumbnail?: string | null;
  coverImage?: string | null;
  gallery: string[];
  projectUrl?: string | null;
  githubUrl?: string | null;
  demoUrl?: string | null;
  videoUrl?: string | null;
  resourceId?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  slug: string;
  featured: boolean;
  published: boolean;
  order: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    name: string | null;
    image: string | null;
  };
  resource?: {
    id: string;
    name: string;
    slug: string;
    icon: string;
    color: string;
  } | null;
  skills?: { id: string; name: string; level?: string | null }[];
  technologies?: { id: string; name: string; category?: string | null }[];
  highlights?: { id: string; content: string; order: number }[];
  metrics?: { id: string; label: string; value: string; unit?: string | null }[];
  tags?: { id: string; name: string; slug: string }[];
}

// Union type for any content item
export type ContentItem = 
  | BlogItem 
  | ArticleItem 
  | CourseItem 
  | VideoItem 
  | ResourceItem 
  | ExperienceItem
  | AssetItem;

// Filter state
export interface FilterState {
  search: string;
  status: ContentStatus | "ALL";
  resourceId: string | "ALL";
  categoryId: string | "ALL";
  sortBy: "createdAt" | "updatedAt" | "publishedAt" | "views" | "likes" | "title";
  sortOrder: "asc" | "desc";
  dateFrom?: Date;
  dateTo?: Date;
}

// Content type metadata
export interface ContentTypeConfig {
  type: ContentType;
  label: string;
  labelPlural: string;
  icon: string;
  hasStatus: boolean;
  hasResource: boolean;
  hasCategory: boolean;
  hasContent: boolean;
  createFields: string[];
}

export const CONTENT_TYPE_CONFIGS: Record<ContentType, ContentTypeConfig> = {
  blogs: {
    type: "blogs",
    label: "Blog",
    labelPlural: "Blogs",
    icon: "IoNewspaperOutline",
    hasStatus: true,
    hasResource: true,
    hasCategory: true,
    hasContent: true,
    createFields: ["title", "slug", "excerpt", "content", "resourceId", "categoryId", "status", "featured", "tags"],
  },
  articles: {
    type: "articles",
    label: "Article",
    labelPlural: "Articles",
    icon: "IoDocumentTextOutline",
    hasStatus: true,
    hasResource: true,
    hasCategory: true,
    hasContent: true,
    createFields: ["title", "slug", "excerpt", "content", "resourceId", "categoryId", "difficulty", "status", "featured", "tags"],
  },
  courses: {
    type: "courses",
    label: "Course",
    labelPlural: "Courses",
    icon: "IoBookOutline",
    hasStatus: true,
    hasResource: true,
    hasCategory: false,
    hasContent: true,
    createFields: ["title", "slug", "subtitle", "description", "resourceId", "level", "price", "status", "featured", "tags"],
  },
  videos: {
    type: "videos",
    label: "Video",
    labelPlural: "Videos",
    icon: "IoPlayCircleOutline",
    hasStatus: true,
    hasResource: true,
    hasCategory: false,
    hasContent: false,
    createFields: ["title", "slug", "description", "resourceId", "videoUrl", "thumbnail", "duration", "status", "featured", "tags"],
  },
  resources: {
    type: "resources",
    label: "Resource",
    labelPlural: "Resources",
    icon: "IoLibraryOutline",
    hasStatus: false,
    hasResource: false,
    hasCategory: true,
    hasContent: false,
    createFields: ["name", "slug", "icon", "color", "description", "typeId", "categoryId", "officialUrl", "docsUrl", "githubUrl"],
  },
  experiences: {
    type: "experiences",
    label: "Experience",
    labelPlural: "Experiences",
    icon: "IoBriefcaseOutline",
    hasStatus: false,
    hasResource: true,
    hasCategory: false,
    hasContent: true,
    createFields: ["title", "subtitle", "description", "type", "status", "startDate", "endDate", "location", "organization", "featured", "published"],
  },
  authors: {
    type: "authors",
    label: "Author",
    labelPlural: "Authors",
    icon: "IoPersonOutline",
    hasStatus: false,
    hasResource: false,
    hasCategory: false,
    hasContent: false,
    createFields: ["name", "email", "image", "bio", "title", "role", "website", "github", "twitter", "linkedin"],
  },
  assets: {
    type: "assets",
    label: "Asset",
    labelPlural: "Assets",
    icon: "IoImagesOutline",
    hasStatus: false,
    hasResource: false,
    hasCategory: true,
    hasContent: false,
    createFields: ["name", "title", "alt", "caption", "category"],
  },
};

// Default filter state
export const DEFAULT_FILTER_STATE: FilterState = {
  search: "",
  status: "ALL",
  resourceId: "ALL",
  categoryId: "ALL",
  sortBy: "createdAt",
  sortOrder: "desc",
};
