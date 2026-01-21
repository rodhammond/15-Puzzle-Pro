
import { BoardState, Move, SolverResult, AlgorithmType } from '../types';
import { GOAL_STATE, GRID_SIZE } from '../constants';

class MinHeap<T> {
  private heap: { priority: number; value: T }[] = [];
  push(value: T, priority: number) {
    this.heap.push({ priority, value });
    this.bubbleUp();
  }
  pop(): T | undefined {
    if (this.size() === 0) return undefined;
    const top = this.heap[0].value;
    const bottom = this.heap.pop()!;
    if (this.size() > 0) {
      this.heap[0] = bottom;
      this.bubbleDown();
    }
    return top;
  }
  size() { return this.heap.length; }
  private bubbleUp() {
    let index = this.heap.length - 1;
    while (index > 0) {
      let parentIndex = Math.floor((index - 1) / 2);
      if (this.heap[index].priority >= this.heap[parentIndex].priority) break;
      [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
      index = parentIndex;
    }
  }
  private bubbleDown() {
    let index = 0;
    while (true) {
      let leftChild = 2 * index + 1;
      let rightChild = 2 * index + 2;
      let smallest = index;
      if (leftChild < this.heap.length && this.heap[leftChild].priority < this.heap[smallest].priority) smallest = leftChild;
      if (rightChild < this.heap.length && this.heap[rightChild].priority < this.heap[smallest].priority) smallest = rightChild;
      if (smallest === index) break;
      [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
      index = smallest;
    }
  }
}

export class PuzzleSolver {
  public static getManhattanDistance(board: BoardState, goal: BoardState): number {
    let distance = 0;
    for (let i = 0; i < board.length; i++) {
      const val = board[i];
      if (val !== 0) {
        const targetIdx = goal.indexOf(val);
        const targetRow = Math.floor(targetIdx / GRID_SIZE);
        const targetCol = targetIdx % GRID_SIZE;
        const currentRow = Math.floor(i / GRID_SIZE);
        const currentCol = i % GRID_SIZE;
        distance += Math.abs(targetRow - currentRow) + Math.abs(targetCol - currentCol);
      }
    }
    return distance;
  }

  public static getLinearConflict(board: BoardState, goal: BoardState): number {
    let conflict = 0;
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c1 = 0; c1 < GRID_SIZE; c1++) {
        const idx1 = r * GRID_SIZE + c1;
        const v1 = board[idx1];
        if (v1 === 0) continue;
        const gIdx1 = goal.indexOf(v1);
        if (Math.floor(gIdx1 / GRID_SIZE) !== r) continue;
        for (let c2 = c1 + 1; c2 < GRID_SIZE; c2++) {
          const idx2 = r * GRID_SIZE + c2;
          const v2 = board[idx2];
          if (v2 === 0) continue;
          const gIdx2 = goal.indexOf(v2);
          if (Math.floor(gIdx2 / GRID_SIZE) === r && (gIdx1 % GRID_SIZE) > (gIdx2 % GRID_SIZE)) conflict += 2;
        }
      }
    }
    for (let c = 0; c < GRID_SIZE; c++) {
      for (let r1 = 0; r1 < GRID_SIZE; r1++) {
        const idx1 = r1 * GRID_SIZE + c;
        const v1 = board[idx1];
        if (v1 === 0) continue;
        const gIdx1 = goal.indexOf(v1);
        if ((gIdx1 % GRID_SIZE) !== c) continue;
        for (let r2 = r1 + 1; r2 < GRID_SIZE; r2++) {
          const idx2 = r2 * GRID_SIZE + c;
          const v2 = board[idx2];
          if (v2 === 0) continue;
          const gIdx2 = goal.indexOf(v2);
          if ((gIdx2 % GRID_SIZE) === c && Math.floor(gIdx1 / GRID_SIZE) > Math.floor(gIdx2 / GRID_SIZE)) conflict += 2;
        }
      }
    }
    return conflict;
  }

  public static getComplexityScore(board: BoardState, goal: BoardState): number {
    return this.getManhattanDistance(board, goal) + this.getLinearConflict(board, goal);
  }

