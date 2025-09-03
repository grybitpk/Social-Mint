import React from 'react';
import { Post } from '../types';
import PostCard from './PostCard';

interface ContentDisplayProps {
    posts: Post[];
    onRegenerate: (postId: string, instruction: string) => void;
    onGenerateCaption: (postId: string) => void;
    onRefineCaption: (postId: string, instruction: string) => void;
    onShortenContent: (postId: string) => void;
    onGenerateVisualSuggestion: (postId: string) => void;
    onGenerateVariations: (postId: string) => void;
    onPredictEngagement: (postId: string) => void;
    onSaveForCalendar: (postId: string) => void;
    regeneratingPostId: string | null;
    generatingCaptionPostId: string | null;
    refiningCaptionPostId: string | null;
    shorteningPostId: string | null;
    generatingVisualSuggestionPostId: string | null;
    generatingVariationsPostId: string | null;
    predictingEngagementPostId: string | null;
}

const ContentDisplay: React.FC<ContentDisplayProps> = ({ 
    posts, 
    onRegenerate, 
    onGenerateCaption, 
    onRefineCaption,
    onShortenContent,
    onGenerateVisualSuggestion,
    onGenerateVariations,
    onPredictEngagement,
    onSaveForCalendar,
    regeneratingPostId, 
    generatingCaptionPostId,
    refiningCaptionPostId,
    shorteningPostId,
    generatingVisualSuggestionPostId,
    generatingVariationsPostId,
    predictingEngagementPostId
}) => {
    return (
        <div className="animate-fade-in">
            <h2 className="text-3xl font-bold text-onPrimary mb-6">Generated Content</h2>
            <div className="space-y-6">
                {posts.map((post, index) => (
                    <div key={post.id} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                        <PostCard
                            post={post}
                            onRegenerate={(instruction) => onRegenerate(post.id, instruction)}
                            onGenerateCaption={() => onGenerateCaption(post.id)}
                            onRefineCaption={(instruction) => onRefineCaption(post.id, instruction)}
                            onShortenContent={() => onShortenContent(post.id)}
                            onGenerateVisualSuggestion={() => onGenerateVisualSuggestion(post.id)}
                            onGenerateVariations={() => onGenerateVariations(post.id)}
                            onPredictEngagement={() => onPredictEngagement(post.id)}
                            onSaveForCalendar={() => onSaveForCalendar(post.id)}
                            isRegenerating={regeneratingPostId === post.id}
                            isGeneratingCaption={generatingCaptionPostId === post.id}
                            isRefiningCaption={refiningCaptionPostId === post.id}
                            isShortening={shorteningPostId === post.id}
                            isGeneratingVisualSuggestion={generatingVisualSuggestionPostId === post.id}
                            isGeneratingVariations={generatingVariationsPostId === post.id}
                            isPredictingEngagement={predictingEngagementPostId === post.id}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ContentDisplay;