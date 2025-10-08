interface EventDetailsModalProps {
  event: any;
  sectors: any[];
  onClose: () => void;
  onEdit?: (event: any) => void;
}

export function EventDetailsModal({ event, sectors, onClose, onEdit }: EventDetailsModalProps) {
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
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    return timeStr.slice(0, 5); // Remove seconds if present
  };

  const formatDateTime = (dateStr: string, timeStr?: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    const dateFormatted = date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    if (timeStr) {
      return `${dateFormatted} às ${formatTime(timeStr)}`;
    }
    return dateFormatted;
  };

  const sectorInfo = getSectorInfo(event.sector);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b bg-gray-50">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className={`
                  inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                  ${sectorInfo.color} text-white
                `}>
                  {event.sector}
                </span>
                {event.notificationSent && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Notificado
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {event.title}
              </h2>
            </div>
            <div className="flex items-center gap-2 ml-4">
              {onEdit && (
                <button
                  onClick={() => {
                    onEdit(event);
                    onClose();
                  }}
                  className="btn-primary-animated px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Editar
                </button>
              )}
              <button
                onClick={onClose}
                className="btn-icon-animated text-gray-400 hover:text-gray-600 p-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Date and Time */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Data e Horário
              </h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="font-medium text-gray-700 w-16">Data:</span>
                  <span className="text-gray-900">{formatDate(event.date)}</span>
                </div>
                {(event.startTime || event.time) && (
                  <div className="flex items-center">
                    <span className="font-medium text-gray-700 w-16">Horário:</span>
                    <span className="text-gray-900">
                      {formatTime(event.startTime || event.time)}
                      {event.endTime && ` - ${formatTime(event.endTime)}`}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Location */}
            {event.location && (
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Local
                </h3>
                <p className="text-gray-900 whitespace-pre-wrap">{event.location}</p>
              </div>
            )}

            {/* Description */}
            {event.description && (
              <div className="bg-yellow-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Descrição
                </h3>
                <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{event.description}</p>
              </div>
            )}

            {/* Original Text (if parsed) */}
            {event.originalText && (
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Texto Original (Analisado)
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap text-sm bg-white p-3 rounded border italic">
                  {event.originalText}
                </p>
              </div>
            )}

            {/* Metadata */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Informações do Sistema
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">ID do Evento:</span>
                  <span className="text-gray-600 font-mono text-xs">{event._id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">Criado em:</span>
                  <span className="text-gray-600">
                    {new Date(event._creationTime).toLocaleString('pt-BR')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">Setor:</span>
                  <span className="text-gray-600">{event.sector}</span>
                </div>
                {event.notificationSent !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">Notificação Enviada:</span>
                    <span className={`text-sm px-2 py-1 rounded ${
                      event.notificationSent 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {event.notificationSent ? 'Sim' : 'Não'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
