import React, { useState, useEffect } from 'react';

interface ApiSettingsProps {
    currentApiKey: string;
    onSave: (apiKey: string) => void;
}

const ApiSettings: React.FC<ApiSettingsProps> = ({ currentApiKey, onSave }) => {
    const [apiKey, setApiKey] = useState('');
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        setApiKey(currentApiKey);
    }, [currentApiKey]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(apiKey);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    return (
        <div className="max-w-3xl mx-auto animate-fade-in">
            <h2 className="text-3xl font-bold text-center text-onPrimary mb-2">API Settings</h2>
            <p className="text-center text-onSurfaceSecondary mb-10">
                Manage your integration with Google's Gemini AI.
            </p>
            <form onSubmit={handleSubmit} className="space-y-6 bg-surface p-8 rounded-lg border border-border">
                <div>
                    <label htmlFor="apiKey" className="block text-sm font-medium text-onSurface mb-1">
                        Gemini API Key
                    </label>
                    <input
                        type="password"
                        id="apiKey"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="Enter your Gemini API key"
                        required
                        className="mt-1 block w-full px-3 py-2 bg-background border border-border rounded-md shadow-sm placeholder-onSurfaceSecondary focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                    />
                    <p className="mt-2 text-xs text-onSurfaceSecondary">
                        Your API key is stored securely in your browser's local storage and is never sent to our servers.
                    </p>
                </div>
                
                <div className="pt-4 flex items-center justify-between">
                    <button
                        type="submit"
                        disabled={!apiKey.trim()}
                        className="flex justify-center items-center py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-onPrimary bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface focus:ring-primary disabled:bg-primary/40 disabled:cursor-not-allowed transition-colors"
                    >
                        Save Key
                    </button>
                    {saved && <p className="text-sm text-primary animate-fade-in">API Key saved successfully!</p>}
                </div>
            </form>
        </div>
    );
};

export default ApiSettings;
