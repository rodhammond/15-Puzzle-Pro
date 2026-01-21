
export type BoardState = number[];

export type AlgorithmType = 
  | 'Iterative-Deepening' 
  | 'Greedy-Best' 
  | 'A*';

export interface Move {
  board: BoardState;
  emptyIndex: number;
  direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'START';
  prevMove?: Move;
  g: number; // Path cost
  h: number; // Heuristic cost
}

export interface SolverResult {
  path: Move[];
  steps: number;
  timeTaken: number;
  algorithmName: string;
  nodesExplored: number;
}

export interface PresetConfig {
  name: string;
  board: BoardState;
  goal?: BoardState;
}
