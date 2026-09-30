import { useCallback, useEffect, useRef, useState } from "react";
import { AmberButton, DPad, GameShell, Overlay, ScreenBar } from "@/components/arcade";
import { playBeep, playKeyClick } from "@/lib/retro-audio";

/* Helper for high scores */
function useHighScore(key: string, lower = false) {
  const [hi, setHi] = useState(0);
  useEffect(() => setHi(Number(localStorage.getItem(key) ?? 0)), [key]);
  const save = useCallback(
    (score: number) => {
      if (score > 0 && (hi === 0 || (lower ? score < hi : score > hi))) {
        localStorage.setItem(key, String(score));
        setHi(score);
      }
    },
    [hi, key, lower]
  );
  return [hi, save] as const;
}

/* =========================================================================
 * 11. 小行星防御 / ASTEROIDS (Vector Space Combat)
 * ========================================================================= */
interface Asteroid {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
}
interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

export function AsteroidsGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [hi, save] = useHighScore("hi-asteroids");

  const shipRef = useRef({ x: 150, y: 110, angle: 0, vx: 0, vy: 0 });
  const asteroidsRef = useRef<Asteroid[]>([]);
  const bulletsRef = useRef<Bullet[]>([]);
  const keysRef = useRef<{ left: boolean; right: boolean; thrust: boolean; fire: boolean }>({
    left: false,
    right: false,
    thrust: false,
    fire: false,
  });

  const spawnAsteroids = () => {
    const list: Asteroid[] = [];
    for (let i = 0; i < 4; i++) {
      list.push({
        x: Math.random() < 0.5 ? 20 : 280,
        y: Math.random() * 220,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        size: 18,
      });
    }
    asteroidsRef.current = list;
  };

  const start = () => {
    shipRef.current = { x: 150, y: 110, angle: -Math.PI / 2, vx: 0, vy: 0 };
    bulletsRef.current = [];
    spawnAsteroids();
    setScore(0);
    setPlaying(true);
  };

  const fire = useCallback(() => {
    if (!playing) return;
    const s = shipRef.current;
    bulletsRef.current.push({
      x: s.x + Math.cos(s.angle) * 12,
      y: s.y + Math.sin(s.angle) * 12,
      vx: s.vx + Math.cos(s.angle) * 4,
      vy: s.vy + Math.sin(s.angle) * 4,
      life: 50,
    });
    playBeep(880, "square", 0.04);
  }, [playing]);

  useEffect(() => {
    if (!playing) return;
    let animId = 0;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const loop = () => {
      const s = shipRef.current;
      const keys = keysRef.current;

      // Rotate
      if (keys.left) s.angle -= 0.08;
      if (keys.right) s.angle += 0.08;
      // Thrust
      if (keys.thrust) {
        s.vx += Math.cos(s.angle) * 0.12;
        s.vy += Math.sin(s.angle) * 0.12;
      }
      s.vx *= 0.98;
      s.vy *= 0.98;
      s.x = (s.x + s.vx + 300) % 300;
      s.y = (s.y + s.vy + 220) % 220;

      // Update bullets
      const newBullets: Bullet[] = [];
      for (const b of bulletsRef.current) {
        b.x = (b.x + b.vx + 300) % 300;
        b.y = (b.y + b.vy + 220) % 220;
        b.life--;
        if (b.life > 0) newBullets.push(b);
      }
      bulletsRef.current = newBullets;

      // Update asteroids & collisions
      const newAsteroids: Asteroid[] = [];
      for (const a of asteroidsRef.current) {
        a.x = (a.x + a.vx + 300) % 300;
        a.y = (a.y + a.vy + 220) % 220;

        let destroyed = false;
        for (let bi = bulletsRef.current.length - 1; bi >= 0; bi--) {
          const b = bulletsRef.current[bi];
          if (!b) continue;
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < a.size) {
            destroyed = true;
            bulletsRef.current.splice(bi, 1);
            playBeep(220, "sawtooth", 0.08);
            setScore((prev) => {
              const n = prev + (a.size > 12 ? 20 : 50);
              save(n);
              return n;
            });
            if (a.size > 10) {
              newAsteroids.push({
                x: a.x,
                y: a.y,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                size: a.size / 2,
              });
              newAsteroids.push({
                x: a.x,
                y: a.y,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                size: a.size / 2,
              });
            }
            break;
          }
        }

        if (!destroyed) {
          // Check collision with ship
          const shipDist = Math.hypot(a.x - s.x, a.y - s.y);
          if (shipDist < a.size + 6) {
            setPlaying(false);
            playBeep(120, "sawtooth", 0.3);
            return;
          }
          newAsteroids.push(a);
        }
      }

      if (newAsteroids.length === 0) {
        spawnAsteroids();
      } else {
        asteroidsRef.current = newAsteroids;
      }

      // Draw vector graphics
      ctx.fillStyle = "#0c1815";
      ctx.fillRect(0, 0, 300, 220);

      // Draw Asteroids
      ctx.strokeStyle = "#38ef7d";
      ctx.lineWidth = 1.5;
      for (const a of asteroidsRef.current) {
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.size, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw Bullets
      ctx.fillStyle = "#fde047";
      for (const b of bulletsRef.current) {
        ctx.fillRect(b.x - 1.5, b.y - 1.5, 3, 3);
      }

      // Draw Ship
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.angle);
      ctx.strokeStyle = "#fde047";
      ctx.beginPath();
      ctx.moveTo(10, 0);
      ctx.lineTo(-8, -6);
      ctx.lineTo(-4, 0);
      ctx.lineTo(-8, 6);
      ctx.closePath();
      ctx.stroke();

      if (keys.thrust) {
        ctx.strokeStyle = "#f97316";
        ctx.beginPath();
        ctx.moveTo(-6, -3);
        ctx.lineTo(-12, 0);
        ctx.lineTo(-6, 3);
        ctx.stroke();
      }
      ctx.restore();

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [playing, save]);

  return (
    <GameShell
      title="小行星防御"
      subtitle="ASTEROIDS"
      activeGameTo="/asteroids"
      onKeyAction={(k) => {
        if (k === "ArrowLeft" || k === "a") {
          keysRef.current.left = true;
          setTimeout(() => (keysRef.current.left = false), 150);
        }
        if (k === "ArrowRight" || k === "d") {
          keysRef.current.right = true;
          setTimeout(() => (keysRef.current.right = false), 150);
        }
        if (k === "ArrowUp" || k === "w") {
          keysRef.current.thrust = true;
          setTimeout(() => (keysRef.current.thrust = false), 150);
        }
        if (k === " " || k === "Enter") {
          if (!playing) start();
          else fire();
        }
      }}
    >
      <ScreenBar>
        <span>得分 {score}</span>
        <span>小行星 {asteroidsRef.current.length}</span>
        <span className="glow-gold">最高 {hi}</span>
      </ScreenBar>
      <div className="relative mx-auto max-w-[300px] aspect-[300/220] bg-screen rounded border border-screen-glow/30 flex items-center justify-center">
        <canvas ref={canvasRef} width={300} height={220} className="w-full h-full block" />
        {!playing && (
          <Overlay>
            <p className="font-pixel text-[11px] glow-amber">
              {score ? `游戏结束 得分 ${score}` : "小行星空间防御"}
            </p>
            <AmberButton onClick={start}>启动推进器 (START)</AmberButton>
            <p className="font-led text-base text-screen-glow/70">← → 转向 · ↑ 推进 · 空格发射</p>
          </Overlay>
        )}
      </div>
      <div className="mt-2 flex items-center justify-center gap-3">
        <DPad
          onDir={(d) => {
            if (d === "left") {
              shipRef.current.angle -= 0.3;
            } else if (d === "right") {
              shipRef.current.angle += 0.3;
            } else if (d === "up") {
              shipRef.current.vx += Math.cos(shipRef.current.angle) * 1.5;
              shipRef.current.vy += Math.sin(shipRef.current.angle) * 1.5;
            }
          }}
        />
        <AmberButton onClick={fire}>💥 激光发射</AmberButton>
      </div>
    </GameShell>
  );
}

