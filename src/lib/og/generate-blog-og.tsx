/**
 * Blog OG Image Generator
 * Creates article/series style OG images for blog posts
 * Uses @vercel/og ImageResponse to render React to PNG
 */
import { ImageResponse } from "@vercel/og";

export const OG_WIDTH = 1920;
export const OG_HEIGHT = 1080;

interface BlogOGOptions {
  title: string;
  excerpt?: string;
  authorName?: string;
  seriesName?: string;
  chapterNumber?: string;
  readTime?: string;
  publishDate?: string;
  resourceIcon?: string; // URL to the resource icon/logo image
  resourceEmoji?: string; // Emoji icon for the resource (e.g., "⚛️")
  resourceName?: string; // Name of the resource (e.g., "Together AI")
  
  // OG Image Styling (customizable per resource)
  ogStyles?: {
    backgroundColor?: string;   // Background color
    borderColor?: string;        // Border/outline color
    textPrimary?: string;        // Primary text (title)
    textSecondary?: string;      // Secondary text (excerpt, meta)
    accentStart?: string;        // Gradient start (for avatar, accents)
    accentEnd?: string;          // Gradient end
    resourceBgColor?: string;    // Right column background
    fontWeight?: number;         // Title font weight (400-700)
    borderWidth?: number;        // Border width in pixels (1-5)
  };
}

/**
 * Generate an article/series style OG image for a blog post
 * Returns an ImageResponse that can be used as a Response or converted to buffer
 */