  private static getNeighbors(move: Move, goal: BoardState): Move[] {
    const neighbors: Move[] = [];
    const emptyIdx = move.emptyIndex;
    const r = Math.floor(emptyIdx / GRID_SIZE), c = emptyIdx % GRID_SIZE;
    const dirs = [{ dr: -1, dc: 0, dir: 'UP' as const }, { dr: 1, dc: 0, dir: 'DOWN' as const }, { dr: 0, dc: -1, dir: 'LEFT' as const }, { dr: 0, dc: 1, dir: 'RIGHT' as const }];
    for (const { dr, dc, dir } of dirs) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
        const ni = nr * GRID_SIZE + nc;
        const nb = [...move.board];
        [nb[emptyIdx], nb[ni]] = [nb[ni], nb[emptyIdx]];
        neighbors.push({ board: nb, emptyIndex: ni, direction: dir, prevMove: move, g: move.g + 1, h: 0 });
      }
    }
    return neighbors;
  }

  public static isSolvable(board: BoardState, goal: BoardState = GOAL_STATE): boolean {
    const n = board.length;
    let inversions = 0;
    const flatBoard = board.filter(x => x !== 0);
    for (let i = 0; i < flatBoard.length; i++) {
      for (let j = i + 1; j < flatBoard.length; j++) {
        const goalPosI = goal.indexOf(flatBoard[i]);
        const goalPosJ = goal.indexOf(flatBoard[j]);
        if (goalPosI > goalPosJ) inversions++;
      }
    }
    const emptyIdx = board.indexOf(0);
    const rowFromBottom = GRID_SIZE - Math.floor(emptyIdx / GRID_SIZE);
    const goalEmptyIdx = goal.indexOf(0);
    const goalRowFromBottom = GRID_SIZE - Math.floor(goalEmptyIdx / GRID_SIZE);
    return (inversions % 2 === Math.abs(rowFromBottom - goalRowFromBottom) % 2);
  }

  private static idaStar(start: BoardState, goal: BoardState): SolverResult | null {
    const startTime = performance.now();
    let threshold = this.getComplexityScore(start, goal);
    const startMove: Move = { board: start, emptyIndex: start.indexOf(0), direction: 'START', g: 0, h: threshold };
    let nodesVisited = 0;

    const search = (move: Move, g: number, threshold: number): { min: number; result?: Move } => {
      nodesVisited++;
      const h = this.getComplexityScore(move.board, goal);
      const f = g + h;
      if (f > threshold) return { min: f };
      if (h === 0) return { min: f, result: move };

      let min = Infinity;
      const neighbors = this.getNeighbors(move, goal).sort((a, b) => this.getComplexityScore(a.board, goal) - this.getComplexityScore(b.board, goal));
      
      for (const next of neighbors) {
        if (move.prevMove && next.board.every((v, i) => v === move.prevMove!.board[i])) continue;
        const res = search(next, g + 1, threshold);
        if (res.result) return res;
        if (res.min < min) min = res.min;
      }
      return { min };
    };

    while (performance.now() - startTime < 12000) {
      const { min, result } = search(startMove, 0, threshold);
      if (result) {
        const path: Move[] = [];
        let t: Move | undefined = result;
        while (t) { path.unshift(t); t = t.prevMove; }
        return { path, steps: path.length - 1, timeTaken: performance.now() - startTime, algorithmName: 'IDA*', nodesExplored: nodesVisited };
      }
      if (min === Infinity) return null;
      threshold = min;
    }
    return null;
  }

  public static solve(start: BoardState, algo: AlgorithmType = 'Iterative-Deepening', goal: BoardState = GOAL_STATE): SolverResult | null {
    if (!this.isSolvable(start, goal)) return null;
    if (algo === 'Iterative-Deepening') return this.idaStar(start, goal);

    const startTime = performance.now();
    const isHeuristicBased = (algo === 'A*' || algo === 'Greedy-Best');
    const startH = isHeuristicBased ? this.getComplexityScore(start, goal) : 0;
    const startMove: Move = { board: start, emptyIndex: start.indexOf(0), direction: 'START', g: 0, h: startH };
    
    const closedSet = new Set<string>();
    const pq = new MinHeap<Move>();
    pq.push(startMove, startH);

    let nodesVisited = 0;
    const MAX_ITERS = algo === 'A*' ? 500000 : 200000;

    while (pq.size() > 0 && nodesVisited < MAX_ITERS) {
      nodesVisited++;
      const current = pq.pop()!;
      if (current.board.every((v, i) => v === goal[i])) {
        const path: Move[] = [];
        let t: Move | undefined = current;
        while (t) { path.unshift(t); t = t.prevMove; }
        return { path, steps: path.length - 1, timeTaken: performance.now() - startTime, algorithmName: algo, nodesExplored: nodesVisited };
      }

      const key = current.board.join(',');
      if (closedSet.has(key)) continue;
      closedSet.add(key);

      for (const n of this.getNeighbors(current, goal)) {
        if (!closedSet.has(n.board.join(','))) {
          if (algo === 'A*') {
            n.h = this.getComplexityScore(n.board, goal);
            const weight = n.g > 30 ? 1.3 : 1.1;
            pq.push(n, n.g + (n.h * weight));
          } else if (algo === 'Greedy-Best') {
            n.h = this.getComplexityScore(n.board, goal);
            pq.push(n, n.h);
          }
        }
      }
    }
    return null;
  }
}
