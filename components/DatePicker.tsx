import React, { useState, useMemo } from 'react';

interface DatePickerProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

const ChevronLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
);

const ChevronRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
);

const DatePicker: React.FC<DatePickerProps> = ({ selectedDate, onSelectDate }) => {
  const [displayDate, setDisplayDate] = useState(new Date(selectedDate));

  const daysInMonth = useMemo(() => {
    const date = new Date(displayDate);
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const days = [];
    
    // Add blank days for the start of the month
    for (let i = 0; i < firstDayOfMonth.getDay(); i++) {
        days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
        days.push(new Date(year, month, i));
    }

    return days;
  }, [displayDate]);
  
  const handlePrevMonth = () => {
    setDisplayDate(new Date(displayDate.getFullYear(), displayDate.getMonth() - 1, 1));
  };
  
  const handleNextMonth = () => {
    setDisplayDate(new Date(displayDate.getFullYear(), displayDate.getMonth() + 1, 1));
  };

  const isSameDay = (d1: Date | null, d2: Date | null) => {
    if (!d1 || !d2) return false;
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  const today = new Date();

  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-xl border border-stone-200 dark:border-slate-700 mt-2 w-full">
      <div className="flex justify-between items-center mb-4">
        <button type="button" onClick={handlePrevMonth} className="p-1 rounded-full hover:bg-stone-100 dark:hover:bg-slate-700 text-stone-500 dark:text-slate-400 hover:text-stone-800 dark:hover:text-slate-100 transition-colors"><ChevronLeftIcon /></button>
        <div className="font-semibold text-stone-700 dark:text-slate-200">
          {displayDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
        </div>
        <button type="button" onClick={handleNextMonth} className="p-1 rounded-full hover:bg-stone-100 dark:hover:bg-slate-700 text-stone-500 dark:text-slate-400 hover:text-stone-800 dark:hover:text-slate-100 transition-colors"><ChevronRightIcon /></button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm text-stone-500 dark:text-slate-400 mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => <div key={day}>{day}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {daysInMonth.map((day, index) => (
          <div key={index} className="flex justify-center items-center">
            {day ? (
              <button 
                type="button"
                onClick={() => onSelectDate(day)}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors text-sm
                  ${isSameDay(day, selectedDate) 
                    ? 'bg-teal-600 text-white font-bold' 
                    : 'text-stone-700 dark:text-slate-200'}
                  ${!isSameDay(day, selectedDate) && isSameDay(day, today) 
                    ? 'border-2 border-teal-300 dark:border-teal-600' 
                    : ''}
                  ${!isSameDay(day, selectedDate) 
                    ? 'hover:bg-stone-200 dark:hover:bg-slate-600' 
                    : ''}
                `}
              >
                {day.getDate()}
              </button>
            ) : <div />}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DatePicker;
