import React, { useState, useEffect, useRef, useCallback } from "react";
import { Chess, type Square } from "chess.js";
import { 
  Compass, 
  Trees, 
  Flame, 
  Wind, 
  Mountain, 
  Volume2, 
  VolumeX, 
  Music,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Cpu,
  Wand2,
  Sparkles,
  Award,
  ChevronRight,
  HelpCircle,
  Coffee,
  RotateCcw,
  Sliders,
  Scissors
} from "lucide-react";

interface HobbyStationProps {
  userId: string;
  userName: string;
  wordCount: number;
}

export default function HobbyStation({ userId, userName, wordCount }: HobbyStationProps) {
  // Common state: Sound control for hobby sounds
  const [soundEnabled, setSoundEnabled] = useState(false);

  // Play micro click sound if enabled (synthesizer or mechanical keys)
  const triggerMicroClick = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = userId === "darshit" ? "sawtooth" : "sine";
      // Different keys match different pitches
      osc.frequency.setValueAtTime(userId === "darshit" ? 180 + Math.random() * 300 : 350 + Math.random() * 100, audioCtx.currentTime); 
      
      gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 0.12);
    } catch (e) {
      // ignore browser audio policies
    }
  };

  return (
    <div className="w-full border border-slate-200 dark:border-white/5 rounded-2xl bg-white dark:bg-[#0b0c10] overflow-hidden shadow-md">
      
      {/* HEADER STATION */}
      <div className="px-5 py-4 border-b border-rose-100 dark:border-white/5 bg-gradient-to-r from-rose-50/20 to-indigo-50/10 dark:from-[#0d0f14] dark:to-[#0d0f14] flex justify-between items-center select-none">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500">
            {userId === "addy" ? "♟️" : userId === "darshit" ? "🎹" : userId === "sonal" ? "🌸" : userId === "debjani" ? "🏔️" : "🏺"}
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-slate-800 dark:text-zinc-200 font-sans">
              {userName}'s FOCUS QUIET STATION
            </h4>
            <p className="text-[10px] text-slate-500 dark:text-zinc-500 font-sans">
              A private interactive sanctuary to focus your mind during copywriting sessions.
            </p>
          </div>
        </div>

        {/* Sound toggle support */}
        <button
          onClick={() => setSoundEnabled(prev => !prev)}
          className={`p-2 rounded-lg border text-xs cursor-pointer flex items-center gap-1.5 transition-colors ${
            soundEnabled 
              ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-500/20 dark:text-emerald-400" 
              : "bg-slate-50 border-slate-200 text-slate-400 dark:bg-[#111] dark:border-zinc-800 dark:text-zinc-500"
          }`}
          title="Enable focus synthesize tones"
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          <span className="font-mono text-[9px] uppercase tracking-wide hidden sm:inline">Synth Audio</span>
        </button>
      </div>
<div className="p-6">
        {/* Render custom station view per operator */}
        {userId === "addy" && <AddyChessAstronomyStation sound={soundEnabled} triggerClick={triggerMicroClick} />}
        {userId === "darshit" && <DarshitMusicQuizStation triggerClick={triggerMicroClick} />}
        {userId === "sonal" && <SonalBotanicalStation sound={soundEnabled} triggerClick={triggerMicroClick} wordCount={wordCount} />}
        {userId === "debjani" && <DebjaniSummitStation wordCount={wordCount} triggerClick={triggerMicroClick} />}
        {userId === "poonam" && <PoonamPotteryOrigamiStation sound={soundEnabled} triggerClick={triggerMicroClick} />}
      </div>
    </div>
  );
}

// =========================================================
// 1. ADDY STATION: STRATEGIC CHESS & COSMOS
// =========================================================
const CHESS_UNICODE: Record<string, string> = {
  wp: "♙", wn: "♘", wb: "♗", wr: "♖", wq: "♕", wk: "♔",
  bp: "♟", bn: "♞", bb: "♝", br: "♜", bq: "♛", bk: "♚",
};

function coordsToSquare(r: number, c: number): string {
  return `${String.fromCharCode(97 + c)}${8 - r}`;
}

function chessBoardToUnicode(chess: Chess): string[][] {
  return chess.board().map((row) =>
    row.map((cell) => (cell ? CHESS_UNICODE[`${cell.color}${cell.type}`] ?? " " : " "))
  );
}

