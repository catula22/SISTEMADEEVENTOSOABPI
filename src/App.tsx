import { useConvexAuth, useQuery } from "convex/react";
import { CustomSignInForm } from "./components/CustomSignInForm";
import { SignOutButton } from "./SignOutButton";
import { AgendaApp } from "./components/AgendaApp";
import { Toaster } from "sonner";
import { NotificationBell } from "./components/NotificationBell";
import { api } from "../convex/_generated/api";
import { useState } from "react";
import { SectorFilter } from "./components/SectorFilter";
import { PublicActivityLog } from "./components/PublicActivityLog";
import { DayEventsModal } from "./components/DayEventsModal";
import { Calendar } from "./components/Calendar";
import { EventList } from "./components/EventList";
import { EventDetailsModal } from "./components/EventDetailsModal";
import { NotificationSettings } from "./components/NotificationSettings";
import { RealtimeIndicator } from "./components/RealtimeIndicator";
import { useRealtimeNotifications } from "./hooks/useRealtimeNotifications";

function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const user = useQuery(api.auth.loggedInUser);
  const [showLogin, setShowLogin] = useState(false);
  const [publicSelectedSector, setPublicSelectedSector] = useState("TODOS");
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const sectors = useQuery(api.sectors.getSectors);

  const [publicSelectedDate, setPublicSelectedDate] = useState(new Date());
  const [publicViewingDate, setPublicViewingDate] = useState<Date | null>(null);
  const [publicSelectedEvent, setPublicSelectedEvent] = useState<any>(null);
  const [currentPublicMonth, setCurrentPublicMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [publicViewMode, setPublicViewMode] = useState<"calendar" | "list">("calendar");

  const publicEvents = useQuery(api.events.getAllEvents, {
    month: currentPublicMonth,
    sector: publicSelectedSector,
  });

  // Enable real-time notifications for all users
  useRealtimeNotifications({ 
    enabled: true,
    userId: user?.email 
  });

  const handlePublicMonthChange = (date: Date) => {
    setCurrentPublicMonth(date.toISOString().slice(0, 7));
  };

  const handlePublicDateSelect = (date: Date) => {
    setPublicViewingDate(date);
  };

  const handlePublicDayEventsModalClose = () => {
    setPublicViewingDate(null);
  };

  if (isLoading) {
    return <div className="w-screen h-screen flex items-center justify-center">Carregando...</div>;
  }

  const Footer = () => (
    <footer className="text-center p-4 text-sm text-gray-500 border-t">
      <div className="flex flex-col items-center gap-2">
        <RealtimeIndicator />
        <div>
          OAB - PI © 2025. Todos os direitos reservados.{" "}
          <a href="#" className="underline hover:text-gray-700">Política de Privacidade</a>{" "}
          <a href="#" className="underline hover:text-gray-700">Termos de Uso</a>
        </div>
      </div>
    </footer>
  );

  return (
    <>
      <Toaster 
        position="top-right" 
        expand={true}
        richColors
        closeButton
        duration={4000}
      />
      {isAuthenticated ? (
        <div className="flex flex-col min-h-screen">
          <main className="container mx-auto p-4 md:p-6 lg:p-8 flex-grow">
            <header className="flex justify-between items-center mb-6 pb-4 border-b">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Agenda OAB
              </h1>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowNotificationSettings(true)}
                  className="btn-icon-animated p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                  title="Configurações de Notificação"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                <NotificationBell />
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                    {user?.name || user?.email}
                  </span>
                  <SignOutButton />
                </div>
              </div>
            </header>
            <AgendaApp />
          </main>
          <Footer />
        </div>
      ) : (
        <div className="flex flex-col min-h-screen bg-gray-50">
          <div className="flex-grow flex items-center justify-center p-4">
            <div className="container mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Left side: Calendar and Filters */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white rounded-lg shadow-sm border">
                    <div className="p-4 border-b flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                      <div className="flex items-center gap-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {publicViewMode === "calendar"
                            ? "Calendário de Eventos"
                            : "Lista de Eventos"}
                        </h3>
                        <button
                          onClick={() => setShowNotificationSettings(true)}
                          className="btn-icon-animated p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                          title="Configurar Notificações"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM9 17H4l5 5v-5zM12 3v12" />
                          </svg>
                        </button>
                      </div>
                      <div className="inline-flex rounded-md shadow-sm" role="group">
                        <button
                          type="button"
                          onClick={() => setPublicViewMode("calendar")}
                          className={`btn-animated px-4 py-2 text-sm font-medium rounded-l-lg border ${
                            publicViewMode === "calendar"
                              ? "bg-blue-600 text-white border-blue-600 z-10 ring-2 ring-blue-300"
                              : "bg-white text-gray-900 border-gray-200 hover:bg-gray-100"
                          }`}
                        >
                          Calendário
                        </button>
                        <button
                          type="button"
                          onClick={() => setPublicViewMode("list")}
                          className={`btn-animated px-4 py-2 text-sm font-medium rounded-r-md border-t border-b border-r ${
                            publicViewMode === "list"
                              ? "bg-blue-600 text-white border-blue-600 z-10 ring-2 ring-blue-300"
                              : "bg-white text-gray-900 border-gray-200 hover:bg-gray-100"
                          }`}
                        >
                          Lista
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      {publicViewMode === "calendar" ? (
                        <Calendar
                          events={publicEvents || []}
                          sectors={sectors || []}
                          selectedDate={publicSelectedDate}
                          onDateSelect={handlePublicDateSelect}
                          onMonthChange={handlePublicMonthChange}
                          isPublicView={true}
                        />
                      ) : (
                        <EventList 
                          events={publicEvents || []} 
                          sectors={sectors || []} 
                          onEventView={setPublicSelectedEvent}
                        />
                      )}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm border p-4">
                    <SectorFilter
                      sectors={sectors || []}
                      selectedSector={publicSelectedSector}
                      onSectorChange={setPublicSelectedSector}
                    />
                  </div>
                </div>

                {/* Right side: Login & Activity */}
                <div className="lg:col-span-1 space-y-6">
                  <div className="w-full bg-white shadow-lg rounded-xl border p-8 space-y-6">
                    <div className="text-center">
                      <h1 className="text-3xl font-bold text-gray-900">Acesso Restrito</h1>
                      <p className="mt-2 text-sm text-gray-600">Faça login para gerenciar eventos</p>
                    </div>
                    {showLogin ? (
                      <CustomSignInForm />
                    ) : (
                      <button
                        onClick={() => setShowLogin(true)}
                        className="w-full auth-button btn-primary-animated"
                      >
                        Acessar
                      </button>
                    )}
                  </div>
                  <PublicActivityLog />
                </div>
              </div>
            </div>
          </div>
          {publicViewingDate && (
            <DayEventsModal
              date={publicViewingDate}
              events={publicEvents || []}
              sectors={sectors || []}
              onClose={handlePublicDayEventsModalClose}
            />
          )}
          {publicSelectedEvent && (
            <EventDetailsModal
              event={publicSelectedEvent}
              sectors={sectors || []}
              onClose={() => setPublicSelectedEvent(null)}
            />
          )}
          <Footer />
        </div>
      )}
      
      {/* Notification Settings Modal */}
      <NotificationSettings
        isOpen={showNotificationSettings}
        onClose={() => setShowNotificationSettings(false)}
      />
    </>
  );
}

export default App;
