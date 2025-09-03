
import React from 'react';
import { Post } from '../types';

interface HistoryPanelProps {
    history: Post[];
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ history }) => {
    return (
        <div className="bg-surface rounded-xl border border-border p-6 sticky top-8">
            <h3 className="text-xl font-bold text-onPrimary mb-4">Content History</h3>
            {history.length === 0 ? (
                <p className="text-onSurfaceSecondary text-sm">Your generated posts will appear here.</p>
            ) : (
                <ul className="space-y-3 max-h-[70vh] overflow-y-auto pr-2 -mr-2">
                    {history.map(post => (
                        <li key={post.id} className="text-sm p-3 bg-background rounded-md border border-border">
                            <p className="text-onSurfaceSecondary truncate">{post.content}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default HistoryPanel;