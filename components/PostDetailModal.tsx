import React from 'react';
import { Post } from '../types';
import { CloseIcon } from './icons/CloseIcon';

interface PostDetailModalProps {
    post: Post;
    onClose: () => void;
}

const PostDetailModal: React.FC<PostDetailModalProps> = ({ post, onClose }) => {
    return (
        <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="bg-surface rounded-xl border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 m-4 animate-slide-up"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-onPrimary">Post Details</h3>
                    <button onClick={onClose} className="text-onSurfaceSecondary hover:text-onSurface">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="space-y-6">
                    {/* Post Content */}
                    <div>
                        <h4 className="font-semibold text-onSurfaceSecondary text-sm mb-2">Post Content</h4>
                        <div className="prose prose-invert max-w-none p-4 bg-background rounded-md border border-border">
                             <p className="text-onSurface whitespace-pre-wrap">{post.content}</p>
                        </div>
                    </div>

                    {/* Caption */}
                    {post.caption && (
                        <div className="space-y-4">
                           <div>
                               <h4 className="font-semibold text-onSurfaceSecondary text-sm mb-2">Generated Caption</h4>
                               <p className="text-onSurface whitespace-pre-wrap p-4 bg-background rounded-md border border-border">{post.caption.paragraph}</p>
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
                        </div>
                    )}

                    {/* CTAs */}
                    <div>
                        <h4 className="font-semibold text-onSurfaceSecondary text-sm mb-2">Suggested CTAs</h4>
                        <div className="flex flex-wrap gap-2">
                            {post.ctas.map((cta, i) => (
                                <span key={i} className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">{cta}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostDetailModal;