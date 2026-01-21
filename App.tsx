
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import confetti from 'canvas-confetti';
import PuzzleBoard from './components/PuzzleBoard';
import MiniBoard from './components/MiniBoard';
import { BoardState, SolverResult, AlgorithmType } from './types';
import { GOAL_STATE, PRESETS } from './constants';
import { PuzzleSolver } from './services/puzzleSolver';
import { getAIHint } from './services/geminiService';

type DifficultyLevel = 'Evaluating...' | 'Trivial' | 'Easy' | 'Medium' | 'Hard' | 'Extreme' | 'Insane' | 'N/A';

const App: React.FC = () => {
  const [board, setBoard] = useState<BoardState>(PRESETS[0].board || GOAL_STATE);
  const [targetGoal, setTargetGoal] = useState<BoardState>(PRESETS[0].goal || GOAL_STATE);
  const [movesCount, setMovesCount] = useState(0);
  const [time, setTime] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedAlgo, setSelectedAlgo] = useState<AlgorithmType>('Iterative-Deepening');
  const [activePresetIdx, setActivePresetIdx] = useState<number>(0);
  const [isSolving, setIsSolving] = useState(false);
  const [solverStatus, setSolverStatus] = useState<'idle' | 'searching' | 'no-path' | 'timeout' | 'error'>('idle');
  const [aiHint, setAiHint] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [solveResult, setSolveResult] = useState<SolverResult | null>(null);
  const [inputMode, setInputMode] = useState(false);
  const [isVisualizing, setIsVisualizing] = useState(false);
  
  const [customStartInput, setCustomStartInput] = useState("");
  const [customGoalInput, setCustomGoalInput] = useState("");
  const [activeInputTab, setActiveInputTab] = useState<'start' | 'goal'>('start');
  
  const [dynamicDifficulty, setDynamicDifficulty] = useState<DifficultyLevel>('Trivial');
  const [complexityScore, setComplexityScore] = useState<number>(0);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackIndex, setPlaybackIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(200); // ms per move
  const playbackIntervalRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<number | null>(null);

  const isSolved = JSON.stringify(board) === JSON.stringify(targetGoal);
  const isCurrentlySolvable = PuzzleSolver.isSolvable(board, targetGoal);

  // Alphabetize Presets (skipping index 0 and 1)
  const sortedPresets = useMemo(() => {
    const fixed = PRESETS[0];
    const shuffleRef = PRESETS[1];
    const others = PRESETS.slice(2).sort((a, b) => a.name.localeCompare(b.name));
    return { fixed, shuffleRef, others };
  }, []);

  // Calculate matches (excluding the empty space)
  const matchedCount = board.reduce((count, val, idx) => {
    if (val === 0) return count;
    return val === targetGoal[idx] ? count + 1 : count;
  }, 0);

  const stopPlayback = useCallback(() => {
    if (playbackIntervalRef.current) { 
      window.clearTimeout(playbackIntervalRef.current); 
      playbackIntervalRef.current = null; 
    }
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    if (isSolved && isGameActive) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 500 };
      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);

        const particleCount = 50 * (timeLeft / duration);
        confetti({ 
          ...defaults, 
          particleCount, 
          colors: ['#dc2626', '#ffffff'],
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } 
        });
        confetti({ 
          ...defaults, 
          particleCount, 
          colors: ['#dc2626', '#ffffff'],
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } 
        });
      }, 250);

      setIsGameActive(false);
      stopPlayback();
    }
  }, [isSolved, isGameActive, stopPlayback]);

  const conductDifficultyAssessment = useCallback((currentBoard: BoardState, goal: BoardState) => {
    if (JSON.stringify(currentBoard) === JSON.stringify(goal)) {
      setDynamicDifficulty('Trivial');
      setComplexityScore(0);
      return;
    }
    if (!PuzzleSolver.isSolvable(currentBoard, goal)) {
      setDynamicDifficulty('N/A');
      setComplexityScore(0);
      return;
    }
    setDynamicDifficulty('Evaluating...');
    setTimeout(() => {
      const score = PuzzleSolver.getComplexityScore(currentBoard, goal);
      setComplexityScore(score);
      if (score < 18) setDynamicDifficulty('Easy');
      else if (score < 34) setDynamicDifficulty('Medium');
      else if (score < 50) setDynamicDifficulty('Hard');
      else if (score < 66) setDynamicDifficulty('Extreme');
      else setDynamicDifficulty('Insane');
    }, 150);
  }, []);

  useEffect(() => {
    stopPlayback();
    setSolveResult(null);
    setSolverStatus('idle');
    setPlaybackIndex(0);
  }, [selectedAlgo, stopPlayback]);

  const handleTileClick = useCallback((index: number) => {
    if (isPlaying || isSolving || isPaused || isSolved) return;
    const ei = board.indexOf(0);
    const r = Math.floor(index / 4), c = index % 4, er = Math.floor(ei / 4), ec = ei % 4;
    if ((Math.abs(r - er) === 1 && c === ec) || (Math.abs(c - ec) === 1 && r === er)) {
      const nb = [...board]; 
      [nb[index], nb[ei]] = [nb[ei], nb[index]];
      
      // Manual move invalidates any current solve calculation
      setSolveResult(null); 
      setSolverStatus('idle');
      setPlaybackIndex(0);
      
      setBoard(nb); 
      setMovesCount(p => p + 1); 
      conductDifficultyAssessment(nb, targetGoal);
      if (!isGameActive && JSON.stringify(nb) !== JSON.stringify(targetGoal)) { 
        setIsGameActive(true); 
        setTime(0); 
      }
    }
  }, [board, isPlaying, isSolving, isPaused, isSolved, isGameActive, targetGoal, conductDifficultyAssessment]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (inputMode || isVisualizing || isPlaying || isSolving || isPaused || isSolved) return;
      const ei = board.indexOf(0);
      const er = Math.floor(ei / 4), ec = ei % 4;
      let targetIdx = -1;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') { if (er < 3) targetIdx = (er + 1) * 4 + ec; }
      else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') { if (er > 0) targetIdx = (er - 1) * 4 + ec; }
      else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') { if (ec < 3) targetIdx = er * 4 + (ec + 1); }
      else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') { if (ec > 0) targetIdx = er * 4 + (ec - 1); }
      if (targetIdx !== -1) handleTileClick(targetIdx);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [board, inputMode, isVisualizing, isPlaying, isSolving, isPaused, isSolved, handleTileClick]);

  useEffect(() => {
    if (isGameActive && !isPaused && !isSolving && !isPlaying && !isSolved) {
      timerIntervalRef.current = window.setInterval(() => setTime(prev => prev + 1), 1000);
    } else if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    return () => { if (timerIntervalRef.current) clearInterval(timerIntervalRef.current); };
  }, [isGameActive, isPaused, isSolving, isPlaying, isSolved]);

  const runSolver = () => {
    if (isSolved || isPaused || !isCurrentlySolvable) return;
    stopPlayback(); 
    setIsSolving(true); 
    setSolverStatus('searching'); 
    setSolveResult(null);
    setTimeout(() => {
      try {
        const res = PuzzleSolver.solve(board, selectedAlgo, targetGoal);
        if (res) { 
          setSolveResult(res); 
          setSolverStatus('idle'); 
          setPlaybackIndex(0); 
        } else { 
          setSolverStatus('timeout'); 
        }
      } catch (e) { 
        console.error(e); 
        setSolverStatus('error'); 
      } finally { 
        setIsSolving(false); 
      }
    }, 50);
  };

  const startPlayback = () => {
    if (!solveResult || isPaused) return;
    setIsPlaying(true);
    setIsGameActive(true);

    const step = () => {
      setPlaybackIndex(p => {
        const n = p + 1;
        if (n >= solveResult.path.length) { 
          stopPlayback(); 
          return p; 
        }
        const nextBoard = solveResult.path[n].board;
        setBoard(nextBoard); 
        setMovesCount(mv => mv + 1);
        conductDifficultyAssessment(nextBoard, targetGoal);
        
        // Re-schedule based on current speed
        playbackIntervalRef.current = window.setTimeout(step, playbackSpeed);
        return n;
      });
    };

    playbackIntervalRef.current = window.setTimeout(step, playbackSpeed);
  };

  // Re-sync playback when speed changes
  useEffect(() => {
    if (isPlaying && playbackIntervalRef.current) {
      window.clearTimeout(playbackIntervalRef.current);
      const step = () => {
        setPlaybackIndex(p => {
          const n = p + 1;
          if (n >= solveResult!.path.length) { 
            stopPlayback(); 
            return p; 
          }
          const nextBoard = solveResult!.path[n].board;
          setBoard(nextBoard); 
          setMovesCount(mv => mv + 1);
          conductDifficultyAssessment(nextBoard, targetGoal);
          playbackIntervalRef.current = window.setTimeout(step, playbackSpeed);
          return n;
        });
      };
      playbackIntervalRef.current = window.setTimeout(step, playbackSpeed);
    }
  }, [playbackSpeed, isPlaying, solveResult, stopPlayback, conductDifficultyAssessment]);

  const shuffleBoard = (sb: BoardState) => {
    let b = [...sb], ei = b.indexOf(0);
    for (let i = 0; i < 600; i++) {
      let r = Math.floor(ei / 4), c = ei % 4, n = [];
      if (r > 0) n.push(ei - 4); if (r < 3) n.push(ei + 4); if (c > 0) n.push(ei - 1); if (c < 3) n.push(ei + 1);
      let m = n[Math.floor(Math.random() * n.length)];
      [b[ei], b[m]] = [b[m], b[ei]]; 
      ei = m;
    }
    return b;
  };

  const getStartButtonLabel = () => {
    const isAtGoal = JSON.stringify(board) === JSON.stringify(targetGoal);
    if (activePresetIdx === -1) return isAtGoal ? "START & SHUFFLE" : "START";
    if (activePresetIdx === 1) return "START";
    return isAtGoal ? "START & SHUFFLE" : "START";
  };

  const handleStartShuffle = () => {
    stopPlayback();
    const label = getStartButtonLabel();
    const shouldShuffle = label === "START & SHUFFLE";
    const nb = shouldShuffle ? shuffleBoard(board) : board;
    setBoard(nb);
    setMovesCount(0);
    setTime(0);
    setIsGameActive(true);
    setIsPaused(false);
    setSolveResult(null);
    setSolverStatus('idle');
    setPlaybackIndex(0);
    conductDifficultyAssessment(nb, targetGoal);
  };

  const parseBoard = (str: string): BoardState | null => {
    try {
      const parts = str.split(/[,\s]+/).map(p => parseInt(p.trim(), 10));
      if (parts.length !== 16) return null;
      const unique = new Set(parts);
      if (unique.size !== 16) return null;
      if (parts.some(n => isNaN(n) || n < 0 || n > 15)) return null;
      return parts;
    } catch { return null; }
  };

  const applyCustomConfig = () => {
    const start = parseBoard(customStartInput);
    const goal = parseBoard(customGoalInput);
    if (start) {
      setBoard(start);
      setActivePresetIdx(-1);
    }
    if (goal) {
      setTargetGoal(goal);
    }
    if (start || goal) {
      setMovesCount(0);
      setTime(0);
      setIsGameActive(false);
      setSolveResult(null);
      setSolverStatus('idle');
      setPlaybackIndex(0);
      conductDifficultyAssessment(start || board, goal || targetGoal);
      setInputMode(false);
    }
  };

  const handleRequestHint = async () => {
    if (isAiLoading || (!isGameActive && movesCount === 0) || isPaused || !isCurrentlySolvable) return;
    setIsAiLoading(true);
    setAiHint(null);
    try {
      // Pass the solver's next move if we have an active solveResult
      const nextMove = (solveResult && playbackIndex < solveResult.path.length - 1) 
        ? solveResult.path[playbackIndex + 1] 
        : undefined;
        
      const hint = await getAIHint(board, targetGoal, nextMove);
      setAiHint(hint);
    } catch (e) {
      setAiHint("Focus on solving the top-left corner sequentially.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleApplyPreset = (p: any, originalIdx: number) => {
    stopPlayback(); 
    const ng = p.goal || GOAL_STATE; 
    const nb = p.board || GOAL_STATE; 
    setTargetGoal(ng); 
    setBoard(nb); 
    setMovesCount(0); 
    setTime(0); 
    setIsGameActive(false); 
    setIsPaused(false); 
    setActivePresetIdx(originalIdx); 
    setSolveResult(null); 
    setSolverStatus('idle'); 
    setPlaybackIndex(0); 
    conductDifficultyAssessment(nb, ng);
  };

  const engines: { id: AlgorithmType; label: string; tag: string; color: string; desc: string; precision: string }[] = [
    { id: 'Iterative-Deepening', label: 'IDA*', tag: 'GRANDMASTER', color: 'bg-blue-500/10 text-blue-500', desc: 'Optimal results. Best for deep 4x4 paths.', precision: 'Mathematical Optimum' },
    { id: 'Greedy-Best', label: 'Greedy', tag: 'HIGH VELOCITY', color: 'bg-yellow-500/10 text-yellow-500', desc: 'Instant solving. Paths may be suboptimal.', precision: 'Approximation' },
    { id: 'A*', label: 'Precision A*', tag: 'RELIABLE', color: 'bg-green-500/10 text-green-500', desc: 'Optimal for shallow to medium shuffles.', precision: 'Weighted Optimum' },
  ];

  const stepsRemaining = solveResult ? solveResult.steps - playbackIndex : 0;
  const showRemaining = solveResult && (isPlaying || playbackIndex > 0);

  return (
    <div className="max-w-[1700px] mx-auto px-6 py-10 flex flex-col items-center text-white min-h-screen">
      <header className="text-center mb-12">
        <h1 className="text-7xl md:text-8xl font-black mb-2 tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-red-600 via-white to-red-600 uppercase">15-PUZZLE</h1>
        <p className="text-slate-400 font-bold tracking-[0.4em] uppercase text-xl">Professional Solver & Strategy Console</p>
      </header>

      <div className="w-full grid grid-cols-1 xl:grid-cols-[380px,1fr,420px] gap-12 items-start justify-items-center">
        {/* Left Column: Algorithm Path Engine & AI Advisor */}
        <div className="w-full flex flex-col gap-8 order-2 xl:order-1">
          <section className="bg-slate-900 p-10 rounded-[3rem] border-2 border-slate-800 shadow-2xl">
            <h2 className="text-xl font-black text-yellow-500 uppercase tracking-widest mb-10">ALGORITHM PATH ENGINE</h2>
            <div className="grid grid-cols-1 gap-4 mb-10">
              {engines.map(algo => (
                <button key={algo.id} disabled={isSolving || isPlaying || isPaused} onClick={() => setSelectedAlgo(algo.id)} className={`text-left p-6 rounded-2xl transition-all border-2 ${selectedAlgo === algo.id ? 'bg-red-600/10 border-red-600 text-red-400' : 'bg-slate-800 border-slate-700 text-slate-500'} disabled:opacity-20`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-base font-black tracking-tight">{algo.label}</span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded ${algo.color}`}>{algo.tag}</span>
                  </div>
                  <p className="text-[10px] font-bold opacity-60 leading-tight">{algo.desc}</p>
                </button>
              ))}
            </div>

            {solveResult ? (
              <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-slate-800 p-5 rounded-3xl border border-slate-700 flex flex-col">
                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                      {showRemaining ? 'Steps Remaining' : 'Steps Found'}
                    </span>
                    <span className="text-3xl font-black">
                      {showRemaining ? stepsRemaining : solveResult.steps}
                    </span>
                  </div>
                  <div className="bg-slate-800 p-5 rounded-3xl border border-slate-700 flex flex-col">
                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Heuristic</span>
                    <span className="text-xs font-black text-blue-400 mt-1 uppercase leading-tight">
                      {engines.find(e => e.id === selectedAlgo)?.precision}
                    </span>
                    <span className="text-[10px] opacity-40 font-bold mt-1">Nodes: {solveResult.nodesExplored.toLocaleString()}</span>
                  </div>
                </div>

                <div className="bg-slate-800 p-6 rounded-[2rem] border border-slate-700 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Sequence Velocity</span>
                    <span className="text-[10px] font-black text-red-500 uppercase">{playbackSpeed}ms / step</span>
                  </div>
                  <input 
                    type="range" 
                    min="50" 
                    max="1000" 
                    step="50" 
                    value={playbackSpeed} 
                    onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                    className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-red-600"
                  />
                  <div className="flex justify-between text-[8px] font-black text-slate-600 uppercase">
                    <span>Warp</span>
                    <span>Learning</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={isPlaying ? stopPlayback : startPlayback} 
                      disabled={isSolved || isPaused} 
                      className={`py-5 rounded-2xl font-black uppercase tracking-widest transition-all text-lg ${
                        isPlaying 
                          ? 'bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-900/40' 
                          : 'bg-yellow-500 hover:bg-yellow-400 text-slate-950 shadow-lg shadow-yellow-900/20'
                      }`}
                    >
                      {isPlaying ? <div className="flex items-center justify-center gap-2"><i className="fas fa-stop"></i><span>Stop</span></div> : <div className="flex items-center justify-center gap-2"><i className="fas fa-play"></i><span>Auto-Solve</span></div>}
                    </button>
                    <button 
                      onClick={() => { 
                        if (!solveResult || playbackIndex >= solveResult.path.length - 1) return; 
                        const nextIdx = playbackIndex + 1; 
                        const nb = solveResult.path[nextIdx].board; 
                        setBoard(nb); 
                        setPlaybackIndex(nextIdx); 
                        setMovesCount(mv => mv + 1); 
                        conductDifficultyAssessment(nb, targetGoal); 
                      }} 
                      disabled={isPlaying || isPaused || playbackIndex >= solveResult.path.length - 1} 
                      className="py-5 bg-slate-800 text-white rounded-2xl font-black transition-all hover:bg-slate-700 border border-slate-700 text-lg"
                    >
                      Next Move
                    </button>
                  </div>
                  <button 
                    onClick={() => setIsVisualizing(true)} 
                    disabled={isPlaying || !solveResult}
                    className="w-full py-5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border-2 border-blue-500/30 rounded-2xl font-black uppercase tracking-widest transition-all text-base flex items-center justify-center gap-2 disabled:opacity-20"
                  >
                    <i className="fas fa-project-diagram"></i> Visualize Sequence
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {!isSolving && solverStatus !== 'idle' && (
                  <div className={`p-6 rounded-[2rem] border-2 animate-in fade-in slide-in-from-top-2 duration-300 ${solverStatus === 'timeout' ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' : solverStatus === 'no-path' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-red-950 border-red-900 text-red-500'}`}>
                    <div className="flex items-center gap-4 mb-2">
                      <i className={`fas ${solverStatus === 'timeout' ? 'fa-hourglass-end' : 'fa-exclamation-triangle'} text-2xl`}></i>
                      <h4 className="font-black uppercase tracking-widest text-lg">{solverStatus === 'timeout' ? 'Search Limit Exceeded' : solverStatus === 'no-path' ? 'No Solution Found' : 'Engine Failure'}</h4>
                    </div>
                    <p className="text-sm font-medium opacity-80 leading-relaxed">{solverStatus === 'timeout' ? `The ${selectedAlgo} engine reached its maximum exploration threshold.` : solverStatus === 'no-path' ? `Exhaustive search completed. This configuration is mathematically impossible.` : `An unexpected error occurred.`}</p>
                  </div>
                )}
                <button onClick={runSolver} disabled={isSolving || isSolved || isPaused || !isCurrentlySolvable} className={`w-full py-8 rounded-[2rem] font-black text-2xl flex items-center justify-center gap-4 transition-all shadow-xl disabled:opacity-20 ${isSolving ? 'bg-slate-800 text-blue-400 shadow-none' : 'bg-gradient-to-br from-red-600 to-red-800 hover:from-red-500 shadow-red-900/40'}`}>
                  {isSolving ? <i className="fas fa-cog fa-spin"></i> : <i className="fas fa-bolt"></i>}
                  {isSolving ? 'ANALYZING STATE...' : 'RUN ENGINE'}
                </button>
              </div>
            )}
          </section>

          <section className="bg-slate-800/30 p-10 rounded-[3rem] border border-slate-700/50 backdrop-blur-3xl shadow-2xl min-h-[350px]">
            <div className="flex flex-col gap-2 mb-8 border-b border-slate-700/50 pb-8">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-black text-slate-500 uppercase tracking-widest">AI Strategic Advisor</h2>
                <div className="flex items-center gap-2">
                   {isAiLoading && <i className="fas fa-circle-notch fa-spin text-blue-500 text-xs"></i>}
                   <span className="text-[10px] font-black text-slate-600 uppercase">Grandmaster Coach</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 font-bold uppercase tracking-tight">Real-time Mission Intelligence</p>
            </div>
            <div className="relative group">
              <div className={`text-lg text-slate-300 italic leading-relaxed font-medium min-h-[120px] transition-all duration-500 ${isAiLoading ? 'opacity-30 blur-sm' : 'opacity-100 blur-0'}`}>
                {!isCurrentlySolvable ? (
                   <span className="text-red-500/60">Strategy analysis disabled for impossible board states. Restore solvability to receive insights.</span>
                ) : (
                  aiHint || "The system is fully synchronized. Request a strategic briefing to identify high-efficiency maneuvers based on your current goal."
                )}
              </div>
              <div className="mt-8">
                <button 
                  onClick={handleRequestHint} 
                  disabled={isAiLoading || isSolved || isPaused || !isCurrentlySolvable || (!isGameActive && movesCount === 0)} 
                  className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest transition-all text-sm border-2 flex items-center justify-center gap-3 ${
                    isAiLoading 
                      ? 'bg-slate-800 border-slate-700 text-slate-500' 
                      : 'bg-blue-600/10 border-blue-500/30 text-blue-500 hover:bg-blue-600 hover:text-white shadow-lg shadow-blue-900/10'
                  } disabled:opacity-20`}
                >
                  <i className={`fas ${isAiLoading ? 'fa-sync fa-spin' : 'fa-brain'}`}></i>
                  {isAiLoading ? 'BRIEFING IN PROGRESS...' : 'REQUEST STRATEGIC BRIEFING'}
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Center Column: Stats & Board */}
        <div className="flex flex-col items-center gap-10 w-full order-1 xl:order-2">
          <div className="flex justify-between items-center w-full max-w-[850px] px-12 py-10 bg-slate-800/50 rounded-[3rem] border border-slate-700 shadow-2xl">
            <div className="flex flex-col items-center gap-2">
              <span className="text-lg text-slate-500 font-black uppercase">Time</span>
              <span className="text-5xl font-black text-white font-mono">{Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}</span>
            </div>
            <div className="w-[3px] h-14 bg-slate-700/50 hidden md:block"></div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-lg text-slate-500 font-black uppercase">Moves Made</span>
              <span className="text-5xl font-black text-red-500">{movesCount}</span>
            </div>
            <div className="w-[3px] h-14 bg-slate-700/50 hidden md:block"></div>
            <div className="flex flex-col items-center gap-2 min-w-[180px]">
              <span className="text-lg text-slate-500 font-black uppercase">Pattern Match</span>
              <div className="flex flex-col items-center">
                <span className={`text-4xl font-black uppercase ${matchedCount === 15 ? 'text-green-400' : 'text-blue-400'}`}>
                  {matchedCount} / 15
                </span>
                <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-1">Tiles Correct</span>
              </div>
            </div>
            <div className="w-[3px] h-14 bg-slate-700/50 hidden md:block"></div>
            <div className={`text-lg font-black uppercase px-8 py-4 rounded-2xl transition-all ${isPaused ? 'bg-orange-500/20 text-orange-400' : isGameActive ? 'bg-green-500/10 text-green-400 animate-pulse' : 'bg-slate-700 text-slate-400'}`}>
              {isPaused ? 'Paused' : isGameActive ? 'Playing' : isSolved ? 'Complete' : 'Idle'}
            </div>
          </div>

          <div className={`relative w-full flex justify-center transition-all duration-300 ease-in-out ${isPaused ? 'opacity-20 blur-2xl pointer-events-none scale-95' : 'opacity-100 scale-100'}`}>
            <PuzzleBoard board={board} onTileClick={handleTileClick} suggestedTileIndex={solveResult && playbackIndex < solveResult.path.length - 1 ? solveResult.path[playbackIndex + 1].emptyIndex : undefined} />
          </div>

          <div className="flex flex-wrap justify-center gap-8 w-full max-w-[850px]">
            {(!isGameActive || isSolved) ? (
              <button onClick={handleStartShuffle} className="px-14 py-6 bg-green-600 hover:bg-green-500 rounded-2xl font-black transition-all shadow-2xl shadow-green-900/40 text-white uppercase text-2xl tracking-tight min-w-[320px]">
                {getStartButtonLabel()}
              </button>
            ) : isPaused ? (
              <button onClick={() => setIsPaused(false)} className="px-14 py-6 bg-lime-500 hover:bg-lime-400 rounded-2xl font-black transition-all shadow-2xl shadow-lime-900/40 text-slate-900 uppercase text-2xl tracking-tight min-w-[320px]">RESUME PLAY</button>
            ) : (
              <button onClick={() => { stopPlayback(); setIsPaused(true); }} className="px-14 py-6 bg-orange-500 hover:bg-orange-400 rounded-2xl font-black transition-all shadow-2xl shadow-orange-900/40 text-white uppercase text-2xl tracking-tight min-w-[320px]">STOP / FREEZE</button>
            )}
            {isGameActive && (
              <button onClick={() => { stopPlayback(); const activeGoal = sortedPresets.fixed.goal || GOAL_STATE; setBoard(activeGoal); setMovesCount(0); setTime(0); setIsGameActive(false); setIsPaused(false); setSolveResult(null); setSolverStatus('idle'); setPlaybackIndex(0); conductDifficultyAssessment(activeGoal, targetGoal); }} className="px-14 py-6 bg-red-600 hover:bg-red-500 rounded-2xl font-black transition-all border-2 border-red-700 text-white shadow-2xl shadow-red-900/40 uppercase text-2xl tracking-tight">HARD RESET</button>
            )}
          </div>
        </div>

        {/* Right Column: Presets & Target Objective */}
        <div className="w-full flex flex-col gap-8 order-3">
          <section className="bg-slate-800/30 p-10 rounded-[3rem] border border-slate-700/50 backdrop-blur-3xl shadow-2xl">
             <div className="flex justify-between items-start mb-10 border-b border-slate-700/50 pb-10">
               <div className="flex flex-col gap-3">
                 <h2 className="text-xl font-black text-yellow-500 uppercase tracking-widest">Target Objective</h2>
                 <p className="text-sm text-slate-600 font-bold max-w-[200px] leading-relaxed">Match this exactly to complete the mission.</p>
               </div>
               <MiniBoard board={targetGoal} title="Goal State" isActive={isSolved} />
             </div>
             
             <h2 className="text-xl font-black text-slate-600 uppercase tracking-widest mb-8">Board Presets</h2>
             <div className="grid grid-cols-1 gap-5">
               {/* 1. Classic Order (Fixed at top) */}
               <div className={`relative flex flex-col gap-2 transition-all ${activePresetIdx === 0 || activePresetIdx === 1 ? 'scale-[1.02]' : ''}`}>
                 <button disabled={isPlaying || isSolving || isPaused} onClick={() => handleApplyPreset(sortedPresets.fixed, 0)} className={`text-left p-8 rounded-[2rem] flex justify-between items-center transition-all border-2 w-full ${activePresetIdx === 0 || activePresetIdx === 1 ? 'bg-red-600/10 border-red-500/40 text-red-500 shadow-xl' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600'}`}>
                   <span className="text-xl font-bold tracking-tight">{sortedPresets.fixed.name}</span>
                   <i className="fas fa-chevron-right text-sm opacity-40 mr-28"></i>
                 </button>
                 <button disabled={isPlaying || isSolving || isPaused} onClick={(e) => { e.stopPropagation(); stopPlayback(); const ng = GOAL_STATE; const nb = shuffleBoard(ng); setTargetGoal(ng); setBoard(nb); setMovesCount(0); setTime(0); setIsGameActive(false); setIsPaused(false); setActivePresetIdx(1); setSolveResult(null); setSolverStatus('idle'); setPlaybackIndex(0); conductDifficultyAssessment(nb, ng); }} className={`absolute right-4 top-1/2 -translate-y-1/2 px-5 py-3 rounded-xl font-black uppercase text-xs tracking-widest transition-all ${activePresetIdx === 1 ? 'bg-red-600 text-white shadow-lg' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700'}`}>SHUFFLE</button>
               </div>

               {/* 2. Sorted Other Presets */}
               {sortedPresets.others.map((p) => {
                 const originalIdx = PRESETS.indexOf(p);
                 const isActive = activePresetIdx === originalIdx;
                 return (
                   <button key={p.name} disabled={isPlaying || isSolving || isPaused} onClick={() => handleApplyPreset(p, originalIdx)} className={`text-left p-8 rounded-[2rem] flex justify-between items-center transition-all border-2 w-full ${isActive ? 'bg-red-600/10 border-red-500/40 text-red-500 shadow-xl' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600'}`}>
                     <span className="text-xl font-bold tracking-tight">{p.name}</span>
                     <i className="fas fa-chevron-right text-sm opacity-40"></i>
                   </button>
                 );
               })}

               {/* 3. Manual Configuration (Fixed at bottom) */}
               <button 
                 disabled={isPlaying || isSolving || isPaused} 
                 onClick={() => { setCustomStartInput(board.join(", ")); setCustomGoalInput(targetGoal.join(", ")); setInputMode(true); }} 
                 className={`text-left p-8 rounded-[2rem] flex justify-between items-center transition-all border-2 w-full ${activePresetIdx === -1 ? 'bg-blue-600/10 border-blue-500/40 text-blue-500' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600'}`}
               >
                 <span className="text-xl font-bold tracking-tight">Manual Configuration</span>
                 <i className="fas fa-edit text-sm opacity-40"></i>
               </button>
             </div>
          </section>
        </div>
      </div>

      {inputMode && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6 z-[300] animate-in fade-in duration-300">
          <div className="bg-slate-900 w-full max-w-[700px] rounded-[3rem] border border-slate-700 shadow-2xl overflow-hidden">
            <header className="p-8 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-3xl font-black uppercase tracking-tighter">Manual State Entry</h3>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Input 16 values (0-15) comma-separated</p>
              </div>
              <button onClick={() => setInputMode(false)} className="w-12 h-12 bg-slate-800 hover:bg-red-600 transition-all rounded-full flex items-center justify-center"><i className="fas fa-times"></i></button>
            </header>
            <div className="p-10 space-y-8">
              <div className="flex gap-4 p-1 bg-slate-950 rounded-2xl border border-slate-800">
                <button onClick={() => setActiveInputTab('start')} className={`flex-1 py-4 rounded-xl font-black text-sm uppercase transition-all ${activeInputTab === 'start' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}>Start State</button>
                <button onClick={() => setActiveInputTab('goal')} className={`flex-1 py-4 rounded-xl font-black text-sm uppercase transition-all ${activeInputTab === 'goal' ? 'bg-red-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}>Goal State</button>
              </div>
              {activeInputTab === 'start' ? (
                <div className="space-y-4 animate-in slide-in-from-left-4">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest block">Current Board (16 Numbers)</label>
                  <textarea value={customStartInput} onChange={e => setCustomStartInput(e.target.value)} className="w-full h-32 bg-slate-950 border border-slate-800 rounded-2xl p-6 font-mono text-lg text-blue-400 focus:border-blue-500 outline-none transition-all placeholder:opacity-20" placeholder="1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0" />
                </div>
              ) : (
                <div className="space-y-4 animate-in slide-in-from-right-4">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest block">Goal Configuration (16 Numbers)</label>
                  <textarea value={customGoalInput} onChange={e => setCustomGoalInput(e.target.value)} className="w-full h-32 bg-slate-950 border border-slate-800 rounded-2xl p-6 font-mono text-lg text-red-400 focus:border-red-500 outline-none transition-all placeholder:opacity-20" placeholder="1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0" />
                </div>
              )}
              <button onClick={applyCustomConfig} disabled={!parseBoard(customStartInput) && !parseBoard(customGoalInput)} className="w-full py-6 bg-white text-slate-900 rounded-[2rem] font-black text-xl hover:bg-slate-200 transition-all disabled:opacity-20 uppercase tracking-tight">Apply Custom Configuration</button>
            </div>
          </div>
        </div>
      )}

      {isVisualizing && solveResult && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-3xl flex items-center justify-center p-6 z-[400] animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-slate-900 w-full max-w-[1400px] h-[85vh] rounded-[4rem] border-2 border-slate-800 flex flex-col overflow-hidden shadow-2xl relative">
            <header className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-md">
              <div>
                <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Logic Stream Visualization</h3>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">{solveResult.algorithmName} • {solveResult.path.length - 1} Steps • {solveResult.nodesExplored.toLocaleString()} Nodes explored</p>
              </div>
              <button onClick={() => setIsVisualizing(false)} className="w-12 h-12 bg-slate-800 hover:bg-red-600 transition-all rounded-full flex items-center justify-center"><i className="fas fa-times"></i></button>
            </header>
            <div className="flex-1 overflow-x-auto p-12 flex items-center gap-10 bg-slate-950/40 custom-scrollbar">
              {solveResult.path.map((move, idx) => (
                <div key={idx} className="flex items-center gap-10 shrink-0">
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">#{idx}</span>
                      {move.direction !== 'START' && (
                        <span className="bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded text-[10px] font-black uppercase border border-blue-500/30">
                          {move.direction}
                        </span>
                      )}
                    </div>
                    <div className="scale-75 origin-top">
                      <MiniBoard board={move.board} title="" isActive={idx === playbackIndex} matchesWith={targetGoal} />
                    </div>
                  </div>
                  {idx < solveResult.path.length - 1 && (
                    <div className="flex flex-col items-center">
                      <i className="fas fa-chevron-right text-slate-800 text-3xl"></i>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <footer className="p-8 border-t border-slate-800 bg-slate-900/50 flex justify-center">
               <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Scroll horizontally to trace the optimal solution path</p>
            </footer>
          </div>
        </div>
      )}

      <style>{`.custom-scrollbar::-webkit-scrollbar{height:8px;}.custom-scrollbar::-webkit-scrollbar-track{background:#0f172a;}.custom-scrollbar::-webkit-scrollbar-thumb{background:#334155;border-radius:10px;}`}</style>
    </div>
  );
};

export default App;
