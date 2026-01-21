
import React from 'react';

interface TileProps {
  value: number;
  onClick: () => void;
  isSuggested?: boolean;
  style?: React.CSSProperties;
}

const Tile: React.FC<TileProps> = ({ value, onClick, isSuggested, style }) => {
  if (value === 0) return null;

  const isOdd = value % 2 !== 0;
  const bgColor = isOdd ? 'bg-red-600' : 'bg-white';
  const textColor = isOdd ? 'text-white' : 'text-slate-900';

  return (
    <button
      onClick={onClick}
      style={style}
      className={`
        absolute w-[calc(25%-17px)] h-[calc(25%-17px)] rounded-xl shadow-2xl flex items-center justify-center 
        text-5xl md:text-7xl font-black transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
        transform hover:brightness-110 active:scale-95 border-b-4 border-slate-900/20
        ${bgColor} ${textColor}
        ${isSuggested ? 'ring-[6px] ring-yellow-400 animate-pulse z-10' : 'ring-1 ring-slate-400/10'}
      `}
    >
      <span className="select-none">{value}</span>
    </button>
  );
};

export default Tile;
