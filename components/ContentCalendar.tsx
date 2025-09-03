import React from 'react';
import { Post } from '../types';

interface ContentCalendarProps {
    scheduledPosts: Record<string, Post[]>;
    unscheduledPosts: Post[];
    onSchedulePost: (post: Post, date: string) => void;
    onUnschedulePost: (post: Post, date: string) => void;
    onReschedulePost: (post: Post, oldDate: string, newDate: string) => void;
    onViewPost: (post: Post) => void;
}

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const ContentCalendar: React.FC<ContentCalendarProps> = ({ 
    scheduledPosts, 
    unscheduledPosts,
    onSchedulePost,
    onUnschedulePost,
    onReschedulePost,
    onViewPost
}) => {
    const [currentDate, setCurrentDate] = React.useState(new Date());

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const changeMonth = (offset: number) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + offset);
            return newDate;
        });
    };
    
    // --- Drag and Drop Handlers ---
    
    const handleDragStart = (e: React.DragEvent, post: Post, originalDate: string | null) => {
        const data = JSON.stringify({ postId: post.id, originalDate });
        e.dataTransfer.setData("application/json", data);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDropOnDate = (e: React.DragEvent, date: string) => {
        e.preventDefault();
        try {
            const data = JSON.parse(e.dataTransfer.getData("application/json"));
            const { postId, originalDate } = data;
            
            const post = [...unscheduledPosts, ...Object.values(scheduledPosts).flat()].find(p => p.id === postId);

            if (post) {
                if (originalDate) { // It's a reschedule
                    if (originalDate !== date) {
                        onReschedulePost(post, originalDate, date);
                    }
                } else { // It's a new schedule from the unscheduled list
                    onSchedulePost(post, date);
                }
            }
        } catch(err) {
            console.error("Failed to handle drop:", err);
        }
    };
    
    const handleDropOnUnscheduled = (e: React.DragEvent) => {
        e.preventDefault();
        try {
            const data = JSON.parse(e.dataTransfer.getData("application/json"));
            const { postId, originalDate } = data;

            if (originalDate) { // Only posts from the calendar can be dropped here
                const post = Object.values(scheduledPosts).flat().find(p => p.id === postId);
                if (post) {
                    onUnschedulePost(post, originalDate);
                }
            }
        } catch(err) {
            console.error("Failed to handle drop:", err);
        }
    };

    const DraggablePost: React.FC<{post: Post, originalDate: string | null, isCompact?: boolean}> = ({post, originalDate, isCompact}) => (
        <div
            draggable
            onDragStart={(e) => handleDragStart(e, post, originalDate)}
            onClick={() => onViewPost(post)}
            className={`p-2 rounded-md border text-xs cursor-pointer transition-colors ${isCompact ? 'bg-primary/20 border-primary/30' : 'bg-surface border-border hover:bg-white/5'}`}
        >
            <p className={`font-semibold truncate ${isCompact ? 'text-onPrimary' : 'text-onSurface'}`}>{post.content.split('\n')[0]}</p>
            {!isCompact && <p className="text-onSurfaceSecondary truncate mt-1 opacity-70">{post.content.substring(0, 80)}...</p>}
        </div>
    );
    
    return (
        <div className="flex flex-col md:flex-row gap-8 h-full animate-fade-in">
            {/* Unscheduled Posts Panel */}
            <aside 
                className="w-full md:w-1/3 lg:w-1/4 bg-surface rounded-xl border border-border p-4 flex flex-col"
                onDragOver={handleDragOver}
                onDrop={handleDropOnUnscheduled}
            >
                <h3 className="text-lg font-bold text-onPrimary mb-4">Unscheduled Posts</h3>
                <div className="space-y-3 overflow-y-auto flex-grow pr-2 -mr-2">
                    {unscheduledPosts.length > 0 ? (
                        unscheduledPosts.map(post => <DraggablePost key={post.id} post={post} originalDate={null} />)
                    ) : (
                        <div className="text-center text-onSurfaceSecondary text-sm p-4 border border-dashed border-border rounded-lg h-full flex items-center justify-center">
                            <p>Save posts from the generation screen to see them here. Drag scheduled posts here to unschedule them.</p>
                        </div>
                    )}
                </div>
            </aside>

            {/* Calendar View */}
            <main className="flex-1 bg-surface rounded-xl border border-border p-4 sm:p-6 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-onPrimary">
                        {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </h2>
                    <div className="flex gap-2">
                        <button onClick={() => changeMonth(-1)} className="px-3 py-1 bg-background border border-border rounded-md text-sm hover:bg-white/5">&lt; Prev</button>
                        <button onClick={() => changeMonth(1)} className="px-3 py-1 bg-background border border-border rounded-md text-sm hover:bg-white/5">Next &gt;</button>
                    </div>
                </div>

                <div className="grid grid-cols-7 gap-1 text-center font-semibold text-onSurfaceSecondary text-xs">
                    {daysOfWeek.map(day => <div key={day} className="py-2">{day}</div>)}
                </div>

                <div className="grid grid-cols-7 grid-rows-5 gap-1 flex-grow">
                    {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} className="bg-background/50 rounded-md"></div>)}
                    {Array.from({ length: daysInMonth }).map((_, day) => {
                        const dayNumber = day + 1;
                        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
                        const postsForDay = scheduledPosts[dateStr] || [];
                        const isToday = new Date().toDateString() === new Date(year, month, dayNumber).toDateString();

                        return (
                            <div 
                                key={dayNumber} 
                                className="bg-background rounded-md p-1.5 flex flex-col gap-1.5 border border-transparent"
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDropOnDate(e, dateStr)}
                            >
                                <span className={`text-xs font-bold ${isToday ? 'text-primary' : 'text-onSurfaceSecondary'}`}>{dayNumber}</span>
                                <div className="space-y-1 overflow-y-auto">
                                    {postsForDay.map(post => (
                                        <DraggablePost key={post.id} post={post} originalDate={dateStr} isCompact={true} />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>
        </div>
    );
};

export default ContentCalendar;