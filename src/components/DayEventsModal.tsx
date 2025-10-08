import { EventList } from "./EventList";
import { EventDetailsModal } from "./EventDetailsModal";
import { useState } from "react";

interface DayEventsModalProps {
  date: Date;
  events: any[];
  sectors: any[];
  onClose: () => void;
  onEventEdit?: (event: any) => void;
  onNewEvent?: (date: Date) => void;
}

export function DayEventsModal({
  date,
  events,
  sectors,
  onClose,
  onEventEdit,
  onNewEvent,
}: DayEventsModalProps) {
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const dayEvents = events.filter((event) => {
    const eventDate = new Date(event.date + "T00:00:00");
    return eventDate.toDateString() === date.toDateString();
  });

  const formatDate = (d: Date) => {
    return d.toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b bg-gray-50">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Eventos do Dia
              </h3>
              <p className="text-sm text-gray-600">{formatDate(date)}</p>
            </div>
            <div className="flex items-center gap-2">
              {onNewEvent && (
                <button
                  onClick={() => onNewEvent(date)}
                  className="btn-primary-animated px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                >
                  + Novo Evento
                </button>
              )}
              <button
                onClick={onClose}
                className="btn-icon-animated text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-y-auto p-4">
          <EventList
            events={dayEvents}
            sectors={sectors}
            onEventEdit={onEventEdit}
            onEventView={setSelectedEvent}
          />
          {dayEvents.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <svg
                className="w-12 h-12 mx-auto mb-4 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p>Nenhum evento para este dia.</p>
            </div>
          )}
        </div>
      </div>
      
      {selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          sectors={sectors}
          onClose={() => setSelectedEvent(null)}
          onEdit={onEventEdit}
        />
      )}
    </div>
  );
}
