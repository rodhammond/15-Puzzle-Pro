import { BoardState, Move } from "../types";

/**
 * Calculates Manhattan distance for a single tile
 */
const getTileManhattan = (tile: number, currentIndex: number, goal: BoardState): number => {
  if (tile === 0) return 0;
  const goalIndex = goal.indexOf(tile);
  const currentRow = Math.floor(currentIndex / 4);
  const currentCol = currentIndex % 4;
  const goalRow = Math.floor(goalIndex / 4);
  const goalCol = goalIndex % 4;
  return Math.abs(currentRow - goalRow) + Math.abs(currentCol - goalCol);
};

/**
 * Gets total Manhattan distance for the board
 */
const getTotalManhattan = (board: BoardState, goal: BoardState): number => {
  return board.reduce((sum, tile, idx) => sum + getTileManhattan(tile, idx, goal), 0);
};

/**
 * Finds tiles that are out of position
 */
const getMisplacedTiles = (board: BoardState, goal: BoardState): number[] => {
  return board.filter((tile, idx) => tile !== 0 && tile !== goal[idx]);
};

/**
 * Checks if a tile is in its goal position
 */
const isTileInPlace = (tile: number, board: BoardState, goal: BoardState): boolean => {
  return board.indexOf(tile) === goal.indexOf(tile);
};

/**
 * Gets tiles that are correctly placed
 */
const getCorrectTiles = (board: BoardState, goal: BoardState): number[] => {
  return board.filter((tile, idx) => tile !== 0 && tile === goal[idx]);
};

/**
 * Analyzes which quadrant needs the most work
 */
const analyzeQuadrants = (board: BoardState, goal: BoardState): string => {
  const quadrants = [
    { name: "top-left", indices: [0, 1, 4, 5], score: 0 },
    { name: "top-right", indices: [2, 3, 6, 7], score: 0 },
    { name: "bottom-left", indices: [8, 9, 12, 13], score: 0 },
    { name: "bottom-right", indices: [10, 11, 14, 15], score: 0 },
  ];

  quadrants.forEach(q => {
    q.indices.forEach(idx => {
      if (board[idx] !== 0 && board[idx] !== goal[idx]) {
        q.score += getTileManhattan(board[idx], idx, goal);
      }
    });
  });

  const worst = quadrants.reduce((a, b) => a.score > b.score ? a : b);
  return worst.name;
};

/**
 * Generates direction-based advice
 */
const getDirectionAdvice = (direction: string): string => {
  const advice: Record<string, string> = {
    'UP': "Moving upward will shift tiles toward the top rows.",
    'DOWN': "Moving downward creates space in the upper region.",
    'LEFT': "A leftward move consolidates the right-side tiles.",
    'RIGHT': "Moving right opens up the left column for repositioning.",
  };
  return advice[direction] || "";
};

/**
 * Professional hint templates
 */
const hintTemplates = {
  excellent: [
    "Exceptional progress! Your Manhattan efficiency is at {percent}%. Maintain this trajectory.",
    "Outstanding alignment detected. Only {remaining} tiles require repositioning.",
    "You're demonstrating master-level tile coordination. The solution is within reach.",
  ],
  good: [
    "Solid positioning. Focus on the {quadrant} quadrant to maximize efficiency.",
    "Good progress with {correct} tiles locked. Consider stabilizing tile {suggest} next.",
    "Your current path shows promise. The {quadrant} region needs attention.",
  ],
  moderate: [
    "Strategic opportunity: the {quadrant} quadrant has the highest displacement. Prioritize this area.",
    "Consider the parking technique—temporarily move tile {suggest} to unlock tile {blocker}.",
    "Manhattan analysis suggests focusing on tiles {tiles}. They're blocking optimal flow.",
  ],
  challenging: [
    "Complex state detected. Apply the rotation strategy: cycle tiles in the {quadrant} region.",
    "High entropy configuration. Recommend solving row-by-row, starting from the top.",
    "Reset strategy advised: focus on placing tiles 1-4 first, then proceed sequentially.",
  ],
  withMove: [
    "The solver recommends moving {direction}. {advice}",
    "Optimal path indicates a {direction} move. This improves Manhattan distance by reducing tile displacement.",
    "Strategic analysis: {direction} is the next optimal move. {advice}",
  ],
};

/**
 * Generates an algorithmic hint based on puzzle state analysis
 */
export const getAlgorithmicHint = (
  currentBoard: BoardState,
  targetGoal: BoardState,
  nextOptimalMove?: Move
): string => {
  const totalManhattan = getTotalManhattan(currentBoard, targetGoal);
  const misplaced = getMisplacedTiles(currentBoard, targetGoal);
  const correct = getCorrectTiles(currentBoard, targetGoal);
  const worstQuadrant = analyzeQuadrants(currentBoard, targetGoal);

  // Calculate progress percentage (rough estimate)
  const maxManhattan = 48; // Theoretical max for 4x4
  const progressPercent = Math.round((1 - totalManhattan / maxManhattan) * 100);

  // Select hint category based on state
  let category: keyof typeof hintTemplates;
  if (misplaced.length <= 2) {
    category = 'excellent';
  } else if (misplaced.length <= 5) {
    category = 'good';
  } else if (misplaced.length <= 10) {
    category = 'moderate';
  } else {
    category = 'challenging';
  }

  // If we have a next move, sometimes use move-based hints
  if (nextOptimalMove && nextOptimalMove.direction !== 'START' && Math.random() > 0.4) {
    const templates = hintTemplates.withMove;
    const template = templates[Math.floor(Math.random() * templates.length)];
    const advice = getDirectionAdvice(nextOptimalMove.direction);
    return template
      .replace('{direction}', nextOptimalMove.direction)
      .replace('{advice}', advice);
  }

  // Select random template from category
  const templates = hintTemplates[category];
  const template = templates[Math.floor(Math.random() * templates.length)];

  // Fill in template variables
  return template
    .replace('{percent}', String(progressPercent))
    .replace('{remaining}', String(misplaced.length))
    .replace('{correct}', String(correct.length))
    .replace('{quadrant}', worstQuadrant)
    .replace('{suggest}', String(misplaced[0] || 1))
    .replace('{blocker}', String(misplaced[1] || misplaced[0] || 2))
    .replace('{tiles}', misplaced.slice(0, 3).join(', '));
};

/**
 * Checks if a user-provided API key exists in localStorage
 */
export const getUserApiKey = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('gemini_api_key');
  }
  return null;
};

/**
 * Saves user API key to localStorage
 */
export const setUserApiKey = (key: string): void => {
  if (typeof window !== 'undefined') {
    if (key.trim()) {
      localStorage.setItem('gemini_api_key', key.trim());
    } else {
      localStorage.removeItem('gemini_api_key');
    }
  }
};

/**
 * Checks if AI hints are available (either env key or user key)
 */
export const isAIAvailable = (): boolean => {
  const envKey = process.env.API_KEY;
  const userKey = getUserApiKey();
  return Boolean(envKey || userKey);
};
