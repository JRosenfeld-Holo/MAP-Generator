import React from 'react';
import { ActionItem, ActionStatus } from '../types';
import { Check, Circle } from 'lucide-react';

interface ActionRowProps {
  item: ActionItem;
  onToggle: (id: string) => void;
}

export const ActionRow: React.FC<ActionRowProps> = ({ item, onToggle }) => {
  const isComplete = item.status === ActionStatus.COMPLETE;

  let rowBgClass = 'hover:bg-brand-gray/20';
  let borderClass = 'border-brand-gray';
  let statusBadgeClass = 'border-brand-gray text-gray-400';
  
  if (isComplete) {
    rowBgClass = 'bg-brand-gray/10';
    borderClass = 'border-brand-gray';
    statusBadgeClass = 'border-brand-lime/20 text-brand-lime bg-brand-lime/10';
  }

  return (
    <div 
      onClick={() => onToggle(item.id)}
      className={`
        group relative flex flex-col md:flex-row md:items-center justify-between 
        p-4 border-b cursor-pointer transition-all duration-300
        ${rowBgClass} ${borderClass}
      `}
    >
      {/* Active Indicator Line */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 transition-colors duration-300 
        ${isComplete ? 'bg-brand-lime' : 'bg-transparent group-hover:bg-brand-gray'}`} 
      />

      <div className="flex items-start md:items-center gap-4 flex-1">
        <button 
          className={`
            mt-1 md:mt-0 flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center transition-all duration-300
            ${isComplete 
              ? 'bg-brand-lime border-brand-lime text-brand-bg' 
              : 'border-brand-gray text-transparent group-hover:border-brand-lime'
            }
          `}
        >
          {isComplete ? <Check size={14} strokeWidth={4} /> : <Circle size={14} />}
        </button>
        
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className={`text-base font-medium transition-colors ${isComplete ? 'text-gray-500 line-through' : 'text-white'}`}>
              {item.task}
            </span>
          </div>
          
          <span className="md:hidden text-xs font-mono text-gray-400 mt-1">
             {item.dueDate}
          </span>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-8 text-sm font-mono text-gray-400 w-1/3 justify-end">
        <span className={isComplete ? 'opacity-50' : ''}>{item.owner}</span>
        
        <div className="flex items-center gap-2">
          <span className={`
            px-3 py-1 rounded-full text-xs border min-w-[80px] text-center
            ${statusBadgeClass}
          `}>
            {isComplete ? 'Done' : item.status}
          </span>
        </div>
      </div>
    </div>
  );
};