export function generateBlogOGImage({
  title,
  excerpt,
  authorName = "@seanfilimon",
  seriesName,
  chapterNumber,
  readTime = "5 min read",
  publishDate,
  resourceIcon,
  resourceEmoji,
  resourceName,
  ogStyles,
}: BlogOGOptions): ImageResponse {
  // Truncate title if too long
  const displayTitle = title.length > 60 ? title.slice(0, 57) + "..." : title;
  
  // Truncate excerpt if provided
  const displayExcerpt = excerpt 
    ? (excerpt.length > 100 ? excerpt.slice(0, 97) + "..." : excerpt)
    : undefined;

  // Format date or use current date
  const displayDate = publishDate || new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  // Extract styling with defaults
  const backgroundColor = ogStyles?.backgroundColor ?? "#000000";
  const borderColor = ogStyles?.borderColor ?? "#262626";
  const textPrimary = ogStyles?.textPrimary ?? "#ffffff";
  const textSecondary = ogStyles?.textSecondary ?? "#a3a3a3";
  const accentStart = ogStyles?.accentStart ?? "#3b82f6";
  const accentEnd = ogStyles?.accentEnd ?? "#8b5cf6";
  const resourceBgColor = ogStyles?.resourceBgColor ?? "#000000";
  const fontWeight = ogStyles?.fontWeight ?? 500;
  const borderWidth = ogStyles?.borderWidth ?? 2;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          backgroundColor,
          overflow: "hidden",
          padding: "80px 128px",
          gap: "0px",
        }}
      >
        {/* Left column - Content (outlined box) */}
        <div
          style={{
            width: "842px",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
            flexShrink: 0,
            overflow: "hidden",
            border: `${borderWidth}px solid ${borderColor}`,
            boxSizing: "border-box",
          }}
        >
            {/* Series/Chapter info section */}
            {(seriesName || chapterNumber) && (
              <div
                style={{
                  width: "100%",
                  paddingLeft: "38px",
                  paddingRight: "38px",
                  paddingTop: "26px",
                  paddingBottom: "26px",
                  borderBottom: `${borderWidth}px solid ${borderColor}`,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "flex-start",
                  overflow: "hidden",
                  boxSizing: "border-box",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-start",
                    alignItems: "center",
                    gap: "13px",
                    maxWidth: "100%",
                    overflow: "hidden",
                  }}
                >
                  {/* Avatar circle */}
                  <div
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <span style={{ color: textPrimary, fontSize: "19px", fontWeight: 600 }}>S</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-start",
                      alignItems: "center",
                      gap: "6px",
                      overflow: "hidden",
                    }}
                  >
                    {seriesName && (
                      <span style={{ color: textSecondary, fontSize: "22px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {seriesName} /
                      </span>
                    )}
                    {chapterNumber && (
                      <span style={{ color: textPrimary, fontSize: "22px", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {chapterNumber}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Main content section */}
            <div
              style={{
                width: "100%",
                padding: "51px",
                borderTop: `${borderWidth}px solid ${borderColor}`,
                borderBottom: `${borderWidth}px solid ${borderColor}`,
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                alignItems: "flex-start",
                gap: "26px",
                overflow: "hidden",
                boxSizing: "border-box",
              }}
            >
              {/* Title */}
              <h1
                style={{
                  width: "100%",
                  maxWidth: "740px",
                  fontSize: displayTitle.length > 40 ? "51px" : "58px",
                  fontWeight,
                  color: textPrimary,
                  lineHeight: 1.2,
                  margin: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  wordBreak: "break-word",
                }}
              >
                {displayTitle}
              </h1>

              {/* Excerpt */}
              {displayExcerpt && (
                <p
                  style={{
                    width: "100%",
                    maxWidth: "614px",
                    fontSize: "26px",
                    color: textSecondary,
                    lineHeight: 1.5,
                    margin: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    wordBreak: "break-word",
                  }}
                >
                  {displayExcerpt}
                </p>
              )}
            </div>

            {/* Footer metadata section */}
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "stretch",
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              {/* Author */}
              <div
                style={{
                  height: "83px",
                  paddingLeft: "38px",
                  paddingRight: "38px",
                  borderRight: "2px solid #262626",
                  display: "flex",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  gap: "13px",
                  flexShrink: 0,
                  overflow: "hidden",
                }}
              >
                {/* Small avatar */}
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: `linear-gradient(135deg, ${accentStart} 0%, ${accentEnd} 100%)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <span style={{ color: textPrimary, fontSize: "16px", fontWeight: 600 }}>S</span>
                </div>
                <span style={{ color: textSecondary, fontSize: "19px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {authorName}
                </span>
              </div>

              {/* Read time */}
              <div
                style={{
                  flex: 1,
                  height: "83px",
                  paddingLeft: "38px",
                  paddingRight: "38px",
                  borderRight: `${borderWidth}px solid ${borderColor}`,
                  display: "flex",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  overflow: "hidden",
                }}
              >
                <span style={{ color: textSecondary, fontSize: "19px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {readTime}
                </span>
              </div>

              {/* Date */}
              <div
                style={{
                  flex: 1,
                  height: "83px",
                  paddingLeft: "38px",
                  paddingRight: "38px",
                  display: "flex",
                  justifyContent: "flex-start",
                  alignItems: "center",
                  overflow: "hidden",
                }}
              >
                <span style={{ color: textSecondary, fontSize: "19px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {displayDate}
                </span>
              </div>
            </div>
          </div>

        {/* Right column - Resource icon area (outlined box) */}
        <div
          style={{
            width: "822px",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            background: resourceBgColor,
            position: "relative",
            overflow: "hidden",
            flexShrink: 0,
            border: `${borderWidth}px solid ${borderColor}`,
            borderLeft: "none",
            boxSizing: "border-box",
          }}
        >
            {resourceIcon ? (
              // Show resource icon/logo image covering the area
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={resourceIcon}
                alt={resourceName || "Resource"}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : resourceEmoji ? (
              // Show emoji with resource name
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "26px",
                  maxWidth: "100%",
                  padding: "0 40px",
                  overflow: "hidden",
                }}
              >
                <span style={{ fontSize: "192px" }}>{resourceEmoji}</span>
                {resourceName && (
                  <span style={{ color: textSecondary, fontSize: "38px", fontWeight: 500, textAlign: "center", maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {resourceName}
                  </span>
                )}
              </div>
            ) : (
              // Fallback decorative gradient orb
              <div
                style={{
                  width: "320px",
                  height: "320px",
                  borderRadius: "50%",
                  background: `radial-gradient(circle, ${accentStart}26 0%, ${accentEnd}1a 50%, transparent 70%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: "160px",
                    height: "160px",
                    borderRadius: "50%",
                    background: `radial-gradient(circle, ${accentStart}33 0%, transparent 70%)`,
                  }}
                />
              </div>
            )}
        </div>
      </div>
    ),
    {
      width: OG_WIDTH,
      height: OG_HEIGHT,
    }
  );
}

/**
 * Generate OG image and return as ArrayBuffer
 * Useful for uploading to storage services
 */
export async function generateBlogOGBuffer(options: BlogOGOptions): Promise<ArrayBuffer> {
  const response = generateBlogOGImage(options);
  return await response.arrayBuffer();
}
