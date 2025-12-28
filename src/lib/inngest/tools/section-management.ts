/**
 * Section Management Tools
 * Tools for manipulating MDX/Markdown blog content structure
 */
import { createTool } from "@inngest/agent-kit";
import { z } from "zod";

/**
 * Parse MDX content into sections
 */
function parseSections(content: string): Array<{ heading: string; level: number; content: string; startIndex: number }> {
  const sections: Array<{ heading: string; level: number; content: string; startIndex: number }> = [];
  const lines = content.split('\n');
  
  let currentSection: { heading: string; level: number; content: string[]; startIndex: number } | null = null;
  
  lines.forEach((line, index) => {
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    
    if (headingMatch) {
      // Save previous section
      if (currentSection) {
        sections.push({
          ...currentSection,
          content: currentSection.content.join('\n'),
        });
      }
      
      // Start new section
      currentSection = {
        heading: headingMatch[2].trim(),
        level: headingMatch[1].length,
        content: [line],
        startIndex: index,
      };
    } else if (currentSection) {
      currentSection.content.push(line);
    }
  });
  
  // Add last section
  if (currentSection) {
    sections.push({
      ...currentSection,
      content: currentSection.content.join('\n'),
    });
  }
  
  return sections;
}

/**
 * Insert Section Tool
 * Inserts a new section at a specific position in the content
 */
export const insertSectionTool = createTool({
  name: "insertSection",
  description: "Insert a new section at a specific position in the blog content. Position can be 'after' or 'before' a target heading.",
  parameters: z.object({
    heading: z.string().describe("The heading text for the new section (without # symbols)"),
    content: z.string().describe("The content of the new section in MDX/Markdown format"),
    level: z.number().min(2).max(6).default(2).describe("Heading level (2-6, where 2 is ##)"),
    position: z.enum(["after", "before"]).describe("Where to insert relative to target"),
    targetHeading: z.string().describe("The heading to insert after/before"),
  }),
  handler: async (input, { network }) => {
    const currentContent = (network?.state.kv.get("content") as string) || "";
    
    if (!currentContent) {
      return { success: false, error: "No content available to modify" };
    }
    
    try {
      const sections = parseSections(currentContent);
      const targetSection = sections.find(s => 
        s.heading.toLowerCase().includes(input.targetHeading.toLowerCase())
      );
      
      if (!targetSection) {
        return { 
          success: false, 
          error: `Target heading "${input.targetHeading}" not found`,
          availableHeadings: sections.map(s => s.heading),
        };
      }
      
      // Create new section
      const headingPrefix = '#'.repeat(input.level);
      const newSection = `\n\n${headingPrefix} ${input.heading}\n\n${input.content}\n`;
      
      // Find insertion point
      const lines = currentContent.split('\n');
      let insertIndex = targetSection.startIndex;
      
      if (input.position === "after") {
        // Find the end of the target section
        insertIndex = targetSection.startIndex + targetSection.content.split('\n').length;
      }
      
      // Insert the new section
      lines.splice(insertIndex, 0, ...newSection.split('\n'));
      const updatedContent = lines.join('\n');
      
      // Store in network state
      network?.state.kv.set("content", updatedContent);
      
      return {
        success: true,
        message: `Inserted section "${input.heading}" ${input.position} "${targetSection.heading}"`,
        updatedContent,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to insert section",
      };
    }
  },
});

/**
 * Append Section Tool
 * Adds a new section to the end of the content
 */
export const appendSectionTool = createTool({
  name: "appendSection",
  description: "Add a new section to the end of the blog content",
  parameters: z.object({
    heading: z.string().describe("The heading text for the new section (without # symbols)"),
    content: z.string().describe("The content of the new section in MDX/Markdown format"),
    level: z.number().min(2).max(6).default(2).describe("Heading level (2-6, where 2 is ##)"),
  }),
  handler: async (input, { network }) => {
    const currentContent = (network?.state.kv.get("content") as string) || "";
    
    if (!currentContent) {
      return { success: false, error: "No content available to modify" };
    }
    
    try {
      const headingPrefix = '#'.repeat(input.level);
      const newSection = `\n\n${headingPrefix} ${input.heading}\n\n${input.content}\n`;
      const updatedContent = currentContent + newSection;
      
      network?.state.kv.set("content", updatedContent);
      
      return {
        success: true,
        message: `Appended section "${input.heading}" to end of content`,
        updatedContent,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to append section",
      };
    }
  },
});

