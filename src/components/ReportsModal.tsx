import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

interface ReportsModalProps {
  onClose: () => void;
}

export function ReportsModal({ onClose }: ReportsModalProps) {
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const sectors = useQuery(api.sectors.getSectors) || [];
  const reportData = useQuery(api.reports.generateSectorReport, { month: selectedMonth });

  const fullReport = sectors.map(sector => {
    const reportEntry = reportData?.find(r => r.sectorName === sector.name);
    return {
      sectorName: sector.name,
      eventCount: reportEntry?.eventCount || 0,
      color: sector.color,
    };
  }).sort((a, b) => b.eventCount - a.eventCount);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Relatório de Eventos por Setor
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

        <div className="p-4 border-b">
            <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-1">
                Filtrar por Mês
            </label>
            <input
                type="month"
                id="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-white border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-shadow shadow-sm"
            />
        </div>

        <div className="overflow-y-auto p-4">
          {reportData === undefined ? (
            <div className="text-center py-8 text-gray-500">Carregando relatório...</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Setor
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nº de Eventos
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {fullReport.map((item) => (
                  <tr key={item.sectorName}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3 ${item.color}`}></div>
                        <div className="text-sm font-medium text-gray-900">{item.sectorName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 text-center">{item.eventCount}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
