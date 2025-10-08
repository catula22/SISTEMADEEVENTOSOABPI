import { useState } from "react";
import { usePaginatedQuery, useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import { EventDetailsModal } from "./EventDetailsModal";

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const [activeTab, setActiveTab] = useState<"notifications" | "activity">("notifications");
  const [selectedEventId, setSelectedEventId] = useState<any>(null);
  const selectedEvent = useQuery(
    api.events.getEventById,
    selectedEventId ? { eventId: selectedEventId } : "skip"
  );
  const sectors = useQuery(api.sectors.getSectors);
  
  const notifications = useQuery(api.notifications.getUserNotifications, { limit: 50 });
  const {
    results: activityLogs,
    status: activityLogsStatus,
    loadMore: loadMoreActivity,
  } = usePaginatedQuery(
    api.activityLogs.getActivityLogs,
    {},
    { initialNumItems: 20 }
  );
  const markAsRead = useMutation(api.notifications.markNotificationAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllNotificationsAsRead);
  const deleteNotification = useMutation(api.notifications.deleteNotification);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead({ notificationId: notificationId as any });
    } catch (error) {
      toast.error("Erro ao marcar notificação como lida");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead({});
      toast.success("Todas as notificações foram marcadas como lidas");
    } catch (error) {
      toast.error("Erro ao marcar notificações como lidas");
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await deleteNotification({ notificationId: notificationId as any });
      toast.success("Notificação excluída");
    } catch (error) {
      toast.error("Erro ao excluir notificação");
    }
  };

  const handleActivityLogClick = (log: any) => {
    if (log.entityId) {
      setSelectedEventId(log.entityId);
    } else {
      toast.info("Este registro de atividade não está associado a um evento existente.");
    }
  };

  const handleNotificationItemClick = (notification: any) => {
    if (!notification.read) {
      void markAsRead({ notificationId: notification._id as any });
    }
    if (notification.activityLog?.entityId) {
      setSelectedEventId(notification.activityLog.entityId);
    } else {
      toast.info("A notificação não está associada a um evento existente.");
    }
  };

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Central de Notificações
            </h3>
            <button
              onClick={onClose}
              className="btn-icon-animated text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab("notifications")}
              className={`btn-animated px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === "notifications"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              Notificações
            </button>
            <button
              onClick={() => setActiveTab("activity")}
              className={`btn-animated px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === "activity"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              Log de Atividades
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[60vh]">
          {activeTab === "notifications" && (
            <div>
              {/* Actions */}
              {notifications && notifications.length > 0 && (
                <div className="p-4 border-b bg-gray-50">
                  <button
                    onClick={handleMarkAllAsRead}
                    className="btn-animated text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Marcar todas como lidas
                  </button>
                </div>
              )}

              {/* Notifications List */}
              <div className="divide-y">
                {notifications?.map((notification) => (
                  <div
                    key={notification._id}
                    onClick={() => handleNotificationItemClick(notification)}
                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                      !notification.read ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-sm font-semibold text-gray-900">
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatTimestamp(notification.timestamp)}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkAsRead(notification._id)}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            Marcar como lida
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteNotification(notification._id)}
                          className="text-xs text-red-600 hover:text-red-800"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {notifications?.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM9 17H4l5 5v-5zM12 3v12" />
                    </svg>
                    <p>Nenhuma notificação encontrada</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "activity" && (
            <div className="divide-y">
              {activityLogs?.map((log) => (
                <div key={log._id} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleActivityLogClick(log)}>
                  <div className="flex items-start space-x-3">
                    {getActionIcon(log.action)}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {log.userName}
                        </span>
                        <span className="text-sm text-gray-600">
                          {log.action === "created" && "criou"}
                          {log.action === "updated" && "atualizou"}
                          {log.action === "deleted" && "excluiu"}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          "{log.details.eventTitle}"
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">{log.details.sector}</span>
                        {" • "}
                        {new Date(log.details.eventDate + 'T00:00:00').toLocaleDateString('pt-BR')}
                        {log.details.eventStartTime && log.details.eventEndTime ? (
                          <span> das {log.details.eventStartTime} às {log.details.eventEndTime}</span>
                        ) : log.details.eventStartTime || log.details.eventTime ? (
                          <span> às {log.details.eventStartTime || log.details.eventTime}</span>
                        ) : null}
                      </div>

                      {log.details.changes && log.action === "updated" && (
                        <div className="text-xs text-gray-500 bg-gray-100 rounded p-2 mt-2">
                          <p className="font-medium mb-1">Alterações:</p>
                          {Object.entries(log.details.changes.after || {}).map(([key, value]) => {
                            const beforeValue = (log.details.changes?.before as any)?.[key];
                            if (beforeValue !== value && value) {
                              return (
                                <div key={key} className="mb-1">
                                  <span className="capitalize">{key}:</span>
                                  <span className="text-red-600 line-through ml-1">{String(beforeValue)}</span>
                                  <span className="text-green-600 ml-1">→ {String(value)}</span>
                                </div>
                              );
                            }
                            return null;
                          })}
                        </div>
                      )}
                      
                      <p className="text-xs text-gray-500 mt-2">
                        {formatTimestamp(log.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {activityLogsStatus === "CanLoadMore" && (
                <div className="p-4 text-center">
                    <button onClick={() => loadMoreActivity(10)} className="btn-animated px-4 py-2 text-sm font-medium rounded-md transition-colors text-blue-600 hover:text-blue-900 hover:bg-blue-100">
                        Carregar mais
                    </button>
                </div>
              )}
              {activityLogs?.length === 0 && activityLogsStatus !== 'LoadingFirstPage' && (
                <div className="p-8 text-center text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p>Nenhuma atividade registrada</p>
                </div>
              )}
            </div>
          )}
        </div>

        {selectedEvent && (
          <EventDetailsModal
            event={selectedEvent}
            sectors={sectors || []}
            onClose={() => setSelectedEventId(null)}
          />
        )}
      </div>
    </div>
  );
}
