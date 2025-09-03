import React, { useState, useCallback, useEffect } from 'react';
import { UserInput, AnalysisResult, GenerationSettings, Post, AppStep, Project } from './types';
import * as geminiService from './services/geminiService';

import Sidebar from './components/Sidebar';
import UserInputForm from './components/UserInputForm';
import AnalysisStep from './components/AnalysisStep';
import ContentDisplay from './components/ContentDisplay';
import HistoryPanel from './components/HistoryPanel';
import Loader from './components/Loader';
import ContentCalendar from './components/ContentCalendar';
import PostDetailModal from './components/PostDetailModal';
import LoginScreen from './components/LoginScreen';
import ProjectDashboard from './components/ProjectDashboard';
import ApiSettings from './components/ApiSettings';

const App: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [apiKey, setApiKey] = useState<string>('');
    const [step, setStep] = useState<AppStep>('login');
    const [projects, setProjects] = useState<Project[]>([]);
    const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

    // State for the current content generation flow within a project
    const [currentCampaignInput, setCurrentCampaignInput] = useState<UserInput | null>(null);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [generationSettings, setGenerationSettings] = useState<GenerationSettings | null>(null);
    
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const [viewingPost, setViewingPost] = useState<Post | null>(null);
    
    // Loading states for various actions
    const [regeneratingPostId, setRegeneratingPostId] = useState<string | null>(null);
    const [generatingCaptionPostId, setGeneratingCaptionPostId] = useState<string | null>(null);
    const [refiningCaptionPostId, setRefiningCaptionPostId] = useState<string | null>(null);
    const [shorteningPostId, setShorteningPostId] = useState<string | null>(null);
    const [generatingVisualSuggestionPostId, setGeneratingVisualSuggestionPostId] = useState<string | null>(null);
    const [generatingVariationsPostId, setGeneratingVariationsPostId] = useState<string | null>(null);
    const [predictingEngagementPostId, setPredictingEngagementPostId] = useState<string | null>(null);

    const activeProject = projects.find(p => p.id === activeProjectId);

    // Load state from localStorage on initial render
    useEffect(() => {
        const loggedIn = localStorage.getItem('isAuthenticated') === 'true';
        if (loggedIn) {
            const savedKey = localStorage.getItem('apiKey') || '';
            setApiKey(savedKey);
            geminiService.init(savedKey);

            setIsAuthenticated(true);
            const savedProjects = localStorage.getItem('projects');
            if (savedProjects) {
                setProjects(JSON.parse(savedProjects));
            }
            setStep('projectDashboard');
        }
    }, []);

    // Persist projects to localStorage whenever they change
    useEffect(() => {
        if (isAuthenticated && projects.length > 0) {
            localStorage.setItem('projects', JSON.stringify(projects));
        }
    }, [projects, isAuthenticated]);

    const handleSaveApiKey = (key: string) => {
        setApiKey(key);
        localStorage.setItem('apiKey', key);
        geminiService.init(key);
        // Navigate away from settings after saving
        if (activeProjectId) {
            setStep('input');
        } else {
            setStep('projectDashboard');
        }
    };

    const handleLogin = () => {
        localStorage.setItem('isAuthenticated', 'true');
        setIsAuthenticated(true);
        setStep('projectDashboard');
    };

    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('projects');
        localStorage.removeItem('apiKey');
        setIsAuthenticated(false);
        setStep('login');
        setProjects([]);
        setActiveProjectId(null);
        setApiKey('');
        geminiService.init('');
    };

    const handleCreateProject = (name: string, brandInfo: UserInput) => {
        const newProject: Project = {
            id: crypto.randomUUID(),
            name,
            brandInfo,
            generatedPosts: [],
            scheduledPosts: {},
            history: [],
        };
        setProjects(prev => [...prev, newProject]);
        setActiveProjectId(newProject.id);
        setStep('input');
    };

    const handleSelectProject = (projectId: string) => {
        setActiveProjectId(projectId);
        setStep('input');
    };
    
    const handleSwitchProject = () => {
        setActiveProjectId(null);
        setStep('projectDashboard');
    };

    const handleNewCampaign = () => {
        if (!activeProject) return;
        setStep('input');
        setCurrentCampaignInput(activeProject.brandInfo);
        setAnalysisResult(null);
        setGenerationSettings(null);
    };

    // Generic function to update the active project, memoized for stability
    const updateActiveProject = useCallback((updateFn: (project: Project) => Project) => {
        setProjects(prevProjects => 
            prevProjects.map(p => p.id === activeProjectId ? updateFn(p) : p)
        );
    }, [activeProjectId]);
    
    const checkApiKey = () => {
        if (!geminiService.isServiceInitialized()) {
            setError("Please set your Gemini API key in the API Settings page before generating content.");
            setStep('apiSettings');
            return false;
        }
        return true;
    };

    const handleAnalyze = async (input: UserInput) => {
        if (!checkApiKey()) return;
        setIsLoading(true);
        setError(null);
        setCurrentCampaignInput(input);
        try {
            const result = await geminiService.analyzeContent(input);
            setAnalysisResult(result);
            setStep('analysis');
        } catch (err) {
            setError('Failed to analyze content. Please check your API key and try again.');
            console.error(err);
            setStep('input');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerate = async (settings: GenerationSettings) => {
        if (!currentCampaignInput || !analysisResult || !activeProjectId || !checkApiKey()) return;
        setIsLoading(true);
        setError(null);
        setGenerationSettings(settings);
        try {
            const posts = await geminiService.generatePosts(currentCampaignInput, settings, analysisResult.suggestedCTAs);
            updateActiveProject(project => ({
                ...project,
                generatedPosts: [...posts, ...project.generatedPosts],
                history: [...posts, ...project.history],
            }));
            setStep('generation');
        } catch (err) {
            setError('Failed to generate posts. Please check your API key and try again.');
            console.error(err);
            setStep('analysis');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegeneratePost = useCallback(async (postId: string, instruction: string) => {
        if (!activeProject || !generationSettings || !checkApiKey()) return;
        setRegeneratingPostId(postId);
        setError(null);
        const postToRegenerate = activeProject.generatedPosts.find(p => p.id === postId);
        if (!postToRegenerate) return;

        try {
            const newContent = await geminiService.regeneratePost(postToRegenerate, activeProject.brandInfo, instruction, generationSettings.language);
            
            const updatedPost: Post = { 
                ...postToRegenerate, 
                content: newContent,
                caption: undefined, visualSuggestionUrl: undefined, variations: undefined, engagementPrediction: undefined,
            };

            updateActiveProject(proj => ({
                ...proj,
                generatedPosts: proj.generatedPosts.map(p => p.id === postId ? updatedPost : p),
                scheduledPosts: Object.fromEntries(Object.entries(proj.scheduledPosts).map(([date, posts]) => [date, posts.map(p => p.id === postId ? updatedPost : p)])),
                history: [updatedPost, ...proj.history.filter(p => p.id !== postId)],
            }));

        } catch (err) {
            setError('Failed to regenerate post. Please try again.');
        } finally {
            setRegeneratingPostId(null);
        }
    }, [activeProject, generationSettings, updateActiveProject]);


    const handleGenerateCaption = useCallback(async (postId: string) => {
        if (!activeProject || !generationSettings || !checkApiKey()) return;
        setGeneratingCaptionPostId(postId);
        const postToUpdate = activeProject.generatedPosts.find(p => p.id === postId);
        if (!postToUpdate) return;
        
        try {
            const caption = await geminiService.generateCaption(postToUpdate.content, activeProject.brandInfo, generationSettings.language);
            updateActiveProject(proj => ({...proj, generatedPosts: proj.generatedPosts.map(p => p.id === postId ? { ...p, caption } : p)}));
        } catch (err) {
            setError('Failed to generate caption.');
        } finally {
            setGeneratingCaptionPostId(null);
        }
    }, [activeProject, generationSettings, updateActiveProject]);

    const handleRefineCaption = useCallback(async (postId: string, instruction: string) => {
        if (!activeProject || !generationSettings || !checkApiKey()) return;
        setRefiningCaptionPostId(postId);
        const postToUpdate = activeProject.generatedPosts.find(p => p.id === postId);
        if (!postToUpdate || !postToUpdate.caption) return;

        try {
            const newCaption = await geminiService.refineCaption(postToUpdate.content, postToUpdate.caption, instruction, activeProject.brandInfo, generationSettings.language);
            updateActiveProject(proj => ({ ...proj, generatedPosts: proj.generatedPosts.map(p => p.id === postId ? { ...p, caption: newCaption } : p) }));
        } catch (err) {
            setError('Failed to refine caption.');
        } finally {
            setRefiningCaptionPostId(null);
        }
    }, [activeProject, generationSettings, updateActiveProject]);
    
    const handleShortenContent = useCallback(async (postId: string) => {
        if (!activeProject || !checkApiKey()) return;
        setShorteningPostId(postId);
        const postToUpdate = activeProject.generatedPosts.find(p => p.id === postId);
        if (!postToUpdate) return;

        try {
            const newContent = await geminiService.shortenPostContent(postToUpdate.content);
            updateActiveProject(proj => ({...proj, generatedPosts: proj.generatedPosts.map(p => p.id === postId ? { ...p, content: newContent } : p) }));
        } catch (err) {
            setError('Failed to shorten post content.');
        } finally {
            setShorteningPostId(null);
        }
    }, [activeProject, updateActiveProject]);

    const handleGenerateVisualSuggestion = useCallback(async (postId: string) => {
        if (!activeProject || !checkApiKey()) return;
        setGeneratingVisualSuggestionPostId(postId);
        const postToUpdate = activeProject.generatedPosts.find(p => p.id === postId);
        if (!postToUpdate) return;
        try {
            const imageUrl = await geminiService.generateVisualSuggestion(postToUpdate.content);
            updateActiveProject(proj => ({ ...proj, generatedPosts: proj.generatedPosts.map(p => p.id === postId ? { ...p, visualSuggestionUrl: imageUrl } : p)}));
        } catch (err) {
            setError('Failed to generate visual suggestion.');
        } finally {
            setGeneratingVisualSuggestionPostId(null);
        }
    }, [activeProject, updateActiveProject]);
    
    const handleGenerateVariations = useCallback(async (postId: string) => {
        if (!activeProject || !generationSettings || !checkApiKey()) return;
        setGeneratingVariationsPostId(postId);
        const postToUpdate = activeProject.generatedPosts.find(p => p.id === postId);
        if (!postToUpdate) return;
        try {
            const variations = await geminiService.generatePostVariations(postToUpdate.content, generationSettings.language);
            updateActiveProject(proj => ({ ...proj, generatedPosts: proj.generatedPosts.map(p => p.id === postId ? { ...p, variations } : p)}));
        } catch (err) {
            setError('Failed to generate post variations.');
        } finally {
            setGeneratingVariationsPostId(null);
        }
    }, [activeProject, generationSettings, updateActiveProject]);

    const handlePredictEngagement = useCallback(async (postId: string) => {
        if (!activeProject || !checkApiKey()) return;
        setPredictingEngagementPostId(postId);
        const postToUpdate = activeProject.generatedPosts.find(p => p.id === postId);
        if (!postToUpdate) return;
        try {
            const prediction = await geminiService.predictEngagement(postToUpdate.content);
            updateActiveProject(proj => ({...proj, generatedPosts: proj.generatedPosts.map(p => p.id === postId ? { ...p, engagementPrediction: prediction } : p)}));
        } catch (err) {
            setError('Failed to predict engagement.');
        } finally {
            setPredictingEngagementPostId(null);
        }
    }, [activeProject, updateActiveProject]);

    // --- CALENDAR HANDLERS ---
    const handleSaveForCalendar = useCallback((postId: string) => {
        updateActiveProject(proj => ({ ...proj, generatedPosts: proj.generatedPosts.map(p => p.id === postId ? { ...p, isSaved: true } : p)}));
        setStep('calendar');
    }, [updateActiveProject]);

    const handleSchedulePost = useCallback((post: Post, date: string) => {
        updateActiveProject(proj => {
            const datePosts = proj.scheduledPosts[date] ? [...proj.scheduledPosts[date], post] : [post];
            return { ...proj, scheduledPosts: { ...proj.scheduledPosts, [date]: datePosts }};
        });
    }, [updateActiveProject]);

    const handleUnschedulePost = useCallback((postToUnschedule: Post, date: string) => {
        updateActiveProject(proj => {
            const newScheduled = { ...proj.scheduledPosts };
            const datePosts = (newScheduled[date] || []).filter(p => p.id !== postToUnschedule.id);
            if (datePosts.length > 0) {
                newScheduled[date] = datePosts;
            } else {
                delete newScheduled[date];
            }
            return { ...proj, scheduledPosts: newScheduled };
        });
    }, [updateActiveProject]);

    const handleReschedulePost = useCallback((post: Post, oldDate: string, newDate: string) => {
        updateActiveProject(proj => {
            const newScheduled = { ...proj.scheduledPosts };
            const oldDatePosts = (newScheduled[oldDate] || []).filter(p => p.id !== post.id);
            if (oldDatePosts.length > 0) newScheduled[oldDate] = oldDatePosts; else delete newScheduled[oldDate];
            const newDatePosts = newScheduled[newDate] ? [...newScheduled[newDate], post] : [post];
            newScheduled[newDate] = newDatePosts;
            return { ...proj, scheduledPosts: newScheduled };
        });
    }, [updateActiveProject]);

    const handleViewPost = (post: Post) => setViewingPost(post);
    const handleClosePostModal = () => setViewingPost(null);

    const renderContent = () => {
        if (!activeProject) return null;

        if (step === 'apiSettings') {
            return <ApiSettings currentApiKey={apiKey} onSave={handleSaveApiKey} />;
        }

        if (isLoading && (step === 'input' || step === 'analysis')) {
            return <div className="flex justify-center items-center h-full"><Loader /></div>;
        }

        switch (step) {
            case 'input':
                return <UserInputForm onSubmit={handleAnalyze} isLoading={isLoading} initialData={activeProject.brandInfo} />;
            case 'analysis':
                return analysisResult && <AnalysisStep analysisResult={analysisResult} onSubmit={handleGenerate} isLoading={isLoading} />;
            case 'generation':
                return (
                   <ContentDisplay 
                        posts={activeProject.generatedPosts}
                        onRegenerate={handleRegeneratePost}
                        onGenerateCaption={handleGenerateCaption}
                        onRefineCaption={handleRefineCaption}
                        onShortenContent={handleShortenContent}
                        onGenerateVisualSuggestion={handleGenerateVisualSuggestion}
                        onGenerateVariations={handleGenerateVariations}
                        onPredictEngagement={handlePredictEngagement}
                        onSaveForCalendar={handleSaveForCalendar}
                        regeneratingPostId={regeneratingPostId}
                        generatingCaptionPostId={generatingCaptionPostId}
                        refiningCaptionPostId={refiningCaptionPostId}
                        shorteningPostId={shorteningPostId}
                        generatingVisualSuggestionPostId={generatingVisualSuggestionPostId}
                        generatingVariationsPostId={generatingVariationsPostId}
                        predictingEngagementPostId={predictingEngagementPostId}
                   />
                );
            case 'calendar':
                const allScheduledPostIds = new Set(Object.values(activeProject.scheduledPosts).flat().map(p => p.id));
                const unscheduledPosts = activeProject.generatedPosts.filter(p => p.isSaved && !allScheduledPostIds.has(p.id));
                return (
                    <ContentCalendar
                        scheduledPosts={activeProject.scheduledPosts}
                        unscheduledPosts={unscheduledPosts}
                        onSchedulePost={handleSchedulePost}
                        onUnschedulePost={handleUnschedulePost}
                        onReschedulePost={handleReschedulePost}
                        onViewPost={handleViewPost}
                    />
                );
            default:
                return null;
        }
    };
    
    if (!isAuthenticated) {
        return <LoginScreen onLogin={handleLogin} />;
    }

    if (!activeProject && step !== 'projectDashboard') {
        // If no active project, always show dashboard (unless logging out)
        return <ProjectDashboard projects={projects} onCreateProject={handleCreateProject} onSelectProject={handleSelectProject} />;
    }

    if(step === 'projectDashboard') {
        return <ProjectDashboard projects={projects} onCreateProject={handleCreateProject} onSelectProject={handleSelectProject} />;
    }


    return (
        <div className="min-h-screen flex bg-background">
            <Sidebar 
                currentStep={step} 
                onNewCampaign={handleNewCampaign} 
                onNavigate={setStep} 
                onLogout={handleLogout}
                projectName={activeProject?.name || 'No Project'}
                onSwitchProject={handleSwitchProject}
            />
            <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                {error && (
                    <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md relative mb-6 animate-fade-in" role="alert">
                       <span className="block sm:inline">{error}</span>
                         <button onClick={() => setError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3">
                            <svg className="fill-current h-6 w-6 text-red-400" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
                        </button>
                    </div>
                )}
                
                <div className="flex flex-col md:flex-row gap-8 h-full">
                    <div className="flex-grow">
                        {renderContent()}
                    </div>
                    {step === 'generation' && activeProject && (
                        <aside className="w-full md:w-1/3 lg:w-1/4 animate-fade-in flex-shrink-0">
                            <HistoryPanel history={activeProject.history} />
                        </aside>
                    )}
                </div>
            </main>
            {viewingPost && <PostDetailModal post={viewingPost} onClose={handleClosePostModal} />}
        </div>
    );
};

export default App;