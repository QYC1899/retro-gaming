import { useCallback, useEffect, useRef, useState } from "react";
import { AmberButton, DPad, GameShell, Overlay, ScreenBar } from "@/components/arcade";

type GameMeta = { title: string; subtitle: string; storage: string; route: string };
const meta = {
  pong: { title: "乒乓球", subtitle: "PONG", storage: "hi-pong", route: "/pong" },
  invaders: { title: "太空侵略者", subtitle: "INVADERS", storage: "hi-invaders", route: "/invaders" },
  frogger: { title: "青蛙过河", subtitle: "FROGGER", storage: "hi-frogger", route: "/frogger" },
  tictactoe: { title: "井字棋", subtitle: "TIC TAC TOE", storage: "hi-tictactoe", route: "/tictactoe" },
  reaction: { title: "反应测试", subtitle: "REACTION", storage: "hi-reaction", route: "/reaction" },
  code: { title: "密码破译", subtitle: "CODE BREAKER", storage: "hi-code", route: "/codebreaker" },
  catch: { title: "接金币", subtitle: "COIN CATCH", storage: "hi-catch", route: "/catch" },
} satisfies Record<string, GameMeta>;

function useHighScore(key: string, lower = false) {
  const [hi, setHi] = useState(0);
  useEffect(() => setHi(Number(localStorage.getItem(key) ?? 0)), [key]);
  const save = useCallback((score: number) => {
    if (score > 0 && (hi === 0 || (lower ? score < hi : score > hi))) {
      localStorage.setItem(key, String(score));
      setHi(score);
    }
  }, [hi, key, lower]);
  return [hi, save] as const;
}

export function PongGame() {
  const m = meta.pong;
  const [score, setScore] = useState(0);
  const [cpu, setCpu] = useState(0);
  const [ball, setBall] = useState({ x: 50, y: 50, dx: 1.2, dy: 1 });
  const [paddle, setPaddle] = useState(50);
  const [playing, setPlaying] = useState(false);
  const [hi, save] = useHighScore(m.storage);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => setBall((b) => {
      let { x, y, dx, dy } = b;
      x += dx;
      y += dy;
      if (y < 4 || y > 96) dy *= -1;
      if (x < 7 && Math.abs(y - paddle) < 18) dx = Math.abs(dx) * 1.04;
      if (x > 93) dx = -Math.abs(dx) * 1.04;
      if (x < 0) {
        setCpu((v) => v + 1);
        x = 50;
        y = 50;
        dx = 1.2;
      }
      if (x > 100) {
        setScore((v) => {
          const n = v + 1;
          save(n);
          return n;
        });
        x = 50;
        y = 50;
        dx = -1.2;
      }
      return { x, y, dx, dy };
    }), 24);
    return () => clearInterval(id);
  }, [playing, paddle, save]);

  const move = (d: "up" | "down" | "left" | "right") =>
    setPaddle((p) => Math.max(14, Math.min(86, p + (d === "up" ? -10 : d === "down" ? 10 : 0))));

  return (
    <GameShell
      title={m.title}
      subtitle={m.subtitle}
      activeGameTo={m.route}
      onKeyAction={(k) => {
        if (k === "ArrowUp" || k === "w") move("up");
        if (k === "ArrowDown" || k === "s") move("down");
        if (k === " " && !playing) setPlaying(true);
      }}
    >
      <ScreenBar>
        <span>你 {score}</span>
        <span>电脑 {cpu}</span>
        <span className="glow-gold">最高 {hi}</span>
      </ScreenBar>
      <div
        className="relative h-56 sm:h-64 border border-screen-glow/30 rounded-md overflow-hidden bg-screen select-none"
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setPaddle(((e.clientY - r.top) / r.height) * 100);
        }}
      >
        <div className="absolute left-[4%] h-14 w-2 bg-screen-glow rounded-sm" style={{ top: `calc(${paddle}% - 28px)` }} />
        <div className="absolute right-[4%] h-14 w-2 bg-gold rounded-sm" style={{ top: `calc(${ball.y}% - 28px)` }} />
        <div className="absolute size-3 rounded-full bg-screen-glow shadow-[0_0_8px_#38ef7d]" style={{ left: `${ball.x}%`, top: `${ball.y}%` }} />
        {!playing && (
          <Overlay>
            <p className="font-pixel text-[11px] glow-amber">电子乒乓</p>
            <AmberButton onClick={() => setPlaying(true)}>发球开始</AmberButton>
            <p className="font-led text-base text-screen-glow/70">上下方向键 / 鼠标滑动控制球拍</p>
          </Overlay>
        )}
      </div>
      <div className="mt-2 flex justify-center">
        <DPad onDir={move} />
      </div>
    </GameShell>
  );
}

