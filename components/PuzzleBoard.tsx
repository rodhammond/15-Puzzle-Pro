
import React from 'react';
import Tile from './Tile';
import { BoardState } from '../types';

interface PuzzleBoardProps {
  board: BoardState;
  onTileClick: (index: number) => void;
  suggestedTileIndex?: number;
}

const PuzzleBoard: React.FC<PuzzleBoardProps> = ({ board, onTileClick, suggestedTileIndex }) => {
  // We need to render all tiles (1-15) regardless of their index in the 'board' array
  const tiles = Array.from({ length: 15 }, (_, i) => i + 1);

  return (
    <div className="relative grid p-4 bg-slate-800 rounded-3xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.9)] w-full max-w-[850px] aspect-square border-[8px] border-slate-700/50 overflow-hidden">
      {/* Background Grid Slots for visual structure */}
      <div className="absolute inset-4 grid grid-cols-4 grid-rows-4 gap-3 pointer-events-none">
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} className="bg-slate-900/50 rounded-xl shadow-[inset_0_4px_12px_rgba(0,0,0,0.5)] border border-slate-800/30" />
        ))}
      </div>

      {/* Render the movable tiles with precise alignment math */}
      {tiles.map((val) => {
        const index = board.indexOf(val);
        const row = Math.floor(index / 4);
        const col = index % 4;
        const isSuggested = index === suggestedTileIndex;

        return (
          <Tile
            key={val}
            value={val}
            onClick={() => onTileClick(index)}
            isSuggested={isSuggested}
            style={{
              // Math: Padding (1rem) + Percentage (25%) - Offset (5px)
              // Offset = (2 * Padding - Gap) / 4 = (32 - 12) / 4 = 5
              top: `calc(1rem + ${row * 25}% - ${row * 5}px)`,
              left: `calc(1rem + ${col * 25}% - ${col * 5}px)`,
            }}
          />
        );
      })}
    </div>
  );
};

export default PuzzleBoard;
