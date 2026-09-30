import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { AmberButton, DPad, GameShell, Overlay, ScreenBar } from "@/components/arcade";

export const Route = createFileRoute("/snake")({
  head: () => ({
    meta: [
      { title: "贪吃蛇 — 复古游戏机" },
      { name: "description", content: "70 年代复古风格的贪吃蛇小游戏。" },
      { property: "og:title", content: "贪吃蛇 — 复古游戏机" },
      { property: "og:description", content: "70 年代复古风格的贪吃蛇小游戏。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SnakePage,
});

const COLS = 16;
const ROWS = 16;
const CELL = 16;
const SPEED = 140; // ms

type Pt = { x: number; y: number };
type Dir = "up" | "down" | "left" | "right";
type State = "idle" | "playing" | "over";

const delta: Record<Dir, Pt> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};
const opposite: Record<Dir, Dir> = { up: "down", down: "up", left: "right", right: "left" };

function SnakePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const snakeRef = useRef<Pt[]>([{ x: 8, y: 8 }]);
  const dirRef = useRef<Dir>("right");
  const nextDirRef = useRef<Dir>("right");
  const foodRef = useRef<Pt>({ x: 4, y: 4 });
  const [status, setStatus] = useState<State>("idle");
  const [score, setScore] = useState(0);
  const [hi, setHi] = useState(0);

  useEffect(() => {
    const v = Number(localStorage.getItem("hi-snake") ?? 0);
    setHi(v);
  }, []);

  const placeFood = useCallback(() => {
    let p: Pt;
    do {
      p = { x: (Math.random() * COLS) | 0, y: (Math.random() * ROWS) | 0 };
    } while (snakeRef.current.some((s) => s.x === p.x && s.y === p.y));
    foodRef.current = p;
  }, []);

  const reset = useCallback(() => {
    snakeRef.current = [{ x: 8, y: 8 }];
    dirRef.current = "right";
    nextDirRef.current = "right";
    placeFood();
    setScore(0);
  }, [placeFood]);

  const start = useCallback(() => {
    reset();
    setStatus("playing");
  }, [reset]);

  const turn = useCallback((d: Dir) => {
    if (d === opposite[dirRef.current]) return;
    nextDirRef.current = d;
  }, []);

  // 键盘
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, Dir> = {
        ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
        w: "up", s: "down", a: "left", d: "right",
      };
      const d = map[e.key];
      if (d) {
        e.preventDefault();
        turn(d);
      } else if (e.key === " " && status !== "playing") {
        start();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [turn, start, status]);

  // 游戏循环
  useEffect(() => {
    if (status !== "playing") return;
    const id = setInterval(() => {
      const dir = nextDirRef.current;
      dirRef.current = dir;
      const snake = snakeRef.current;
      const head = { x: snake[0]!.x + delta[dir]!.x, y: snake[0]!.y + delta[dir]!.y };

      // 碰撞:墙 / 自身
      if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS ||
          snake.some((s) => s.x === head.x && s.y === head.y)) {
        setStatus("over");
        setScore((prev) => {
          if (prev > hi) {
            localStorage.setItem("hi-snake", String(prev));
            setHi(prev);
          }
          return prev;
        });
        return;
      }

      const newSnake = [head, ...snake];
      const food = foodRef.current;
      if (head.x === food.x && head.y === food.y) {
        setScore((s) => s + 10);
        placeFood();
      } else {
        newSnake.pop();
      }
      snakeRef.current = newSnake;
    }, SPEED);
    return () => clearInterval(id);
  }, [status, placeFood, hi]);

  // 绘制
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = COLS * CELL;
    const h = ROWS * CELL;

    let raf = 0;
    const draw = () => {
      ctx.fillStyle = "oklch(0.13 0.02 70)";
      ctx.fillRect(0, 0, w, h);
      // 网格
      ctx.strokeStyle = "oklch(0.20 0.03 70 / 0.6)";
      ctx.lineWidth = 1;
      for (let i = 0; i <= COLS; i++) {
        ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, h); ctx.stroke();
      }
      for (let j = 0; j <= ROWS; j++) {
        ctx.beginPath(); ctx.moveTo(0, j * CELL); ctx.lineTo(w, j * CELL); ctx.stroke();
      }
      // 食物(金色)
      const f = foodRef.current;
      ctx.fillStyle = "oklch(0.82 0.16 85)";
      ctx.shadowColor = "oklch(0.82 0.16 85)";
      ctx.shadowBlur = 8;
      ctx.fillRect(f.x * CELL + 3, f.y * CELL + 3, CELL - 6, CELL - 6);
      ctx.shadowBlur = 0;
      // 蛇(琥珀色)
      snakeRef.current.forEach((s, i) => {
        ctx.fillStyle = i === 0 ? "oklch(0.80 0.19 70)" : "oklch(0.66 0.17 60)";
        ctx.shadowColor = "oklch(0.78 0.19 70)";
        ctx.shadowBlur = i === 0 ? 10 : 4;
        ctx.fillRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2);
      });
      ctx.shadowBlur = 0;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <GameShell title="贪吃蛇" subtitle="SNAKE" activeGameTo="/snake" onKeyAction={(k) => {
      if (k === "ArrowUp" || k === "w") turn("up");
      if (k === "ArrowDown" || k === "s") turn("down");
      if (k === "ArrowLeft" || k === "a") turn("left");
      if (k === "ArrowRight" || k === "d") turn("right");
      if (k === " " && status !== "playing") start();
    }}>
      <ScreenBar>
        <span>得分 {score}</span>
        <span className="glow-gold">最高 {hi}</span>
      </ScreenBar>

      <div className="relative mx-auto flex flex-col items-center justify-center">
        <canvas
          ref={canvasRef}
          width={COLS * CELL}
          height={ROWS * CELL}
          className="rounded-md block max-w-full max-h-[220px]"
          style={{ imageRendering: "pixelated" }}
        />
        {status === "idle" && (
          <Overlay>
            <p className="font-pixel text-[11px] glow-amber pulse-glow text-center leading-relaxed">
              贪吃蛇<br />准备好了吗?
            </p>
            <AmberButton onClick={start}>开始游戏</AmberButton>
            <p className="font-led text-base text-screen-glow/70">方向键 / WASD / 键盘控制</p>
          </Overlay>
        )}
        {status === "over" && (
          <Overlay>
            <p className="font-pixel text-[11px] glow-amber text-center leading-relaxed">
              游戏结束<br />得分 {score}
            </p>
            {score >= hi && score > 0 && (
              <p className="font-pixel text-[9px] glow-gold pulse-glow">新纪录!</p>
            )}
            <AmberButton onClick={start}>再来一局</AmberButton>
          </Overlay>
        )}
      </div>

      <div className="mt-2 relative z-10 flex items-center justify-center">
        <DPad onDir={turn} />
      </div>
    </GameShell>
  );
}

