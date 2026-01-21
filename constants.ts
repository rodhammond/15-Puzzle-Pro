
import { BoardState, PresetConfig } from './types';

export const GOAL_STATE: BoardState = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0];

// Checkerboard Parity: Alternates odd/even tiles horizontally AND vertically
const CHECKERBOARD_GOAL: BoardState = [1, 2, 3, 4, 6, 5, 8, 7, 9, 10, 11, 12, 14, 13, 15, 0];

// Horizontal Stripes: Each row is a single solid color (Red/White/Red/White)
const HORIZONTAL_STRIPES_GOAL: BoardState = [1, 3, 5, 7, 2, 4, 6, 8, 9, 11, 13, 15, 10, 12, 14, 0];

// Columns 1&2 and 3&4 swapped for first 3 rows
const COLUMN_SWAP_GOAL: BoardState = [2, 1, 4, 3, 6, 5, 8, 7, 10, 9, 12, 11, 0, 13, 14, 15];

// Clockwise spiral inward
const SPIRAL_GOAL: BoardState = [1, 2, 3, 4, 12, 13, 14, 5, 11, 0, 15, 6, 10, 9, 8, 7];

// Solvable Inverted Order
const INVERTED_GOAL: BoardState = [15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 1, 2, 0];

export const PRESETS: PresetConfig[] = [
  {
    name: "Classic Order",
    board: GOAL_STATE,
    goal: GOAL_STATE
  },
  {
    name: "Random Shuffle",
    board: GOAL_STATE, 
    goal: GOAL_STATE
  },
  {
    name: "Horizontal Stripes",
    board: HORIZONTAL_STRIPES_GOAL,
    goal: HORIZONTAL_STRIPES_GOAL
  },
  {
    name: "Checkerboard Parity",
    board: CHECKERBOARD_GOAL,
    goal: CHECKERBOARD_GOAL
  },
  {
    name: "Column Swap",
    board: COLUMN_SWAP_GOAL,
    goal: COLUMN_SWAP_GOAL
  },
  {
    name: "Spiral Pattern",
    board: SPIRAL_GOAL,
    goal: SPIRAL_GOAL
  },
  {
    name: "Inverted Order",
    board: INVERTED_GOAL,
    goal: INVERTED_GOAL
  }
];

export const GRID_SIZE = 4;
