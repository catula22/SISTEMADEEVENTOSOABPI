import { useState } from "react";

interface CalendarProps {
  events: any[];
  sectors: any[];
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onMonthChange: (date: Date) => void;
  isPublicView?: boolean;
}

export function Calendar({ events, sectors, selectedDate, onDateSelect, onMonthChange, isPublicView = false }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const previousMonth = () => {
    const newDate = new Date(year, month - 1, 1);
    setCurrentDate(newDate);
    onMonthChange(newDate);
  };

  const nextMonth = () => {
    const newDate = new Date(year, month + 1, 1);
    setCurrentDate(newDate);
    onMonthChange(newDate);
  };

  const getEventsForDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(event => event.date === dateStr);
  };

  const getSectorColor = (sectorName: string) => {
    const sector = sectors.find(s => s.name === sectorName);
    return sector ? sector.color : 'bg-gray-500';
  };

  const isToday = (day: number) => {
    const today = new Date();
    return today.getDate() === day && 
           today.getMonth() === month && 
           today.getFullYear() === year;
  };

  const isSelected = (day: number) => {
    return selectedDate.getDate() === day && 
           selectedDate.getMonth() === month && 
           selectedDate.getFullYear() === year;
  };

  // Generate calendar days
  const calendarDays = [];
  
  // Empty cells for days before the first day of the month
  for (let i = 0; i < firstDayWeekday; i++) {
    calendarDays.push(null);
  }
  
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  return (
    <div className="w-full">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={previousMonth}
          className="btn-icon-animated p-2 hover:bg-gray-100 rounded-md transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <h2 className="text-xl font-semibold text-gray-900">
          {monthNames[month]} {year}
        </h2>
        
        <button
          onClick={nextMonth}
          className="btn-icon-animated p-2 hover:bg-gray-100 rounded-md transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Week Days Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-600">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="p-2 h-24"></div>;
          }

          const dayEvents = getEventsForDate(day);
          const isCurrentDay = isToday(day);
          const isSelectedDay = !isPublicView && isSelected(day);

          return (
            <div
              key={`day-${day}`}
              onClick={() => onDateSelect(new Date(year, month, day))}
              className={`
                calendar-day p-1 h-24 border border-gray-200 relative
                cursor-pointer rounded-lg
                hover:bg-blue-50 hover:border-blue-300
                ${isCurrentDay ? 'bg-blue-100 border-blue-300' : ''}
                ${isSelectedDay ? 'bg-blue-200 border-blue-400' : ''}
              `}
            >
              <div className={`
                text-sm font-medium mb-1
                ${isCurrentDay ? 'text-blue-800' : 'text-gray-900'}
              `}>
                {day}
              </div>
              
              {/* Event indicators */}
              <div className="space-y-0.5">
                {dayEvents.slice(0, 2).map((event) => (
                  <div
                    key={event._id}
                    className={`
                      text-xs px-1 py-0.5 rounded text-white truncate
                      ${getSectorColor(event.sector)}
                    `}
                    title={`${event.startTime || event.time}${event.endTime ? `-${event.endTime}` : ''} - ${event.title}`}
                  >
                    {event.startTime || event.time} {event.title}
                  </div>
                ))}
                
                {dayEvents.length > 2 && (
                  <div className="text-xs text-gray-500 px-1">
                    +{dayEvents.length - 2} mais
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
