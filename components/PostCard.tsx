import React, { useState } from 'react';
import { Post } from '../types';
import { CopyIcon } from './icons/CopyIcon';
import { RefreshIcon } from './icons/RefreshIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { EditIcon } from './icons/EditIcon';
import { ShortenIcon } from './icons/ShortenIcon';
import { ImageIcon } from './icons/ImageIcon';
import { VariationsIcon } from './icons/VariationsIcon';
import { GaugeIcon } from './icons/GaugeIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { SaveIcon } from './icons/SaveIcon';


interface PostCardProps {
    post: Post;
    onRegenerate: (instruction: string) => void;
    onGenerateCaption: () => void;
    onRefineCaption: (instruction: string) => void;
    onShortenContent: () => void;
    onGenerateVisualSuggestion: () => void;
    onGenerateVariations: () => void;
    onPredictEngagement: () => void;
    onSaveForCalendar: () => void;
    isRegenerating: boolean;
    isGeneratingCaption: boolean;
    isRefiningCaption: boolean;
    isShortening: boolean;
    isGeneratingVisualSuggestion: boolean;
    isGeneratingVariations: boolean;
    isPredictingEngagement: boolean;
}

const PostCard: React.FC<PostCardProps> = ({ 
    post, 
    onRegenerate, 
    onGenerateCaption,
    onRefineCaption, 
    onShortenContent,
    onGenerateVisualSuggestion,
    onGenerateVariations,
    onPredictEngagement,
    onSaveForCalendar,
    isRegenerating, 
    isGeneratingCaption,
    isRefiningCaption,
    isShortening,
    isGeneratingVisualSuggestion,
    isGeneratingVariations,
    isPredictingEngagement,
}) => {
    const [copied, setCopied] = useState(false);
    const [editInstruction, setEditInstruction] = useState('');
    const [isPromptingRegen, setIsPromptingRegen] = useState(false);
    const [regenInstruction, setRegenInstruction] = useState('');
    const [activeFeature, setActiveFeature] = useState<string | null>(null);

    const getCaptionAsText = () => {
        if (!post.caption) return '';
        const { paragraph, ctaText, destinationUrl, tags } = post.caption;
        return `
CAPTION:
${paragraph}

CTA: ${ctaText}
URL: ${destinationUrl}

TAGS:
${tags.map(t => `#${t}`).join(' ')}
        `.trim();
    }

    const handleCopy = () => {
        const fullContent = `POST CONTENT:\n${post.content}\n\n${getCaptionAsText()}`;
        navigator.clipboard.writeText(fullContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    
    const handleDownload = () => {
        const fullContent = `POST CONTENT:\n${post.content}\n\n${getCaptionAsText()}`;
        const blob = new Blob([fullContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `post_${post.id}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleRefineSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editInstruction.trim()) {
            onRefineCaption(editInstruction);
            setEditInstruction('');
        }
    };

    const handleRegenerateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onRegenerate(regenInstruction);
        setIsPromptingRegen(false);
        setRegenInstruction('');
    };

    const handleFeatureClick = (feature: string) => {
        if (feature === 'visual') onGenerateVisualSuggestion();
        if (feature === 'variations') onGenerateVariations();
        if (feature === 'engagement') onPredictEngagement();
        setActiveFeature(prev => prev === feature ? null : feature);
    }

    const SmallLoader: React.FC = () => (
      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    );

    const FeatureButton: React.FC<{icon: React.ReactNode, label: string, onClick: () => void, isLoading: boolean, isDisabled?: boolean, comingSoon?: boolean}> = ({icon, label, onClick, isLoading, isDisabled, comingSoon}) => (
        <button
            onClick={onClick}
            disabled={isLoading || isDisabled}
            className="flex items-center w-full sm:w-auto justify-center px-3 py-1.5 border border-border text-xs font-medium rounded-md text-onSurface bg-surface hover:bg-white/5 disabled:opacity-50 transition-colors relative"
            title={comingSoon ? `${label} (Coming Soon)`: label}
        >
            {isLoading ? <SmallLoader /> : icon}
            <span className="ml-1.5">{label}</span>
            {comingSoon && <span className="absolute -top-1.5 -right-1.5 text-[8px] bg-secondary text-white px-1 rounded-full">SOON</span>}
        </button>
    );

    return (
        <div className="bg-surface rounded-xl border border-border overflow-hidden transition-all duration-300 hover:border-primary/50 relative">
            {(isRegenerating && !isPromptingRegen) && (
                <div className="absolute inset-0 bg-surface/80 flex items-center justify-center z-10">
                    <div className="flex items-center text-primary font-semibold">
                       <SmallLoader />
                       <span className="ml-2">Regenerating...</span>
                    </div>
                </div>
            )}
            <div className="p-6">
                <div className="prose prose-invert max-w-none">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-onSurfaceSecondary text-sm">Post Content</h4>
                        <button
                            onClick={onShortenContent}
                            disabled={isShortening}
                            className="flex items-center px-2 py-1 border border-border text-xs font-medium rounded-md text-onSurfaceSecondary bg-surface hover:bg-white/5 hover:text-onSurface disabled:opacity-50 transition-colors"
                            title="Shorten content"
                        >
                            {isShortening ? <SmallLoader /> : <ShortenIcon className="w-4 h-4 mr-1.5" />}
                            Shorten
                        </button>
                    </div>
                    <p className="text-onSurface whitespace-pre-wrap">{post.content}</p>
                </div>

                {/* ADVANCED FEATURES */}
                <div className="mt-4 pt-4 border-t border-border">
                    <h4 className="font-semibold text-onSurfaceSecondary text-sm mb-3">Advanced Features</h4>
                    <div className="flex flex-wrap gap-2">
                        <FeatureButton icon={<ImageIcon className="w-4 h-4" />} label="Suggest Visual" onClick={() => handleFeatureClick('visual')} isLoading={isGeneratingVisualSuggestion} />
                        <FeatureButton icon={<VariationsIcon className="w-4 h-4" />} label="Generate Variations" onClick={() => handleFeatureClick('variations')} isLoading={isGeneratingVariations} />
                        <FeatureButton icon={<GaugeIcon className="w-4 h-4" />} label="Predict Engagement" onClick={() => handleFeatureClick('engagement')} isLoading={isPredictingEngagement} />
                        <FeatureButton icon={<CalendarIcon className="w-4 h-4" />} label="Schedule" onClick={() => {}} isLoading={false} isDisabled={true} comingSoon={true} />
                    </div>

                    {activeFeature && (
                        <div className="mt-4 p-4 bg-background rounded-lg border border-border animate-fade-in">
                            {activeFeature === 'visual' && (
                                <>
                                    <h5 className="text-sm font-semibold mb-2 text-onSurface">AI Visual Suggestion</h5>
                                    {isGeneratingVisualSuggestion && <div className="flex items-center text-onSurfaceSecondary text-sm"><SmallLoader /><span className="ml-2">Generating image...</span></div>}
                                    {post.visualSuggestionUrl && <img src={post.visualSuggestionUrl} alt="AI visual suggestion" className="rounded-md w-full aspect-square object-cover" />}
                                </>
                            )}
                             {activeFeature === 'variations' && (
                                <>
                                    <h5 className="text-sm font-semibold mb-2 text-onSurface">Post Variations</h5>
                                    {isGeneratingVariations && <div className="flex items-center text-onSurfaceSecondary text-sm"><SmallLoader /><span className="ml-2">Generating variations...</span></div>}
                                    {post.variations && (
                                        <div className="space-y-4 text-xs">
                                            <div>
                                                <p className="font-bold text-onSurfaceSecondary">Twitter:</p>
                                                <p className="text-onSurface whitespace-pre-wrap">{post.variations.twitter}</p>
                                            </div>
                                            <div>
                                                <p className="font-bold text-onSurfaceSecondary">LinkedIn Post:</p>
                                                <p className="text-onSurface whitespace-pre-wrap">{post.variations.linkedIn}</p>
                                            </div>
                                            <div>
                                                <p className="font-bold text-onSurfaceSecondary">LinkedIn Article:</p>
                                                <p className="text-onSurface whitespace-pre-wrap">{post.variations.linkedInArticle}</p>
                                            </div>
                                             <div>
                                                <p className="font-bold text-onSurfaceSecondary">Pinterest Description:</p>
                                                <p className="text-onSurface whitespace-pre-wrap">{post.variations.pinterestDescription}</p>
                                            </div>
                                            <div>
                                                <p className="font-bold text-onSurfaceSecondary">Reel Script:</p>
                                                <p className="text-onSurface whitespace-pre-wrap">{post.variations.reelScript}</p>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                             {activeFeature === 'engagement' && (
                                <>
                                    <h5 className="text-sm font-semibold mb-2 text-onSurface">Engagement Prediction</h5>
                                    {isPredictingEngagement && <div className="flex items-center text-onSurfaceSecondary text-sm"><SmallLoader /><span className="ml-2">Analyzing...</span></div>}
                                    {post.engagementPrediction && (
                                        <div className="space-y-2">
                                            <p className="font-semibold text-onSurfaceSecondary">Score: <span className="text-lg font-bold text-primary">{post.engagementPrediction.score}/10</span></p>
                                            <p className="font-semibold text-onSurfaceSecondary">Feedback: <span className="font-normal text-onSurface">{post.engagementPrediction.feedback}</span></p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>

                {post.caption && (
                    <div className="mt-4 pt-4 border-t border-border space-y-4">
                        <div>
                           <h4 className="font-semibold text-onSurfaceSecondary text-sm mb-2">Generated Caption</h4>
                           <p className="text-onSurface whitespace-pre-wrap">{post.caption.paragraph}</p>
                        </div>
                        <div className="flex gap-4 text-sm">
                            <div className="font-semibold text-onSurfaceSecondary">CTA: <span className="font-normal text-primary">{post.caption.ctaText}</span></div>
                             <div className="font-semibold text-onSurfaceSecondary">URL: <span className="font-normal text-primary underline">{post.caption.destinationUrl}</span></div>
                        </div>
                         <div>
                            <h4 className="font-semibold text-onSurfaceSecondary text-sm mb-2">Hashtags</h4>
                            <div className="flex flex-wrap gap-2">
                                {post.caption.tags.map((tag, i) => (
                                    <span key={i} className="px-2 py-0.5 bg-background border border-border text-onSurfaceSecondary text-xs rounded">#{tag}</span>
                                ))}
                            </div>
                        </div>
                         <form onSubmit={handleRefineSubmit} className="pt-2 flex gap-2">
                           <input
                               type="text"
                               value={editInstruction}
                               onChange={(e) => setEditInstruction(e.target.value)}
                               placeholder="e.g., add offer to 40%"
                               className="flex-grow px-3 py-1.5 bg-background border border-border rounded-md shadow-sm placeholder-onSurfaceSecondary focus:outline-none focus:ring-primary focus:border-primary text-xs"
                               disabled={isRefiningCaption}
                           />
                           <button
                               type="submit"
                               disabled={isRefiningCaption || !editInstruction.trim()}
                               className="flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-onPrimary bg-primary/80 hover:bg-primary disabled:opacity-50 transition-colors"
                           >
                               {isRefiningCaption ? <SmallLoader /> : <EditIcon className="w-4 h-4 mr-1.5" />}
                               Refine
                           </button>
                       </form>
                    </div>
                )}
                
                <div className="mt-4 pt-4 border-t border-border">
                    <h4 className="font-semibold text-onSurfaceSecondary text-sm mb-2">Suggested CTAs</h4>
                    <div className="flex flex-wrap gap-2">
                        {post.ctas.map((cta, i) => (
                            <span key={i} className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">{cta}</span>
                        ))}
                    </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-2 justify-between items-center">
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                         {!isPromptingRegen ? (
                            <button onClick={() => setIsPromptingRegen(true)} disabled={isRegenerating} className="flex items-center px-3 py-1.5 border border-border text-xs font-medium rounded-md text-onSurface bg-surface hover:bg-white/5 disabled:opacity-50 transition-colors">
                                {isRegenerating ? <SmallLoader /> : <RefreshIcon className="w-4 h-4 mr-1.5" />}
                                Generate Again
                            </button>
                        ) : (
                            <div className="w-full animate-fade-in">
                                <form onSubmit={handleRegenerateSubmit} className="space-y-2">
                                    <textarea
                                        value={regenInstruction}
                                        onChange={(e) => setRegenInstruction(e.target.value)}
                                        placeholder="Add specific instructions to guide the regeneration..."
                                        className="block w-full px-3 py-1.5 bg-background border border-border rounded-md shadow-sm placeholder-onSurfaceSecondary focus:outline-none focus:ring-primary focus:border-primary text-xs"
                                        rows={2}
                                        autoFocus
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            type="submit"
                                            disabled={isRegenerating}
                                            className="flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-onPrimary bg-primary hover:bg-primary-dark disabled:opacity-50 transition-colors"
                                        >
                                            {isRegenerating ? <SmallLoader /> : <RefreshIcon className="w-4 h-4 mr-1.5" />}
                                            Generate
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsPromptingRegen(false)}
                                            disabled={isRegenerating}
                                            className="flex items-center px-3 py-1.5 border border-border text-xs font-medium rounded-md text-onSurface bg-surface hover:bg-white/5 disabled:opacity-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {!post.caption && !isPromptingRegen && (
                            <button onClick={onGenerateCaption} disabled={isGeneratingCaption} className="flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-onPrimary bg-primary hover:bg-primary-dark disabled:bg-primary/40 transition-colors">
                                {isGeneratingCaption ? <SmallLoader /> : <SparklesIcon className="w-4 h-4 mr-1.5" />}
                                Generate Caption
                            </button>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button 
                            onClick={onSaveForCalendar} 
                            disabled={post.isSaved}
                            className="flex items-center px-3 py-1.5 border border-border text-xs font-medium rounded-md text-onSurface bg-surface hover:bg-white/5 disabled:opacity-50 disabled:cursor-default transition-colors">
                            <SaveIcon className="w-4 h-4 mr-1.5" />
                            {post.isSaved ? 'Saved' : 'Save for Calendar'}
                        </button>
                        <button onClick={handleCopy} className="flex items-center px-3 py-1.5 border border-border text-xs font-medium rounded-md text-onSurface bg-surface hover:bg-white/5 transition-colors">
                            <CopyIcon className="w-4 h-4 mr-1.5" />
                            {copied ? 'Copied!' : 'Copy'}
                        </button>
                         <button onClick={handleDownload} className="flex items-center px-3 py-1.5 border border-border text-xs font-medium rounded-md text-onSurface bg-surface hover:bg-white/5 transition-colors">
                            <DownloadIcon className="w-4 h-4 mr-1.5" />
                            Download
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostCard;