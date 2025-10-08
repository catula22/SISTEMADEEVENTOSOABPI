interface SectorFilterProps {
  sectors: any[];
  selectedSector: string;
  onSectorChange: (sector: string) => void;
}

export function SectorFilter({ sectors, selectedSector, onSectorChange }: SectorFilterProps) {
  const allSectors = [
    { name: "TODOS", color: "bg-gray-600", textColor: "text-gray-700", bgLight: "bg-gray-50" },
    ...sectors
  ];

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-900 mb-3">Filtrar por Setor</h3>
      <div className="flex flex-wrap gap-2">
        {allSectors.map(sector => (
          <button
            key={sector.name}
            onClick={() => onSectorChange(sector.name)}
            className={`
              px-3 py-1.5 rounded-full text-sm font-medium transition-all
              ${selectedSector === sector.name
                ? `${sector.color} text-white shadow-md`
                : `${sector.bgLight} ${sector.textColor} hover:shadow-sm border border-gray-200`
              }
            `}
          >
            {sector.name}
          </button>
        ))}
      </div>
    </div>
  );
}