export function InvadersGame() {
  const m = meta.invaders;
  const [ship, setShip] = useState(2);
  const [aliens, setAliens] = useState(() => Array.from({ length: 15 }, (_, i) => i));
  const [score, setScore] = useState(0);
  const [shots, setShots] = useState<number[]>([]);
  const [playing, setPlaying] = useState(false);
  const [hi, save] = useHighScore(m.storage);

  const fire = () => {
    if (!playing) return;
    const target = aliens.find((a) => a % 5 === ship);
    if (target !== undefined) {
      setShots((s) => [...s, ship]);
      setTimeout(() => setShots([]), 180);
      setAliens((a) => a.filter((x) => x !== target));
      setScore((v) => {
        const n = v + 10;
        save(n);
        return n;
      });
    }
  };

  const move = (d: "up" | "down" | "left" | "right") =>
    setShip((s) => Math.max(0, Math.min(4, s + (d === "left" ? -1 : d === "right" ? 1 : 0))));

  const start = () => {
    setAliens(Array.from({ length: 15 }, (_, i) => i));
    setScore(0);
    setPlaying(true);
  };

  return (
    <GameShell
      title={m.title}
      subtitle={m.subtitle}
      activeGameTo={m.route}
      onKeyAction={(k) => {
        if (k === "ArrowLeft" || k === "a") move("left");
        if (k === "ArrowRight" || k === "d") move("right");
        if (k === " " || k === "Enter") {
          if (!playing) start();
          else fire();
        }
      }}
    >
      <ScreenBar>
        <span>得分 {score}</span>
        <span>剩余入侵者 {aliens.length}</span>
        <span className="glow-gold">最高 {hi}</span>
      </ScreenBar>
      <div className="relative h-56 sm:h-64 bg-screen rounded-md p-4 flex flex-col justify-between">
        <div className="grid grid-cols-5 gap-3">
          {Array.from({ length: 15 }, (_, i) => (
            <span
              key={i}
              className={`text-center font-pixel text-base transition-opacity ${
                aliens.includes(i) ? "glow-amber" : "opacity-0"
              }`}
            >
              👾
            </span>
          ))}
        </div>
        {shots.map((_, i) => (
          <span
            key={i}
            className="absolute bottom-12 font-pixel glow-gold animate-shot"
            style={{ left: `${12 + ship * 19}%` }}
          >
            │
          </span>
        ))}
        <span className="font-pixel text-xl glow-gold block transition-all" style={{ marginLeft: `${8 + ship * 19}%` }}>
          ▲
        </span>
        {(!playing || aliens.length === 0) && (
          <Overlay>
            <p className="font-pixel text-[10px] glow-amber">
              {aliens.length === 0 ? "🎉 地球安全了!" : "抵御外星侵略"}
            </p>
            <AmberButton onClick={start}>
              {aliens.length === 0 ? "再守一次" : "开始战斗"}
            </AmberButton>
          </Overlay>
        )}
      </div>
      <div className="mt-2 flex items-center justify-center gap-4">
        <DPad onDir={move} />
        <AmberButton onClick={fire}>💥 发射 (SPACE)</AmberButton>
      </div>
    </GameShell>
  );
}

