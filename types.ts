export type AppStep = 'login' | 'projectDashboard' | 'input' | 'analysis' | 'generation' | 'calendar' | 'apiSettings';

export interface UserInput {
  topic: string;
  details: string;
  url: string;
}

export interface AnalysisResult {
  businessType: string;
  suggestedPostFormat: 'Reel' | 'Static' | 'Carousel';
  suggestedTone: 'Professional' | 'Bold' | 'GenZ' | 'Minimal' | 'Luxury';
  suggestedCTAs: string[];
}

export interface GenerationSettings {
  postCount: number;
  postType: string;
  tone: string;
  language: string;
}

export interface Caption {
    paragraph: string;
    ctaText: string;
    destinationUrl: string;
    tags: string[];
}

export interface EngagementPrediction {
    score: number; // 1-10
    feedback: string;
}

export interface PostVariations {
    twitter: string; // Short & catchy
    linkedIn: string; // Long-form professional post
    reelScript: string; // Engaging script
    linkedInArticle: string; // A full article format for LinkedIn
    pinterestDescription: string; // A descriptive text for a Pinterest Pin
}

export interface Post {
  id: string;
  content: string;
  postType: string;
  tone: string;
  caption?: Caption;
  ctas: string[];
  visualSuggestionUrl?: string;
  variations?: PostVariations;
  engagementPrediction?: EngagementPrediction;
  isSaved?: boolean;
}

export interface Project {
    id: string;
    name: string;
    brandInfo: UserInput;
    generatedPosts: Post[];
    scheduledPosts: Record<string, Post[]>;
    history: Post[];
}