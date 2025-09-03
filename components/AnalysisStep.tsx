import React, { useState } from 'react';
import { AnalysisResult, GenerationSettings } from '../types';

interface AnalysisStepProps {
    analysisResult: AnalysisResult;
    onSubmit: (settings: GenerationSettings) => void;
    isLoading: boolean;
}

const postCounts = [1, 3, 5];
const postTypes = ['Reel', 'Static', 'Carousel'];
const tones = ['Professional', 'Bold', 'GenZ', 'Minimal', 'Luxury'];
const languages = ['English', 'Urdu', 'Arabic'];

const AnalysisStep: React.FC<AnalysisStepProps> = ({ analysisResult, onSubmit, isLoading }) => {
    const [postCount, setPostCount] = useState(3);
    const [postType, setPostType] = useState<AnalysisResult['suggestedPostFormat']>(analysisResult.suggestedPostFormat);
    const [tone, setTone] = useState<AnalysisResult['suggestedTone']>(analysisResult.suggestedTone);
    const [language, setLanguage] = useState('English');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ postCount, postType, tone, language });
    };
    
    const Card: React.FC<{title: string, value: string}> = ({title, value}) => (
        <div className="bg-surface border border-border p-4 rounded-lg text-center">
            <h4 className="text-sm font-medium text-onSurfaceSecondary">{title}</h4>
            <p className="text-lg font-semibold text-primary truncate">{value}</p>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <h2 className="text-3xl font-bold text-center text-onPrimary mb-2">Analysis Complete!</h2>
            <p className="text-center text-onSurfaceSecondary mb-8">Here's what we recommend. Adjust the settings below and generate your posts.</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <Card title="Business Type" value={analysisResult.businessType} />
                <Card title="Post Format" value={analysisResult.suggestedPostFormat} />
                <Card title="Tone of Voice" value={analysisResult.suggestedTone} />
                <Card title="Top CTA" value={analysisResult.suggestedCTAs[0] || 'Shop Now'} />
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 bg-surface p-8 rounded-lg border border-border">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                        <label htmlFor="postCount" className="block text-sm font-medium text-onSurface mb-1">Number of Posts</label>
                        <select id="postCount" value={postCount} onChange={(e) => setPostCount(Number(e.target.value))} className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-background border-border focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md">
                            {postCounts.map(count => <option key={count} value={count}>{count}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="postType" className="block text-sm font-medium text-onSurface mb-1">Post Type</label>
                         <select id="postType" value={postType} onChange={(e) => setPostType(e.target.value as AnalysisResult['suggestedPostFormat'])} className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-background border-border focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md">
                            {postTypes.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="tone" className="block text-sm font-medium text-onSurface mb-1">Style/Tone</label>
                         <select id="tone" value={tone} onChange={(e) => setTone(e.target.value as AnalysisResult['suggestedTone'])} className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-background border-border focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md">
                            {tones.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="language" className="block text-sm font-medium text-onSurface mb-1">Language</label>
                         <select id="language" value={language} onChange={(e) => setLanguage(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base bg-background border-border focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md">
                            {languages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                        </select>
                    </div>
                 </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-onPrimary bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-primary disabled:bg-primary/40 transition-colors"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Generating Posts...
                            </>
                        ) : 'Generate Content'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AnalysisStep;