/* =========================================================================
 * 12. 月球着陆器 / LUNAR LANDER (1979 Apollo Simulation)
 * ========================================================================= */
export function LunarLanderGame() {
  const [pos, setPos] = useState({ x: 140, y: 20 });
  const [vel, setVel] = useState({ vx: 0.5, vy: 0 });
  const [fuel, setFuel] = useState(100);
  const [status, setStatus] = useState<"idle" | "flying" | "landed" | "crashed">("idle");
  const [score, setScore] = useState(0);
  const [hi, save] = useHighScore("hi-lander");

  const thrust = (dir: "up" | "left" | "right") => {
    if (status !== "flying" || fuel <= 0) return;
    setFuel((f) => Math.max(0, f - 3));
    playBeep(180, "sawtooth", 0.05);
    setVel((v) => ({
      vx: v.vx + (dir === "left" ? -0.4 : dir === "right" ? 0.4 : 0),
      vy: v.vy + (dir === "up" ? -0.8 : 0),
    }));
  };

  const start = () => {
    setPos({ x: 60 + Math.random() * 140, y: 15 });
    setVel({ vx: (Math.random() - 0.5) * 0.8, vy: 0 });
    setFuel(100);
    setStatus("flying");
  };

  useEffect(() => {
    if (status !== "flying") return;
    const id = setInterval(() => {
      setPos((p) => {
        let nx = p.x + vel.vx;
        let ny = p.y + vel.vy;
        if (nx < 10) nx = 10;
        if (nx > 280) nx = 280;

        // Ground touch
        if (ny >= 170) {
          ny = 170;
          // Landing condition: Pad is at x: 100~190
          const onPad = nx >= 90 && nx <= 190;
          const softLanding = Math.abs(vel.vy) < 1.4 && Math.abs(vel.vx) < 1.0;

          if (onPad && softLanding) {
            setStatus("landed");
            const pts = Math.round(fuel * 10 + 500);
            setScore(pts);
            save(pts);
            playBeep(660, "sine", 0.2);
          } else {
            setStatus("crashed");
            playBeep(90, "sawtooth", 0.3);
          }
        }
        return { x: nx, y: ny };
      });

      setVel((v) => ({
        vx: v.vx * 0.99,
        vy: v.vy + 0.12, // Gravity
      }));
    }, 40);
    return () => clearInterval(id);
  }, [status, vel, fuel, save]);

  return (
    <GameShell
      title="月球着陆器"
      subtitle="LUNAR LANDER"
      activeGameTo="/lander"
      onKeyAction={(k) => {
        if (k === "ArrowUp" || k === "w" || k === " ") {
          if (status === "idle" || status === "landed" || status === "crashed") start();
          else thrust("up");
        }
        if (k === "ArrowLeft" || k === "a") thrust("left");
        if (k === "ArrowRight" || k === "d") thrust("right");
      }}
    >
      <ScreenBar>
        <span>
          燃料: <strong className={fuel < 25 ? "text-[#ef4444]" : "text-[#fde047]"}>{fuel}%</strong>
        </span>
        <span>垂直降速: {vel.vy.toFixed(1)}</span>
        <span className="glow-gold">最高 {hi}</span>
      </ScreenBar>

      <div className="relative h-56 sm:h-64 bg-screen rounded border border-screen-glow/30 overflow-hidden">
        {/* Stars */}
        <div className="absolute top-4 left-10 text-xs text-screen-glow/40">✦</div>
        <div className="absolute top-12 right-20 text-xs text-screen-glow/30">✦</div>
        <div className="absolute top-24 left-36 text-xs text-screen-glow/20">✦</div>

        {/* Lander Module */}
        <div
          className="absolute transition-all duration-75 flex flex-col items-center"
          style={{ left: pos.x - 12, top: pos.y }}
        >
          <div className="text-xl leading-none">🚀</div>
        </div>

        {/* Lunar Surface & Pad */}
        <div className="absolute bottom-0 inset-x-0 h-14 bg-[#1b2a26] border-t-2 border-screen-glow/40">
          <div className="absolute top-0 left-[90px] w-[100px] h-3 bg-[#fde047]/30 border-b-2 border-[#fde047] flex items-center justify-center font-pixel text-[7px] text-[#fde047]">
            ★ LANDING PAD 2X ★
          </div>
        </div>

        {status !== "flying" && (
          <Overlay>
            <p className="font-pixel text-[11px] glow-amber">
              {status === "landed"
                ? `🎉 完美着陆! 得分 +${score}`
                : status === "crashed"
                ? "💥 着陆器坠毁! 降速过快"
                : "阿波罗月球着陆器"}
            </p>
            <AmberButton onClick={start}>
              {status === "idle" ? "启动降落" : "再次尝试"}
            </AmberButton>
            <p className="font-led text-base text-screen-glow/70">
              ↑ 启动垂直减速主引擎 · ← → 调整姿态
            </p>
          </Overlay>
        )}
      </div>

      <div className="mt-2 flex justify-center gap-2">
        <button
          type="button"
          onClick={() => thrust("left")}
          className="retro-key retro-key-cream px-3 py-1 font-pixel text-xs"
        >
          ◀ 左推力
        </button>
        <button
          type="button"
          onClick={() => thrust("up")}
          className="retro-key retro-key-cream px-5 py-1 font-pixel text-xs text-[#d97706]"
        >
          ▲ 主推进减速
        </button>
        <button
          type="button"
          onClick={() => thrust("right")}
          className="retro-key retro-key-cream px-3 py-1 font-pixel text-xs"
        >
          右推力 ▶
        </button>
      </div>
    </GameShell>
  );
}