export function FroggerGame() {
  const m = meta.frogger;
  const [pos, setPos] = useState({ x: 2, y: 5 });
  const [cars, setCars] = useState([0, 3, 1, 4]);
  const [score, setScore] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [hi, save] = useHighScore(m.storage);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setCars((c) => c.map((x, i) => (x + (i % 2 ? 1 : -1) + 5) % 5)), 650);
    return () => clearInterval(id);
  }, [playing]);

  useEffect(() => {
    if (!playing) return;
    if (pos.y > 0 && pos.y < 5 && cars[pos.y - 1] === pos.x) {
      setPlaying(false);
    } else if (pos.y === 0) {
      setScore((s) => {
        const n = s + 1;
        save(n);
        return n;
      });
      setPos({ x: 2, y: 5 });
    }
  }, [cars, pos, playing, save]);

  const move = (d: "up" | "down" | "left" | "right") =>
    playing &&
    setPos((p) => ({
      x: Math.max(0, Math.min(4, p.x + (d === "left" ? -1 : d === "right" ? 1 : 0))),
      y: Math.max(0, Math.min(5, p.y + (d === "up" ? -1 : d === "down" ? 1 : 0))),
    }));

  return (
    <GameShell
      title={m.title}
      subtitle={m.subtitle}
      activeGameTo={m.route}
      onKeyAction={(k) => {
        if (k === "ArrowUp" || k === "w") move("up");
        if (k === "ArrowDown" || k === "s") move("down");
        if (k === "ArrowLeft" || k === "a") move("left");
        if (k === "ArrowRight" || k === "d") move("right");
        if (k === " " && !playing) {
          setScore(0);
          setPos({ x: 2, y: 5 });
          setPlaying(true);
        }
      }}
    >
      <ScreenBar>
        <span>过河 {score}</span>
        <span className="glow-gold">最高 {hi}</span>
      </ScreenBar>
      <div className="relative grid grid-rows-6 h-56 sm:h-64 bg-screen rounded-md overflow-hidden">
        {Array.from({ length: 6 }, (_, r) => (
          <div
            key={r}
            className={`grid grid-cols-5 border-b border-screen-glow/10 ${
              r === 0 || r === 5 ? "bg-screen-glow/10" : ""
            }`}
          >
            {Array.from({ length: 5 }, (_, c) => (
              <div key={c} className="grid place-items-center font-pixel text-lg">
                {pos.x === c && pos.y === r ? (
                  <span className="glow-gold">🐸</span>
                ) : r > 0 && r < 5 && cars[r - 1] === c ? (
                  <span className="glow-amber">🚗</span>
                ) : null}
              </div>
            ))}
          </div>
        ))}
        {!playing && (
          <Overlay>
            <p className="font-pixel text-[10px] glow-amber">
              {score ? "小心车辆撞击!" : "青蛙过河"}
            </p>
            <AmberButton
              onClick={() => {
                setScore(0);
                setPos({ x: 2, y: 5 });
                setPlaying(true);
              }}
            >
              开始过河
            </AmberButton>
          </Overlay>
        )}
      </div>
      <div className="mt-2 flex justify-center">
        <DPad onDir={move} />
      </div>
    </GameShell>
  );
}

const marks = [0, 1, 2, 3, 4, 5, 6, 7, 8];
const wins = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

export function TicTacToeGame() {
  const [board, setBoard] = useState<string[]>(Array(9).fill(""));
  const [winsCount, setWins] = useState(0);
  const [hi, save] = useHighScore("hi-tictactoe");

  const winningLine = wins.find((w) => {
    const first = w[0];
    if (first === undefined) return false;
    const mark = board[first];
    return Boolean(mark) && w.every((i) => board[i] === mark);
  });
  const winner = winningLine?.[0] === undefined ? undefined : board[winningLine[0]];
  const full = board.every(Boolean);

  const play = (i: number) => {
    if (board[i] || winner) return;
    const b = [...board];
    b[i] = "X";
    const won = wins.some((w) => w.every((n) => b[n] === "X"));
    if (won) {
      setBoard(b);
      setWins((v) => {
        const n = v + 1;
        save(n);
        return n;
      });
      return;
    }
    const open = marks.filter((n) => !b[n]);
    if (open.length) {
      const pick = open[Math.floor(Math.random() * open.length)];
      if (pick !== undefined) b[pick] = "O";
    }
    setBoard(b);
  };

  return (
    <GameShell title="井字棋" subtitle="TIC TAC TOE" activeGameTo="/tictactoe">
      <ScreenBar>
        <span>连胜 {winsCount}</span>
        <span className="glow-gold">最高纪录 {hi}</span>
      </ScreenBar>
      <div className="relative grid grid-cols-3 gap-2 mx-auto w-56 aspect-square my-auto">
        {marks.map((i) => (
          <button
            key={i}
            onClick={() => play(i)}
            className="retro-key retro-key-cream rounded-md font-pixel text-2xl"
          >
            {board[i] || "·"}
          </button>
        ))}
        {(winner || full) && (
          <Overlay>
            <p className="font-pixel text-[11px] glow-amber">
              {winner === "X" ? "🎉 你赢了!" : winner === "O" ? "电脑获胜" : "平局"}
            </p>
            <AmberButton onClick={() => setBoard(Array(9).fill(""))}>再来一局</AmberButton>
          </Overlay>
        )}
      </div>
      <p className="font-led text-base text-screen-glow/60 text-center mt-2">
        你是 X · 连成三格获胜
      </p>
    </GameShell>
  );
}

