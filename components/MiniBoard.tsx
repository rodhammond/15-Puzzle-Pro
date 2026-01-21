
import React from 'react';
import { BoardState } from '../types';

interface MiniBoardProps {
  board: BoardState;
  title?: string;
  isActive?: boolean;
  matchesWith?: BoardState;
}

const MiniBoard: React.FC<MiniBoardProps> = ({ board, title, isActive, matchesWith }) => {
  return (
    <div className={`flex flex-col items-center gap-3 transition-all duration-500 ${isActive ? 'scale-110' : 'opacity-80'}`}>
      {title && (
        <span className={`text-sm font-black uppercase tracking-widest ${isActive ? 'text-red-500' : 'text-slate-500'}`}>
          {title}
        </span>
      )}
      <div className={`grid grid-cols-4 gap-1.5 p-2 bg-slate-800 rounded-xl border-4 transition-colors duration-500 shadow-xl w-32 h-32 ${isActive ? 'border-red-500 shadow-red-900/20' : 'border-slate-700'}`}>
        {board.map((val, idx) => {
          if (val === 0) {
            return <div key={idx} className="bg-slate-900 rounded-[4px]" />;
          }
          
          const isMatched = matchesWith && val === matchesWith[idx];
          const isOdd = val % 2 !== 0;
          
          return (
            <div
              key={idx}
              className={`rounded-[3px] flex items-center justify-center text-[10px] font-black transition-colors ${
                isMatched 
                  ? 'bg-green-500 text-white' 
                  : isOdd ? 'bg-red-600 text-white' : 'bg-white text-slate-900'
              }`}
            >
              {val}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MiniBoard;