/* =========================================================================
 * 13. 扫雷终端 / MINESWEEPER
 * ========================================================================= */
export function MinesweeperGame() {
  const ROWS = 8;
  const COLS = 8;
  const MINES = 8;

  type Cell = { mine: boolean; revealed: boolean; flagged: boolean; count: number };
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [status, setStatus] = useState<"idle" | "playing" | "won" | "lost">("idle");
  const [flagMode, setFlagMode] = useState(false);
  const [hi, save] = useHighScore("hi-minesweeper");

  const initBoard = () => {
    const b: Cell[][] = Array.from({ length: ROWS }, () =>
      Array.from({ length: COLS }, () => ({
        mine: false,
        revealed: false,
        flagged: false,
        count: 0,
      }))
    );

    let placed = 0;
    while (placed < MINES) {
      const r = Math.floor(Math.random() * ROWS);
      const c = Math.floor(Math.random() * COLS);
      const row = b[r];
      if (row && !row[c]!.mine) {
        row[c]!.mine = true;
        placed++;
      }
    }

    // Counts
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const row = b[r];
        if (row && row[c]!.mine) continue;
        let count = 0;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
              const targetRow = b[nr];
              if (targetRow && targetRow[nc]!.mine) count++;
            }
          }
        }
        if (row) row[c]!.count = count;
      }
    }

    setGrid(b);
    setStatus("playing");
  };

  const clickCell = (r: number, c: number) => {
    if (status !== "playing") return;
    const targetRow = grid[r];
    if (!targetRow) return;
    const cell = targetRow[c];
    if (!cell || cell.revealed) return;

    if (flagMode) {
      playBeep(440, "sine", 0.04);
      const next = grid.map((row, ri) =>
        row.map((cl, ci) => (ri === r && ci === c ? { ...cl, flagged: !cl.flagged } : cl))
      );
      setGrid(next);
      return;
    }

    if (cell.flagged) return;

    if (cell.mine) {
      // Boom
      playBeep(90, "sawtooth", 0.3);
      setStatus("lost");
      // reveal all mines
      setGrid((g) =>
        g.map((row) =>
          row.map((cl) => (cl.mine ? { ...cl, revealed: true } : cl))
        )
      );
      return;
    }

    playKeyClick();
    // Flood reveal
    const next = grid.map((row) => row.map((cl) => ({ ...cl })));
    const reveal = (rowIdx: number, colIdx: number) => {
      if (rowIdx < 0 || rowIdx >= ROWS || colIdx < 0 || colIdx >= COLS) return;
      const curRow = next[rowIdx];
      if (!curRow) return;
      const cl = curRow[colIdx];
      if (!cl || cl.revealed || cl.flagged) return;
      cl.revealed = true;
      if (cl.count === 0 && !cl.mine) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            reveal(rowIdx + dr, colIdx + dc);
          }
        }
      }
    };
    reveal(r, c);

    // Check win
    let unrevealedSafe = 0;
    for (const row of next) {
      for (const cl of row) {
        if (!cl.mine && !cl.revealed) unrevealedSafe++;
      }
    }

    if (unrevealedSafe === 0) {
      setStatus("won");
      save(MINES * 100);
      playBeep(720, "sine", 0.2);
    }
    setGrid(next);
  };

  useEffect(() => {
    initBoard();
  }, []);

  return (
    <GameShell title="扫雷终端" subtitle="MINESWEEPER" activeGameTo="/minesweeper">
      <ScreenBar>
        <span>地雷数量 {MINES}</span>
        <span className="glow-gold font-bold">模式: {flagMode ? "🚩 插旗" : "⛏️ 挖掘"}</span>
        <span className="glow-gold">最高 {hi}</span>
      </ScreenBar>

      <div className="relative mx-auto my-auto p-2 bg-[#0d1c18] border border-screen-glow/30 rounded flex flex-col items-center">
        <div className="grid grid-cols-8 gap-1">
          {grid.map((row, r) =>
            row.map((cell, c) => (
              <button
                key={`${r}-${c}`}
                type="button"
                onClick={() => clickCell(r, c)}
                className={`size-7 sm:size-8 rounded font-pixel text-xs flex items-center justify-center border transition-all ${
                  cell.revealed
                    ? cell.mine
                      ? "bg-[#ef4444] border-[#b91c1c] text-white"
                      : "bg-[#142d25] border-[#1f483b] text-screen-glow"
                    : "retro-key retro-key-cream text-[#3a2e1d]"
                }`}
              >
                {cell.revealed
                  ? cell.mine
                    ? "💣"
                    : cell.count > 0
                    ? cell.count
                    : ""
                  : cell.flagged
                  ? "🚩"
                  : ""}
              </button>
            ))
          )}
        </div>

        {status !== "playing" && status !== "idle" && (
          <Overlay>
            <p className="font-pixel text-[11px] glow-amber">
              {status === "won" ? "🎉 恭喜! 排除了全部地雷" : "💥 触发地雷 任务失败"}
            </p>
            <AmberButton onClick={initBoard}>再来一局 (NEW GAME)</AmberButton>
          </Overlay>
        )}
      </div>

      <div className="mt-2 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => setFlagMode((f) => !f)}
          className={`retro-key px-4 py-1.5 font-pixel text-[9px] rounded ${
            flagMode ? "retro-key-grey" : "retro-key-cream"
          }`}
        >
          {flagMode ? "🚩 当前: 插旗模式" : "⛏️ 当前: 挖掘模式 (点击切换)"}
        </button>
        <AmberButton onClick={initBoard}>🔄 重置盘面</AmberButton>
      </div>
    </GameShell>
  );
}

/* =========================================================================
 * 14. 极速公路赛 / ROAD RACE (Top-Down 8-bit Racer)
 * ========================================================================= */
