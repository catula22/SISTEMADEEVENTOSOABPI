import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Calendar } from "./Calendar";
import { EventForm } from "./EventForm";
import { EventList } from "./EventList";
import { TextParser } from "./TextParser";
import { SectorFilter } from "./SectorFilter";
import { toast } from "sonner";
import { DayEventsModal } from "./DayEventsModal";
import { ReportsModal } from "./ReportsModal";
import { EventDetailsModal } from "./EventDetailsModal";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function AgendaApp() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSector, setSelectedSector] = useState("TODOS");
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [viewingDate, setViewingDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(
    new Date().toISOString().slice(0, 7) // YYYY-MM
  );
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [eventViewMode, setEventViewMode] = useState<"all" | "mine">("all");
  const [selectedEventForView, setSelectedEventForView] = useState<any>(null);

  // Get all events (public view) - this shows all events
  const allEvents = useQuery(api.events.getAllEvents, {
    month: currentMonth,
    sector: selectedSector,
  });

  // Get user's events (for editing permissions)
  const userEvents = useQuery(api.events.getUserEvents, {
    month: currentMonth,
    sector: selectedSector,
  });

  const sectors = useQuery(api.sectors.getSectors);
  const parseAndCreateEvents = useMutation(api.events.parseAndCreateEvents);
  const storeSubscription = useMutation(api.subscriptions.storeUserSubscription);

  // Choose which events to display based on the view mode
  const displayEvents = eventViewMode === "all" ? allEvents : userEvents;

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager.getSubscription().then((subscription) => {
          if (subscription === null) {
            subscribeUser();
          } else {
            storeSubscription({ subscription: subscription.toJSON() as any });
          }
        });
      });
    }
  }, [storeSubscription]);

  const subscribeUser = () => {
    const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      console.error("VITE_VAPID_PUBLIC_KEY is not set.");
      return;
    }
    const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

    navigator.serviceWorker.ready.then((registration) => {
      registration.pushManager
        .subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey,
        })
        .then((subscription) => {
          toast.success("Inscrito para notificações!");
          storeSubscription({ subscription: subscription.toJSON() as any });
        })
        .catch((err) => {
          console.error("Failed to subscribe the user: ", err);
          toast.error("Falha ao se inscrever para notificações.");
        });
    });
  };

  const handleTextParse = async (text: string) => {
    try {
      const createdEvents = await parseAndCreateEvents({ text });
      toast.success(`${createdEvents.length} eventos criados com sucesso!`);
    } catch (error) {
      toast.error("Erro ao processar o texto");
      console.error(error);
    }
  };

  const handleDateSelect = (date: Date) => {
    setViewingDate(date);
  };

  const handleEventEdit = (event: any) => {
    // Check if user can edit this event (only their own events)
    const canEdit = userEvents?.some(userEvent => userEvent._id === event._id);
    if (!canEdit) {
      toast.error("Você só pode editar seus próprios eventos");
      return;
    }
    
    setViewingDate(null);
    setEditingEvent(event);
    setShowEventForm(true);
  };

  const handleFormClose = () => {
    setShowEventForm(false);
    setEditingEvent(null);
  };

  const handleMonthChange = (date: Date) => {
    setCurrentMonth(date.toISOString().slice(0, 7));
  };

  const handleDayEventsModalClose = () => {
    setViewingDate(null);
  };

  const handleNewEvent = (date: Date) => {
    setViewingDate(null);
    setSelectedDate(date);
    setEditingEvent(null);
    setShowEventForm(true);
  };

  const handleEventView = (event: any) => {
    setSelectedEventForView(event);
  };

  return (
    <div className="space-y-6">
      {/* Text Parser Section */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Auto-Organização Simplificada</h3>
          <p className="text-sm text-gray-600 mt-1">
            Cole o texto com seus eventos e deixe o sistema organizá-los automaticamente por setores
          </p>
        </div>
        <div className="p-4">
          <TextParser onParse={handleTextParse} />
        </div>
      </div>

      {/* Controls: View Toggle, Event View Toggle and Sector Filter */}
      <div className="bg-white rounded-lg shadow-sm border p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div>
              <span className="text-sm font-medium text-gray-700 mr-3">Visualizar como:</span>
              <div className="inline-flex rounded-md shadow-sm" role="group">
                <button
                  type="button"
                  onClick={() => setViewMode("calendar")}
                  className={`btn-animated px-4 py-2 text-sm font-medium rounded-l-lg border ${
                    viewMode === "calendar"
                      ? "bg-blue-600 text-white border-blue-600 z-10 ring-2 ring-blue-300"
                      : "bg-white text-gray-900 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  Calendário
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`btn-animated px-4 py-2 text-sm font-medium rounded-r-md border-t border-b border-r ${
                    viewMode === "list"
                      ? "bg-blue-600 text-white border-blue-600 z-10 ring-2 ring-blue-300"
                      : "bg-white text-gray-900 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  Lista
                </button>
              </div>
            </div>
            
            <div>
              <span className="text-sm font-medium text-gray-700 mr-3">Mostrar eventos:</span>
              <div className="inline-flex rounded-md shadow-sm" role="group">
                <button
                  type="button"
                  onClick={() => setEventViewMode("all")}
                  className={`btn-animated px-4 py-2 text-sm font-medium rounded-l-lg border ${
                    eventViewMode === "all"
                      ? "bg-green-600 text-white border-green-600 z-10 ring-2 ring-green-300"
                      : "bg-white text-gray-900 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  Todos
                </button>
                <button
                  type="button"
                  onClick={() => setEventViewMode("mine")}
                  className={`btn-animated px-4 py-2 text-sm font-medium rounded-r-md border-t border-b border-r ${
                    eventViewMode === "mine"
                      ? "bg-green-600 text-white border-green-600 z-10 ring-2 ring-green-300"
                      : "bg-white text-gray-900 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  Meus Eventos
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex-grow sm:flex-grow-0 flex items-center gap-2">
            <button
              onClick={() => setShowEventForm(true)}
              className="btn-primary-animated px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              + Novo Evento
            </button>
            <button
              onClick={() => setShowReportsModal(true)}
              className="btn-animated px-3 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition-colors whitespace-nowrap"
            >
              Relatórios
            </button>
          </div>
        </div>
        <SectorFilter
          sectors={sectors || []}
          selectedSector={selectedSector}
          onSectorChange={setSelectedSector}
        />
      </div>

      {/* Main Content */}
      {viewMode === "calendar" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">
                  Calendário {eventViewMode === "mine" ? "- Meus Eventos" : "- Todos os Eventos"}
                </h3>
              </div>
              <div className="p-4">
                <Calendar
                  events={displayEvents || []}
                  sectors={sectors || []}
                  selectedDate={selectedDate}
                  onDateSelect={handleDateSelect}
                  onMonthChange={handleMonthChange}
                />
              </div>
            </div>
          </div>

          {/* Event List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  {eventViewMode === "mine" ? "Meus Próximos Eventos" : "Próximos Eventos"}
                </h3>
              </div>
              <div className="p-4 max-h-[60vh] overflow-y-auto">
                <EventList
                  events={displayEvents || []}
                  sectors={sectors || []}
                  onEventEdit={handleEventEdit}
                  onEventView={handleEventView}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">
              Lista de Eventos {eventViewMode === "mine" ? "- Meus Eventos" : "- Todos os Eventos"}
            </h3>
          </div>
          <div className="p-4">
            <EventList
              events={displayEvents || []}
              sectors={sectors || []}
              onEventEdit={handleEventEdit}
              onEventView={handleEventView}
            />
          </div>
        </div>
      )}

      {/* Event Form Modal */}
      {showEventForm && (
        <EventForm
          event={editingEvent}
          selectedDate={selectedDate}
          sectors={sectors || []}
          onClose={handleFormClose}
        />
      )}

      {/* Day Events Modal */}
      {viewingDate && (
        <DayEventsModal
          date={viewingDate}
          events={displayEvents || []}
          sectors={sectors || []}
          onClose={handleDayEventsModalClose}
          onEventEdit={handleEventEdit}
          onNewEvent={handleNewEvent}
        />
      )}
      
      {/* Reports Modal */}
      {showReportsModal && (
        <ReportsModal onClose={() => setShowReportsModal(false)} />
      )}
      
      {/* Event Details Modal */}
      {selectedEventForView && (
        <EventDetailsModal
          event={selectedEventForView}
          sectors={sectors || []}
          onClose={() => setSelectedEventForView(null)}
          onEdit={handleEventEdit}
        />
      )}
    </div>
  );
}
