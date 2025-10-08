import { useState } from "react";

interface TextParserProps {
  onParse: (text: string) => void;
}

export function TextParser({ onParse }: TextParserProps) {
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!text.trim()) return;
    
    setIsLoading(true);
    try {
      await onParse(text);
      setText("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Cole o texto com seus eventos...

Exemplo:
Reunião da Comissão de Direitos Humanos - 15/01/2024 às 14:00
Palestra ESA sobre Direito Digital - 20/01 - 19h
Gravação do podcast - 25/01/2024 10:30"
          rows={6}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </div>
      
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          <p>O sistema identifica automaticamente:</p>
          <ul className="list-disc list-inside mt-1 space-y-0.5 text-xs">
            <li>Datas (DD/MM/YYYY, DD/MM)</li>
            <li>Horários (HH:MM, HHh) - fim calculado automaticamente</li>
            <li>Setores por palavras-chave</li>
          </ul>
        </div>
        
        <button
          type="submit"
          disabled={!text.trim() || isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Processando...</span>
            </div>
          ) : (
            "Organizar Eventos"
          )}
        </button>
      </div>
    </form>
  );
}
