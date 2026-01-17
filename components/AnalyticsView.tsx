import React, { useState, useMemo } from 'react';
import type { JournalEntry } from '../types';
import AnalyticsDayDetailModal from './AnalyticsDayDetailModal';

// Import extracted utilities
import {
  parseDuration,
  getHeatmapColor,
  calculateMonthlyStats,
  generateCalendarGrid,
} from '../utils/analytics';

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
  };

  // Use extracted utility for monthly stats calculation
  const monthlyStats = useMemo(() => {
    return calculateMonthlyStats(
      entries,
      viewDate.getFullYear(),
      viewDate.getMonth()
    );
  }, [entries, viewDate]);

  // Use extracted utility for calendar grid generation
  const calendarGrid = useMemo(() => {
    return generateCalendarGrid(
      viewDate.getFullYear(),
      viewDate.getMonth()
    );
  }, [viewDate]);

  const kpiData = [
    { label: '이번 달 총 수련 시간 (분)', value: monthlyStats.totalMinutes },
    { label: '이번 달 총 수련 횟수', value: monthlyStats.totalSessions },
    { label: '최장 연속 수련일', value: monthlyStats.longestStreak },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto my-12 p-6 bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg rounded-xl shadow-lg border border-stone-200 dark:border-slate-700">
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
        <div className="grid grid-cols-7 gap-1.5">
          {calendarGrid.map((day, index) => {
            const dayData = day ? monthlyStats.entriesByDay[day] : undefined;
            const hasEntries = dayData && dayData.entries.length > 0;

            return (
              <div key={index} className="aspect-square">
                {day ? (
                  <button
                    onClick={() => handleDateClick(day)}
                    className={`w-full h-full rounded-md p-1 text-left align-top transition-all duration-200 hover:ring-2 hover:ring-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 overflow-hidden ${hasEntries ? 'bg-stone-50 dark:bg-slate-800/80' : 'bg-stone-100/50 dark:bg-slate-700/60'}`}
                  >
                    <span className={`font-semibold text-sm ${hasEntries ? 'text-stone-700 dark:text-slate-200' : 'text-stone-400 dark:text-slate-500'}`}>{day}</span>

                    {hasEntries && (
                      <div className="flex flex-col gap-0.5 mt-1">
                        {dayData.entries.slice(0, 3).map((entry, entryIndex) => (
                          <div
                            key={entryIndex}
                            className={`w-full rounded-sm text-[10px] leading-tight px-1 truncate ${getHeatmapColor(parseDuration(entry.duration))}`}
                            title={entry.title}
                          >
                            {entry.title?.split(' ').slice(0, 2).join(' ') || '수련'}
                          </div>
                        ))}
                      </div>
                    )}
                  </button>
                ) : <div />}
              </div>
            );
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