function AddyChessAstronomyStation({ sound, triggerClick }: { sound: boolean; triggerClick: () => void }) {
  const [starCount, setStarCount] = useState(14);
  const [constellation, setConstellation] = useState("Orion's Belt");

  const chessRef = useRef(new Chess());
  const [board, setBoard] = useState<string[][]>(() => chessBoardToUnicode(chessRef.current));
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalTargets, setLegalTargets] = useState<string[]>([]);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [gameFeedback, setGameFeedback] = useState("You play White. Select a piece — chess.js enforces legal moves only.");
  const [isAiComputing, setIsAiComputing] = useState(false);

  const syncBoard = useCallback(() => {
    setBoard(chessBoardToUnicode(chessRef.current));
  }, []);

  const playChessAudio = (type: "move" | "capture" | "win") => {
    if (!sound) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      if (type === "move") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(140, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
      } else if (type === "capture") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(320, audioCtx.currentTime);
        osc.frequency.setValueAtTime(480, audioCtx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
      } else {
        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime);
        osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
      }
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + (type === "capture" ? 0.3 : type === "win" ? 0.65 : 0.12));
    } catch {
      // ignore browser audio policies
    }
  };

  const triggerCpuReply = () => {
    const chess = chessRef.current;
    if (chess.isGameOver()) {
      setGameFeedback(chess.isCheckmate() ? "Checkmate! Reset to play again." : "Game drawn. Reset to play again.");
      playChessAudio("win");
      setIsAiComputing(false);
      return;
    }
    const cpuMoves = chess.moves();
    if (cpuMoves.length === 0) {
      setGameFeedback("CPU has no legal moves. Your turn ended — reset to continue.");
      setIsAiComputing(false);
      return;
    }
    const cpuMove = cpuMoves[Math.floor(Math.random() * cpuMoves.length)];
    const played = chess.move(cpuMove);
    if (played) {
      setMoveHistory(chess.history());
      setGameFeedback(`CPU played ${played.san}. Your turn!`);
      playChessAudio(played.captured ? "capture" : "move");
    }
    syncBoard();
    if (chess.isGameOver()) {
      setGameFeedback(chess.isCheckmate() ? "Checkmate! CPU wins — reset for a rematch." : "Game over. Reset to play again.");
      playChessAudio("win");
    }
    setIsAiComputing(false);
  };

  const handleCellClick = (r: number, c: number) => {
    triggerClick();
    const chess = chessRef.current;
    if (isAiComputing || chess.turn() !== "w" || chess.isGameOver()) return;

    const square = coordsToSquare(r, c);

    if (selectedSquare) {
      if (selectedSquare === square) {
        setSelectedSquare(null);
        setLegalTargets([]);
        setGameFeedback("Deselected piece.");
        return;
      }
      const move = chess.move({ from: selectedSquare, to: square, promotion: "q" });
      if (!move) {
        const piece = chess.get(square as Square);
        if (piece && piece.color === "w") {
          setSelectedSquare(square);
          setLegalTargets(chess.moves({ square: square as Square, verbose: true }).map((m) => m.to));
          setGameFeedback(`Selected ${CHESS_UNICODE[`w${piece.type}`] ?? piece.type} on ${square}.`);
        } else {
          setGameFeedback("Illegal move — chess.js rejected that transfer.");
        }
        return;
      }
      setMoveHistory(chess.history());
      setSelectedSquare(null);
      setLegalTargets([]);
      setGameFeedback(`You played ${move.san}. CPU is thinking…`);
      playChessAudio(move.captured ? "capture" : "move");
      syncBoard();
      if (chess.isGameOver()) {
        setGameFeedback(chess.isCheckmate() ? "Checkmate! You win — brilliant tactics!" : "Game over.");
        playChessAudio("win");
        return;
      }
      setIsAiComputing(true);
      setTimeout(triggerCpuReply, 450);
      return;
    }

    const piece = chess.get(square as Square);
    if (!piece || piece.color !== "w") {
      setGameFeedback("Select one of your White pieces (♙♖♘♗♕♔) to begin.");
      return;
    }
    setSelectedSquare(square);
    setLegalTargets(chess.moves({ square: square as Square, verbose: true }).map((m) => m.to));
    setGameFeedback(`Selected ${CHESS_UNICODE[`w${piece.type}`] ?? piece.type} on ${square}. Click a highlighted destination.`);
    playChessAudio("move");
  };

  const resetChessMatch = () => {
    triggerClick();
    chessRef.current = new Chess();
    setSelectedSquare(null);
    setLegalTargets([]);
    setMoveHistory([]);
    setGameFeedback("Board reset. You play White — make your opening move.");
    syncBoard();
    playChessAudio("win");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
      <div className="bg-slate-50 dark:bg-[#121319] p-5 rounded-xl border border-slate-100 dark:border-white/5 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-2.5">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#0047AB] dark:text-sky-400">Play & Learn Chess Lab</span>
            <span className="text-[10px] font-mono text-slate-400">chess.js Legal Engine</span>
          </div>

          <div className="relative mb-3 flex flex-col items-center">
            <div className="grid grid-cols-8 gap-0.5 border-4 border-slate-700 bg-slate-800 p-1 rounded-lg w-full max-w-[280px] hover:shadow-lg transition-shadow">
              {board.map((row, rIdx) =>
                row.map((piece, cIdx) => {
                  const isDarkCell = (rIdx + cIdx) % 2 === 1;
                  const square = coordsToSquare(rIdx, cIdx);
                  const isSelected = selectedSquare === square;
                  const isLegalTarget = legalTargets.includes(square);
                  const cellBg = isSelected
                    ? "bg-amber-400/90 text-slate-900 border-2 border-yellow-600 scale-[1.05] z-10"
                    : isLegalTarget
                    ? "bg-emerald-400/40 text-slate-900 ring-2 ring-emerald-500/60"
                    : isDarkCell
                    ? "bg-[#6c7ca4] text-white"
                    : "bg-[#eaf1ec] text-[#2c3e50]";

                  return (
                    <div
                      key={`${rIdx}-${cIdx}`}
                      onClick={() => handleCellClick(rIdx, cIdx)}
                      className={`relative aspect-square w-full font-serif flex items-center justify-center text-xl font-semibold select-none cursor-pointer transition-transform hover:scale-[1.06] active:scale-95 ${cellBg} ${isAiComputing ? "pointer-events-none opacity-70" : ""}`}
                      title={`${square}`}
                    >
                      {piece}
                      <span className="absolute bottom-0 right-0 text-[6px] opacity-15 font-mono">{square}</span>
                    </div>
                  );
                })
              )}
            </div>

            {moveHistory.length > 0 && (
              <div className="mt-3 w-full max-w-[280px] max-h-[88px] overflow-y-auto bg-slate-900/80 dark:bg-black/40 rounded-lg border border-slate-700 p-2">
                <span className="text-[8px] uppercase tracking-widest text-sky-400 font-mono block mb-1">Move Log</span>
                <div className="flex flex-col gap-0.5 font-mono text-[9px] text-zinc-300">
                  {moveHistory.map((san, idx) => (
                    <div key={`${san}-${idx}`} className="flex gap-2">
                      <span className="text-sky-500 w-5 shrink-0">{idx + 1}.</span>
                      <span>{san}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="p-2.5 bg-[#0047AB]/5 dark:bg-sky-500/5 rounded-lg border border-dashed border-[#0047AB]/20 text-[10px] text-slate-700 dark:text-sky-300 font-mono leading-relaxed mb-3">
            <span className="font-bold text-[#0047AB] dark:text-sky-400 block uppercase tracking-wide mb-0.5">ℹ Status Oracle:</span>
            {isAiComputing ? "CPU bot computing legal counter-move…" : gameFeedback}
          </div>
        </div>

        <div className="pt-2 border-t border-slate-200/50 dark:border-white/5">
          <button
            onClick={resetChessMatch}
            disabled={isAiComputing}
            className="w-full py-1.5 bg-[#0047AB] hover:bg-[#003b8f] disabled:opacity-50 text-white rounded text-[9px] tracking-widest font-mono uppercase font-bold transition-all cursor-pointer border-0"
          >
            Reset Board Match 🔄
          </button>
        </div>
      </div>

      {/* Astronomy block */}
      <div className="bg-slate-50 dark:bg-[#121319] p-5 rounded-xl border border-slate-100 dark:border-white/5 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#00E5FF]">Cosmos Radar</span>
            <span className="text-[10px] font-mono text-slate-400">Celestial Mapping</span>
          </div>
          <h5 className="text-xs font-semibold text-slate-800 dark:text-zinc-200 mb-1">Astronomy Positioner</h5>
          <p className="text-[11px] text-slate-500 dark:text-zinc-500 leading-relaxed">
            Configure astronomy parameters to align copywriting rhythm with celestial elevation curves.
          </p>
        </div>

        <div className="my-4 py-3 bg-white dark:bg-black/25 text-center rounded-lg border border-slate-100 dark:border-white/5">
          <div className="text-[20px] mb-1">🌌</div>
          <span className="text-[9px] uppercase tracking-wider font-mono block text-slate-400">Target Constellation</span>
          <span className="text-sm font-semibold text-slate-800 dark:text-zinc-200 font-serif italic">{constellation}</span>
          
          <div className="grid grid-cols-2 gap-2 mt-3 px-4 text-left font-mono text-[9px] text-slate-500">
            <div>• RA: <span className="text-sky-500">05h 35m 17s</span></div>
            <div>• DEC: <span className="text-indigo-400">-05° 23' 28''</span></div>
            <div>• Alt: <span className="text-emerald-500">{32 + starCount}° Sky High</span></div>
            <div>• Azimuth: <span className="text-amber-500">182.4° South</span></div>
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => {
              triggerClick();
              setStarCount(prev => prev + 1);
              const starSigns = ["Orion's Belt", "Cassiopeia W", "Crux Southern", "Andromeda Galaxy", "Ursa Major Bowl"];
              setConstellation(starSigns[Math.floor(Math.random() * starSigns.length)]);
            }}
            className="flex-1 py-1.5 border border-[#00E5FF]/30 hover:bg-[#00E5FF]/10 text-slate-800 dark:text-[#00E5FF] rounded text-[9px] uppercase tracking-wider font-semibold text-center transition-colors cursor-pointer"
          >
            Track Alt Constellation
          </button>
        </div>
      </div>

    </div>
  );
}

// ==========================================================================
// 2. DARSHIT STATION: ENDLESS INDIAN CLASSICAL MUSIC QUIZ ENGINE
// ==========================================================================
interface IndianClassicalQuizQuestion {
  question: string;
  choices: string[];
  correctAnswer: string;
  explanation: string;
}

function DarshitMusicQuizStation({ triggerClick }: { triggerClick: () => void }) {
  const [question, setQuestion] = useState<IndianClassicalQuizQuestion | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNextChallenge = async () => {
    triggerClick();
    setLoading(true);
    setError(null);
    setSelectedChoice(null);
    try {
      const response = await fetch("/api/hobby/darshit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "next-challenge" }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error || `Gemini quiz engine unavailable (${response.status})`);
      }
      const data = (await response.json()) as IndianClassicalQuizQuestion;
      if (
        typeof data?.question !== "string" ||
        !Array.isArray(data?.choices) ||
        data.choices.length < 2 ||
        typeof data?.correctAnswer !== "string" ||
        typeof data?.explanation !== "string"
      ) {
        throw new Error("Malformed quiz payload from Gemini schema.");
      }
      setQuestion(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to reach Gemini quiz engine.";
      setError(message);
      setQuestion({
        question: "Which raga is traditionally associated with late evening and meditative romanticism?",
        choices: ["Raga Yaman", "Raga Bhairav", "Raga Malkauns", "Raga Desh"],
        correctAnswer: "Raga Yaman",
        explanation:
          "Raga Yaman is a structural evening raga using tivra Ma, projecting a serene, loving, and prayerful atmosphere.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNextChallenge();
  }, []);

  const chooseAnswer = (choice: string) => {
    if (selectedChoice !== null || !question) return;
    triggerClick();
    setSelectedChoice(choice);
    setAnsweredCount((prev) => prev + 1);
    if (choice === question.correctAnswer) setScore((prev) => prev + 1);
  };

  const resetQuiz = () => {
    triggerClick();
    setScore(0);
    setAnsweredCount(0);
    fetchNextChallenge();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
      <div className="lg:col-span-2 bg-slate-50 dark:bg-[#0c0817] p-5 rounded-xl border border-purple-500/10 flex flex-col justify-between min-h-[380px]">
        <div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#B026FF] font-mono">
              AI Powered Matrix
            </span>
            <span className="text-[10px] font-mono text-purple-400">
              {loading ? "Streaming Prompt..." : "Question Live"}
            </span>
          </div>

          <h5 className="text-xs font-semibold text-slate-800 dark:text-[#f1e6ff] flex items-center gap-1.5 mb-3">
            <Music className="w-4 h-4 text-purple-500" /> Darshit's Raga-Tala Challenge
          </h5>

          {loading ? (
            <div className="p-8 text-center bg-white dark:bg-black/20 rounded-xl border border-purple-500/10 flex flex-col items-center justify-center min-h-[180px]">
              <RefreshCw className="w-6 h-6 text-purple-500 animate-spin mb-2" />
              <p className="text-xs text-zinc-400 font-mono">Querying Gemini via secure server proxy...</p>
            </div>
          ) : question ? (
            <div className="p-4 bg-white dark:bg-black/30 rounded-xl border border-purple-500/15">
              <p className="text-sm font-semibold text-slate-800 dark:text-zinc-100 leading-relaxed mb-4">
                {question.question}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {question.choices.map((choice) => {
                  const isCorrect =
                    selectedChoice !== null && choice === question.correctAnswer;
                  const isWrong =
                    selectedChoice === choice && choice !== question.correctAnswer;
                  return (
                    <button
                      key={choice}
                      disabled={selectedChoice !== null}
                      onClick={() => chooseAnswer(choice)}
                      className={`p-3 rounded-lg text-left text-[11px] border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        isCorrect
                          ? "bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-semibold"
                          : isWrong
                          ? "bg-red-500/10 border-red-500 text-red-700 dark:text-red-300 font-semibold"
                          : "bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 hover:border-purple-500"
                      }`}
                    >
                      <span>{choice}</span>
                      {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                      {isWrong && <XCircle className="w-4 h-4 text-red-500" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {error && (
            <p className="mt-2 text-[10px] text-amber-500 font-mono bg-amber-500/5 p-2 rounded border border-amber-500/10">
              ⚡ Local Fallback: {error}
            </p>
          )}

          {selectedChoice !== null && question && (
            <div className="mt-3 p-3 bg-purple-500/5 border border-purple-500/20 rounded-lg transition-all">
              <div className="text-[10px] font-mono uppercase tracking-widest text-purple-500 mb-1 font-bold">
                Verification Details:
              </div>
              <p className="text-[11px] text-slate-600 dark:text-zinc-300 leading-relaxed">
                {question.explanation}
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4">
          <button
            onClick={fetchNextChallenge}
            disabled={loading}
            className="py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded text-[10px] uppercase font-bold tracking-widest cursor-pointer border-0 transition-all"
          >
            Next Challenge
          </button>
          <button
            onClick={resetQuiz}
            disabled={loading}
            className="py-2 bg-zinc-900 text-zinc-200 rounded text-[10px] uppercase font-bold tracking-widest cursor-pointer border border-zinc-700 hover:bg-zinc-800 disabled:opacity-50 transition-all"
          >
            Reset Console
          </button>
        </div>
      </div>

      {/* Side Status Dashboard */}
      <div className="bg-[#0b0c10] p-5 rounded-xl border border-purple-500/15 flex flex-col justify-between text-zinc-100">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 font-mono">
            Score Console
          </span>
          <div className="mt-5 text-center">
            <div className="text-4xl font-semibold text-white">{score}</div>
            <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">
              Correct of {answeredCount}
            </div>
          </div>
          <div className="mt-5 p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-400 leading-relaxed font-mono">
            <p className="text-purple-400 font-bold mb-1">⚡ Gemini Pipe Active</p>
            Endless Indian classical music challenges stream through the server using VITE_GEMINI_API_KEY with strict JSON schema enforcement.
          </div>
        </div>
      </div>
    </div>
  );
}

// =========================================================
// 3. SONAL STATION: BONSAI BOTANICAL, TEA BREWER & RETRO BOLLYWOOD DRAMA
// =========================================================
function SonalBotanicalStation({ sound, triggerClick, wordCount }: { sound: boolean; triggerClick: () => void; wordCount: number }) {
  const [teaSelection, setTeaSelection] = useState("Organic Ceremonial Matcha");
  const [teaProgress, setTeaProgress] = useState(0);
  const [isBrewing, setIsBrewing] = useState(false);

  // Bollywood states
  const bollywoodDialogues = [
    { text: "Rahul... Naam toh suna hi hoga. 😉", movie: "Dil To Pagal Hai", context: "Classic king of romance entry" },
    { text: "Babuji ne kaha parivaar chhod do, parivaar ne kaha paro ko chhod do... Tumne kaha compliance chhod do! 😭", movie: "Devdas", context: "Heavy melodramatic copywriter stress" },
    { text: "Mogambo khush hua! 😈", movie: "Mr. India", context: "When Gemini approves your compliance score" },
    { text: "Don ko pakadna mushkil hi nahi... namumkin hai! 🕶️", movie: "Don", context: "Regarding a sneaky trailing passive voice" },
    { text: "Ek chutki sindoor ki keemat tum kya jano Ramesh babu... copywriter ke sar ka taj hota hai! 👑", movie: "Om Shanti Om", context: "Pure epic intensity for copy standards" },
    { text: "Picture abhi baaki hai mere dost! 🎬", movie: "Om Shanti Om", context: "While audits are compiling" },
    { text: "Tension lene ka nahi, dene ka! 🤘", movie: "Munna Bhai M.B.B.S.", context: "Chill wisdom during compliance audits" }
  ];

  const [activeDialogueIdx, setActiveDialogueIdx] = useState(0);
  const [aiBollywoodJoke, setAiBollywoodJoke] = useState("");
  const [aiJokeTagline, setAiJokeTagline] = useState("");
  const [jokeCategory, setJokeCategory] = useState<"bollywood" | "dark" | null>(null);
  const [jokeLoading, setJokeLoading] = useState(false);
  const [jokeError, setJokeError] = useState<string | null>(null);
  const [masalaGlow, setMasalaGlow] = useState(false);

  // Work excuses generator state
  const [excuseCategory, setExcuseCategory] = useState<"block" | "regulatory" | "glitch" | "bollywood">("block");
  const [currentExcuse, setCurrentExcuse] = useState("The compliance inspector's shade of blue on page 4 clashed with my inner retro cinematic aesthetic, inducing temporary word-blindness.");
  const [copyFeedback, setCopyFeedback] = useState(false);

  const excusesDatabase = {
    block: [
      "The conceptual resonance between my current headline and classic 1970s Bollywood romance is too dense to risk publishing today.",
      "My creative muse is currently in a deep, introspective dialogue with itself regarding the social semiotics of passive verbs.",
      "I have run out of metaphors for 'innovative solution' that don't sound like a commercial printer manual. Need 24 hours of silence.",
      "The dramatic tension in our copy has exceeded regulatory thresholds; releasing it as-is would spark unrest in compliance circles."
    ],
    regulatory: [
      "The Federal Passive-Voice Inspectorate has flagged our draft. Proceeding prior to local certification is a moral liability.",
      "I'm worried that making this sentence more direct will awaken the sleeping regulatory giants of the 1998 Treaty.",
      "The terms and conditions on page 7 are too structurally perfect; altering even one letter risks collapsing the space-time-compliance continuum."
    ],
    glitch: [
      "The trailing space-character check on line 42 has generated a minor, localized black hole in my text editor.",
      "My cursor has gained a level of emotional sensitivity that makes hovering over legal fine-print an act of verbal aggression.",
      "The cloud server's visual styling is too white today; my eyeballs have initiated a coordinated work-stoppage to prevent screen burn."
    ],
    bollywood: [
      "Babuji said writing copy today would upset the cosmic karma of our marketing funnels. Sorry, compliance!",
      "I was configuring my wind machine for a perfect dramatic entry pose, and my reference copies blew off the desk.",
      "Rishte mein toh hum tumhare Copy Lead lagte hain... so I have officially granted myself a creative sabbatical.",
      "Compliance can wait, because as Simran said to her dad: 'Let me live my life in a beautiful, non-work-oriented lounge!'"
    ]
  };

  const handleGenerateExcuse = (cat: "block" | "regulatory" | "glitch" | "bollywood") => {
    triggerClick();
    setExcuseCategory(cat);
    const list = excusesDatabase[cat];
    const randomIdx = Math.floor(Math.random() * list.length);
    setCurrentExcuse(list[randomIdx]);
  };

  const handleCopyExcuse = () => {
    triggerClick();
    navigator.clipboard.writeText(currentExcuse);
    setCopyFeedback(true);
    setTimeout(() => {
      setCopyFeedback(false);
    }, 1500);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isBrewing) {
      interval = setInterval(() => {
        setTeaProgress(prev => {
          if (prev >= 100) {
            setIsBrewing(false);
            return 100;
          }
          return prev + 5;
        });
      }, 150);
    }
    return () => clearInterval(interval);
  }, [isBrewing]);

  const handleBrewTea = () => {
    triggerClick();
    setTeaProgress(0);
    setIsBrewing(true);
  };

  const fetchBollywoodJoke = async (category: "bollywood" | "dark") => {
    triggerClick();
    setMasalaGlow(true);
    setTimeout(() => setMasalaGlow(false), 800);
    setJokeLoading(true);
    setJokeError(null);
    setJokeCategory(category);
    try {
          const n8nUrl = "https://snowfall-punctuate-thrill.ngrok-free.dev";
    const response = await fetch(n8nUrl, {
      method: "POST",
      mode: "cors", // Forces the browser to process your n8n CORS rules cleanly
      headers: {
        "ngrok-skip-browser-warning": "true"
      }
    });

    if (!response.ok) {
      throw new Error(`n8n responded with status ${response.status}`);
    }

    const data = await response.json();
setAiBollywoodJoke(data.joke);
      setAiJokeTagline("Joke from n8n");
      setJokeCategory(category);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load joke from n8n.";
      setJokeError(message);
      setAiBollywoodJoke("");
      setAiJokeTagline("");
    } finally {
      setJokeLoading(false);
    }
  };

  // Trigger high pitch nostalgic Bollywood synth melody
  const triggerRetroBollywoodChords = () => {
    triggerClick();
    setMasalaGlow(true);
    setTimeout(() => setMasalaGlow(false), 800);
    
    if (!sound) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const playTone = (freq: number, start: number, duration: number, type: OscillatorType) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + start);
        
        gain.gain.setValueAtTime(0, audioCtx.currentTime + start);
        gain.gain.linearRampToValueAtTime(0.04, audioCtx.currentTime + start + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + start + duration);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + start);
        osc.stop(audioCtx.currentTime + start + duration);
      };

      playTone(261.63, 0, 0.4, "sine");
      playTone(329.63, 0.08, 0.4, "sine");
      playTone(392.00, 0.16, 0.5, "sawtooth");
      playTone(523.25, 0.24, 0.6, "sine"); // High octave
      
    } catch (e) {
      // Audio policies
    }
  };

  const currentDialogue = bollywoodDialogues[activeDialogueIdx];

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans transition-all duration-300 ${masalaGlow ? "shadow-[0_0_50px_rgba(212,175,55,0.15)] ring-1 ring-amber-500/20 rounded-xl" : ""}`}>
      
      {/* Ultimate Work-Excuse Generator */}
      <div className="bg-[#fcfdfd] dark:bg-[#070b13] p-5 rounded-xl border border-rose-500/15 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] uppercase font-bold tracking-widest text-rose-500 font-sans font-mono">Anti-Work Shield</span>
            <span className="text-[10px] font-mono text-amber-500">Excuses Generator</span>
          </div>
          <h5 className="text-xs font-semibold text-slate-800 dark:text-rose-100 flex items-center gap-1">
            <Coffee className="w-4 h-4 text-rose-500" /> Sonal's Alibi Engine
          </h5>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed mb-4">
            Generates high-fidelity, creative professional excuses to stall compliance writing tasks.
          </p>

          {/* Render Excuse display */}
          <div className="p-3 bg-rose-50/50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/30 rounded-lg min-h-[110px] flex flex-col justify-between mb-4">
            <p className="text-xs text-slate-700 dark:text-zinc-350 italic font-serif leading-relaxed">
              "{currentExcuse}"
            </p>
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-rose-150 dark:border-rose-900/20">
              <span className="text-[8px] font-mono uppercase bg-rose-100/80 dark:bg-rose-950/60 shadow-sm text-rose-600 px-1.5 py-0.5 rounded font-bold">
                Category: {excuseCategory}
              </span>
              <button
                onClick={handleCopyExcuse}
                className="text-[9px] text-rose-500 hover:text-rose-700 underline font-mono cursor-pointer border-0 bg-transparent flex items-center gap-1"
              >
                {copyFeedback ? "✓ Copied!" : "Copy Excuse 📋"}
              </button>
            </div>
          </div>
        </div>

        {/* Categories Grid selectors */}
        <div className="space-y-2">
          <span className="text-[8.5px] uppercase font-bold tracking-wider text-slate-400 dark:text-zinc-500 block">Select Excuse Core Aura:</span>
          <div className="grid grid-cols-2 gap-1.5 flex-wrap">
            <button 
              onClick={() => handleGenerateExcuse("block")}
              className={`py-1 text-[9px] font-semibold rounded cursor-pointer border-0 transition-all ${excuseCategory === "block" ? "bg-rose-500 text-white font-bold" : "bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:bg-slate-200"}`}
            >
              Creative Block
            </button>
            <button 
              onClick={() => handleGenerateExcuse("regulatory")}
              className={`py-1 text-[9px] font-semibold rounded cursor-pointer border-0 transition-all ${excuseCategory === "regulatory" ? "bg-rose-500 text-white font-bold" : "bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:bg-slate-200"}`}
            >
              Regulatory
            </button>
            <button 
              onClick={() => handleGenerateExcuse("glitch")}
              className={`py-1 text-[9px] font-semibold rounded cursor-pointer border-0 transition-all ${excuseCategory === "glitch" ? "bg-rose-500 text-white font-bold" : "bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:bg-slate-200"}`}
            >
              System Glitch
            </button>
            <button 
              onClick={() => handleGenerateExcuse("bollywood")}
              className={`py-1 text-[9px] font-semibold rounded cursor-pointer border-0 transition-all ${excuseCategory === "bollywood" ? "bg-rose-500 text-white font-bold" : "bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:bg-slate-200"}`}
            >
              Bollywood Drama
            </button>
          </div>
        </div>
      </div>

      {/* BOLLYWOOD MASALA DRAMA ZONE */}
      <div className="bg-[#fffbeb] dark:bg-[#0c0a06] p-5 rounded-xl border-2 border-double border-amber-500/30 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#F1C40F] dark:text-amber-400 font-sans">Sonal's Cinema Club</span>
            <span className="text-[10px] font-mono text-rose-500 font-semibold animate-pulse">✨ MASALA LIVE</span>
          </div>
          
          <h5 className="text-xs font-semibold text-amber-950 dark:text-amber-100 flex items-center gap-1.5 mb-1.5">
            🎬 Bollywood Oracle & Drama Box
          </h5>
          <p className="text-[11px] text-amber-900/60 dark:text-amber-200/50 leading-relaxed mb-3">
            Need compliance entertainment? Get iconic Bollywood dialogue triggers and copywriting jokes:
          </p>

          {/* dialogue board */}
          <div className="p-3.5 bg-white dark:bg-black/45 rounded-xl border border-amber-200 dark:border-amber-950/40 relative overflow-hidden min-h-[96px] flex flex-col justify-between mb-3.5">
            <div className="absolute top-0 right-0 p-1 text-[20px] opacity-25">🎥</div>
            <p className="text-xs font-serif font-black italic text-amber-900 dark:text-amber-300 leading-relaxed">
              "{currentDialogue.text}"
            </p>
            <div className="flex justify-between items-center mt-2 border-t border-amber-100 dark:border-amber-950/20 pt-1.5">
              <span className="text-[8px] font-mono text-amber-700/80 uppercase">🎬 {currentDialogue.movie}</span>
              <span className="text-[8.5px] font-sans text-amber-600 dark:text-amber-400 font-medium italic">({currentDialogue.context})</span>
            </div>
          </div>

          {/* joke board */}
          <div className="p-3 bg-amber-500/5 dark:bg-amber-500/10 rounded-lg border border-dashed border-amber-300/40 text-[10px] text-amber-950/80 dark:text-amber-300/80 leading-relaxed mb-3 font-sans min-h-[72px]">
            <span className="font-semibold text-amber-700 dark:text-amber-300 block mb-0.5">
              💡 {jokeLoading ? "Streaming Masala Joke…" : aiJokeTagline || "Bollywood & Dark Joke Matrix"}
            </span>
            {jokeCategory && !jokeLoading && (
              <span className="text-[8px] font-mono uppercase text-amber-600/80 block mb-1">
                {jokeCategory === "bollywood" ? "🎬 Bollywood via Mistral" : "😈 Dark Humor via Mistral"}
              </span>
            )}
            {jokeLoading ? (
              <span className="font-mono text-[9px] text-amber-600 animate-pulse">
                Querying Mistral AI ({jokeCategory === "dark" ? "dark humor" : "Bollywood masala"})…
              </span>
            ) : jokeError ? (
              <span className="text-[9px] text-rose-600 dark:text-rose-400 font-mono leading-relaxed">
                ⚡ {jokeError}
                <span className="block mt-1 text-amber-700/80">Add MISTRAL_API_KEY to your .env file and restart the server.</span>
              </span>
            ) : (
              aiBollywoodJoke || "Tap a button below — Mistral will brew a fresh Bollywood or dark corporate joke."
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-2 border-t border-amber-500/10">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                triggerClick();
                setActiveDialogueIdx(prev => (prev + 1) % bollywoodDialogues.length);
              }}
              className="py-1.5 bg-gradient-to-r from-amber-500 to-rose-500 text-white hover:from-amber-600 hover:to-rose-600 rounded text-[9px] uppercase tracking-wider font-semibold transition-all hover:scale-[1.02] cursor-pointer shadow-sm border-0"
            >
              Dialogue 🎭
            </button>
            <button
              onClick={() => fetchBollywoodJoke("bollywood")}
              disabled={jokeLoading}
              className="py-1.5 border border-amber-500/30 text-amber-700 dark:text-amber-400 disabled:opacity-50 rounded text-[9px] uppercase tracking-wider font-semibold cursor-pointer"
            >
              {jokeLoading && jokeCategory === "bollywood" ? "Brewing…" : "Bollywood Joke 🎬"}
            </button>
          </div>
          <button
            onClick={() => fetchBollywoodJoke("dark")}
            disabled={jokeLoading}
            className="w-full py-1.5 bg-[#1a0f0f] text-rose-300 border border-rose-500/30 hover:border-rose-500/60 disabled:opacity-50 rounded text-[9px] uppercase tracking-wider font-semibold cursor-pointer"
          >
            {jokeLoading && jokeCategory === "dark" ? "Brewing Dark Joke…" : "Dark Masala Joke 😈"}
          </button>
          
          <button
            onClick={() => {
              triggerRetroBollywoodChords();
              fetchBollywoodJoke(jokeCategory === "bollywood" ? "bollywood" : "dark");
            }}
            className="w-full py-1 text-[9px] tracking-widest font-mono bg-[#0c0a06] text-amber-400 border border-amber-500/40 hover:border-amber-500 rounded font-semibold cursor-pointer"
          >
            🎺 RETRO CHORD SWEEP
          </button>
        </div>
      </div>

      {/* Tea Brewer */}
      <div className="bg-[#fcfdfd] dark:bg-[#07130a] p-5 rounded-xl border border-emerald-500/15 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#39FF14] dark:text-emerald-400">Zen Brewing</span>
            <span className="text-[10px] font-mono text-slate-400">Mindfulness Timer</span>
          </div>
          <h5 className="text-xs font-semibold text-slate-800 dark:text-emerald-100 flex items-center gap-1">
            <Coffee className="w-4 h-4 text-emerald-500" /> Herbal Focus Tea Infuser
          </h5>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed mb-3">
            Brew a sensory tea cup to anchor focus. Countdown timer triggers steam and hot water circles.
          </p>

          <div className="flex flex-col gap-2">
            {[
              "Organic Ceremonial Matcha",
              "Roasted Barley Oolong",
              "Fragrant Chamomile Lavender"
            ].map((tea, idx) => (
              <button
                key={idx}
                onClick={() => { triggerClick(); setTeaSelection(tea); }}
                className={`py-1.5 px-3 rounded text-left text-[10px] border transition-all cursor-pointer ${
                  teaSelection === tea 
                    ? "bg-emerald-500/10 border-emerald-500 text-slate-800 dark:text-emerald-300 font-semibold" 
                    : "bg-transparent border-slate-200 dark:border-white/5 text-slate-500 hover:text-slate-850"
                }`}
              >
                🍵 {tea}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-zinc-850">
          {isBrewing ? (
            <div className="flex flex-col gap-1 text-center">
              <span className="text-[9px] font-mono tracking-widest text-emerald-500 uppercase animate-pulse">Brewing Hot Infusion...</span>
              <div className="w-full bg-slate-100 dark:bg-black/30 h-1.5 rounded-full overflow-hidden mt-1">
                <div className="h-full bg-emerald-500" style={{ width: `${teaProgress}%` }} />
              </div>
            </div>
          ) : teaProgress >= 100 ? (
            <div className="text-center bg-teal-50 dark:bg-teal-950/20 py-2 rounded text-xs select-none">
              <span className="text-teal-700 dark:text-teal-400 font-serif italic">Your {teaSelection.split(" ").pop()} is fully vertical and hot! Enjoy focus. ✓</span>
              <button 
                onClick={() => setTeaProgress(0)}
                className="text-[9px] block mx-auto underline text-zinc-500 dark:text-zinc-400 mt-2 hover:text-[#B026FF]"
              >
                Reset brewer
              </button>
            </div>
          ) : (
            <button
              onClick={handleBrewTea}
              className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded text-[10px] uppercase font-semibold font-sans transition-all cursor-pointer border-0"
            >
              Start Brew Cycle ♨
            </button>
          )}
        </div>
      </div>

    </div>
  );
}

// =========================================================
// 4. DEBJANI STATION: DEUTSCHLAND ALPINE & EXPEDITION SIGHTS
// =========================================================
function DebjaniSummitStation({ wordCount, triggerClick }: { wordCount: number; triggerClick: () => void }) {
  const peaks = [
    { name: "Zugspitze (Bavaria Peak)", height: 2962 },
    { name: "Watzmann (Alpine Ridge)", height: 2713 },
    { name: "Feldberg (Schwarzwald)", height: 1493 },
    { name: "Brocken (Harz Mountains)", height: 1141 }
  ];

  const germanSights = [
    { name: "Neuschwanstein Castle", location: "Füssen, Bavaria", desc: "The fairytale alpine castle framed by mist and snow peaks. Pure poetic imagery." },
    { name: "Rhine River Vineyards", location: "Rhineland", desc: "Stunning sloped terraces overlooking historic castles and river valleys." },
    { name: "Brandenburg Gate", location: "Berlin", desc: "Historic neoclassical monument of unity, strength, and dramatic lighting." },
    { name: "Lake Titisee", location: "Black Forest", desc: "Cozy alpine lake nested inside dark pine tree canopies and cuckoo clock workshops." }
  ];

  const focusPhrases = [
    { aspect: "Dreaming of the Alps", thoughts: "Even though I don't speak any German, I absolutely love the clear mountain breeze!" },
    { aspect: "Postcard Wishlist", thoughts: "Stunning forest canopies, fairytale castles, and peaceful slate-colored silence." },
    { aspect: "Alpine Punctuality", thoughts: "I demand absolute, punctual delivery of your copy drafts with zero excuses!" },
    { aspect: "Castle Inspiration", thoughts: "Neuschwanstein is my dream escape when reviewing structural layouts." }
  ];

  const [activePeakIdx, setActivePeakIdx] = useState(0);
  const [climbClicks, setClimbClicks] = useState(1);
  const [activeSightIdx, setActiveSightIdx] = useState(0);
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [alpineGlow, setAlpineGlow] = useState(false);

  // Darshit Taunt State — Indian-style workplace English
  const darshitIndianTaunts = [
    "Arrey Darshit sir, too much micromanagement you are doing on the music playlist, but client deck when you will submit, yaar?",
    "Senior Writer logic only — whole morning raga practice, and now poor-guy face you are making for deadline extension?",
    "What is this, boss? Team Lead designation you have, but grammar check also you want intern to do?",
    "Darshit, kindly explain: synth tuning is critical work, but compliance copy is optional work? Very nice Senior Content Writer ethics!",
    "Yaar Darshit, you are playing helpless innocent guy in meeting, but in hobby station Indian classical quiz champion you are becoming?",
    "Too much kindness you show when deadline misses, but when music volume up you become very strict Team Lead only!",
    "Arrey, Darshit bhai — 'I am just a poor writer' drama stop karo and active voice use karo, no?",
    "Senior Writer sahab, your passive voice count is more than your playlist song count. What is this situation?",
    "Darshit, every standup you say 'sorry yaar, will do today' — but harmonium practice done on time every day, I am noticing only!",
    "Team Lead means lead the team, not lead the tabla session during audit hour, Darshit sir!",
    "Kind poor-guy energy you bring, but when Sonal asks for update suddenly you become very busy music curator boss?",
    "What is this, Senior Content Writer? Word count pending, but alaap pending nahi — I can see your priorities clearly yaar!",
    "Darshit, you told me 'Debjani, I am very stressed poor fellow' — then why three new synth presets you uploaded in lunch break?",
    "Boss-level Senior Writer you are, but innocent puppy eyes also you keep ready for every missed SLA. Pick one personality only!",
  ];
  const [tauntIdx, setTauntIdx] = useState(0);
  const [activeTauntMsg, setActiveTauntMsg] = useState(darshitIndianTaunts[0]);
  const [tauntCopyDone, setTauntCopyDone] = useState(false);

  const handleCycleTaunt = () => {
    triggerClick();
    const nextIdx = (tauntIdx + 1) % darshitIndianTaunts.length;
    setTauntIdx(nextIdx);
    setActiveTauntMsg(darshitIndianTaunts[nextIdx]);
  };

  const handleCopyTaunt = () => {
    triggerClick();
    navigator.clipboard.writeText(activeTauntMsg);
    setTauntCopyDone(true);
    setTimeout(() => setTauntCopyDone(false), 1550);
  };

  const activePeak = peaks[activePeakIdx];
  const currentHeight = Math.min(activePeak.height, Math.round((wordCount * 1.5) + (climbClicks * 120)));
  const climbPercentage = Math.min(100, Math.round((currentHeight / activePeak.height) * 100));

  const triggerYodelChimper = () => {
    triggerClick();
    setAlpineGlow(true);
    setTimeout(() => setAlpineGlow(false), 500);

    // Procedural Yodel/Alpenhorn pitch bend sound
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = "sine";
      // Alpenhorn long low organic drone: 110Hz (A2) to 220Hz (A3)
      osc.frequency.setValueAtTime(110, audioCtx.currentTime);
      osc.frequency.linearRampToValueAtTime(220, audioCtx.currentTime + 0.15);
      osc.frequency.linearRampToValueAtTime(165, audioCtx.currentTime + 0.35); // Perfect fifth E3
      
      gain.gain.setValueAtTime(0, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.06, audioCtx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.55);
    } catch(e) {
      // Audio permission limits
    }
  };

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans transition-all duration-300 ${alpineGlow ? "shadow-[0_0_40px_rgba(239,68,68,0.15)] ring-1 ring-red-500/20 rounded-xl" : ""}`}>
      
      {/* Trek Status parameters */}
      <div className="bg-[#fefcfc] dark:bg-[#0f0808] p-5 rounded-xl border border-red-500/10 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#DC143C]">German Alpinist Trek</span>
            <span className="text-[10px] font-mono text-zinc-500">Expedition Active</span>
          </div>
          <h5 className="text-xs font-semibold text-slate-800 dark:text-red-100 flex items-center gap-1">
            <Mountain className="w-4 h-4 text-red-500" /> Bavarian Peak Summit Map
          </h5>
          <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed mb-4">
            Ascend prestigious peaks within Germany. Watch your oxygen meters update as compliance audits progress.
          </p>

          <div className="flex flex-col gap-1.5 mb-2.5">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400">German Summits:</span>
            <div className="grid grid-cols-2 gap-1.5">
              {peaks.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => { triggerClick(); setActivePeakIdx(idx); }}
                  className={`py-2 px-2.5 rounded text-left text-[9px] uppercase font-mono border cursor-pointer transition-all ${
                    activePeakIdx === idx 
                      ? "bg-red-950/20 text-red-400 border-red-500" 
                      : "bg-transparent border-slate-200 dark:border-white/5 text-slate-500 hover:text-slate-755"
                  }`}
                >
                  ▲ {p.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-zinc-850 flex flex-col gap-2">
          <button
            onClick={() => {
              triggerClick();
              setClimbClicks(prev => prev + 1);
            }}
            className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded text-[10px] uppercase font-semibold font-sans tracking-widest transition-all cursor-pointer border-0"
          >
            Climb Bavaria Trail (+120m) 🏔
          </button>
          
          <button
            onClick={triggerYodelChimper}
            className="w-full py-1 text-[9px] tracking-wider font-mono bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 hover:border-amber-500 rounded font-semibold cursor-pointer"
          >
            📯 SOUND BAVARIAN ALPENHORN
          </button>
        </div>
      </div>

      {/* Live Trek Progress & Sightseeing Postcard */}
      <div className="bg-[#fefcfc] dark:bg-[#0f0808] p-5 rounded-xl border border-red-500/10 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#DC143C]">Germany Journal</span>
            <span className="text-[10px] font-mono text-emerald-500">
              {climbPercentage >= 100 ? "● summit reached" : "● ascendance stable"}
            </span>
          </div>
          
          {/* Postcard Box */}
          <div className="p-3 bg-white dark:bg-black/40 rounded-xl border border-slate-150 relative overflow-hidden mb-3">
            <span className="absolute top-1.5 right-2 font-mono text-[8px] text-slate-400">DEUTSCHLAND POSTCARD</span>
            <div className="text-[10px] uppercase tracking-widest font-bold text-red-500 font-sans mb-0.5">
              📮 {germanSights[activeSightIdx].name}
            </div>
            <span className="text-[9px] font-mono text-zinc-400 italic block mb-1">{germanSights[activeSightIdx].location}</span>
            <p className="text-[11.5px] text-slate-600 dark:text-zinc-300 leading-relaxed font-serif">
              "{germanSights[activeSightIdx].desc}"
            </p>
            <div className="mt-2.5 flex justify-between items-center pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  triggerClick();
                  setActiveSightIdx(prev => (prev + 1) % germanSights.length);
                }}
                className="text-[9px] font-sans font-semibold text-red-600 hover:underline cursor-pointer border-0 bg-transparent p-0"
              >
                Go to next sight →
              </button>
              <span className="text-[8.5px] font-mono text-zinc-400">Postcard #{activeSightIdx + 1}</span>
            </div>
          </div>

          {/* Germany Love Diary */}
          <div className="p-2.5 bg-zinc-100/50 dark:bg-zinc-950/30 rounded-lg text-center font-sans border border-slate-100 relative mb-3">
            <span className="text-[8px] text-zinc-400 uppercase font-mono block mb-0.5">My Germany Travel Aspirations</span>
            <div className="text-xs font-bold text-rose-850 dark:text-rose-400 uppercase tracking-wide mb-0.5">{focusPhrases[phraseIdx].aspect}</div>
            <div className="text-[11px] text-slate-600 dark:text-zinc-300 leading-relaxed italic">"{focusPhrases[phraseIdx].thoughts}"</div>
            <button
              onClick={() => {
                triggerClick();
                setPhraseIdx(prev => (prev + 1) % focusPhrases.length);
              }}
              className="text-[8.5px] font-semibold text-rose-600 hover:text-rose-700 block mt-1.5 mx-auto cursor-pointer border-0 bg-transparent"
            >
              Cycle Travel Diary →
            </button>
          </div>
        </div>

        {/* Big graphic progress bar */}
        <div className="py-2.5 bg-slate-100/40 dark:bg-black/15 rounded-lg text-center border border-slate-150">
          <div className="flex justify-between px-3 text-[9px] font-mono text-slate-400">
            <span>Summit Progress:</span>
            <span>{currentHeight.toLocaleString()}m / {activePeak.height.toLocaleString()}m ({climbPercentage}%)</span>
          </div>
          <div className="mx-3 mt-1.5 h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-red-650 bg-red-600 transition-all duration-300" style={{ width: `${climbPercentage}%` }} />
          </div>
        </div>
      </div>

      {/* NEW SECTION: DARSHIT TAUNTING DASHBOARD */}
      <div className="bg-[#fff9f9] dark:bg-[#120a0b] p-5 rounded-xl border border-red-500/15 flex flex-col justify-between text-slate-800 dark:text-zinc-100">
        <div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#DC143C] font-mono">Senior Editor Deck</span>
            <span className="text-[10px] font-mono text-red-500 animate-pulse">● TARGET: DARSHIT</span>
          </div>
          <h5 className="text-xs font-semibold text-slate-800 dark:text-red-100 flex items-center gap-1.5">
            ⚔️ Indian-Style Workplace Taunt Launcher
          </h5>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed mb-4">
            Cycle through realistic, funny Indian-English taunts aimed at Team Lead Darshit — music-obsessed, kind, and always playing the poor guy.
          </p>

          <div className="p-3 bg-red-50/50 dark:bg-red-950/10 border border-red-105 border-red-500/10 rounded-lg min-h-[110px] flex flex-col justify-between mb-4">
            <p className="text-xs text-red-900 dark:text-zinc-300 italic font-serif leading-relaxed">
              "{activeTauntMsg}"
            </p>
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-red-200/40">
              <span className="text-[8px] font-mono uppercase bg-red-100/80 dark:bg-red-950/60 shadow-sm text-red-600 px-1.5 py-0.5 rounded font-bold">
                Taunt {tauntIdx + 1} / {darshitIndianTaunts.length}
              </span>
              <button
                onClick={handleCopyTaunt}
                className="text-[9px] text-red-600 hover:text-red-700 underline font-mono cursor-pointer border-0 bg-transparent flex items-center gap-1"
              >
                {tauntCopyDone ? "✓ Copied!" : "Copy Taunt 📋"}
              </button>
            </div>
          </div>
        </div>

        <div>
          <button
            onClick={handleCycleTaunt}
            className="w-full py-2 bg-[#DC143C] hover:bg-red-700 text-white rounded text-[10px] uppercase font-bold tracking-widest cursor-pointer border-0 transition-all"
          >
            Next Taunt for Darshit 🇮🇳
          </button>
        </div>
      </div>

    </div>
  );
}

// =========================================================
// 5. POONAM STATION: CERAMIC POTTERY WHEEL & ORIGAMI FOLDING
// =========================================================
interface PoonamTrailParticle {
  id: number;
  x: number;
  y: number;
}

function PoonamPotteryOrigamiStation({ sound, triggerClick }: { sound: boolean; triggerClick: () => void }) {
  const folds = [
    { step: "Step 1: Valley Fold", desc: "Fold square paper diagonally into a clean triangle." },
    { step: "Step 2: Petal Crease", desc: "Fold two outer tips inwards along the guideline creases." },
    { step: "Step 3: Crane Inversion", desc: "Push down central spine to lift beautiful wing folds." }
  ];
  const [foldIdx, setFoldIdx] = useState(0);

  // Literary Library & Shakespeare Drama Bot
  const literaryBooks = [
    { 
      title: "Hamlet", 
      genre: "Tragedy",
      quote: "To be, or not to be, that is the question.", 
      interpretation: "Compliance checking is the ultimate moral act of a precise editor." 
    },
    { 
      title: "Macbeth", 
      genre: "Tragedy",
      quote: "What's done cannot be undone.", 
      interpretation: "Edit thoroughly, for once the client reads, the spell is cast!" 
    },
    { 
      title: "The Merchant of Venice", 
      genre: "Comedy",
      quote: "All that glitters is not gold.", 
      interpretation: "Not all headlines that sound flashy are compliant. Test first!" 
    },
    { 
      title: "Romeo & Juliet", 
      genre: "Romance",
      quote: "What's in a name? That which we call a rose by any other name would smell as sweet.", 
      interpretation: "Though you change 'guarantee' to 'offer', compliance smells just as sweet." 
    }
  ];

  const shakespeareCompliments = [
    "O noble scribe Poonam, thy quill of copywriting flows like a crystalline brook of pure, unblemished wisdom!",
    "How fair is thy diligence, gentle guardian of classical letters, as thy paper fills with pristine compliance!",
    "By my troth, thy copyeditor standards shall be sung by minstrels across digital kingdoms from Verona to the Thames!",
    "Thou art the very pattern of modern industry, rare Poonam; thy words are sweeter than summer's honeyed wind!"
  ];

  const [activeComplimentIdx, setActiveComplimentIdx] = useState(0);
  const [bookGlow, setBookGlow] = useState(false);
  const [literaryQuote, setLiteraryQuote] = useState("");
  const [literaryTitle, setLiteraryTitle] = useState("");
  const [literaryContext, setLiteraryContext] = useState("");
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [trailParticles, setTrailParticles] = useState<PoonamTrailParticle[]>([]);
  const profileCardRef = useRef<HTMLDivElement>(null);
  const trailIdRef = useRef(0);
  const lastTrailSpawnRef = useRef(0);

  const handlePoonamMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!profileCardRef.current) return;
    const now = performance.now();
    if (now - lastTrailSpawnRef.current < 16) return;
    lastTrailSpawnRef.current = now;

    const rect = profileCardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = ++trailIdRef.current;

    setTrailParticles((prev) => [...prev.slice(-40), { id, x, y }]);
    window.setTimeout(() => {
      setTrailParticles((prev) => prev.filter((particle) => particle.id !== id));
    }, 600);
  };

  const fetchLiteraryGem = async () => {
    triggerClick();
    setBookGlow(true);
    setTimeout(() => setBookGlow(false), 600);
    setQuoteLoading(true);
    setQuoteError(null);
    try {
      const response = await fetch("/api/hobby/poonam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "next-quote" }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error || `Gemini archive unavailable (${response.status})`);
      }
      const data = (await response.json()) as { quote?: string; bookTitle?: string; authorContext?: string };
      if (typeof data.quote !== "string" || typeof data.bookTitle !== "string" || typeof data.authorContext !== "string") {
        throw new Error("Malformed literary payload from Gemini.");
      }
      setLiteraryQuote(data.quote);
      setLiteraryTitle(data.bookTitle);
      setLiteraryContext(data.authorContext);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to reach Gemini literary archive.";
      setQuoteError(message);
      const fallback = literaryBooks[Math.floor(Math.random() * literaryBooks.length)];
      setLiteraryQuote(fallback.quote);
      setLiteraryTitle(fallback.title);
      setLiteraryContext(fallback.interpretation);
    } finally {
      setQuoteLoading(false);
    }
  };

  const triggerNostalgicHarpsichord = () => {
    triggerClick();
    setBookGlow(true);
    setTimeout(() => setBookGlow(false), 600);

    if (!sound) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Harpsichord delicate plucky arpeggio
      const playPluck = (freq: number, delay: number) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        // Triangle wave feels like a gentle pluck
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + delay);
        
        gain.gain.setValueAtTime(0, audioCtx.currentTime + delay);
        gain.gain.linearRampToValueAtTime(0.04, audioCtx.currentTime + delay + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + delay + 0.4);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + delay);
        osc.stop(audioCtx.currentTime + delay + 0.45);
      };

      // F4, A4, C5 classical pluck
      playPluck(349.23, 0);
      playPluck(440.00, 0.1);
      playPluck(523.25, 0.2);
    } catch(e) {
      // Audio policies
    }
  };

  const displayQuote = literaryQuote || literaryBooks[0].quote;
  const displayTitle = literaryTitle || literaryBooks[0].title;
  const displayContext = literaryContext || literaryBooks[0].interpretation;

  return (
    <div
      ref={profileCardRef}
      className="relative overflow-hidden rounded-xl"
      onMouseMove={handlePoonamMouseMove}
    >
      <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden rounded-xl">
        {trailParticles.map((particle) => (
          <span
            key={particle.id}
            className="absolute w-1.5 h-1.5 rounded-full bg-pink-500 shadow-[0_0_8px_#ff007f] animate-poonam-stardust"
            style={{ left: particle.x, top: particle.y }}
          />
        ))}
      </div>

      <div className={`relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-6 font-sans transition-all duration-300 ${bookGlow ? "shadow-[0_0_40px_rgba(183,110,121,0.18)] border-pink-500/30 rounded-xl" : ""}`}>
      
      {/* SHAKESPEARE LITERATURE & DRAMA BOT */}
      <div className="bg-[#fefaf7] dark:bg-[#0c0a09] p-5 rounded-xl border-2 border-double border-[#B76E79]/30 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#B76E79] font-mono">The Globe Theatre</span>
            <span className="text-[9px] font-mono text-amber-600 font-semibold">📜 SCRIBES ACTIVE</span>
          </div>

          <h5 className="text-xs font-semibold text-amber-950 dark:text-amber-100 flex items-center gap-1.5 mb-1.5 font-sans">
            ✍️ Infinite Literature Archive
          </h5>
          <p className="text-[11px] text-zinc-500 leading-relaxed mb-3">
            Fetch unique classic literary quotes with book titles and author context via Gemini:
          </p>

          {/* Book display */}
          <div className="p-3.5 bg-white dark:bg-black/45 rounded-xl border border-amber-900/10 dark:border-[#B76E79]/20 relative min-h-[105px] flex flex-col justify-between mb-3">
            <div className="absolute top-1 right-2 text-[14px]">📖</div>
            <div>
              <div className="font-serif text-[11px] font-bold text-amber-850 dark:text-amber-400 block">
                {quoteLoading ? "Consulting the archive…" : displayTitle}
              </div>
              <p className="font-serif italic text-xs text-amber-900 dark:text-amber-300 mt-1 leading-relaxed">
                "{displayQuote}"
              </p>
            </div>
            <p className="text-[9.5px] text-zinc-500 dark:text-zinc-400 mt-2 border-t border-dotted border-amber-900/10 pt-1.5 leading-normal">
              <span className="font-bold text-amber-800">Author Context:</span> {displayContext}
            </p>
            {quoteError && (
              <p className="mt-1 text-[8px] text-amber-600 font-mono">⚡ Fallback: {quoteError}</p>
            )}
          </div>

          {/* Compliment card */}
          <div className="p-3 bg-pink-500/5 rounded-lg border border-dashed border-pink-300/40 text-[10px] text-rose-950/80 dark:text-rose-100/80 leading-relaxed font-serif italic mb-2">
            "{shakespeareCompliments[activeComplimentIdx]}"
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-2 border-t border-amber-900/10">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={fetchLiteraryGem}
              disabled={quoteLoading}
              className="py-1.5 bg-gradient-to-r from-[#B76E79] to-amber-700 disabled:opacity-50 text-white rounded text-[9px] uppercase tracking-wider font-semibold transition-all cursor-pointer border-0 shadow-sm"
            >
              {quoteLoading ? "Fetching Gem…" : "Fetch Literary Gem 📚"}
            </button>
            <button
              onClick={() => {
                triggerClick();
                setActiveComplimentIdx(prev => (prev + 1) % shakespeareCompliments.length);
              }}
              className="py-1.5 border border-[#B76E79]/30 text-[#B76E79] dark:text-rose-300 hover:bg-[#B76E79]/10 rounded text-[9px] uppercase tracking-wider font-semibold cursor-pointer"
            >
              Scribe Praise 🎭
            </button>
          </div>
          
          <button
            onClick={triggerNostalgicHarpsichord}
            className="w-full py-1 text-[9px] tracking-widest font-mono bg-amber-950/20 hover:bg-amber-950/30 text-amber-800 dark:text-amber-400 border border-amber-850/30 rounded font-semibold cursor-pointer"
          >
            🎵 PLUCK VINTAGE HARPSICHORD
          </button>
        </div>
      </div>

      {/* Origami cranes folding */}
      <div className="bg-[#fcfbf9] dark:bg-[#110e11] p-5 rounded-xl border border-pink-500/10 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#B76E79]">Origami Studio</span>
            <span className="text-[10px] font-mono text-slate-400">Paper Crane</span>
          </div>
          <h5 className="text-xs font-semibold text-rose-950 dark:text-rose-100 flex items-center gap-1">
            <Scissors className="w-4 h-4 text-[#B76E79]" /> Step-by-Step Folding Guide
          </h5>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed mb-4">
            Practice peaceful paper origami folds while reviewing copywriting content parameters.
          </p>

          <div className="p-3 bg-white dark:bg-black/35 rounded-lg border border-slate-100 min-h-[90px] flex flex-col justify-between">
            <strong className="text-[10px] uppercase font-bold text-rose-500 font-mono tracking-wider">{folds[foldIdx % folds.length].step}</strong>
            <p className="text-[11px] text-slate-600 dark:text-zinc-300 leading-relaxed mt-1">{folds[foldIdx % folds.length].desc}</p>
            <div className="flex gap-4 mt-2 font-mono text-[8px] text-zinc-400">
              <span>Paper size: 15x15cm</span>
              <span>Fold Tension: Precise</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 whitespace-nowrap pt-4">
          <button 
            onClick={() => { triggerClick(); setFoldIdx(prev => prev + 1); }}
            className="flex-1 py-1.5 bg-[#B76E79] text-white hover:bg-[#a55f6a] rounded text-[9px] uppercase tracking-wider font-semibold text-center transition-all cursor-pointer border-0"
          >
            Advance Fold Sequence →
          </button>
          <button 
            onClick={() => { triggerClick(); setFoldIdx(0); }}
            className="p-1.5 border border-slate-205 rounded hover:bg-slate-50 cursor-pointer text-slate-400 hover:text-slate-650"
            title="Reset origami folding"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
    </div>
  );
}
