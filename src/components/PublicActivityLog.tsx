import { usePaginatedQuery, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { EventDetailsModal } from "./EventDetailsModal";
import { toast } from "sonner";

export function PublicActivityLog() {
  const [selectedEventId, setSelectedEventId] = useState<any>(null);
  const selectedEvent = useQuery(
    api.events.getEventById,
    selectedEventId ? { eventId: selectedEventId } : "skip"
  );
  const sectors = useQuery(api.sectors.getSectors);
  const {
    results: activityLogs,
    status,
    loadMore,
  } = usePaginatedQuery(
    api.activityLogs.getPublicActivityLogs,
    {},
    { initialNumItems: 10 }
  );

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes}m atrás`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h atrás`;
    } else {
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "created":
        return (
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
        );
      case "updated":
        return (
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
        );
      case "deleted":
        return (
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const handleLogClick = (log: any) => {
    if (log.entityId) {
      setSelectedEventId(log.entityId);
    } else {
      toast.info("Este registro de atividade não está associado a um evento existente.");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold text-gray-900">Atividades Recentes</h3>
      </div>
      <div className="divide-y max-h-96 overflow-y-auto">
        {activityLogs?.map((log) => (
          <div key={log._id} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleLogClick(log)}>
            <div className="flex items-start space-x-3">
              {getActionIcon(log.action)}
              <div className="flex-1 min-w-0">
                <div className="text-sm">
                  <span className="font-medium text-gray-900">{log.userName}</span>
                  <span className="text-gray-600">
                    {log.action === "created" ? " criou o evento " : ""}
                    {log.action === "updated" ? " atualizou o evento " : ""}
                    {log.action === "deleted" ? " excluiu o evento " : ""}
                  </span>
                  <span className="font-medium text-gray-900">
                    "{log.details.eventTitle}"
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {formatTimestamp(log.timestamp)}
                </p>
              </div>
            </div>
          </div>
        ))}
        {status === "CanLoadMore" ? (
          <div className="p-4 text-center">
            <button
              onClick={() => loadMore(10)}
              className="btn-animated px-4 py-2 text-sm font-medium rounded-md transition-colors text-blue-600 hover:text-blue-900 hover:bg-blue-100"
            >
              Carregar mais
            </button>
          </div>
        ) : null}
        {activityLogs?.length === 0 && status !== "LoadingFirstPage" ? (
          <div className="p-8 text-center text-gray-500">
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p>Nenhuma atividade registrada</p>
          </div>
        ) : null}
      </div>
      {selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          sectors={sectors || []}
          onClose={() => setSelectedEventId(null)}
        />
      )}
    </div>
  );
}
