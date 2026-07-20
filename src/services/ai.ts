import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function explainConcept(concept: string, context: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Explain the technical concept "${concept}" in the context of the following text: "${context}". Provide a clear definition and a real-world example. Format as Markdown.`,
    });
    return response.text;
  } catch (error) {
    console.error("Error explaining concept:", error);
    return "Failed to explain concept. Please try again.";
  }
}

export async function generateConceptDiagram(concept: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `A clean, modern, educational diagram illustrating the concept of "${concept}". Minimalist, professional, white background, blue and orange accents.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "16:9",
        }
      }
    });
    
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating diagram:", error);
    return null;
  }
}

export async function summarizeChapter(chapterTitle: string, chapterContent: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Summarize the following chapter titled "${chapterTitle}". Keep it concise, engaging, and highlight the 3-4 key takeaways. Format as Markdown.\n\n${chapterContent}`,
    });
    return response.text;
  } catch (error) {
    console.error("Error summarizing chapter:", error);
    return "Failed to summarize chapter. Please try again.";
  }
}

export async function askChapterQuestion(question: string, chapterTitle: string, chapterContent: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are an AI reading assistant helping a user understand a book chapter. 
Chapter Title: "${chapterTitle}"
Chapter Content: "${chapterContent}"

User Question: "${question}"

Answer the question based primarily on the chapter content. If the answer requires broader context, provide it but clarify what is from the text versus general knowledge. Keep the tone helpful, educational, and concise. Format as Markdown.`,
    });
    return response.text;
  } catch (error) {
    console.error("Error answering question:", error);
    return "Failed to answer question. Please try again.";
  }
}

export async function getChapterNews(chapterTitle: string, chapterContent: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Search for recent news articles related to the following chapter title and themes: "${chapterTitle}". Provide a short summary of 2-3 relevant recent events or breakthroughs, and explain how they connect to the chapter. Format as Markdown.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text;
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    // Extract URLs
    const sources = chunks
      .map(chunk => chunk.web)
      .filter(web => web && web.uri && web.title);

    return { text, sources };
  } catch (error) {
    console.error("Error fetching chapter news:", error);
    return { text: "Failed to fetch real-world news. Please try again.", sources: [] };
  }
}

export async function generateConceptMap(chapterTitle: string, chapterContent: string, terms: string[]) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the following chapter and the provided keywords.
Chapter Title: "${chapterTitle}"
Chapter Content: "${chapterContent}"
Keywords: ${terms.join(", ")}

Generate a concept map showing how these keywords relate to each other based on the chapter.
Return a JSON object with "nodes" and "links".
Each node should have an "id" (the keyword) and a "group" (number, representing a category).
Each link should have a "source" (node id), "target" (node id), and a short "label" explaining the relationship.
Only include keywords that are present or highly relevant to this specific chapter. Keep the map concise but informative.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            nodes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  group: { type: Type.NUMBER }
                },
                required: ["id", "group"]
              }
            },
            links: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  source: { type: Type.STRING },
                  target: { type: Type.STRING },
                  label: { type: Type.STRING }
                },
                required: ["source", "target", "label"]
              }
            }
          },
          required: ["nodes", "links"]
        }
      }
    });
    
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Error generating concept map:", error);
    return null;
  }
}