export function RoadRaceGame() {
  const [playerX, setPlayerX] = useState(2); // 0, 1, 2, 3, 4
  const [cars, setCars] = useState<{ lane: number; y: number; icon: string }[]>([]);
  const [fuel, setFuel] = useState(100);
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [hi, save] = useHighScore("hi-race");

  const start = () => {
    setPlayerX(2);
    setCars([]);
    setFuel(100);
    setScore(0);
    setSpeed(1);
    setPlaying(true);
  };

  const move = (dir: "left" | "right") => {
    if (!playing) return;
    playKeyClick();
    setPlayerX((x) => Math.max(0, Math.min(4, x + (dir === "left" ? -1 : 1))));
  };

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setFuel((f) => {
        if (f <= 0) {
          setPlaying(false);
          return 0;
        }
        return f - 0.5;
      });

      setScore((s) => {
        const next = s + speed * 2;
        save(next);
        return next;
      });

      // Move oncoming traffic
      setCars((prev) => {
        const icons = ["🚙", "🚚", "🚕", "⛽"];
        const nextCars = prev
          .map((c) => ({ ...c, y: c.y + 1 }))
          .filter((c) => c.y < 8);

        // Spawn new car
        if (Math.random() < 0.45) {
          const lane = Math.floor(Math.random() * 5);
          const isFuel = Math.random() < 0.2;
          nextCars.push({
            lane,
            y: 0,
            icon: isFuel ? "⛽" : icons[Math.floor(Math.random() * 3)] ?? "🚙",
          });
        }

        // Collision check at bottom (y === 6)
        for (const c of nextCars) {
          if (c.y === 6 && c.lane === playerX) {
            if (c.icon === "⛽") {
              setFuel((f) => Math.min(100, f + 25));
              playBeep(880, "sine", 0.08);
            } else {
              // Crash
              playBeep(110, "sawtooth", 0.3);
              setPlaying(false);
            }
          }
        }

        return nextCars;
      });
    }, 280 / speed);
    return () => clearInterval(id);
  }, [playing, speed, playerX, save]);

  return (
    <GameShell
      title="极速公路赛"
      subtitle="ROAD RACE"
      activeGameTo="/race"
      onKeyAction={(k) => {
        if (k === "ArrowLeft" || k === "a") move("left");
        if (k === "ArrowRight" || k === "d") move("right");
        if (k === "ArrowUp" || k === "w") setSpeed((s) => Math.min(2.5, s + 0.3));
        if (k === "ArrowDown" || k === "s") setSpeed((s) => Math.max(1, s - 0.3));
        if (k === " " && !playing) start();
      }}
    >
      <ScreenBar>
        <span>里程 {score}KM</span>
        <span>
          燃料: <strong className={fuel < 25 ? "text-[#ef4444]" : "text-[#fde047]"}>{Math.round(fuel)}%</strong>
        </span>
        <span>速度 {speed.toFixed(1)}X</span>
        <span className="glow-gold">最高 {hi}</span>
      </ScreenBar>

      <div className="relative h-56 sm:h-64 bg-[#0a1815] border-x-4 border-dashed border-[#fde047]/40 rounded overflow-hidden grid grid-rows-7 grid-cols-5 p-1">
        {Array.from({ length: 35 }).map((_, i) => {
          const lane = i % 5;
          const row = Math.floor(i / 5);
          const car = cars.find((c) => c.lane === lane && c.y === row);
          const isPlayer = row === 6 && lane === playerX;

          return (
            <div key={i} className="flex items-center justify-center text-lg border-b border-[#1b332d]/40">
              {isPlayer ? (
                <span className="text-xl animate-bounce">🏎️</span>
              ) : car ? (
                <span className="text-base">{car.icon}</span>
              ) : null}
            </div>
          );
        })}

        {!playing && (
          <Overlay>
            <p className="font-pixel text-[11px] glow-amber">
              {score ? `比赛结束! 里程 ${score}KM` : "8-BIT 极速公路赛"}
            </p>
            <AmberButton onClick={start}>踏上赛道 (START)</AmberButton>
            <p className="font-led text-base text-screen-glow/70">← → 切换车道 · 拾取 ⛽ 补充燃料</p>
          </Overlay>
        )}
      </div>

      <div className="mt-2 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => move("left")}
          className="retro-key retro-key-cream px-5 py-2 font-pixel text-xs"
        >
          ◀ 左变道
        </button>
        <button
          type="button"
          onClick={() => move("right")}
          className="retro-key retro-key-cream px-5 py-2 font-pixel text-xs"
        >
          右变道 ▶
        </button>
      </div>
    </GameShell>
  );
}

/* =========================================================================
 * 15. 地牢探险 / ROGUE DUNGEON (Classic ASCII RPG)
 * ========================================================================= */
