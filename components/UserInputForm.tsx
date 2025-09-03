
import React, { useState, useEffect } from 'react';
import { UserInput } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';

interface UserInputFormProps {
    onSubmit: (data: UserInput) => void;
    isLoading: boolean;
    initialData?: UserInput;
}

const UserInputForm: React.FC<UserInputFormProps> = ({ onSubmit, isLoading, initialData }) => {
    const [topic, setTopic] = useState('');
    const [details, setDetails] = useState('');
    const [url, setUrl] = useState('');

    useEffect(() => {
        if (initialData) {
            setTopic(initialData.topic || '');
            setDetails(initialData.details || '');
            setUrl(initialData.url || '');
        }
    }, [initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (topic && url) {
            onSubmit({ topic, details, url });
        }
    };

    return (
        <div className="max-w-3xl mx-auto animate-fade-in">
            <h2 className="text-3xl font-bold text-center text-onPrimary mb-2">Create Your Content Campaign</h2>
            <p className="text-center text-onSurfaceSecondary mb-10">Confirm your brand details below, or edit them for this specific campaign.</p>
            <form onSubmit={handleSubmit} className="space-y-6 bg-surface p-8 rounded-lg border border-border">
                <div>
                    <label htmlFor="topic" className="block text-sm font-medium text-onSurface mb-1">Topic</label>
                    <input
                        type="text"
                        id="topic"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="e.g., Summer Sale for Shoes"
                        required
                        className="mt-1 block w-full px-3 py-2 bg-background border border-border rounded-md shadow-sm placeholder-onSurfaceSecondary focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="details" className="block text-sm font-medium text-onSurface mb-1">Brand Details</label>
                    <textarea
                        id="details"
                        rows={3}
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        placeholder="e.g., 50% off all sneakers until Sunday"
                        className="mt-1 block w-full px-3 py-2 bg-background border border-border rounded-md shadow-sm placeholder-onSurfaceSecondary focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    />
                </div>
                <div>
                    <label htmlFor="url" className="block text-sm font-medium text-onSurface mb-1">Website URL</label>
                    <input
                        type="url"
                        id="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="e.g., https://www.yourbrand.com"
                        required
                        className="mt-1 block w-full px-3 py-2 bg-background border border-border rounded-md shadow-sm placeholder-onSurfaceSecondary focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    />
                </div>
                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isLoading || !topic || !url}
                        className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-onPrimary bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-primary disabled:bg-primary/40 disabled:cursor-not-allowed transition-colors"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8
 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Analyzing...
                            </>
                        ) : (
                            <>
                            <SparklesIcon className="w-5 h-5 mr-2" />
                            Analyze & Suggest
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UserInputForm;