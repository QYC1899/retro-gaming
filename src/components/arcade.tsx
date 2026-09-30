import type { ReactNode } from "react";
import { RetroComputerLayout } from "./RetroComputerLayout";

/** 通用游戏外壳: 完整 1977 年复古电脑 (CRT监视器 + 台式主机插卡口 + 机械键盘) */
export function GameShell({
  title,
  subtitle,
  children,
  activeGameTo,
  onKeyAction,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  activeGameTo?: string;
  onKeyAction?: (key: string) => void;
}) {
  return (
    <RetroComputerLayout activeGameTo={activeGameTo} onKeyAction={onKeyAction} showBackToHub={true}>
      <div className="w-full h-full flex flex-col justify-between">
        {/* Game Title Bar inside CRT */}
        <div className="flex items-center justify-between border-b border-screen-glow/20 pb-1 mb-2 font-pixel text-[8px] text-screen-glow/70">
          <span>{title}</span>
          <span className="text-amber">{subtitle}</span>
        </div>
        {/* Inner Game Canvas / Viewport */}
        <div className="flex-1 flex flex-col justify-center relative overflow-hidden">
          {children}
        </div>
      </div>
    </RetroComputerLayout>
  );
}

/** 屏幕顶部状态栏 */
export function ScreenBar({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center justify-between font-pixel text-[9px] sm:text-[10px] glow-amber mb-2 relative z-10">
      {children}
    </div>
  );
}

/** 大字居中提示(开始/结束) */
export function Overlay({ children }: { children: ReactNode }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 sm:gap-4 z-20 bg-[#0c1917]/85 backdrop-blur-[2px] p-4 text-center">
      {children}
    </div>
  );
}

/** 琥珀色开始/动作按键 */
export function AmberButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="retro-key retro-key-cream px-5 py-2.5 rounded-lg font-pixel text-[10px] text-[#3a2e1d] shadow-lg hover:scale-105 active:scale-95 transition-all"
    >
      {children}
    </button>
  );
}

/** 移动端方向键 */
export function DPad({ onDir }: { onDir: (d: "up" | "down" | "left" | "right") => void }) {
  const btn =
    "retro-key retro-key-cream rounded-md font-pixel text-xs flex items-center justify-center h-10 w-10 text-[#3a2e1d]";
  return (
    <div className="grid grid-cols-3 grid-rows-3 gap-1 w-32 mx-auto select-none my-1">
      <span />
      <button type="button" className={btn} onPointerDown={() => onDir("up")}>▲</button>
      <span />
      <button type="button" className={btn} onPointerDown={() => onDir("left")}>◀</button>
      <span className="flex items-center justify-center">
        <span className="h-3 w-3 rounded-full bg-[#8c7a5c]/50" />
      </span>
      <button type="button" className={btn} onPointerDown={() => onDir("right")}>▶</button>
      <span />
      <button type="button" className={btn} onPointerDown={() => onDir("down")}>▼</button>
      <span />
    </div>
  );
}