export function DungeonGame() {
  const [hp, setHp] = useState(100);
  const [keys, setKeys] = useState(0);
  const [gold, setGold] = useState(0);
  const [floor, setFloor] = useState(1);
  const [log, setLog] = useState("进入了古老地下城……");
  const [pos, setPos] = useState({ x: 1, y: 1 });
  const [map, setMap] = useState<string[][]>([]);
  const [playing, setPlaying] = useState(false);
  const [hi, save] = useHighScore("hi-dungeon");

  const buildFloor = () => {
    // 7x7 dungeon grid: # wall, . floor, K key, D door, M monster, P potion, T treasure, S stairs
    const m: string[][] = [
      ["#", "#", "#", "#", "#", "#", "#"],
      ["#", ".", ".", "M", ".", "K", "#"],
      ["#", ".", "#", "#", "#", ".", "#"],
      ["#", "P", "#", "T", "#", ".", "#"],
      ["#", ".", "#", "D", "#", ".", "#"],
      ["#", ".", "M", ".", ".", "S", "#"],
      ["#", "#", "#", "#", "#", "#", "#"],
    ];
    setMap(m);
    setPos({ x: 1, y: 1 });
  };

  const start = () => {
    setHp(100);
    setKeys(0);
    setGold(0);
    setFloor(1);
    setLog("踏入地牢第 1 层！寻找钥匙与下层楼梯。");
    buildFloor();
    setPlaying(true);
  };

  const move = (dx: number, dy: number) => {
    if (!playing) return;
    const nx = pos.x + dx;
    const ny = pos.y + dy;
    const targetRow = map[ny];
    if (!targetRow) return;
    const tile = targetRow[nx];
    if (!tile || tile === "#") return;

    if (tile === "D") {
      if (keys > 0) {
        setKeys((k) => k - 1);
        playBeep(520, "sine", 0.08);
        setLog("使用钥匙打开了铁门！");
        targetRow[nx] = ".";
      } else {
        setLog("铁门紧锁，需要寻找钥匙 🔑！");
        playBeep(160, "sawtooth", 0.1);
        return;
      }
    } else if (tile === "K") {
      setKeys((k) => k + 1);
      playBeep(880, "sine", 0.08);
      setLog("捡到了一把地牢铜钥匙 🔑！");
      targetRow[nx] = ".";
    } else if (tile === "P") {
      setHp((h) => Math.min(100, h + 30));
      playBeep(660, "sine", 0.1);
      setLog("饮用了生命药水 🧪 (+30 HP)！");
      targetRow[nx] = ".";
    } else if (tile === "T") {
      const g = 150;
      setGold((prev) => {
        const next = prev + g;
        save(next);
        return next;
      });
      playBeep(980, "sine", 0.12);
      setLog("开启了华丽宝箱 💎 (+150 金币)！");
      targetRow[nx] = ".";
    } else if (tile === "M") {
      // Fight
      setHp((h) => {
        const next = h - 25;
        if (next <= 0) {
          setPlaying(false);
          setLog("你被地牢魔物击败了……");
          playBeep(90, "sawtooth", 0.3);
          return 0;
        }
        return next;
      });
      playBeep(240, "square", 0.08);
      setLog("击败了地牢怪兽 👹！受到了 25 点伤害。");
      targetRow[nx] = ".";
    } else if (tile === "S") {
      // Next floor
      playBeep(780, "sine", 0.2);
      setFloor((f) => f + 1);
      setGold((g) => {
        const next = g + 200;
        save(next);
        return next;
      });
      setLog(`进入了地牢第 ${floor + 1} 层！`);
      buildFloor();
      return;
    }

    setPos({ x: nx, y: ny });
    playKeyClick();
  };

  useEffect(() => {
    buildFloor();
  }, []);

  return (
    <GameShell
      title="地牢探险"
      subtitle="ROGUE DUNGEON"
      activeGameTo="/dungeon"
      onKeyAction={(k) => {
        if (k === "ArrowUp" || k === "w") move(0, -1);
        if (k === "ArrowDown" || k === "s") move(0, 1);
        if (k === "ArrowLeft" || k === "a") move(-1, 0);
        if (k === "ArrowRight" || k === "d") move(1, 0);
        if (k === " " && !playing) start();
      }}
    >
      <ScreenBar>
        <span>第 {floor} 层</span>
        <span>
          生命: <strong className={hp < 30 ? "text-[#ef4444]" : "text-[#38ef7d]"}>{hp} HP</strong>
        </span>
        <span>🔑 x{keys}</span>
        <span className="glow-gold">金币 {gold}</span>
      </ScreenBar>

      <div className="relative mx-auto my-auto bg-[#0a1815] border border-screen-glow/30 p-2 rounded flex flex-col items-center">
        <div className="grid grid-cols-7 gap-1 select-none">
          {map.map((row, y) =>
            row.map((tile, x) => {
              const isPlayer = pos.x === x && pos.y === y;
              return (
                <div
                  key={`${y}-${x}`}
                  className="size-8 rounded flex items-center justify-center font-pixel text-xs bg-[#11241f] border border-[#1b3830]"
                >
                  {isPlayer ? (
                    <span className="text-base text-[#fde047] animate-pulse">🧙</span>
                  ) : tile === "#" ? (
                    <span className="text-[#3b554e]">🧱</span>
                  ) : tile === "K" ? (
                    <span>🔑</span>
                  ) : tile === "D" ? (
                    <span>🚪</span>
                  ) : tile === "P" ? (
                    <span>🧪</span>
                  ) : tile === "T" ? (
                    <span>💎</span>
                  ) : tile === "M" ? (
                    <span>👹</span>
                  ) : tile === "S" ? (
                    <span>🌀</span>
                  ) : (
                    <span className="text-[#1e3e35]">·</span>
                  )}
                </div>
              );
            })
          )}
        </div>

        <p className="mt-2 font-led text-base text-screen-glow/90 text-center">{log}</p>

        {!playing && (
          <Overlay>
            <p className="font-pixel text-[11px] glow-amber">
              {hp <= 0 ? "冒险失败 · 倒在地牢深处" : "ROGUE 地牢探险"}
            </p>
            <AmberButton onClick={start}>开启冒险 (START)</AmberButton>
            <p className="font-led text-base text-screen-glow/70">
              方向键探索 · 收集 🔑 打开 🚪 前往 🌀
            </p>
          </Overlay>
        )}
      </div>

      <div className="mt-2 flex justify-center">
        <DPad
          onDir={(d) => {
            if (d === "up") move(0, -1);
            if (d === "down") move(0, 1);
            if (d === "left") move(-1, 0);
            if (d === "right") move(1, 0);
          }}
        />
      </div>
    </GameShell>
  );
}

/* =========================================================================
 * 16. 声光记忆 / RETRO SIMON (1978 Electronic Toy)
 * ========================================================================= */
export function SimonGame() {
  const [seq, setSeq] = useState<number[]>([]);
  const [playerStep, setPlayerStep] = useState(0);
  const [activeBtn, setActiveBtn] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [hi, save] = useHighScore("hi-simon");

  const colors = [
    { id: 0, name: "绿", bg: "bg-[#10b981]", tone: 440 },
    { id: 1, name: "红", bg: "bg-[#ef4444]", tone: 554 },
    { id: 2, name: "黄", bg: "bg-[#f59e0b]", tone: 659 },
    { id: 3, name: "蓝", bg: "bg-[#3b82f6]", tone: 880 },
  ];

  const flashButton = (id: number) => {
    setActiveBtn(id);
    const col = colors[id];
    if (col) playBeep(col.tone, "sine", 0.18);
    setTimeout(() => setActiveBtn(null), 250);
  };

  const playSequence = (list: number[]) => {
    list.forEach((id, idx) => {
      setTimeout(() => flashButton(id), (idx + 1) * 450);
    });
  };

  const start = () => {
    const first = Math.floor(Math.random() * 4);
    const initial = [first];
    setSeq(initial);
    setPlayerStep(0);
    setScore(0);
    setPlaying(true);
    playSequence(initial);
  };

  const press = (id: number) => {
    if (!playing || activeBtn !== null) return;
    flashButton(id);

    if (id === seq[playerStep]) {
      if (playerStep + 1 === seq.length) {
        // Next round!
        const nextScore = score + 1;
        setScore(nextScore);
        save(nextScore);
        const nextSeq = [...seq, Math.floor(Math.random() * 4)];
        setSeq(nextSeq);
        setPlayerStep(0);
        setTimeout(() => playSequence(nextSeq), 800);
      } else {
        setPlayerStep((s) => s + 1);
      }
    } else {
      // Wrong!
      playBeep(120, "sawtooth", 0.4);
      setPlaying(false);
    }
  };

  return (
    <GameShell title="声光记忆" subtitle="RETRO SIMON" activeGameTo="/simon">
      <ScreenBar>
        <span>回合 {score}</span>
        <span>长度 {seq.length}</span>
        <span className="glow-gold">最高纪录 {hi}</span>
      </ScreenBar>

      <div className="relative mx-auto my-auto p-4 bg-[#0a1815] border border-screen-glow/30 rounded-full size-52 sm:size-60 flex items-center justify-center shadow-2xl">
        <div className="grid grid-cols-2 gap-2 size-full rounded-full overflow-hidden p-2 bg-[#1b2b26]">
          {colors.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => press(c.id)}
              className={`${c.bg} rounded-2xl transition-all ${
                activeBtn === c.id ? "brightness-150 scale-105 shadow-[0_0_20px_#fff]" : "opacity-80 hover:opacity-100"
              }`}
            />
          ))}
        </div>

        <div className="absolute size-20 rounded-full bg-[#0d1c18] border-2 border-screen-glow/50 flex flex-col items-center justify-center font-pixel text-[8px] text-screen-glow">
          <span>SIMON</span>
          <span className="text-[10px] text-[#fde047] font-bold">{score}</span>
        </div>

        {!playing && (
          <Overlay>
            <p className="font-pixel text-[11px] glow-amber">
              {score ? `记忆失误! 完成 ${score} 关` : "1978 SIMON 声光记忆"}
            </p>
            <AmberButton onClick={start}>开始记忆挑战</AmberButton>
            <p className="font-led text-base text-screen-glow/70">依次复述闪烁的四色光芒与音调</p>
          </Overlay>
        )}
      </div>
    </GameShell>
  );
}

