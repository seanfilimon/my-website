import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@clerk/nextjs/server";

// Initialize Gemini for direct API calls
// Use GOOGLE_API_KEY to match existing Inngest agents
const apiKey = process.env.GOOGLE_API_KEY || "";
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

type AIAction = "rewrite" | "expand" | "simplify" | "fix" | "chat";

const ACTION_PROMPTS: Record<Exclude<AIAction, "chat">, string> = {
  rewrite: `Rewrite the following text to be clearer and more engaging while maintaining the same meaning. 
Keep the same tone and style. Only return the rewritten text, nothing else.`,
  
  expand: `Expand on the following text by adding more detail, examples, or explanations. 
Keep the same tone and style. Only return the expanded text, nothing else.`,
  
  simplify: `Simplify the following text to make it easier to understand. 
Remove jargon and complex sentences while keeping the core meaning. Only return the simplified text, nothing else.`,
  
  fix: `Fix any grammar, spelling, or punctuation errors in the following text. 
Keep the original meaning and style. Only return the corrected text, nothing else.`,
};

/**
 * POST /api/ai/edit
 * 
 * Handles AI-powered blog editing requests using Gemini API.
 * 
 * Body:
 * - action: "rewrite" | "expand" | "simplify" | "fix" | "chat"
 * - text: string (the text to edit)
 * - instruction?: string (required for "chat" action)
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { action, text, instruction } = body as {
      action: AIAction;
      text: string;
      instruction?: string;
    };

    if (!action || !text) {
      return NextResponse.json(
        { error: "Missing required fields: action and text" },
        { status: 400 }
      );
    }

    // Use direct Gemini API
    if (!genAI) {
      console.error("AI edit error: Missing GOOGLE_API_KEY environment variable");
      return NextResponse.json(
        { error: "AI service not configured. Please set GOOGLE_API_KEY environment variable." },
        { status: 500 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

    let prompt: string;
    let systemInstruction: string;

    if (action === "chat") {
      // Chat-based editing with custom instruction
      if (!instruction) {
        return NextResponse.json(
          { error: "Missing instruction for chat action" },
          { status: 400 }
        );
      }

      systemInstruction = `You are an AI assistant helping to edit blog content written in MDX/Markdown format.
The user will provide the current blog content and describe what changes they want.
Apply the requested changes and return the complete updated content.
Maintain the MDX/Markdown formatting.
Only return the updated content, no explanations.`;

      prompt = `Current blog content:
---
${text}
---

User's request: ${instruction}

Apply the requested changes and return the complete updated content:`;

    } else {
      // Predefined action
      systemInstruction = ACTION_PROMPTS[action];
      prompt = text;
    }

    // Generate response
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      systemInstruction,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
      },
    });

    const response = result.response;
    const generatedText = response.text();

    if (action === "chat") {
      return NextResponse.json({
        result: generatedText,
        message: "I've applied the changes you requested. Click 'Apply Changes' to update the editor.",
      });
    }

    return NextResponse.json({
      result: generatedText,
    });

  } catch (error: any) {
    console.error("AI edit error:", error);
    
    // Provide more specific error messages
    let errorMessage = "Failed to process text";
    
    if (error.message?.includes("API key") || error.message?.includes("API_KEY")) {
      errorMessage = "Invalid API key. Please check your GOOGLE_API_KEY configuration.";
    } else if (error.message?.includes("quota")) {
      errorMessage = "API quota exceeded. Please try again later.";
    } else if (error.message?.includes("safety")) {
      errorMessage = "Content was blocked by safety filters. Please try different text.";
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