/**
 * Restructure Content Tool
 * Reorganizes content into logical sections
 */
export const restructureContentTool = createTool({
  name: "restructureContent",
  description: "Reorganize the blog content into well-structured sections with proper heading hierarchy",
  parameters: z.object({
    structure: z.array(z.object({
      heading: z.string(),
      level: z.number().min(2).max(6),
      content: z.string(),
    })).describe("Array of sections in the desired order"),
  }),
  handler: async (input, { network }) => {
    try {
      let restructuredContent = "";
      
      input.structure.forEach((section, index) => {
        const headingPrefix = '#'.repeat(section.level);
        restructuredContent += `${index > 0 ? '\n\n' : ''}${headingPrefix} ${section.heading}\n\n${section.content}`;
      });
      
      network?.state.kv.set("content", restructuredContent);
      
      return {
        success: true,
        message: `Restructured content into ${input.structure.length} sections`,
        updatedContent: restructuredContent,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to restructure content",
      };
    }
  },
});

/**
 * Find Section Tool
 * Locates a section by heading or content
 */
export const findSectionTool = createTool({
  name: "findSection",
  description: "Find a section in the content by heading text",
  parameters: z.object({
    searchTerm: z.string().describe("The heading text to search for (partial match)"),
  }),
  handler: async (input, { network }) => {
    const currentContent = (network?.state.kv.get("content") as string) || "";
    
    if (!currentContent) {
      return { success: false, error: "No content available to search" };
    }
    
    try {
      const sections = parseSections(currentContent);
      const matchingSections = sections.filter(s => 
        s.heading.toLowerCase().includes(input.searchTerm.toLowerCase())
      );
      
      if (matchingSections.length === 0) {
        return {
          success: false,
          message: "No matching sections found",
          availableHeadings: sections.map(s => s.heading),
        };
      }
      
      return {
        success: true,
        matchingSections: matchingSections.map(s => ({
          heading: s.heading,
          level: s.level,
          contentPreview: s.content.slice(0, 200) + (s.content.length > 200 ? '...' : ''),
        })),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to find section",
      };
    }
  },
});

/**
 * Update Section Tool
 * Modifies an existing section's content
 */
export const updateSectionTool = createTool({
  name: "updateSection",
  description: "Update the content of an existing section",
  parameters: z.object({
    targetHeading: z.string().describe("The heading of the section to update"),
    newContent: z.string().describe("The new content for the section"),
    newHeading: z.string().optional().describe("Optional new heading text"),
  }),
  handler: async (input, { network }) => {
    const currentContent = (network?.state.kv.get("content") as string) || "";
    
    if (!currentContent) {
      return { success: false, error: "No content available to modify" };
    }
    
    try {
      const sections = parseSections(currentContent);
      const targetSection = sections.find(s => 
        s.heading.toLowerCase().includes(input.targetHeading.toLowerCase())
      );
      
      if (!targetSection) {
        return {
          success: false,
          error: `Section "${input.targetHeading}" not found`,
          availableHeadings: sections.map(s => s.heading),
        };
      }
      
      // Create updated section
      const headingPrefix = '#'.repeat(targetSection.level);
      const heading = input.newHeading || targetSection.heading;
      const updatedSection = `${headingPrefix} ${heading}\n\n${input.newContent}`;
      
      // Replace in content
      const updatedContent = currentContent.replace(targetSection.content, updatedSection);
      
      network?.state.kv.set("content", updatedContent);
      
      return {
        success: true,
        message: `Updated section "${targetSection.heading}"`,
        updatedContent,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to update section",
      };
    }
  },
});

/**
 * All section management tools
 */
export const sectionManagementTools = [
  insertSectionTool,
  appendSectionTool,
  restructureContentTool,
  findSectionTool,
  updateSectionTool,
];

export default sectionManagementTools;