/* =========================================================================
 * 17. 导弹防御 / MISSILE DEFENSE (1980 Anti-Ballistic Interceptor)
 * ========================================================================= */
interface Missile {
  sx: number;
  sy: number;
  tx: number;
  ty: number;
  cx: number;
  cy: number;
}
interface Blast {
  x: number;
  y: number;
  r: number;
  maxR: number;
}

export function MissileGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [cities, setCities] = useState(3);
  const [playing, setPlaying] = useState(false);
  const [hi, save] = useHighScore("hi-missile");

  const missilesRef = useRef<Missile[]>([]);
  const blastsRef = useRef<Blast[]>([]);

  const start = () => {
    missilesRef.current = [];
    blastsRef.current = [];
    setCities(3);
    setScore(0);
    setPlaying(true);
  };

  const fireInterceptor = (clientX: number, clientY: number) => {
    if (!playing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 300;
    const y = ((clientY - rect.top) / rect.height) * 220;

    blastsRef.current.push({ x, y, r: 2, maxR: 24 });
    playBeep(440, "square", 0.05);
  };

  useEffect(() => {
    if (!playing) return;
    let animId = 0;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const interval = setInterval(() => {
      // Spawn incoming ballistic missile
      if (missilesRef.current.length < 5) {
        const sx = Math.random() * 300;
        const tx = 30 + Math.random() * 240;
        missilesRef.current.push({ sx, sy: 0, tx, ty: 200, cx: sx, cy: 0 });
      }
    }, 900);

    const loop = () => {
      // Update blasts
      const nextBlasts: Blast[] = [];
      for (const b of blastsRef.current) {
        b.r += 0.8;
        if (b.r < b.maxR) nextBlasts.push(b);
      }
      blastsRef.current = nextBlasts;

      // Update missiles
      const nextMissiles: Missile[] = [];
      for (const m of missilesRef.current) {
        m.cx += (m.tx - m.sx) * 0.006;
        m.cy += (m.ty - m.sy) * 0.006;

        let intercepted = false;
        for (const b of blastsRef.current) {
          if (Math.hypot(m.cx - b.x, m.cy - b.y) < b.r) {
            intercepted = true;
            playBeep(220, "sawtooth", 0.08);
            setScore((s) => {
              const n = s + 50;
              save(n);
              return n;
            });
            break;
          }
        }

        if (!intercepted) {
          if (m.cy >= 200) {
            // Hit ground city!
            playBeep(90, "sawtooth", 0.2);
            setCities((c) => {
              const nc = c - 1;
              if (nc <= 0) setPlaying(false);
              return nc;
            });
          } else {
            nextMissiles.push(m);
          }
        }
      }
      missilesRef.current = nextMissiles;

      // Draw
      ctx.fillStyle = "#0a1815";
      ctx.fillRect(0, 0, 300, 220);

      // Draw Missiles
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 1.5;
      for (const m of missilesRef.current) {
        ctx.beginPath();
        ctx.moveTo(m.sx, m.sy);
        ctx.lineTo(m.cx, m.cy);
        ctx.stroke();
      }

      // Draw Blasts
      ctx.fillStyle = "rgba(253, 224, 71, 0.4)";
      ctx.strokeStyle = "#fde047";
      for (const b of blastsRef.current) {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }

      // Draw Ground & 3 Cities
      ctx.fillStyle = "#1b3027";
      ctx.fillRect(0, 200, 300, 20);

      ctx.fillStyle = "#38ef7d";
      ctx.font = "12px monospace";
      if (cities >= 1) ctx.fillText("🏙️", 40, 198);
      if (cities >= 2) ctx.fillText("🏙️", 140, 198);
      if (cities >= 3) ctx.fillText("🏙️", 240, 198);

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => {
      clearInterval(interval);
      cancelAnimationFrame(animId);
    };
  }, [playing, cities, save]);

  return (
    <GameShell title="导弹防御" subtitle="MISSILE DEFENSE" activeGameTo="/missile">
      <ScreenBar>
        <span>得分 {score}</span>
        <span>防御城市 {cities}/3 🏙️</span>
        <span className="glow-gold">最高 {hi}</span>
      </ScreenBar>

      <div
        className="relative mx-auto max-w-[300px] aspect-[300/220] bg-screen rounded border border-screen-glow/30 cursor-crosshair select-none"
        onClick={(e) => fireInterceptor(e.clientX, e.clientY)}
      >
        <canvas ref={canvasRef} width={300} height={220} className="w-full h-full block" />
        {!playing && (
          <Overlay>
            <p className="font-pixel text-[11px] glow-amber">
              {cities <= 0 ? `城市全毁! 得分 ${score}` : "导弹防御防空拦截"}
            </p>
            <AmberButton onClick={start}>开启防空系统</AmberButton>
            <p className="font-led text-base text-screen-glow/70">
              点击屏幕发射拦截弹 · 产生爆轰波摧毁来袭导弹
            </p>
          </Overlay>
        )}
      </div>
    </GameShell>
  );
}

/* =========================================================================
 * 18. 幸运老虎机 / VINTAGE SLOTS (1970s Mechanical 3-Reel Slot)
 * ========================================================================= */
export function SlotsGame() {
  const symbols = ["🍒", "🍋", "🔔", "🍇", "💎", "7️⃣", "💰"];
  const [reels, setReels] = useState(["7️⃣", "7️⃣", "7️⃣"]);
  const [coins, setCoins] = useState(100);
  const [bet, setBet] = useState(5);
  const [spinning, setSpinning] = useState(false);
  const [winMessage, setWinMessage] = useState("拉动摇杆开始下注！");
  const [hi, save] = useHighScore("hi-slots");

  const spin = () => {
    if (spinning || coins < bet) return;
    setCoins((c) => c - bet);
    setSpinning(true);
    setWinMessage("齿轮转动中……");

    let ticks = 0;
    const tickId = setInterval(() => {
      playKeyClick();
      setReels([
        symbols[Math.floor(Math.random() * symbols.length)] ?? "🍒",
        symbols[Math.floor(Math.random() * symbols.length)] ?? "🍋",
        symbols[Math.floor(Math.random() * symbols.length)] ?? "🔔",
      ]);
      ticks++;
      if (ticks > 12) {
        clearInterval(tickId);
        const finalReels = [
          symbols[Math.floor(Math.random() * symbols.length)] ?? "🍒",
          symbols[Math.floor(Math.random() * symbols.length)] ?? "🍋",
          symbols[Math.floor(Math.random() * symbols.length)] ?? "🔔",
        ];
        setReels(finalReels);
        setSpinning(false);

        // Check payouts
        const r0 = finalReels[0];
        const r1 = finalReels[1];
        const r2 = finalReels[2];

        if (r0 === r1 && r1 === r2) {
          let mult = 20;
          if (r0 === "7️⃣") mult = 100;
          if (r0 === "💰") mult = 200;
          if (r0 === "💎") mult = 50;

          const won = bet * mult;
          setCoins((c) => {
            const next = c + won;
            save(next);
            return next;
          });
          setWinMessage(`🎉 大奖! 3个 ${r0} 赢得 +${won} 金币!`);
          playBeep(880, "sine", 0.3);
        } else if (r0 === r1 || r1 === r2 || r0 === r2) {
          const won = bet * 3;
          setCoins((c) => {
            const next = c + won;
            save(next);
            return next;
          });
          setWinMessage(`✨ 连线奖励! 获得 +${won} 金币!`);
          playBeep(660, "sine", 0.15);
        } else {
          setWinMessage("再接再厉，幸运就在下一次！");
        }
      }
    }, 80);
  };

  return (
    <GameShell
      title="幸运老虎机"
      subtitle="VINTAGE SLOTS"
      activeGameTo="/slots"
      onKeyAction={(k) => {
        if (k === " " || k === "Enter") spin();
      }}
    >
      <ScreenBar>
        <span>
          金币持有: <strong className="glow-gold">{coins} 🪙</strong>
        </span>
        <span>当前下注: {bet}</span>
        <span className="glow-gold">最高筹码 {hi}</span>
      </ScreenBar>

      <div className="relative mx-auto my-auto p-4 bg-[#0a1815] border-2 border-screen-glow/40 rounded-xl flex flex-col items-center">
        {/* Slot Reels Window */}
        <div className="flex items-center gap-3 p-3 bg-[#11241f] border-2 border-[#1f483b] rounded-lg shadow-inner">
          {reels.map((sym, i) => (
            <div
              key={i}
              className={`size-16 sm:size-20 rounded-lg bg-[#f7f0e1] border-2 border-[#8f8269] flex items-center justify-center text-3xl sm:text-4xl shadow-md ${
                spinning ? "animate-pulse" : ""
              }`}
            >
              {sym}
            </div>
          ))}
        </div>

        <p className="mt-3 font-pixel text-[9px] sm:text-[10px] glow-amber text-center">
          {winMessage}
        </p>

        {/* Bet Selector */}
        <div className="mt-3 flex items-center gap-2 font-pixel text-[8px]">
          <span className="text-screen-glow/70">选择押注:</span>
          {[1, 5, 10, 20].map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => setBet(b)}
              className={`retro-key px-2.5 py-1 rounded ${
                bet === b ? "retro-key-grey" : "retro-key-cream"
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-2 flex justify-center">
        <AmberButton onClick={spin}>
          {spinning ? "🎲 滚轮飞速旋转中..." : `🎰 拉动拉杆 (SPIN - 消耗 ${bet} 币)`}
        </AmberButton>
      </div>
    </GameShell>
  );
}

/* =========================================================================
 * 19. 欢乐打地鼠 / WHACK-A-MOLE (Fast Mechanical Reaction)
 * ========================================================================= */
export function MoleGame() {
  const [moles, setMoles] = useState<boolean[]>(Array(9).fill(false));
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [playing, setPlaying] = useState(false);
  const [hi, save] = useHighScore("hi-mole");

  const start = () => {
    setScore(0);
    setTimeLeft(30);
    setMoles(Array(9).fill(false));
    setPlaying(true);
  };

  const whack = (idx: number) => {
    if (!playing) return;
    if (moles[idx]) {
      playBeep(880, "sine", 0.06);
      setScore((s) => {
        const next = s + 10;
        save(next);
        return next;
      });
      setMoles((prev) => prev.map((m, i) => (i === idx ? false : m)));
    } else {
      playBeep(180, "sawtooth", 0.05);
    }
  };

  useEffect(() => {
    if (!playing) return;
    const timerId = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setPlaying(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    const moleId = setInterval(() => {
      const idx = Math.floor(Math.random() * 9);
      setMoles((prev) => prev.map((_, i) => i === idx));
    }, 650);

    return () => {
      clearInterval(timerId);
      clearInterval(moleId);
    };
  }, [playing]);

  return (
    <GameShell
      title="欢乐打地鼠"
      subtitle="WHACK-A-MOLE"
      activeGameTo="/mole"
      onKeyAction={(k) => {
        // Support 1-9 keyboard keys
        if (/^[1-9]$/.test(k)) {
          whack(Number(k) - 1);
        }
        if (k === " " && !playing) start();
      }}
    >
      <ScreenBar>
        <span>得分 {score}</span>
        <span>剩余时间: {timeLeft}S</span>
        <span className="glow-gold">最高 {hi}</span>
      </ScreenBar>

      <div className="relative mx-auto my-auto p-3 bg-[#0a1815] border border-screen-glow/30 rounded-xl">
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {moles.map((isMole, i) => (
            <button
              key={i}
              type="button"
              onClick={() => whack(i)}
              className="size-16 sm:size-20 rounded-xl bg-[#142d25] border-2 border-[#204a3d] flex flex-col items-center justify-center relative shadow-inner hover:brightness-110 active:scale-95 transition-all"
            >
              <span className="font-pixel text-[8px] text-screen-glow/40 absolute top-1 left-2">
                {i + 1}
              </span>
              {isMole ? (
                <span className="text-3xl sm:text-4xl animate-bounce">🦔</span>
              ) : (
                <span className="size-8 rounded-full bg-[#08120f] border border-black/40 inline-block" />
              )}
            </button>
          ))}
        </div>

        {!playing && (
          <Overlay>
            <p className="font-pixel text-[11px] glow-amber">
              {timeLeft === 0 ? `时间到! 最终得分 ${score}` : "欢乐机械打地鼠"}
            </p>
            <AmberButton onClick={start}>开始击打 (START)</AmberButton>
            <p className="font-led text-base text-screen-glow/70">
              点击地鼠或按键盘数字键 1~9 快速击打
            </p>
          </Overlay>
        )}
      </div>
    </GameShell>
  );
}

/* =========================================================================
 * 20. 极速打字机 / RETRO TYPIST (Terminal Word Defense)
 * ========================================================================= */
const WORD_LIST = [
  "CRT", "BYTE", "ROM", "RAM", "DOS", "CHIP", "PIXEL", "CODE", "TURBO",
  "ATARI", "KEY", "CPU", "BOOT", "VRAM", "HACK", "DATA", "PLAY", "GAME"
];

interface FallingWord {
  id: number;
  text: string;
  x: number;
  y: number;
}

export function TypingGame() {
  const [words, setWords] = useState<FallingWord[]>([]);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [hp, setHp] = useState(5);
  const [playing, setPlaying] = useState(false);
  const [hi, save] = useHighScore("hi-typing");
  const scoreRef = useRef(0);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  const start = () => {
    setWords([]);
    setInput("");
    setScore(0);
    scoreRef.current = 0;
    setHp(5);
    setPlaying(true);
  };

  const handleChar = (char: string) => {
    if (!playing) return;
    const nextInput = (input + char.toUpperCase()).trim();

    // Check matches
    const match = words.find((w) => w.text === nextInput);
    if (match) {
      playBeep(920, "sine", 0.08);
      const addPts = match.text.length * 10;
      setScore((s) => {
        const next = s + addPts;
        scoreRef.current = next;
        save(next);
        return next;
      });
      setWords((prev) => prev.filter((w) => w.id !== match.id));
      setInput("");
    } else {
      playKeyClick();
      setInput(nextInput);
    }
  };

  useEffect(() => {
    if (!playing) return;
    const spawnId = setInterval(() => {
      const text = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)] ?? "BYTE";
      const x = 10 + Math.floor(Math.random() * 65);
      setWords((prev) => [...prev, { id: Date.now() + Math.random(), text, x, y: 0 }]);
    }, 1400);

    const fallId = setInterval(() => {
      setWords((prev) => {
        const nextWords: FallingWord[] = [];
        for (const w of prev) {
          const ny = w.y + 4;
          if (ny >= 85) {
            // Buffer breach!
            playBeep(110, "sawtooth", 0.15);
            setHp((h) => {
              const nh = Math.max(0, h - 1);
              if (nh <= 0) {
                setPlaying(false);
                save(scoreRef.current);
              }
              return nh;
            });
          } else {
            nextWords.push({ ...w, y: ny });
          }
        }
        return nextWords;
      });
    }, 200);

    return () => {
      clearInterval(spawnId);
      clearInterval(fallId);
    };
  }, [playing, save]);

  return (
    <GameShell
      title="极速打字机"
      subtitle="RETRO TYPIST"
      activeGameTo="/typing"
      onKeyAction={(k) => {
        if (/^[a-zA-Z]$/.test(k)) {
          handleChar(k);
        } else if (k === "Backspace") {
          setInput((prev) => prev.slice(0, -1));
        } else if (k === " " && !playing) {
          start();
        }
      }}
    >
      <ScreenBar>
        <span>得分 {score}</span>
        <span>
          防御护盾:{" "}
          <strong className={hp < 2 ? "text-[#ef4444]" : "text-[#38ef7d]"}>
            {hp > 0 ? "🛡️".repeat(Math.max(0, Math.min(5, hp))) : "💥 护盾耗尽"}
          </strong>
        </span>
        <span className="glow-gold">最高 {hi}</span>
      </ScreenBar>

      <div className="relative h-56 sm:h-64 bg-screen rounded border border-screen-glow/30 p-2 overflow-hidden flex flex-col justify-between">
        {/* Falling words area */}
        <div className="relative flex-1">
          {words.map((w) => (
            <div
              key={w.id}
              className="absolute font-pixel text-xs glow-amber bg-[#142d25] px-1.5 py-0.5 rounded border border-screen-glow/40 transition-all duration-200"
              style={{ left: `${w.x}%`, top: `${w.y}%` }}
            >
              {w.text}
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <div className="w-full pt-2 border-t border-screen-glow/30 flex items-center justify-between font-pixel text-[10px]">
          <div className="flex items-center gap-1.5">
            <span className="text-screen-glow/70">INPUT:</span>
            <span className="glow-gold font-bold">{input || "_"}</span>
          </div>
          <button
            type="button"
            onClick={() => setInput("")}
            className="retro-key retro-key-grey px-2 py-0.5 font-pixel text-[8px]"
          >
            CLEAR
          </button>
        </div>

        {!playing && (
          <Overlay>
            <p className="font-pixel text-[11px] glow-amber">
              {hp <= 0 ? (
                <>
                  缓冲区溢出! 游戏结束<br />
                  <span className="text-[#fde047] text-sm mt-1 inline-block">最终得分: {score}</span>
                </>
              ) : (
                "极速终端打字防御"
              )}
            </p>
            {score >= hi && score > 0 && (
              <p className="font-pixel text-[9px] glow-gold animate-pulse">🏆 创下新纪录!</p>
            )}
            <AmberButton onClick={start}>
              {hp <= 0 ? "再来一局 (RETRY)" : "开始打字 (START)"}
            </AmberButton>
            <p className="font-led text-base text-screen-glow/70">
              在键盘上快速敲击飘落的指令单词以消除它们
            </p>
          </Overlay>
        )}
      </div>
    </GameShell>
  );
}

