import React, { useMemo } from 'react';
import type { JournalEntry } from '../types';

interface PostPracticeFeedbackModalProps {
  entry: JournalEntry;
  allEntries: JournalEntry[];
  onClose: () => void;
}

const parseDuration = (durationStr?: string): number => {
    if (!durationStr) return 0;
    const match = durationStr.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
};

const getWeekStart = (date: Date): Date => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday as start of week
    return new Date(d.setDate(diff));
};

const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const PostPracticeFeedbackModal: React.FC<PostPracticeFeedbackModalProps> = ({ entry, allEntries, onClose }) => {
    
    const weeklyStats = useMemo(() => {
        const now = new Date();

        const startOfThisWeek = getWeekStart(now);
        const endOfThisWeek = new Date(startOfThisWeek);
        endOfThisWeek.setDate(startOfThisWeek.getDate() + 7);

        const startOfLastWeek = new Date(startOfThisWeek);
        startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);

        let thisWeekMinutes = 0;
        let lastWeekMinutes = 0;
        const thisWeekPracticeDays = new Set<string>();

        for (const e of allEntries) {
            const entryDate = new Date(e.date);
            if (entryDate >= startOfThisWeek && entryDate < endOfThisWeek) {
                thisWeekMinutes += parseDuration(e.duration);
                const dateString = entryDate.toISOString().split('T')[0];
                thisWeekPracticeDays.add(dateString);
            } else if (entryDate >= startOfLastWeek && entryDate < startOfThisWeek) {
                lastWeekMinutes += parseDuration(e.duration);
            }
        }
        
        const thisWeekSessions = thisWeekPracticeDays.size;
        const difference = thisWeekMinutes - lastWeekMinutes;

        return {
            thisWeekSessions,
            thisWeekMinutes,
            difference,
        };
    }, [allEntries]);

    return (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="feedback-title"
        >
            <div
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 text-center"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 id="feedback-title" className="text-xl font-bold text-stone-800 dark:text-slate-200 text-left">오늘의 수련 요약</h2>
                    <button onClick={onClose} className="text-stone-500 dark:text-slate-400 hover:text-stone-800 dark:hover:text-slate-100 transition-colors" aria-label="Close modal">
                        <XIcon />
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="bg-stone-100 dark:bg-slate-700/50 p-4 rounded-lg flex items-center justify-between">
                        <span className="font-semibold text-stone-700 dark:text-slate-300">오늘의 강도</span>
                        <div className="flex space-x-1 text-2xl" aria-label={`Intensity: ${entry.intensity || 0} out of 5`}>
                            {[...Array(5)].map((_, i) => (
                                <span key={i} role="img" aria-hidden="true">{i < (entry.intensity || 0) ? '🌕' : '🌑'}</span>
                            ))}
                        </div>
                    </div>

                    <div className="bg-stone-100 dark:bg-slate-700/50 p-4 rounded-lg flex items-center justify-between">
                        <span className="font-semibold text-stone-700 dark:text-slate-300">이번 주 총 수련</span>
                        <div className="text-right">
                           <p className="font-bold text-lg text-teal-600 dark:text-teal-400">{weeklyStats.thisWeekSessions}회 / {weeklyStats.thisWeekMinutes}분 ⏱️</p>
                        </div>
                    </div>

                    <div className="bg-stone-100 dark:bg-slate-700/50 p-4 rounded-lg flex items-center justify-between">
                        <span className="font-semibold text-stone-700 dark:text-slate-300">지난주 대비</span>
                        <div className="text-right">
                            {weeklyStats.difference >= 0 ? (
                                <p className="font-bold text-lg text-emerald-600 dark:text-emerald-400">+{weeklyStats.difference}분 증가 👍</p>
                            ) : (
                                <p className="font-bold text-lg text-amber-600 dark:text-amber-400">{weeklyStats.difference}분 감소</p>
                            )}
                        </div>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="w-full mt-6 bg-teal-600 text-white font-bold py-3 px-4 rounded-md hover:bg-teal-700 transition-colors"
                >
                    확인
                </button>
            </div>
        </div>
    );
};

export default PostPracticeFeedbackModal;
