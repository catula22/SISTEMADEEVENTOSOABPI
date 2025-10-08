import { useEffect, useRef, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { toast } from 'sonner';

interface UseRealtimeNotificationsProps {
  enabled?: boolean;
  userId?: string;
}

export function useRealtimeNotifications({ enabled = true, userId }: UseRealtimeNotificationsProps) {
  const [hasPermission, setHasPermission] = useState(false);
  const [lastEventCount, setLastEventCount] = useState<number | null>(null);
  const [lastActivityCount, setLastActivityCount] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isInitialLoad = useRef(true);

  // Get current events count for change detection
  const allEvents = useQuery(api.events.getAllEvents, {});
  const activityLogs = useQuery(api.activityLogs.getPublicActivityLogs, {
    paginationOpts: { numItems: 10, cursor: null }
  });

  // Get the notification sound URL from Convex storage
  const soundUrl = useQuery(api.events.getNotificationSoundUrl, {});

  // Helper function to play notification sound
  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => console.warn('Sound playback failed'));
    }
  };

  // Initialize audio with the sound from Convex storage
  useEffect(() => {
    if (soundUrl) {
      audioRef.current = new Audio(soundUrl);
      audioRef.current.preload = 'auto';
      audioRef.current.volume = 0.7; // Set volume to 70%
    }
  }, [soundUrl]);

  // Request notification permission
  useEffect(() => {
    if (!enabled) return;

    const requestPermission = async () => {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        setHasPermission(permission === 'granted');
      }
    };

    requestPermission();
  }, [enabled]);

  // Monitor events for changes
  useEffect(() => {
    if (!enabled || !allEvents) return;

    const currentEventCount = allEvents.length;

    // Skip initial load
    if (isInitialLoad.current) {
      setLastEventCount(currentEventCount);
      isInitialLoad.current = false;
      return;
    }

    // Detect new events
    if (lastEventCount !== null && currentEventCount > lastEventCount) {
      const newEventsCount = currentEventCount - lastEventCount;
      
      // Play sound
      playNotificationSound();

      // Show toast notification
      toast.success(`${newEventsCount} novo(s) evento(s) adicionado(s)!`, {
        duration: 4000,
        style: {
          background: '#10B981',
          color: 'white',
          border: 'none',
        },
      });

      // Show browser notification
      if (hasPermission) {
        new Notification('Agenda OAB - Novos Eventos', {
          body: `${newEventsCount} novo(s) evento(s) foram adicionados à agenda`,
          icon: '/og-preview.png',
          tag: 'new-events',
        });
      }
    }

    // Detect removed events
    if (lastEventCount !== null && currentEventCount < lastEventCount) {
      const removedEventsCount = lastEventCount - currentEventCount;
      
      // Play sound
      playNotificationSound();

      // Show toast notification
      toast.info(`${removedEventsCount} evento(s) removido(s)`, {
        duration: 4000,
        style: {
          background: '#3B82F6',
          color: 'white',
          border: 'none',
        },
      });

      // Show browser notification
      if (hasPermission) {
        new Notification('Agenda OAB - Eventos Removidos', {
          body: `${removedEventsCount} evento(s) foram removidos da agenda`,
          icon: '/og-preview.png',
          tag: 'removed-events',
        });
      }
    }

    setLastEventCount(currentEventCount);
  }, [allEvents, lastEventCount, enabled, hasPermission]);

  // Monitor activity logs for changes
  useEffect(() => {
    if (!enabled || !activityLogs?.page?.length) return;

    const currentActivityCount = activityLogs.page.length;

    // Skip initial load
    if (lastActivityCount === null) {
      setLastActivityCount(currentActivityCount);
      return;
    }

    // Detect new activity
    if (currentActivityCount > lastActivityCount) {
      const newActivities = activityLogs.page.slice(0, currentActivityCount - lastActivityCount);
      
      for (const activity of newActivities) {
        // Skip if it's the current user's activity
        if (userId && activity.userEmail === userId) continue;

        // Play sound
        playNotificationSound();

        // Show toast notification
        const actionText = activity.action === 'created' ? 'criou' : 
                          activity.action === 'updated' ? 'atualizou' : 'excluiu';
        
        toast.info(`${activity.userName} ${actionText} "${activity.details.eventTitle}"`, {
          duration: 5000,
          style: {
            background: '#8B5CF6',
            color: 'white',
            border: 'none',
          },
        });

        // Show browser notification
        if (hasPermission) {
          new Notification('Agenda OAB - Atividade Recente', {
            body: `${activity.userName} ${actionText} o evento "${activity.details.eventTitle}"`,
            icon: '/og-preview.png',
            tag: 'activity-update',
          });
        }
      }
    }

    setLastActivityCount(currentActivityCount);
  }, [activityLogs, lastActivityCount, enabled, hasPermission, userId]);

  return {
    hasPermission,
    requestPermission: async () => {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        setHasPermission(permission === 'granted');
        return permission === 'granted';
      }
      return false;
    },
  };
}
