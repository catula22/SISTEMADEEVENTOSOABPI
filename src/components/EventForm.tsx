import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface EventFormProps {
  event?: any;
  selectedDate: Date;
  sectors: any[];
  onClose: () => void;
}

export function EventForm({ event, selectedDate, sectors, onClose }: EventFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    startTime: "09:00",
    endTime: "10:00",
    sector: "EVENTOS PARTICULARES",
    location: "",
  });

  const createEvent = useMutation(api.events.createEvent);
  const updateEvent = useMutation(api.events.updateEvent);
  const deleteEvent = useMutation(api.events.deleteEvent);

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || "",
        description: event.description || "",
        date: event.date || "",
        startTime: event.startTime || "09:00",
        endTime: event.endTime || "10:00",
        sector: event.sector || "EVENTOS PARTICULARES",
        location: event.location || "",
      });
    } else {
      const dateStr = selectedDate.toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, date: dateStr }));
    }
  }, [event, selectedDate]);

  const handleStartTimeChange = (newStartTime: string) => {
    setFormData(prev => {
      const startHour = parseInt(newStartTime.split(':')[0]);
      const startMinute = newStartTime.split(':')[1];
      const endHour = startHour + 1;
      const newEndTime = `${endHour.toString().padStart(2, '0')}:${startMinute}`;
      
      return {
        ...prev,
        startTime: newStartTime,
        endTime: newEndTime
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error("Título é obrigatório");
      return;
    }

    if (formData.startTime >= formData.endTime) {
      toast.error("Horário de fim deve ser posterior ao horário de início");
      return;
    }

    try {
      if (event) {
        await updateEvent({
          id: event._id,
          ...formData,
        });
        toast.success("Evento atualizado com sucesso!");
      } else {
        await createEvent(formData);
        toast.success("Evento criado com sucesso!");
      }
      onClose();
    } catch (error) {
      toast.error("Erro ao salvar evento");
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!event) return;
    
    if (confirm("Tem certeza que deseja excluir este evento?")) {
      try {
        await deleteEvent({ id: event._id });
        toast.success("Evento excluído com sucesso!");
        onClose();
      } catch (error) {
        toast.error("Erro ao excluir evento");
        console.error(error);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {event ? "Editar Evento" : "Novo Evento"}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Digite o título do evento"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Início *
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleStartTimeChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fim *
                </label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Setor
              </label>
              <select
                value={formData.sector}
                onChange={(e) => setFormData(prev => ({ ...prev, sector: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {sectors.map(sector => (
                  <option key={sector.name} value={sector.name}>
                    {sector.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Local
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Local do evento"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Descrição adicional do evento"
              />
            </div>

            <div className="flex justify-between pt-4">
              {event && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-2 text-red-600 hover:text-red-800 font-medium"
                >
                  Excluir
                </button>
              )}
              
              <div className="flex space-x-3 ml-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                >
                  {event ? "Atualizar" : "Criar"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
