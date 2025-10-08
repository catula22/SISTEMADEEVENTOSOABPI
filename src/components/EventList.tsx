interface EventListProps {
  events: any[];
  sectors: any[];
  onEventEdit?: (event: any) => void;
  onEventView?: (event: any) => void;
}

export function EventList({ events, sectors, onEventEdit, onEventView }: EventListProps) {
  const getSectorInfo = (sectorName: string) => {
    return sectors.find(s => s.name === sectorName) || {
      color: 'bg-gray-500',
      textColor: 'text-gray-700',
      bgLight: 'bg-gray-50'
    };
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (timeStr: string) => {
    return timeStr.slice(0, 5); // Remove seconds if present
  };

  const groupEventsByDate = (events: any[]) => {
    const grouped: { [key: string]: any[] } = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    events.forEach(event => {
      if (event.date && typeof event.date === 'string') {
        if (!grouped[event.date]) {
          grouped[event.date] = [];
        }
        grouped[event.date].push(event);
      }
    });

    const allDates = Object.keys(grouped);
    
    const futureDates = allDates
      .filter(d => new Date(d + 'T00:00:00') >= today)
      .sort((a, b) => a.localeCompare(b)); // Ascending for future dates

    const pastDates = allDates
      .filter(d => new Date(d + 'T00:00:00') < today)
      .sort((a, b) => b.localeCompare(a)); // Descending for past dates

    const sortedDates = [...futureDates, ...pastDates];
    
    return sortedDates.map(date => ({
      date,
      events: grouped[date].sort((a, b) => {
        const timeA = a.startTime || a.time || '00:00';
        const timeB = b.startTime || b.time || '00:00';
        return timeA.localeCompare(timeB);
      })
    }));
  };

  const groupedEvents = groupEventsByDate(events);

  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p>Nenhum evento encontrado</p>
        <p className="text-sm mt-1">Clique em "Novo" para criar um evento</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groupedEvents.map(({ date, events: dayEvents }) => (
        <div key={date}>
          <h4 className="text-sm font-semibold text-gray-900 mb-3 pb-1 border-b">
            {formatDate(date)}
          </h4>
          
          <div className="space-y-2">
            {dayEvents.map(event => {
              const sectorInfo = getSectorInfo(event.sector);
              
              return (
                <div
                  key={event._id}
                  onClick={() => onEventView ? onEventView(event) : onEventEdit?.(event)}
                  className={`
                    p-3 rounded-lg border transition-all
                    ${(onEventEdit || onEventView) ? 'cursor-pointer hover:shadow-md' : ''}
                    ${sectorInfo.bgLight} border-gray-200 ${(onEventEdit || onEventView) ? 'hover:border-gray-300' : ''}
                  `}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {formatTime(event.startTime || event.time)}
                          {event.endTime && ` - ${formatTime(event.endTime)}`}
                        </span>
                        <span className={`
                          inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                          ${sectorInfo.color} text-white
                        `}>
                          {event.sector}
                        </span>
                      </div>
                      
                      <h5 className="font-medium text-gray-900 truncate mb-1">
                        {event.title}
                      </h5>
                      
                      {event.location && (
                        <p className="text-sm text-gray-600 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {event.location}
                        </p>
                      )}
                      
                      {event.description && (
                        <p className={`text-sm text-gray-600 mt-1 ${onEventView ? 'line-clamp-2' : ''}`}>
                          {event.description}
                        </p>
                      )}
                    </div>
                    
                    {(onEventEdit || onEventView) && (
                      <svg className="w-5 h-5 text-gray-400 ml-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