export function ReactionGame() {
  const m = meta.reaction;
  const [phase, setPhase] = useState<"idle" | "wait" | "go" | "done" | "early">("idle");
  const [result, setResult] = useState(0);
  const startRef = useRef(0);
  const timer = useRef<number | undefined>(undefined);
  const [hi, save] = useHighScore(m.storage, true);

  const start = () => {
    setPhase("wait");
    setResult(0);
    timer.current = window.setTimeout(() => {
      startRef.current = performance.now();
      setPhase("go");
    }, 1200 + Math.random() * 2200);
  };

  const hit = () => {
    if (phase === "wait") {
      clearTimeout(timer.current);
      setPhase("early");
    } else if (phase === "go") {
      const n = Math.round(performance.now() - startRef.current);
      setResult(n);
      save(n);
      setPhase("done");
    }
  };

  return (
    <GameShell
      title={m.title}
      subtitle={m.subtitle}
      activeGameTo={m.route}
      onKeyAction={(k) => {
        if (k === " " || k === "Enter") {
          if (phase === "idle" || phase === "done" || phase === "early") start();
          else hit();
        }
      }}
    >
      <ScreenBar>
        <span>本次 {result ? `${result}MS` : "—"}</span>
        <span className="glow-gold">最快 {hi ? `${hi}MS` : "—"}</span>
      </ScreenBar>
      <button
        onClick={hit}
        className={`relative h-56 sm:h-64 w-full rounded-md border border-screen-glow/30 flex items-center justify-center ${
          phase === "go" ? "bg-amber/30" : "bg-screen"
        }`}
      >
        {phase === "go" && <span className="font-pixel text-2xl glow-gold animate-ping">⚡ 按下! (HIT)</span>}
        {(phase === "idle" || phase === "done" || phase === "early") && (
          <Overlay>
            <p className="font-pixel text-[11px] glow-amber">
              {phase === "done" ? `${result} 毫秒` : phase === "early" ? "太早了! 请等待绿灯" : "等待屏幕闪烁后按下"}
            </p>
            <AmberButton onClick={start}>{phase === "idle" ? "准备开始" : "再试一次"}</AmberButton>
          </Overlay>
        )}
        {phase === "wait" && <span className="font-pixel text-xs text-screen-glow/60 animate-pulse">等待信号中……</span>}
      </button>
    </GameShell>
  );
}

