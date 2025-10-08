import { useState } from "react";
import { Calendar } from "./Calendar";

interface PublicCalendarProps {
  events: any[];
  sectors: any[];
  onDateSelect: (date: Date) => void;
  onMonthChange: (date: Date) => void;
}

export function PublicCalendar({
  events,
  sectors,
  onDateSelect,
  onMonthChange,
}: PublicCalendarProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold text-gray-900">Calendário de Eventos</h3>
      </div>
      <div className="p-4">
        <Calendar
          events={events}
          sectors={sectors}
          selectedDate={selectedDate}
          onDateSelect={onDateSelect}
          onMonthChange={onMonthChange}
        />
      </div>
    </div>
  );
}
