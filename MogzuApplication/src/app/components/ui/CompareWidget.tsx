import { useState } from 'react';
import { X, ChevronUp, ChevronDown, Check } from 'lucide-react';
import { useNavigate } from 'react-router';

export interface CompareItem {
  id: string;
  name: string;
  image: string;
  category: 'space' | 'activity' | 'gifting';
}

interface CompareWidgetProps {
  items: CompareItem[];
  onRemoveItem: (id: string) => void;
  onClearAll: () => void;
}

export function CompareWidget({ items, onRemoveItem, onClearAll }: CompareWidgetProps) {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(true);

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none pb-6">
      <div className="bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-200 pointer-events-auto w-full max-w-3xl mx-4 transition-all duration-300">
        {/* Header */}
        <div 
          className="flex items-center justify-between p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 rounded-t-xl"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2">
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">{items.length}/3</span>
            <span className="text-sm font-semibold text-gray-800">Compare Shortlist</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={(e) => { e.stopPropagation(); onClearAll(); }}
              className="text-xs text-gray-500 hover:text-gray-800 font-medium"
            >
              Clear all
            </button>
            {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronUp className="w-4 h-4 text-gray-500" />}
          </div>
        </div>

        {/* Content */}
        {isExpanded && (
          <div className="p-4 flex items-center justify-between gap-4">
            <div className="flex gap-4 flex-1">
              {[0, 1, 2].map((index) => {
                const item = items[index];
                return item ? (
                  <div key={item.id} className="relative w-1/3 flex items-center gap-3 bg-gray-50 p-2 rounded-lg border border-gray-100">
                    <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-md" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 truncate">{item.name}</p>
                      <p className="text-[10px] text-gray-500 capitalize">{item.category}</p>
                    </div>
                    <button 
                      onClick={() => onRemoveItem(item.id)}
                      className="absolute -top-2 -right-2 bg-white rounded-full p-0.5 shadow-sm border border-gray-200 text-gray-400 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div key={`empty-${index}`} className="w-1/3 flex items-center justify-center bg-gray-50 border border-dashed border-gray-300 rounded-lg h-16">
                    <span className="text-xs text-gray-400 font-medium">Add to compare</span>
                  </div>
                );
              })}
            </div>
            
            <button 
              onClick={() => navigate('/compare')}
              disabled={items.length < 2}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
            >
              Compare now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}