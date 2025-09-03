import { GoogleGenAI, Type } from "@google/genai";
import { UserInput, AnalysisResult, Post, GenerationSettings, Caption, EngagementPrediction, PostVariations } from '../types';

let ai: GoogleGenAI | null = null;
let isInitialized = false;

export const init = (apiKey: string) => {
    if (apiKey) {
        ai = new GoogleGenAI({ apiKey });
        isInitialized = true;
    } else {
        ai = null;
        isInitialized = false;
    }
};

export const isServiceInitialized = () => isInitialized;

const getClient = (): GoogleGenAI => {
    if (!ai) {
        throw new Error("Gemini service not initialized. Please set the API key.");
    }
    return ai;
}


// --- Helper Functions ---

const parseJsonResponse = <T,>(text: string, fallback: T): T => {
    try {
        // Find the start and end of the JSON block
        const startIndex = text.indexOf('```json');
        const endIndex = text.lastIndexOf('```');

        if (startIndex === -1 || endIndex === -1 || startIndex >= endIndex) {
            // If no markdown block, assume the whole string is JSON
            return JSON.parse(text) as T;
        }

        const jsonString = text.substring(startIndex + 7, endIndex).trim();
        return JSON.parse(jsonString) as T;
    } catch (error) {
        console.error("Failed to parse JSON response:", error);
        console.error("Original text:", text);
        return fallback;
    }
};


// --- API Functions ---

export const analyzeContent = async (input: UserInput): Promise<AnalysisResult> => {
  const client = getClient();
  const prompt = `
    Analyze the provided information for a social media content strategy.
    Based on the Topic, Details, and Website URL, determine the following:

    1.  **Business Type**: A concise category for the business (e.g., "Fashion & Footwear", "Tech Startup", "Local Cafe").
    2.  **Suggested Post Format**: The best format for this content. Choose one: 'Reel', 'Static', 'Carousel'.
    3.  **Suggested Tone**: The most effective tone of voice. Choose one: 'Professional', 'Bold', 'GenZ', 'Minimal', 'Luxury'.
    4.  **Suggested CTAs**: Generate 3-4 diverse, smart, and compelling call-to-action buttons (e.g., "Step into Summer Today 🌞👟", "Your Perfect Sneakers Await 🚀"). Avoid generic CTAs like "Shop Now".

    **Input Data:**
    -   **Topic**: ${input.topic}
    -   **Details**: ${input.details}
    -   **Website URL**: ${input.url} (Infer brand name, style, and offerings from this URL)

    Return the analysis as a JSON object.
  `;

  const response = await client.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          businessType: { type: Type.STRING },
          suggestedPostFormat: { type: Type.STRING, enum: ['Reel', 'Static', 'Carousel'] },
          suggestedTone: { type: Type.STRING, enum: ['Professional', 'Bold', 'GenZ', 'Minimal', 'Luxury'] },
          suggestedCTAs: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ['businessType', 'suggestedPostFormat', 'suggestedTone', 'suggestedCTAs'],
      }
    }
  });
  
  return parseJsonResponse(response.text, { businessType: '', suggestedPostFormat: 'Static', suggestedTone: 'Professional', suggestedCTAs: [] });
};


