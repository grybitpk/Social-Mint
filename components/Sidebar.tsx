import React from 'react';
import { AppStep } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';
import { InputIcon } from './icons/InputIcon';
import { AnalysisIcon } from './icons/AnalysisIcon';
import { GenerationIcon } from './icons/GenerationIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { LogoutIcon } from './icons/LogoutIcon';
import { SettingsIcon } from './icons/SettingsIcon';

interface SidebarProps {
    currentStep: AppStep;
    onNewCampaign: () => void;
    onNavigate: (step: AppStep) => void;
    onLogout: () => void;
    projectName: string;
    onSwitchProject: () => void;
}

const NavLink: React.FC<{ icon: React.ReactNode; label: string; isActive?: boolean; isDisabled?: boolean; onClick: () => void; }> = ({ icon, label, isActive, isDisabled, onClick }) => (
    <a 
        href="#"
        onClick={(e) => {
            e.preventDefault();
            if (!isDisabled) onClick();
        }}
        className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors 
            ${isActive ? 'bg-surface text-onPrimary' : 'text-onSurfaceSecondary'}
            ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-surface/50 hover:text-onSurface'}
        `}
    >
        {icon}
        <span className="ml-3">{label}</span>
        {isDisabled && <span className="ml-auto text-[9px] bg-zinc-700 text-zinc-300 px-1.5 py-0.5 rounded-full">SOON</span>}
    </a>
);

const Sidebar: React.FC<SidebarProps> = ({ currentStep, onNewCampaign, onNavigate, onLogout, projectName, onSwitchProject }) => {
    const isWorkflowDisabled = currentStep === 'apiSettings';
    
    return (
        <aside className="w-64 flex-shrink-0 bg-surface/50 border-r border-border p-4 flex flex-col">
            <div>
                <div className="flex items-center h-16 px-2">
                    <SparklesIcon className="h-8 w-8 text-primary" />
                    <h1 className="ml-3 text-xl font-bold text-onPrimary">
                        AI Content Studio
                    </h1>
                </div>
                <div className="mt-4 p-3 bg-background rounded-lg text-center border border-border">
                    <span className="text-xs font-semibold text-onSurfaceSecondary uppercase tracking-wider">Project</span>
                    <p className="font-bold text-onPrimary truncate mt-1">{projectName}</p>
                    <button onClick={onSwitchProject} className="text-xs text-secondary hover:underline mt-2">Switch Project</button>
                </div>
            </div>
            <nav className="flex-grow mt-8 space-y-2">
                 <p className="px-4 pt-4 pb-2 text-xs font-semibold text-onSurfaceSecondary uppercase tracking-wider">Workflow</p>
                <NavLink icon={<InputIcon className="h-5 w-5" />} label="1. User Input" isActive={currentStep === 'input'} onClick={() => onNavigate('input')} isDisabled={isWorkflowDisabled} />
                <NavLink icon={<AnalysisIcon className="h-5 w-5" />} label="2. AI Analysis" isActive={currentStep === 'analysis'} onClick={() => onNavigate('analysis')} isDisabled={currentStep === 'input' || isWorkflowDisabled}/>
                <NavLink icon={<GenerationIcon className="h-5 w-5" />} label="3. Generation" isActive={currentStep === 'generation'} onClick={() => onNavigate('generation')} isDisabled={(currentStep !== 'generation' && currentStep !== 'calendar') || isWorkflowDisabled}/>
                
                <p className="px-4 pt-4 pb-2 text-xs font-semibold text-onSurfaceSecondary uppercase tracking-wider">Tools</p>
                <NavLink icon={<CalendarIcon className="h-5 w-5" />} label="Content Calendar" isActive={currentStep === 'calendar'} isDisabled={isWorkflowDisabled} onClick={() => onNavigate('calendar')} />
                
                <p className="px-4 pt-4 pb-2 text-xs font-semibold text-onSurfaceSecondary uppercase tracking-wider">Settings</p>
                <NavLink icon={<SettingsIcon className="h-5 w-5" />} label="API Settings" isActive={currentStep === 'apiSettings'} onClick={() => onNavigate('apiSettings')} />

            </nav>
            <div className="mt-auto space-y-2">
                 <button
                    onClick={onNewCampaign}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-onPrimary bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary"
                >
                    + New Campaign
                </button>
                <button
                    onClick={onLogout}
                    className="w-full flex items-center justify-center px-4 py-2 border border-border text-sm font-medium rounded-md text-onSurfaceSecondary bg-surface hover:bg-white/5 transition-colors"
                >
                    <LogoutIcon className="h-5 w-5 mr-2" />
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;