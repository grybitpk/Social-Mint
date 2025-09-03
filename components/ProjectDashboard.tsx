
import React, { useState } from 'react';
import { Project, UserInput } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';
import { CloseIcon } from './icons/CloseIcon';
import Loader from './Loader';

interface ProjectDashboardProps {
    projects: Project[];
    onCreateProject: (name: string, brandInfo: UserInput) => void;
    onSelectProject: (projectId: string) => void;
    isLoading: boolean;
}

const ProjectDashboard: React.FC<ProjectDashboardProps> = ({ projects, onCreateProject, onSelectProject, isLoading }) => {
    const [isCreating, setIsCreating] = useState(false);
    const [name, setName] = useState('');
    const [url, setUrl] = useState('');
    const [details, setDetails] = useState('');

    const handleCreateSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim() && url.trim()) {
            onCreateProject(name, { topic: name, url, details });
            setIsCreating(false);
            setName('');
            setUrl('');
            setDetails('');
        }
    };

    const ProjectCard: React.FC<{project: Project}> = ({ project }) => (
        <div 
            onClick={() => onSelectProject(project.id)}
            className="bg-surface rounded-lg border border-border p-6 cursor-pointer transition-all duration-300 hover:border-primary hover:shadow-lg hover:shadow-primary/10"
        >
            <h3 className="text-xl font-bold text-onPrimary truncate">{project.name}</h3>
            <p className="text-sm text-secondary truncate mt-1">{project.brandInfo.url}</p>
            <p className="text-xs text-onSurfaceSecondary mt-4">
                {project.generatedPosts?.length || 0} posts, {Object.keys(project.scheduledPosts || {}).length} scheduled
            </p>
        </div>
    );

    const NewProjectModal: React.FC = () => (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
            <div 
                className="bg-surface rounded-xl border border-border w-full max-w-lg m-4 p-8 animate-slide-up"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-onPrimary">Create New Project</h2>
                    <button onClick={() => setIsCreating(false)} className="text-onSurfaceSecondary hover:text-onSurface">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
                 <form onSubmit={handleCreateSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="projectName" className="block text-sm font-medium text-onSurface mb-1">Project Name</label>
                        <input
                            type="text" id="projectName" value={name} onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Summer Shoe Campaign" required
                            className="mt-1 block w-full px-3 py-2 bg-background border border-border rounded-md shadow-sm placeholder-onSurfaceSecondary focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="projectUrl" className="block text-sm font-medium text-onSurface mb-1">Website URL</label>
                        <input
                            type="url" id="projectUrl" value={url} onChange={(e) => setUrl(e.target.value)}
                            placeholder="e.g., https://www.yourbrand.com" required
                            className="mt-1 block w-full px-3 py-2 bg-background border border-border rounded-md shadow-sm placeholder-onSurfaceSecondary focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="projectDetails" className="block text-sm font-medium text-onSurface mb-1">Brand Details (Optional)</label>
                        <textarea
                            id="projectDetails" rows={3} value={details} onChange={(e) => setDetails(e.target.value)}
                            placeholder="Key brand messages, voice, target audience..."
                            className="mt-1 block w-full px-3 py-2 bg-background border border-border rounded-md shadow-sm placeholder-onSurfaceSecondary focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        />
                    </div>
                    <div className="pt-4 flex justify-end gap-4">
                        <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 border border-border text-sm font-medium rounded-md text-onSurface bg-surface hover:bg-white/5">Cancel</button>
                        <button type="submit" disabled={!name.trim() || !url.trim()} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-onPrimary bg-primary hover:bg-primary-dark disabled:bg-primary/40">Create Project</button>
                    </div>
                </form>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                     <div className="flex items-center">
                        <SparklesIcon className="h-10 w-10 text-primary" />
                        <h1 className="ml-4 text-3xl font-bold text-onPrimary">
                           Your Projects
                        </h1>
                    </div>
                    <button onClick={() => setIsCreating(true)} className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-onPrimary bg-primary hover:bg-primary-dark">
                        + New Project
                    </button>
                </div>

                {isLoading ? (
                    <div className="text-center py-20">
                        <Loader />
                    </div>
                ) : projects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                        {projects.map(p => <ProjectCard key={p.id} project={p} />)}
                    </div>
                ) : (
                    <div className="text-center py-20 border-2 border-dashed border-border rounded-lg animate-fade-in">
                        <h2 className="text-xl font-semibold text-onPrimary">No projects yet!</h2>
                        <p className="text-onSurfaceSecondary mt-2">Click "New Project" to get started.</p>
                    </div>
                )}
            </div>
            {isCreating && <NewProjectModal />}
        </div>
    );
};

export default ProjectDashboard;