export const generatePosts = async (input: UserInput, settings: GenerationSettings, ctas: string[]): Promise<Post[]> => {
  const client = getClient();
  const postTypeInstructions = {
    'Reel': "Generate a script-like content piece with short, engaging lines, hooks, and scene descriptions suitable for a short video.",
    'Static': "Generate a well-structured caption suitable for a single image post.",
    'Carousel': "Generate content for a multi-slide post. Provide distinct content for at least 3 slides.",
  };

  const prompt = `
    You are a social media content creator. Generate ${settings.postCount} social media post(s) in **${settings.language}** based on the provided information.

    **Core Information:**
    -   **Brand/Website**: ${input.url}
    -   **Topic**: ${input.topic}
    -   **Key Details**: ${input.details}

    **Generation Settings:**
    -   **Number of Posts to Generate**: ${settings.postCount}
    -   **Post Type**: ${settings.postType}. ${postTypeInstructions[settings.postType as keyof typeof postTypeInstructions]}
    -   **Tone of Voice**: ${settings.tone}
    -   **Language**: ${settings.language}

    **Formatting Rules:**
    -   The generated content must NOT include any hashtags (e.g., #sale).
    -   Ensure the content is well-formatted with appropriate line breaks to improve readability.
    
    For each post, provide a unique ID and the main content.
    Return the result as a JSON array of objects.
  `;

  const response = await client.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING, description: "A unique identifier string." },
                    content: { type: Type.STRING, description: "The main generated content for the post." },
                },
                required: ['id', 'content']
            }
        }
    }
  });

  const generatedPosts = parseJsonResponse<Array<{id: string; content: string}>>(response.text, []);
  
  return generatedPosts.map(p => ({
      ...p,
      id: crypto.randomUUID(),
      ctas: ctas,
      postType: settings.postType,
      tone: settings.tone,
  }));
};

export const regeneratePost = async (originalPost: Post, input: UserInput, instruction: string, language: string): Promise<string> => {
    const client = getClient();
    const prompt = `
    Regenerate a new version of a social media post in **${language}** based on the user's instruction. It should be different from the original but keep the same core topic and tone.

    **Core Information:**
    -   **Brand/Website**: ${input.url}
    -   **Topic**: ${input.topic}
    -   **Original Content (for reference)**: "${originalPost.content}"
    -   **User's Instruction for change**: "${instruction || 'Make it different.'}"
    -   **Language**: ${language}

    **Formatting Rules:**
    -   The new content must NOT include any hashtags (e.g., #sale).
    -   Ensure the content is well-formatted with appropriate line breaks to improve readability.

    Return only the new post content as a single string. Do not include any other explanatory text.
    `;
    
    const response = await client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    });

    return response.text.trim();
};

const captionSchema = {
    type: Type.OBJECT,
    properties: {
        paragraph: { type: Type.STRING, description: "A catchy paragraph for the caption." },
        ctaText: { type: Type.STRING, description: "A clear call-to-action phrase." },
        destinationUrl: { type: Type.STRING, description: "The destination website URL for the campaign." },
        tags: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "An array of exactly 20 trendy and relevant Instagram tags, without the '#' symbol."
        },
    },
    required: ['paragraph', 'ctaText', 'destinationUrl', 'tags']
};


export const generateCaption = async (postContent: string, input: UserInput, language: string): Promise<Caption> => {
    const client = getClient();
    const prompt = `
    Based on the social media post content below, generate a structured Instagram caption in **${language}**.
    The caption should reference the brand's name or offers if possible, derived from the website URL.

    **Website/Brand**: ${input.url}
    **Full Post Content**: "${postContent}"
    **Language**: ${language}

    **Instructions:**
    1.  **Paragraph**: Write a short, catchy paragraph for the caption. Use line breaks for readability.
    2.  **CTA Text**: Create a clear and compelling call-to-action.
    3.  **Destination URL**: Use the provided website URL.
    4.  **Tags**: Generate exactly 20 trendy, relevant Instagram tags. DO NOT include the '#' symbol.

    Return the result as a JSON object matching the required schema.
    `;

    const response = await client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: captionSchema,
        }
    });
    
    return parseJsonResponse(response.text, { paragraph: '', ctaText: '', destinationUrl: '', tags: [] });
};

