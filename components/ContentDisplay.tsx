import React, { useState, useMemo } from 'react';
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
    const [typeFilter, setTypeFilter] = useState('all');
    const [toneFilter, setToneFilter] = useState('all');
    const [featureFilter, setFeatureFilter] = useState('all');

    const availableTones = useMemo(() => {
        return [...new Set(posts.map(p => p.tone))];
    }, [posts]);

    const filteredPosts = useMemo(() => {
        return posts.filter(post => {
            // Defensive check for older posts from localStorage that might not have these properties
            if (!post.postType || !post.tone) return true; 
            
            const typeMatch = typeFilter === 'all' || post.postType === typeFilter;
            const toneMatch = toneFilter === 'all' || post.tone === toneFilter;
            const featureMatch = featureFilter === 'all' ||
                (featureFilter === 'hasCaption' && !!post.caption) ||
                (featureFilter === 'hasVisual' && !!post.visualSuggestionUrl);
                
            return typeMatch && toneMatch && featureMatch;
        });
    }, [posts, typeFilter, toneFilter, featureFilter]);

    return (
        <div className="animate-fade-in">
            <h2 className="text-3xl font-bold text-onPrimary mb-6">Generated Content</h2>

            {posts.length > 0 && (
                <div className="bg-surface p-4 rounded-lg border border-border mb-6 animate-fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <label htmlFor="typeFilter" className="block text-xs font-medium text-onSurfaceSecondary mb-1">Filter by Type</label>
                            <select id="typeFilter" value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="w-full bg-background border border-border rounded-md px-2 py-1.5 text-sm focus:ring-primary focus:border-primary transition-colors">
                                <option value="all">All Types</option>
                                <option value="Reel">Reel</option>
                                <option value="Static">Static</option>
                                <option value="Carousel">Carousel</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="toneFilter" className="block text-xs font-medium text-onSurfaceSecondary mb-1">Filter by Tone</label>
                            <select id="toneFilter" value={toneFilter} onChange={e => setToneFilter(e.target.value)} className="w-full bg-background border border-border rounded-md px-2 py-1.5 text-sm focus:ring-primary focus:border-primary transition-colors">
                                <option value="all">All Tones</option>
                                {availableTones.map(tone => <option key={tone} value={tone}>{tone}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="featureFilter" className="block text-xs font-medium text-onSurfaceSecondary mb-1">Filter by Feature</label>
                            <select id="featureFilter" value={featureFilter} onChange={e => setFeatureFilter(e.target.value)} className="w-full bg-background border border-border rounded-md px-2 py-1.5 text-sm focus:ring-primary focus:border-primary transition-colors">
                                <option value="all">All Features</option>
                                <option value="hasCaption">Has Caption</option>
                                <option value="hasVisual">Has Visual</option>
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={() => {
                                    setTypeFilter('all');
                                    setToneFilter('all');
                                    setFeatureFilter('all');
                                }}
                                className="w-full text-center px-3 py-1.5 border border-border text-sm font-medium rounded-md text-onSurfaceSecondary bg-surface hover:bg-white/5 disabled:opacity-50 transition-colors"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-6">
                {filteredPosts.length > 0 ? (
                    filteredPosts.map((post, index) => (
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
                    ))
                ) : (
                    posts.length > 0 && (
                        <div className="text-center py-10 border-2 border-dashed border-border rounded-lg">
                            <h3 className="text-lg font-semibold text-onPrimary">No posts match your filters.</h3>
                            <p className="text-onSurfaceSecondary mt-1">Try adjusting or clearing the filters.</p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default ContentDisplay;