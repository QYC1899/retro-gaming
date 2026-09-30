import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AmberButton, GameShell, Overlay, ScreenBar } from "@/components/arcade";

export const Route = createFileRoute("/memory")({
  head: () => ({
    meta: [
      { title: "记忆翻牌 — 复古游戏机" },
      { name: "description", content: "70 年代复古风格的记忆翻牌小游戏。" },
      { property: "og:title", content: "记忆翻牌 — 复古游戏机" },
      { property: "og:description", content: "70 年代复古风格的记忆翻牌小游戏。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MemoryPage,
});

const SYMBOLS = ["★", "♥", "◆", "●", "▲", "■", "♪", "✦"];
const N = 8; // 8 对 = 16 张

type Card = { id: number; sym: string; flipped: boolean; matched: boolean };

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    const tmp = a[i]!;
    a[i] = a[j]!;
    a[j] = tmp;
  }
  return a;
}

function buildDeck(): Card[] {
  const pairs = [...SYMBOLS, ...SYMBOLS];
  return shuffle(pairs).map((sym, i) => ({ id: i, sym, flipped: false, matched: false }));
}

function MemoryPage() {
  const [deck, setDeck] = useState<Card[]>(buildDeck);
  const [picked, setPicked] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [status, setStatus] = useState<"idle" | "playing" | "win">("idle");
  const [hi, setHi] = useState(0);
  const [lock, setLock] = useState(false);

  const matchedCount = deck.filter((c) => c.matched).length;

  useEffect(() => {
    setHi(Number(localStorage.getItem("hi-memory") ?? 0));
  }, []);

  const start = useCallback(() => {
    setDeck(buildDeck());
    setPicked([]);
    setMoves(0);
    setStatus("playing");
    setLock(false);
  }, []);

  // 翻牌
  const flip = useCallback((idx: number) => {
    if (lock || status !== "playing") return;
    const card = deck[idx]!;
    if (card.flipped || card.matched) return;

    const newDeck = deck.map((c, i) => (i === idx ? { ...c, flipped: true } : c));
    const newPicked = [...picked, idx];
    setDeck(newDeck);
    setPicked(newPicked);

    if (newPicked.length === 2) {
      setMoves((m) => m + 1);
      setLock(true);
      const a = newPicked[0]!;
      const b = newPicked[1]!;
      if (newDeck[a]!.sym === newDeck[b]!.sym) {
        setTimeout(() => {
          setDeck((d) => d.map((c, i) =>
            i === a || i === b ? { ...c, matched: true } : c));
          setPicked([]);
          setLock(false);
        }, 380);
      } else {
        setTimeout(() => {
          setDeck((d) => d.map((c, i) =>
            i === a || i === b ? { ...c, flipped: false } : c));
          setPicked([]);
          setLock(false);
        }, 700);
      }
    }
  }, [deck, picked, lock, status]);

  // 胜利判定
  useEffect(() => {
    if (status === "playing" && matchedCount === N * 2) {
      setStatus("win");
      if (hi === 0 || moves < hi) {
        localStorage.setItem("hi-memory", String(moves));
        setHi(moves);
      }
    }
  }, [matchedCount, status, moves, hi]);

  const grid = useMemo(() => {
    return (
      <div className="grid grid-cols-4 gap-2 mx-auto" style={{ width: 256 }}>
        {deck.map((c, i) => (
          <button
            key={c.id}
            onPointerDown={() => flip(i)}
            className="aspect-square rounded-md flex items-center justify-center transition-all duration-150 select-none"
            style={{
              background: c.flipped || c.matched
                ? "oklch(0.18 0.03 70)"
                : "linear-gradient(160deg, oklch(0.93 0.025 75), oklch(0.86 0.04 72))",
              border: "2px solid oklch(0.22 0.045 52)",
              boxShadow: c.flipped || c.matched
                ? "inset 0 0 10px oklch(0.78 0.19 70 / 0.4)"
                : "0 3px 0 oklch(0.20 0.04 52), inset 0 1px 0 oklch(1 0 0 / 0.6)",
            }}
          >
            {c.flipped || c.matched ? (
              <span
                className="font-pixel text-base"
                style={{
                  color: c.matched ? "oklch(0.82 0.16 85)" : "oklch(0.80 0.19 70)",
                  textShadow: "0 0 8px oklch(0.78 0.19 70 / 0.7)",
                }}
              >
                {c.sym}
              </span>
            ) : (
              <span className="font-pixel text-[10px] text-wood/40">?</span>
            )}
          </button>
        ))}
      </div>
    );
  }, [deck, flip]);

  return (
    <GameShell title="记忆翻牌" subtitle="MEMORY" activeGameTo="/memory" onKeyAction={(k) => {
      if (k === " " && status !== "playing") start();
    }}>
      <ScreenBar>
        <span>步数 {moves}</span>
        <span>已配对 {matchedCount / 2}/{N}</span>
        <span className="glow-gold">最佳 {hi || "—"}</span>
      </ScreenBar>

      <div className="relative my-auto flex flex-col items-center">
        {grid}
        {status === "idle" && (
          <Overlay>
            <p className="font-pixel text-[11px] glow-amber pulse-glow text-center leading-relaxed">
              记忆翻牌<br />准备好了吗?
            </p>
            <AmberButton onClick={start}>开始游戏</AmberButton>
            <p className="font-led text-base text-screen-glow/70">翻开两张相同的卡牌图案</p>
          </Overlay>
        )}
        {status === "win" && (
          <Overlay>
            <p className="font-pixel text-[11px] glow-gold pulse-glow text-center leading-relaxed">
              全部配对!<br />{moves} 步完成
            </p>
            {(hi === 0 || moves <= hi) && (
              <p className="font-pixel text-[9px] glow-gold pulse-glow">新纪录!</p>
            )}
            <AmberButton onClick={start}>再来一局</AmberButton>
          </Overlay>
        )}
      </div>
    </GameShell>
  );
}