export function CodeBreakerGame() {
  const m = meta.code;
  const secret = useRef("");
  const [guess, setGuess] = useState("");
  const [tries, setTries] = useState(0);
  const [hint, setHint] = useState("输入四位数字");
  const [won, setWon] = useState(false);
  const [hi, save] = useHighScore(m.storage, true);

  const start = () => {
    secret.current = String(Math.floor(1000 + Math.random() * 9000));
    setGuess("");
    setTries(0);
    setHint("输入四位数字");
    setWon(false);
  };

  useEffect(start, []);

  const submit = () => {
    if (guess.length !== 4) return;
    const n = tries + 1;
    setTries(n);
    if (guess === secret.current) {
      setWon(true);
      save(n);
      return;
    }
    let exact = 0, near = 0;
    guess.split("").forEach((x, i) => {
      if (x === secret.current[i]) exact++;
      else if (secret.current.includes(x)) near++;
    });
    setHint(`${exact} 位正确 · ${near} 位存在`);
    setGuess("");
  };

  return (
    <GameShell
      title={m.title}
      subtitle={m.subtitle}
      activeGameTo={m.route}
      onKeyAction={(k) => {
        if (/^[0-9]$/.test(k) && guess.length < 4) setGuess((g) => g + k);
        if (k === "Backspace") setGuess((g) => g.slice(0, -1));
        if (k === "Enter") submit();
      }}
    >
      <ScreenBar>
        <span>尝试 {tries} 次</span>
        <span className="glow-gold">最佳 {hi || "—"}</span>
      </ScreenBar>
      <div className="relative h-56 sm:h-64 bg-screen rounded-md flex flex-col items-center justify-center gap-3 p-3">
        <p className="font-pixel text-[10px] glow-amber">{hint}</p>
        <div className="font-pixel text-3xl tracking-[0.4em] glow-gold min-h-10">
          {guess.padEnd(4, "·")}
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {"1234567890".split("").map((n) => (
            <button
              key={n}
              onClick={() => guess.length < 4 && setGuess((g) => g + n)}
              className="retro-key retro-key-cream size-9 rounded-md font-pixel text-xs"
            >
              {n}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <AmberButton onClick={() => setGuess("")}>清除</AmberButton>
          <AmberButton onClick={submit}>确认提交 (ENTER)</AmberButton>
        </div>
        {won && (
          <Overlay>
            <p className="font-pixel text-[11px] glow-gold">🎉 密码破解成功! 共 {tries} 次</p>
            <AmberButton onClick={start}>生成新密码</AmberButton>
          </Overlay>
        )}
      </div>
    </GameShell>
  );
}

export function CatchGame() {
  const m = meta.catch;
  const [basket, setBasket] = useState(2);
  const [coin, setCoin] = useState({ x: 2, y: 0 });
  const [score, setScore] = useState(0);
  const [miss, setMiss] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [hi, save] = useHighScore(m.storage);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setCoin((c) => {
        if (c.y >= 5) {
          if (c.x === basket) {
            setScore((s) => {
              const n = s + 1;
              save(n);
              return n;
            });
          } else {
            setMiss((v) => {
              const n = v + 1;
              if (n >= 3) setPlaying(false);
              return n;
            });
          }
          return { x: Math.floor(Math.random() * 5), y: 0 };
        }
        return { ...c, y: c.y + 1 };
      });
    }, 430);
    return () => clearInterval(id);
  }, [playing, basket, save]);

  const move = (d: "up" | "down" | "left" | "right") =>
    setBasket((b) => Math.max(0, Math.min(4, b + (d === "left" ? -1 : d === "right" ? 1 : 0))));

  return (
    <GameShell
      title={m.title}
      subtitle={m.subtitle}
      activeGameTo={m.route}
      onKeyAction={(k) => {
        if (k === "ArrowLeft" || k === "a") move("left");
        if (k === "ArrowRight" || k === "d") move("right");
        if (k === " " && !playing) {
          setScore(0);
          setMiss(0);
          setPlaying(true);
        }
      }}
    >
      <ScreenBar>
        <span>金币 {score}</span>
        <span>漏接 {miss}/3</span>
        <span className="glow-gold">最高 {hi}</span>
      </ScreenBar>
      <div className="relative grid grid-rows-6 grid-cols-5 h-56 sm:h-64 bg-screen rounded-md">
        {Array.from({ length: 30 }, (_, i) => {
          const x = i % 5;
          const y = Math.floor(i / 5);
          return (
            <div key={i} className="grid place-items-center font-pixel text-lg">
              {coin.x === x && coin.y === y ? (
                <span className="glow-gold">🪙</span>
              ) : y === 5 && basket === x ? (
                <span className="glow-amber text-xl">🧺</span>
              ) : null}
            </div>
          );
        })}
        {!playing && (
          <Overlay>
            <p className="font-pixel text-[11px] glow-amber">接住掉落金币</p>
            <AmberButton
              onClick={() => {
                setScore(0);
                setMiss(0);
                setPlaying(true);
              }}
            >
              开始接金币
            </AmberButton>
          </Overlay>
        )}
      </div>
      <div className="mt-2 flex justify-center">
        <DPad onDir={move} />
      </div>
    </GameShell>
  );
}
