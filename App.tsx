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
  
  const [dynamicDifficulty, setDynamicDifficulty] = useState<DifficultyLevel>('Trivial');
  const [complexityScore, setComplexityScore] = useState<number>(0);

  const [benchmarkMoves, setBenchmarkMoves] = useState<number | null>(null);
  const [isCalculatingBenchmark, setIsCalculatingBenchmark] = useState(false);
  const benchmarkDebounceRef = useRef<number | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackIndex, setPlaybackIndex] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(200); 
  const playbackIntervalRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<number | null>(null);

  const isSolved = JSON.stringify(board) === JSON.stringify(targetGoal);
  const isCurrentlySolvable = PuzzleSolver.isSolvable(board, targetGoal);
  const isSystemOffline = !isGameActive && movesCount === 0 && !isSolved;

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
        confetti({ ...defaults, particleCount, colors: ['#dc2626', '#ffffff'], origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, colors: ['#dc2626', '#ffffff'], origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
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

  const calculateBenchmarkMoves = useCallback((currentBoard: BoardState, goal: BoardState) => {
    if (benchmarkDebounceRef.current) {
      window.clearTimeout(benchmarkDebounceRef.current);
    }
    setBenchmarkMoves(null);
    setIsCalculatingBenchmark(true);
    benchmarkDebounceRef.current = window.setTimeout(() => {
      const result = PuzzleSolver.solve(currentBoard, 'Greedy-Best', goal);
      if (result) {
        setBenchmarkMoves(result.steps);
      }
      setIsCalculatingBenchmark(false);
    }, 1200); 
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
    if (isSolved || isPaused || !isCurrentlySolvable || isSystemOffline) return;
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
        if (n >= solveResult.path.length) { stopPlayback(); return p; }
        const nextBoard = solveResult.path[n].board;
        setBoard(nextBoard); 
        setMovesCount(mv => mv + 1);
        conductDifficultyAssessment(nextBoard, targetGoal);
        playbackIntervalRef.current = window.setTimeout(step, playbackSpeed);
        return n;
      });
    };
    playbackIntervalRef.current = window.setTimeout(step, playbackSpeed);
  };

  const handleRequestHint = async () => {
    if (isAiLoading || isSystemOffline || isPaused || !isCurrentlySolvable) return;
    setIsAiLoading(true);
    setAiHint(null);
    try {
      const nextMove = (solveResult && playbackIndex < solveResult.path.length - 1) ? solveResult.path[playbackIndex + 1] : undefined;
      const hint = await getAIHint(board, targetGoal, nextMove);
      setAiHint(hint);
    } catch (e) {
      setAiHint("Focus on solving the top-left corner sequentially.");
    } finally {
      setIsAiLoading(false);
    }
  };

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

  const handleStartShuffle = () => {
    stopPlayback();
    const label = JSON.stringify(board) === JSON.stringify(targetGoal) ? "START & SHUFFLE" : "START";
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
    if (shouldShuffle) calculateBenchmarkMoves(nb, targetGoal);
    else setBenchmarkMoves(null);
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
    setBenchmarkMoves(null);
  };

  const engines: { id: AlgorithmType; label: string; tag: string; color: string; desc: string; precision: string }[] = [
    { id: 'Iterative-Deepening', label: 'Supreme Navigator', tag: 'GRANDMASTER', color: 'bg-blue-500/10 text-blue-500', desc: 'Optimal results. Best for deep 4x4 paths.', precision: 'Mathematical Optimum' },
    { id: 'Greedy-Best', label: 'Instant Velocity', tag: 'HIGH VELOCITY', color: 'bg-yellow-500/10 text-yellow-500', desc: 'Instant solving. Paths may be suboptimal.', precision: 'Approximation' },
    { id: 'A*', label: 'Tactical Analysis', tag: 'RELIABLE', color: 'bg-green-500/10 text-green-500', desc: 'Optimal for shallow to medium shuffles.', precision: 'Weighted Optimum' },
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
        {/* Left Column */}
        <div className="w-full flex flex-col gap-8 order-2 xl:order-1 relative">
          {isSystemOffline && (
            <div className="absolute inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm rounded-[3rem] border-2 border-slate-800/50 flex flex-col items-center justify-center p-8 text-center">
              <i className="fas fa-lock text-5xl text-slate-700 mb-6"></i>
              <h3 className="text-2xl font-black text-slate-600 uppercase tracking-tighter">Awaiting Game Start</h3>
            </div>
          )}

          <section className={`bg-slate-900 p-10 rounded-[3rem] border-2 border-slate-800 shadow-2xl transition-all duration-700 ${isSystemOffline ? 'opacity-20' : 'opacity-100'}`}>
            <h2 className="text-xl font-black text-yellow-500 uppercase tracking-widest mb-10">ALGORITHM PATH ENGINE</h2>
            <div className="grid grid-cols-1 gap-4 mb-10">
              {engines.map(algo => (
                <button key={algo.id} disabled={isSolving || isPlaying || isPaused || isSystemOffline} onClick={() => setSelectedAlgo(algo.id)} className={`text-left p-6 rounded-2xl transition-all border-2 ${selectedAlgo === algo.id ? 'bg-red-600/10 border-red-600 text-red-400' : 'bg-slate-800 border-slate-700 text-slate-500'} disabled:opacity-20`}>
                  <div className="flex justify-between items-center mb-1"><span className="text-base font-black tracking-tight">{algo.label}</span><span className={`text-[10px] font-black px-2 py-0.5 rounded ${algo.color}`}>{algo.tag}</span></div>
                  <p className="text-[10px] font-bold opacity-60 leading-tight">{algo.desc}</p>
                </button>
              ))}
            </div>

            {solveResult ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-slate-800 p-5 rounded-3xl border border-slate-700 flex flex-col"><span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{showRemaining ? 'Steps Remaining' : 'Steps Found'}</span><span className="text-3xl font-black">{showRemaining ? stepsRemaining : solveResult.steps}</span></div>
                  <div className="bg-slate-800 p-5 rounded-3xl border border-slate-700 flex flex-col"><span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Heuristic</span><span className="text-xs font-black text-blue-400 mt-1 uppercase leading-tight">{engines.find(e => e.id === selectedAlgo)?.precision}</span></div>
                </div>
                <button onClick={isPlaying ? stopPlayback : startPlayback} className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest transition-all text-lg ${isPlaying ? 'bg-red-600' : 'bg-yellow-500 text-slate-950'}`}>
                   {isPlaying ? 'Stop' : 'Auto-Solve'}
                </button>
              </div>
            ) : (
              <button onClick={runSolver} disabled={isSolving || isSolved || isPaused || !isCurrentlySolvable || isSystemOffline} className={`w-full py-8 rounded-[2rem] font-black text-2xl flex items-center justify-center gap-4 transition-all ${isSolving ? 'bg-slate-800' : 'bg-gradient-to-br from-red-600 to-red-800 hover:from-red-500'}`}>
                {isSolving ? 'ANALYZING...' : 'RUN ENGINE'}
              </button>
            )}
          </section>

          <section className={`bg-slate-800/30 p-10 rounded-[3rem] border border-slate-700/50 backdrop-blur-3xl shadow-2xl transition-all duration-700 ${isSystemOffline ? 'opacity-20' : 'opacity-100'}`}>
            <h2 className="text-xl font-black text-slate-500 uppercase tracking-widest mb-8">AI Strategic Advisor</h2>
            <div className="text-lg text-slate-300 italic mb-8 min-h-[100px]">{aiHint || "The system is synchronized. Request a briefing for maneuvers."}</div>
            <div className="flex flex-col gap-3">
              <button onClick={handleRequestHint} disabled={isAiLoading || isSystemOffline} className="w-full py-5 bg-blue-600/10 border-2 border-blue-500/30 text-blue-500 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">
                 {isAiLoading ? 'BRIEFING...' : 'REQUEST STRATEGIC BRIEFING'}
              </button>
            </div>
          </section>
        </div>

        {/* Center Column */}
        <div className="flex flex-col items-center gap-10 w-full order-1 xl:order-2">
          <div className="flex justify-between items-center w-full max-w-[850px] px-12 py-10 bg-slate-800/50 rounded-[3rem] border border-slate-700 shadow-2xl">
            <div className="flex flex-col items-center gap-2"><span className="text-lg text-slate-500 font-black uppercase">Time</span><span className="text-5xl font-black text-white font-mono">{Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}</span></div>
            <div className="flex flex-col items-center gap-2"><span className="text-lg text-slate-500 font-black uppercase">Moves</span><span className="text-5xl font-black text-red-500">{movesCount}</span></div>
            <div className="flex flex-col items-center gap-2"><span className="text-lg text-slate-500 font-black uppercase">Match</span><span className={`text-4xl font-black uppercase ${matchedCount === 15 ? 'text-green-400' : 'text-blue-400'}`}>{matchedCount} / 15</span></div>
          </div>

          <div className={`relative w-full flex justify-center transition-all ${isPaused ? 'opacity-20 blur-2xl' : 'opacity-100'}`}>
            <PuzzleBoard board={board} onTileClick={handleTileClick} suggestedTileIndex={solveResult && playbackIndex < solveResult.path.length - 1 ? solveResult.path[playbackIndex + 1].emptyIndex : undefined} />
          </div>

          <div className="flex flex-wrap justify-center gap-8 w-full max-w-[850px]">
             {(!isGameActive || isSolved) ? (
              <button onClick={handleStartShuffle} className="px-14 py-6 bg-green-600 hover:bg-green-500 rounded-2xl font-black transition-all shadow-2xl text-white uppercase text-2xl tracking-tight min-w-[320px]">START</button>
            ) : isPaused ? (
              <button onClick={() => setIsPaused(false)} className="px-14 py-6 bg-lime-500 hover:bg-lime-400 rounded-2xl font-black transition-all text-slate-900 uppercase text-2xl tracking-tight min-w-[320px]">RESUME</button>
            ) : (
              <button onClick={() => { stopPlayback(); setIsPaused(true); }} className="px-14 py-6 bg-orange-500 hover:bg-orange-400 rounded-2xl font-black transition-all text-white uppercase text-2xl tracking-tight min-w-[320px]">FREEZE</button>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="w-full flex flex-col gap-8 order-3">
          <section className="bg-slate-800/30 p-10 rounded-[3rem] border border-slate-700/50 backdrop-blur-3xl shadow-2xl">
             <div className="flex justify-between items-start mb-10 border-b border-slate-700/50 pb-10">
               <div className="flex flex-col gap-3">
                 <h2 className="text-xl font-black text-yellow-500 uppercase tracking-widest">Target Objective</h2>
                 <p className="text-sm text-slate-600 font-bold max-w-[200px]">Match this state to complete mission.</p>
               </div>
               <MiniBoard board={targetGoal} title="Goal" isActive={isSolved} />
             </div>
             <h2 className="text-xl font-black text-slate-600 uppercase tracking-widest mb-8">Board Presets</h2>
             <div className="grid grid-cols-1 gap-4">
               {PRESETS.map((p, i) => (
                 <button key={p.name} disabled={isPlaying || isSolving} onClick={() => handleApplyPreset(p, i)} className={`text-left p-6 rounded-2xl transition-all border-2 ${activePresetIdx === i ? 'border-red-500 bg-red-600/10 text-red-400' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                    {p.name}
                 </button>
               ))}
               <button onClick={() => setInputMode(true)} className="text-left p-6 rounded-2xl bg-slate-900 border-2 border-slate-800 text-slate-400 hover:border-slate-600 transition-all">Manual Configuration</button>
             </div>
          </section>
        </div>
      </div>

      {/* Manual Input Modal */}
      {inputMode && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6 z-[300]">
           <div className="bg-slate-900 w-full max-w-[500px] rounded-[3rem] p-10 border border-slate-700">
              <h3 className="text-2xl font-black uppercase mb-6">Manual Entry</h3>
              <div className="space-y-4">
                 <textarea value={customStartInput} onChange={e => setCustomStartInput(e.target.value)} placeholder="Numbers 0-15 separated by commas..." className="w-full h-32 bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-blue-400 outline-none" />
                 <button onClick={() => { const b = customStartInput.split(',').map(n => parseInt(n.trim())); if (b.length === 16) { setBoard(b); setInputMode(false); setActivePresetIdx(-1); } }} className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black uppercase">Apply Board</button>
                 <button onClick={() => setInputMode(false)} className="w-full py-4 bg-slate-800 text-white rounded-2xl font-black uppercase">Cancel</button>
              </div>
           </div>
        </div>
      )}

      {/* Visualizer Modal */}
      {isVisualizing && solveResult && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-3xl flex items-center justify-center p-6 z-[400]">
           <div className="bg-slate-900 w-full max-w-[1400px] h-[85vh] rounded-[4rem] border-2 border-slate-800 flex flex-col overflow-hidden shadow-2xl relative">
              <header className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-md"><div><h3 className="text-3xl font-black text-white uppercase tracking-tighter">Logic Stream Visualization</h3><p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">{solveResult.path.length - 1} Steps Total</p></div><button onClick={() => setIsVisualizing(false)} className="w-12 h-12 bg-slate-800 hover:bg-red-600 transition-all rounded-full flex items-center justify-center"><i className="fas fa-times"></i></button></header>
              <div className="flex-1 overflow-x-auto p-12 flex items-center gap-10 bg-slate-950/40 custom-scrollbar">
                {solveResult.path.map((move, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-4 shrink-0">
                    <span className="text-[10px] font-black text-slate-500 uppercase">#{idx}</span>
                    <MiniBoard board={move.board} isActive={idx === playbackIndex} />
                  </div>
                ))}
              </div>
           </div>
        </div>
      )}

      <style>{`.custom-scrollbar::-webkit-scrollbar{height:8px;}.custom-scrollbar::-webkit-scrollbar-track{background:#0f172a;}.custom-scrollbar::-webkit-scrollbar-thumb{background:#334155;border-radius:10px;}`}</style>
    </div>
  );
};

export default App;