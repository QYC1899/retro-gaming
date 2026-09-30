import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { AmberButton, GameShell, Overlay, ScreenBar } from "@/components/arcade";

export const Route = createFileRoute("/breakout")({
  head: () => ({
    meta: [
      { title: "打砖块 — 复古游戏机" },
      { name: "description", content: "70 年代复古风格的打砖块小游戏。" },
      { property: "og:title", content: "打砖块 — 复古游戏机" },
      { property: "og:description", content: "70 年代复古风格的打砖块小游戏。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BreakoutPage,
});

const W = 256;
const H = 240;
const PADDLE_W = 48;
const PADDLE_H = 8;
const BALL = 6;
const BRICK_ROWS = 5;
const BRICK_COLS = 8;
const BRICK_W = 28;
const BRICK_H = 12;
const BRICK_GAP = 2;
const BRICK_TOP = 30;

type State = "idle" | "playing" | "over" | "win";
type Vec = { x: number; y: number };

const ROW_COLORS = [
  "oklch(0.82 0.16 85)",
  "oklch(0.70 0.18 62)",
  "oklch(0.66 0.17 60)",
  "oklch(0.60 0.14 55)",
  "oklch(0.50 0.12 50)",
];

function BreakoutPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const paddleX = useRef(W / 2 - PADDLE_W / 2);
  const ball = useRef<Vec>({ x: W / 2, y: H - 40 });
  const vel = useRef<Vec>({ x: 2, y: -2.6 });
  const bricks = useRef<boolean[]>(Array(BRICK_ROWS * BRICK_COLS).fill(true));
  const [status, setStatus] = useState<State>("idle");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [hi, setHi] = useState(0);
  const statusRef = useRef<State>("idle");
  const scoreRef = useRef(0);
  const livesRef = useRef(3);

  useEffect(() => { statusRef.current = status; }, [status]);
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { livesRef.current = lives; }, [lives]);

  useEffect(() => {
    setHi(Number(localStorage.getItem("hi-breakout") ?? 0));
  }, []);

  const reset = useCallback((full: boolean) => {
    paddleX.current = W / 2 - PADDLE_W / 2;
    ball.current = { x: W / 2, y: H - 40 };
    vel.current = { x: 2, y: -2.6 };
    if (full) {
      bricks.current = Array(BRICK_ROWS * BRICK_COLS).fill(true);
      setScore(0);
      setLives(3);
    }
  }, []);

  const start = useCallback(() => {
    reset(true);
    setStatus("playing");
  }, [reset]);

  // 输入:鼠标/触摸 + 键盘
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const move = (clientX: number) => {
      const rect = canvas.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * W;
      paddleX.current = Math.max(0, Math.min(W - PADDLE_W, x - PADDLE_W / 2));
    };
    const onMouse = (e: MouseEvent) => move(e.clientX);
    const onTouch = (e: TouchEvent) => {
      if (e.touches[0]) move(e.touches[0].clientX);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") paddleX.current = Math.max(0, paddleX.current - 16);
      else if (e.key === "ArrowRight") paddleX.current = Math.min(W - PADDLE_W, paddleX.current + 16);
      else if (e.key === " " && statusRef.current !== "playing") start();
    };
    canvas.addEventListener("mousemove", onMouse);
    canvas.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      canvas.removeEventListener("mousemove", onMouse);
      canvas.removeEventListener("touchmove", onTouch);
      window.removeEventListener("keydown", onKey);
    };
  }, [start]);

  // 游戏循环
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;

    const step = () => {
      // 物理(仅 playing)
      if (statusRef.current === "playing") {
        const b = ball.current;
        const v = vel.current;
        b.x += v.x;
        b.y += v.y;

        if (b.x < BALL / 2) { b.x = BALL / 2; v.x = Math.abs(v.x); }
        if (b.x > W - BALL / 2) { b.x = W - BALL / 2; v.x = -Math.abs(v.x); }
        if (b.y < BALL / 2) { b.y = BALL / 2; v.y = Math.abs(v.y); }

        // 挡板
        const px = paddleX.current;
        const py = H - 16;
        if (b.y + BALL / 2 >= py && b.y + BALL / 2 <= py + PADDLE_H + 4 &&
            b.x >= px && b.x <= px + PADDLE_W && v.y > 0) {
          v.y = -Math.abs(v.y);
          const hit = (b.x - (px + PADDLE_W / 2)) / (PADDLE_W / 2);
          v.x = hit * 3.2;
        }

        // 砖块
        for (let r = 0; r < BRICK_ROWS; r++) {
          for (let c = 0; c < BRICK_COLS; c++) {
            const idx = r * BRICK_COLS + c;
            if (!bricks.current[idx]) continue;
            const bx = c * (BRICK_W + BRICK_GAP) + 4;
            const by = r * (BRICK_H + BRICK_GAP) + BRICK_TOP;
            if (b.x + BALL / 2 > bx && b.x - BALL / 2 < bx + BRICK_W &&
                b.y + BALL / 2 > by && b.y - BALL / 2 < by + BRICK_H) {
              bricks.current[idx] = false;
              v.y = -v.y;
              setScore((s) => s + 10);
            }
          }
        }

        // 掉落
        if (b.y > H) {
          const nl = livesRef.current - 1;
          setLives(nl);
          if (nl <= 0) {
            setStatus("over");
            setScore((prev) => {
              if (prev > hi) { localStorage.setItem("hi-breakout", String(prev)); setHi(prev); }
              return prev;
            });
          } else {
            ball.current = { x: W / 2, y: H - 40 };
            vel.current = { x: 2, y: -2.6 };
          }
        }

        // 胜利
        if (bricks.current.every((b2) => !b2)) {
          setStatus("win");
          setScore((prev) => {
            if (prev > hi) { localStorage.setItem("hi-breakout", String(prev)); setHi(prev); }
            return prev;
          });
        }
      }

      // 绘制
      ctx.fillStyle = "oklch(0.13 0.02 70)";
      ctx.fillRect(0, 0, W, H);

      // 砖块
      for (let r = 0; r < BRICK_ROWS; r++) {
        for (let c = 0; c < BRICK_COLS; c++) {
          const idx = r * BRICK_COLS + c;
          if (!bricks.current[idx]) continue;
          const bx = c * (BRICK_W + BRICK_GAP) + 4;
          const by = r * (BRICK_H + BRICK_GAP) + BRICK_TOP;
          ctx.fillStyle = ROW_COLORS[r]!;
          ctx.shadowColor = ROW_COLORS[r]!;
          ctx.shadowBlur = 6;
          ctx.fillRect(bx, by, BRICK_W, BRICK_H);
        }
      }
      ctx.shadowBlur = 0;

      // 挡板
      const px = paddleX.current;
      ctx.fillStyle = "oklch(0.93 0.025 75)";
      ctx.shadowColor = "oklch(0.78 0.19 70)";
      ctx.shadowBlur = 8;
      ctx.fillRect(px, H - 16, PADDLE_W, PADDLE_H);
      ctx.shadowBlur = 0;

      // 球
      const b = ball.current;
      ctx.fillStyle = "oklch(0.80 0.19 70)";
      ctx.shadowColor = "oklch(0.80 0.19 70)";
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(b.x, b.y, BALL / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      raf = requestAnimationFrame(step);
    };
    step();
    return () => cancelAnimationFrame(raf);
  }, [hi]);

  return (
    <GameShell title="打砖块" subtitle="BREAKOUT" activeGameTo="/breakout" onKeyAction={(k) => {
      if (k === "ArrowLeft" || k === "a") {
        paddleX.current = Math.max(0, paddleX.current - 18);
      } else if (k === "ArrowRight" || k === "d") {
        paddleX.current = Math.min(W - PADDLE_W, paddleX.current + 18);
      } else if (k === " " && status !== "playing") {
        start();
      }
    }}>
      <ScreenBar>
        <span>得分 {score}</span>
        <span>生命 {lives}</span>
        <span className="glow-gold">最高 {hi}</span>
      </ScreenBar>

      <div className="relative mx-auto flex flex-col items-center" style={{ width: "100%", maxWidth: 320 }}>
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="rounded-md block w-full touch-none max-h-[220px]"
          style={{ imageRendering: "pixelated", aspectRatio: `${W}/${H}` }}
        />
        {status === "idle" && (
          <Overlay>
            <p className="font-pixel text-[11px] glow-amber pulse-glow text-center leading-relaxed">
              打砖块<br />准备好了吗?
            </p>
            <AmberButton onClick={start}>开始游戏</AmberButton>
            <p className="font-led text-base text-screen-glow/70">鼠标移动 / 左右方向键控制挡板</p>
          </Overlay>
        )}
        {status === "over" && (
          <Overlay>
            <p className="font-pixel text-[11px] glow-amber text-center leading-relaxed">
              游戏结束<br />得分 {score}
            </p>
            {score >= hi && score > 0 && <p className="font-pixel text-[9px] glow-gold pulse-glow">新纪录!</p>}
            <AmberButton onClick={start}>再来一局</AmberButton>
          </Overlay>
        )}
        {status === "win" && (
          <Overlay>
            <p className="font-pixel text-[11px] glow-gold pulse-glow text-center leading-relaxed">
              全部清除!<br />得分 {score}
            </p>
            <AmberButton onClick={start}>再来一局</AmberButton>
          </Overlay>
        )}
      </div>
    </GameShell>
  );
}

