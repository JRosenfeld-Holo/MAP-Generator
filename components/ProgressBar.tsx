import React from 'react';

interface ProgressBarProps {
  percentage: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ percentage }) => {
  return (
    <div className="w-full flex items-center gap-4 font-mono text-sm">
      <div className="flex-1 h-3 bg-brand-gray rounded-full overflow-hidden relative border border-brand-gray/50">
        <div 
          className="h-full bg-brand-lime transition-all duration-700 ease-out shadow-[0_0_10px_#bffd11aa]"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-brand-lime font-bold min-w-[3.5rem] text-right">
        {Math.round(percentage)}%
      </span>
    </div>
  );
};