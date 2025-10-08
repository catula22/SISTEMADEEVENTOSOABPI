import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { NotificationPanel } from "./NotificationPanel";

export function NotificationBell() {
  const [showPanel, setShowPanel] = useState(false);
  const unreadCount = useQuery(api.notifications.getUnreadNotificationCount);

  return (
    <>
      <button
        onClick={() => setShowPanel(true)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
        title="Notificações"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM9 17H4l5 5v-5zM12 3v12" />
        </svg>
        
        {unreadCount && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      <NotificationPanel 
        isOpen={showPanel} 
        onClose={() => setShowPanel(false)} 
      />
    </>
  );
}
