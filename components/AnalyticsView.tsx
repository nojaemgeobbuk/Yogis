
import React, { useState, useMemo, useCallback } from 'react';
import type { JournalEntry } from '../types';
import AnalyticsDayDetailModal from './AnalyticsDayDetailModal';

const ChevronLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
);

const ChevronRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
);

const parseDuration = (durationStr?: string): number => {
    if (!durationStr) return 0;
    const match = durationStr.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
};

const getHeatmapColor = (duration: number): string => {
    if (duration > 60) return 'bg-teal-700 dark:bg-teal-500 text-white';
    if (duration > 40) return 'bg-teal-600 dark:bg-teal-600 text-white';
    if (duration > 20) return 'bg-teal-400 dark:bg-teal-700 text-stone-800 dark:text-slate-100';
    if (duration > 0) return 'bg-teal-200 dark:bg-teal-900 text-stone-700 dark:text-slate-200';
    return 'bg-stone-100 dark:bg-slate-700 text-stone-500 dark:text-slate-400';
}

const AnalyticsView: React.FC<{ entries: JournalEntry[] }> = ({ entries }) => {
    const [viewDate, setViewDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const handlePrevMonth = () => {
        setViewDate(current => new Date(current.getFullYear(), current.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setViewDate(current => new Date(current.getFullYear(), current.getMonth() + 1, 1));
    };
    
    const handleDateClick = (day: number | null) => {
        if (day === null) return;
        const clickedDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        setSelectedDate(clickedDate);
    }
    
    const monthlyStats = useMemo(() => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();

        const monthlyEntries = entries.filter(e => {
            const entryDate = new Date(e.date);
            return entryDate.getFullYear() === year && entryDate.getMonth() === month;
        });

        const entriesByDay: Record<number, { entries: JournalEntry[], totalDuration: number }> = {};
        let totalMinutes = 0;

        monthlyEntries.forEach(entry => {
            const day = new Date(entry.date).getDate();
            if (!entriesByDay[day]) {
                entriesByDay[day] = { entries: [], totalDuration: 0 };
            }
            const duration = parseDuration(entry.duration);
            entriesByDay[day].entries.push(entry);
            entriesByDay[day].totalDuration += duration;
            totalMinutes += duration;
        });

        let longestStreak = 0;
        let currentStreak = 0;
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        for (let i = 1; i <= daysInMonth; i++) {
            if (entriesByDay[i]) {
                currentStreak++;
            } else {
                longestStreak = Math.max(longestStreak, currentStreak);
                currentStreak = 0;
            }
        }
        longestStreak = Math.max(longestStreak, currentStreak);

        return {
            totalMinutes,
            totalSessions: monthlyEntries.length,
            longestStreak,
            entriesByDay,
        };
    }, [entries, viewDate]);

    const calendarGrid = useMemo(() => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        const grid: (number | null)[] = [];
        for (let i = 0; i < firstDayOfMonth; i++) {
            grid.push(null);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            grid.push(i);
        }
        return grid;

    }, [viewDate]);

    const kpiData = [
        { label: '이번 달 총 수련 시간 (분)', value: monthlyStats.totalMinutes },
        { label: '이번 달 총 수련 횟수', value: monthlyStats.totalSessions },
        { label: '최장 연속 수련일', value: monthlyStats.longestStreak },
    ];

    return (
        <div className="w-full max-w-4xl mx-auto my-8 p-6 bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg rounded-xl shadow-lg border border-stone-200 dark:border-slate-700">
            <header className="flex justify-between items-center mb-6">
                <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-stone-200/80 dark:hover:bg-slate-700/80 transition-colors" aria-label="Previous month"><ChevronLeftIcon /></button>
                <h2 className="text-2xl font-bold text-stone-700 dark:text-slate-200">{viewDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })}</h2>
                <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-stone-200/80 dark:hover:bg-slate-700/80 transition-colors" aria-label="Next month"><ChevronRightIcon /></button>
            </header>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {kpiData.map(kpi => (
                    <div key={kpi.label} className="bg-white/80 dark:bg-slate-800 p-4 rounded-lg border border-stone-200 dark:border-slate-700 text-center shadow-sm">
                        <p className="text-sm font-semibold text-stone-600 dark:text-slate-300">{kpi.label}</p>
                        <p className="text-3xl font-bold text-teal-700 dark:text-teal-400 mt-1">{kpi.value}</p>
                    </div>
                ))}
            </section>

            <section>
                 <div className="grid grid-cols-7 gap-2 text-center text-sm font-semibold text-stone-500 dark:text-slate-400 mb-2">
                    {['일', '월', '화', '수', '목', '금', '토'].map(day => <div key={day}>{day}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-2">
                    {calendarGrid.map((day, index) => {
                         const dayData = day ? monthlyStats.entriesByDay[day] : undefined;
                         const duration = dayData?.totalDuration || 0;
                         const colorClass = getHeatmapColor(duration);
                         const yyyymmdd = day ? `${viewDate.getFullYear()}-${String(viewDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : '';

                        return (
                             <div key={index} className="aspect-square">
                                {day ? (
                                    <button 
                                        onClick={() => handleDateClick(day)}
                                        className={`w-full h-full rounded-md flex items-center justify-center font-bold transition-all duration-200 hover:ring-2 hover:ring-teal-500 dark:hover:ring-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 ${colorClass}`}
                                        title={`${yyyymmdd} • ${duration}분`}
                                    >
                                        {day}
                                    </button>
                                ) : <div />}
                             </div>
                        )
                    })}
                </div>
            </section>
            
            {selectedDate && (
                <AnalyticsDayDetailModal 
                    date={selectedDate} 
                    entries={monthlyStats.entriesByDay[selectedDate.getDate()]?.entries || []}
                    onClose={() => setSelectedDate(null)}
                />
            )}
        </div>
    );
};

export default AnalyticsView;
