import { useState, useRef, useEffect } from 'react';
import { useRealtimeNotifications } from '../hooks/useRealtimeNotifications';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { toast } from 'sonner';

interface NotificationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationSettings({ isOpen, onClose }: NotificationSettingsProps) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const { hasPermission, requestPermission } = useRealtimeNotifications({ enabled: false });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Get the notification sound URL from Convex storage
  const soundUrl = useQuery(api.events.getNotificationSoundUrl, {});

  // Initialize audio with the sound from Convex storage
  useEffect(() => {
    if (soundUrl) {
      audioRef.current = new Audio(soundUrl);
      audioRef.current.preload = 'auto';
      audioRef.current.volume = 0.7; // Set volume to 70%
    }
  }, [soundUrl]);

  const handleRequestPermission = async () => {
    const granted = await requestPermission();
    if (granted) {
      // Test notification
      new Notification('Agenda OAB', {
        body: 'Notificações ativadas com sucesso!',
        icon: '/og-preview.png',
      });
    }
  };

  const testSound = () => {
    if (audioRef.current && soundUrl) {
      audioRef.current.play()
        .then(() => {
          toast.success('Som de notificação reproduzido!', {
            duration: 2000,
          });
        })
        .catch(() => {
          toast.error('Erro ao reproduzir som de notificação', {
            duration: 2000,
          });
        });
    } else {
      toast.warning('Som de notificação não disponível', {
        duration: 2000,
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Configurações de Notificação
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
        </div>

        <div className="p-4 space-y-4">
          {/* Browser Notifications */}
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Notificações do Navegador</h4>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Status: {hasPermission ? 'Ativadas' : 'Desativadas'}
              </span>
              {!hasPermission && (
                <button
                  onClick={handleRequestPermission}
                  className="btn-primary-animated px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Ativar
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Receba notificações quando eventos forem criados, atualizados ou removidos
            </p>
          </div>

          {/* Sound Notifications */}
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Notificações Sonoras</h4>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Sons de alerta para mudanças
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={testSound}
                  className="btn-animated px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200"
                >
                  Testar
                </button>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={soundEnabled}
                    onChange={(e) => setSoundEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Real-time Updates Info */}
          <div className="bg-blue-50 rounded-lg p-3">
            <h4 className="font-medium text-blue-900 mb-2">Atualizações em Tempo Real</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Novos eventos adicionados</li>
              <li>• Eventos atualizados ou removidos</li>
              <li>• Atividades de outros usuários</li>
              <li>• Mudanças na agenda em tempo real</li>
            </ul>
          </div>
        </div>

        <div className="p-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="w-full btn-primary-animated px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