export const refineCaption = async (postContent: string, currentCaption: Caption, instruction: string, input: UserInput, language: string): Promise<Caption> => {
    const client = getClient();
    const prompt = `
    You are editing a structured social media caption. Refine the 'Current Caption' based on the user's 'Edit Instruction'.
    The final caption should be in **${language}**, relevant to the 'Full Post Content' and the brand.

    **Website/Brand**: ${input.url}
    **Full Post Content**: "${postContent}"
    **Current Caption (JSON)**: ${JSON.stringify(currentCaption)}
    **Edit Instruction**: "${instruction}"
    **Language**: ${language}

    **Instructions:**
    -   Modify the caption components (paragraph, ctaText, destinationUrl, tags) based on the instruction.
    -   Maintain the structure of the JSON output.
    -   Ensure there are still exactly 20 relevant tags.

    Return the refined caption as a JSON object matching the required schema.
    `;

    const response = await client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: captionSchema,
        }
    });
    
    return parseJsonResponse(response.text, { paragraph: '', ctaText: '', destinationUrl: '', tags: [] });
};

export const shortenPostContent = async (originalContent: string): Promise<string> => {
    const client = getClient();
    const prompt = `
    You are a content editor. Shorten the following social media post content.
    Make it more concise and punchy, but preserve the core message, key information, and original tone.

    **Original Content**:
    "${originalContent}"

    Return only the shortened text as a single string. Do not include any other explanatory text.
    `;
    
    const response = await client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    });

    return response.text.trim();
};

export const generateVisualSuggestion = async (postContent: string): Promise<string> => {
    const client = getClient();
    const prompt = `
    Generate a high-quality, photorealistic image that visually represents the following social media post content. The image should be eye-catching and suitable for a platform like Instagram.
    
    **Post Content**: "${postContent}"
    
    Focus on creating a visually appealing scene, possibly with good lighting and composition. For example, if the topic is "Summer Sneakers", suggest sneaker mockups, lifestyle shots, or AI-made backgrounds.
    `;
    const response = await client.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '1:1',
        },
    });

    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64ImageBytes}`;
};

export const generatePostVariations = async (postContent: string, language: string): Promise<PostVariations> => {
    const client = getClient();
    const prompt = `
    Based on the social media post content below, generate five variations for different platforms in **${language}**.

    **Original Post Content**: "${postContent}"

    **Instructions:**
    1.  **Twitter**: A short, catchy version (under 280 characters).
    2.  **LinkedIn**: A professional post suitable for a business audience.
    3.  **Reel Script**: An engaging script for a short video (TikTok/Instagram), with scene ideas or hooks.
    4.  **LinkedIn Article**: A more detailed, long-form article based on the content, suitable for publishing on LinkedIn. Include a title and structured paragraphs.
    5.  **Pinterest Description**: A descriptive, keyword-rich text for a Pinterest Pin. Include relevant keywords and a call to action.

    Return the result as a JSON object.
    `;
    const response = await client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    twitter: { type: Type.STRING },
                    linkedIn: { type: Type.STRING },
                    reelScript: { type: Type.STRING },
                    linkedInArticle: { type: Type.STRING },
                    pinterestDescription: { type: Type.STRING },
                },
                required: ['twitter', 'linkedIn', 'reelScript', 'linkedInArticle', 'pinterestDescription'],
            }
        }
    });
    return parseJsonResponse(response.text, { twitter: '', linkedIn: '', reelScript: '', linkedInArticle: '', pinterestDescription: '' });
};

export const predictEngagement = async (postContent: string): Promise<EngagementPrediction> => {
    const client = getClient();
    const prompt = `
    Analyze the following social media post content and predict its engagement potential.

    **Post Content**: "${postContent}"

    **Instructions:**
    1.  **Score**: Give it an engagement score from 1 to 10 (1=low, 10=high).
    2.  **Feedback**: Provide one concise, actionable suggestion for improvement (e.g., "Add a stronger hook," "Shorten text for reels," "Include a question to encourage comments.").

    Return the result as a JSON object.
    `;
    const response = await client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    score: { type: Type.NUMBER },
                    feedback: { type: Type.STRING },
                },
                required: ['score', 'feedback'],
            }
        }
    });
    return parseJsonResponse(response.text, { score: 0, feedback: '' });
};