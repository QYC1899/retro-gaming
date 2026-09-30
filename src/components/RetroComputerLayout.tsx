import React, { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { RetroKeyboard } from "./RetroKeyboard";
import {
  playCartridgeEject,
  playCartridgeInsert,
  playCrtDegauss,
  isSoundEnabled,
  toggleSound,
} from "@/lib/retro-audio";
import { Volume2, VolumeX, ArrowLeft } from "lucide-react";

export interface GameCardInfo {
  to: string;
  title: string;
  subtitle: string;
  icon: string;
  highScoreKey: string;
  number: string;
  instruction: string;
  color?: string;
}

export const ALL_GAMES: GameCardInfo[] = [
  // Left Side Rack: Cartridges 01 to 10
  { to: "/snake", title: "贪吃蛇", subtitle: "SNAKE", icon: "🐍", highScoreKey: "hi-snake", number: "01", instruction: "吞下金币，避开墙壁和自己的尾巴", color: "#10b981" },
  { to: "/breakout", title: "打砖块", subtitle: "BREAKOUT", icon: "🧱", highScoreKey: "hi-breakout", number: "02", instruction: "移动挡板，击碎屏幕上方的砖块", color: "#f59e0b" },
  { to: "/memory", title: "记忆翻牌", subtitle: "MEMORY", icon: "🃏", highScoreKey: "hi-memory", number: "03", instruction: "翻开卡牌，找出全部相同图案", color: "#8b5cf6" },
  { to: "/pong", title: "乒乓球", subtitle: "PONG", icon: "🏓", highScoreKey: "hi-pong", number: "04", instruction: "移动球拍，把球打回电脑一侧", color: "#3b82f6" },
  { to: "/invaders", title: "太空侵略者", subtitle: "INVADERS", icon: "👾", highScoreKey: "hi-invaders", number: "05", instruction: "移动飞船，击落所有入侵者", color: "#ec4899" },
  { to: "/frogger", title: "青蛙过河", subtitle: "FROGGER", icon: "🐸", highScoreKey: "hi-frogger", number: "06", instruction: "看准时机，穿过不断移动的车流", color: "#22c55e" },
  { to: "/tictactoe", title: "井字棋", subtitle: "TIC TAC TOE", icon: "⭕", highScoreKey: "hi-tictactoe", number: "07", instruction: "率先把三个 X 连成一条直线", color: "#f97316" },
  { to: "/reaction", title: "反应测试", subtitle: "REACTION", icon: "⚡", highScoreKey: "hi-reaction", number: "08", instruction: "等待屏幕亮起，然后立即按下", color: "#eab308" },
  { to: "/codebreaker", title: "密码破译", subtitle: "CODE BREAKER", icon: "🔐", highScoreKey: "hi-code", number: "09", instruction: "根据反馈猜出隐藏的四位数字", color: "#06b6d4" },
  { to: "/catch", title: "接金币", subtitle: "COIN CATCH", icon: "🪙", highScoreKey: "hi-catch", number: "10", instruction: "左右移动篮子，接住掉落金币", color: "#d97706" },

  // Right Side Rack: Cartridges 11 to 20
  { to: "/asteroids", title: "小行星防御", subtitle: "ASTEROIDS", icon: "🚀", highScoreKey: "hi-asteroids", number: "11", instruction: "控制飞船转向推进，击碎小行星", color: "#38ef7d" },
  { to: "/lander", title: "月球着陆器", subtitle: "LUNAR LANDER", icon: "🌕", highScoreKey: "hi-lander", number: "12", instruction: "控制主副推进引擎，平稳降落月球表面", color: "#fde047" },
  { to: "/minesweeper", title: "扫雷终端", subtitle: "MINESWEEPER", icon: "💣", highScoreKey: "hi-minesweeper", number: "13", instruction: "分析周边地雷数值，精准排雷", color: "#ef4444" },
  { to: "/race", title: "极速公路赛", subtitle: "ROAD RACE", icon: "🏎️", highScoreKey: "hi-race", number: "14", instruction: "极速穿梭车流，拾取燃料持续疾驰", color: "#f97316" },
  { to: "/dungeon", title: "地牢探险", subtitle: "ROGUE DUNGEON", icon: "🧙", highScoreKey: "hi-dungeon", number: "15", instruction: "探索地下城，搜集钥匙宝箱挑战魔物", color: "#8b5cf6" },
  { to: "/simon", title: "声光记忆", subtitle: "RETRO SIMON", icon: "🔴", highScoreKey: "hi-simon", number: "16", instruction: "复述经典四色声光记忆序列", color: "#ec4899" },
  { to: "/missile", title: "导弹防御", subtitle: "MISSILE DEFENSE", icon: "🏙️", highScoreKey: "hi-missile", number: "17", instruction: "发射高空防空拦截弹，保卫防御城市", color: "#06b6d4" },
  { to: "/slots", title: "幸运老虎机", subtitle: "VINTAGE SLOTS", icon: "🎰", highScoreKey: "hi-slots", number: "18", instruction: "拉动机械手柄，赢取 777 巨额大奖", color: "#f59e0b" },
  { to: "/mole", title: "欢乐打地鼠", subtitle: "WHACK-A-MOLE", icon: "🦔", highScoreKey: "hi-mole", number: "19", instruction: "眼疾手快，按数字键击打冒出的地鼠", color: "#10b981" },
  { to: "/typing", title: "极速打字机", subtitle: "RETRO TYPIST", icon: "⌨️", highScoreKey: "hi-typing", number: "20", instruction: "在终端敲击消除飘落的指令单词", color: "#3b82f6" },
];

interface RetroComputerLayoutProps {
  children?: ReactNode;
  activeGameTo?: string;
  onKeyAction?: (key: string) => void;
  showBackToHub?: boolean;
}

export function RetroComputerLayout({
  children,
  activeGameTo,
  onKeyAction,
  showBackToHub = false,
}: RetroComputerLayoutProps) {
  const navigate = useNavigate();
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isInserting, setIsInserting] = useState(false);
  const [isEjecting, setIsEjecting] = useState(false);
  const [screenPower, setScreenPower] = useState(true);
  const [brightness, setBrightness] = useState(100);
  const [soundOn, setSoundOn] = useState(true);
  const [bootStep, setBootStep] = useState<number>(0);
  const insertTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    setSoundOn(isSoundEnabled());
  }, []);

  // If inside a game route, find which game is active
  useEffect(() => {
    if (activeGameTo) {
      const idx = ALL_GAMES.findIndex((g) => g.to === activeGameTo);
      if (idx >= 0) setSelectedIdx(idx);
    }
  }, [activeGameTo]);

  const currentGame = ALL_GAMES[selectedIdx] ?? ALL_GAMES[0];

  const handleSoundToggle = () => {
    const next = toggleSound();
    setSoundOn(next);
  };

  const handlePowerToggle = () => {
    if (screenPower) {
      setScreenPower(false);
    } else {
      setScreenPower(true);
      playCrtDegauss();
    }
  };

  const handleInsertCartridge = (idx: number) => {
    if (isInserting || isEjecting) return;
    setSelectedIdx(idx);
    setIsInserting(true);
    setBootStep(1);

    // Audio & Cartridge motion sequence
    playCartridgeInsert();

    // Boot animation sequence
    setTimeout(() => {
      setBootStep(2);
      playCrtDegauss();
    }, 600);

    setTimeout(() => {
      setBootStep(3);
    }, 1100);

    insertTimeoutRef.current = window.setTimeout(() => {
      setIsInserting(false);
      setBootStep(0);
      const targetGame = ALL_GAMES[idx];
      if (targetGame && (!activeGameTo || activeGameTo !== targetGame.to)) {
        navigate({ to: targetGame.to });
      }
    }, 1600);
  };

  const handleEjectCartridge = () => {
    if (isInserting || isEjecting) return;
    playCartridgeEject();
    setIsEjecting(true);
    setTimeout(() => {
      setIsEjecting(false);
      if (activeGameTo) {
        navigate({ to: "/" });
      }
    }, 850);
  };

  const isCartridgeInserted = Boolean(activeGameTo) || isInserting;

  // Split into left rack (0-9) and right rack (10-19)
  const leftCartridges = ALL_GAMES.slice(0, 10);
  const rightCartridges = ALL_GAMES.slice(10, 20);

  const renderCartridgeItem = (game: GameCardInfo, idx: number, isRightSide: boolean) => {
    const isSelected = selectedIdx === idx;
    const isCurrentInserting = isInserting && isSelected;
    const isCurrentEjecting = isEjecting && isSelected;

    return (
      <div
        key={game.to}
        onClick={() => handleInsertCartridge(idx)}
        className={`retro-cartridge-3d p-1.5 sm:p-2 flex flex-col justify-between min-h-[105px] sm:min-h-[118px] relative transition-all ${
          isSelected ? "ring-2 ring-[#fbbf24] shadow-xl" : ""
        } ${
          isCurrentInserting
            ? isRightSide
              ? "cartridge-inserting-right"
              : "cartridge-inserting-left"
            : ""
        } ${isCurrentEjecting ? "cartridge-ejecting-motion" : ""}`}
        style={{
          backgroundColor: isSelected ? "#2d2419" : undefined,
        }}
      >
        {/* Grip Ribs */}
        <div className="cartridge-grip-ribs !pt-1">
          <span className="cartridge-rib !h-2" />
          <span className="cartridge-rib !h-2" />
          <span className="cartridge-rib !h-2" />
        </div>

        {/* Cartridge Sticker Art */}
        <div className="cartridge-sticker !m-1 !p-1.5 flex flex-col items-center justify-between text-center min-h-[64px]">
          <div className="w-full flex items-center justify-between text-[6px] font-pixel text-[#5c4a30]">
            <span>V.{game.number}</span>
            <span>ROM</span>
          </div>

          <div className="text-xl sm:text-2xl leading-none my-0.5">{game.icon}</div>

          <div>
            <h3 className="font-pixel text-[7px] text-[#2c2214] truncate max-w-[85px]">
              {game.title}
            </h3>
            <p className="font-led text-[11px] text-[#78613f] leading-none truncate max-w-[85px]">
              {game.subtitle}
            </p>
          </div>
        </div>

        {/* Golden Pins Connector */}
        <div className="cartridge-gold-pins !h-1.5" />

        {/* Active / Playing Marker */}
        {isSelected && activeGameTo === game.to && (
          <div className="absolute top-1 right-1 size-2 bg-[#22c55e] rounded-full shadow-sm animate-ping" />
        )}
      </div>
    );
  };

  return (
    <div className="retro-studio-backdrop flex flex-col items-center justify-start min-h-screen p-2 sm:p-4 select-none">
      {/* Studio Header Bar */}
      <header className="w-full max-w-7xl flex items-center justify-between pb-2 sm:pb-3 text-wood-dark">
        <div className="flex items-center gap-3">
          {showBackToHub && (
            <Link
              to="/"
              className="retro-key retro-key-grey px-3 py-1.5 rounded-md flex items-center gap-1.5 font-pixel text-[9px] text-[#eee4ce] hover:brightness-110 shadow-md transition-transform"
            >
              <ArrowLeft className="size-3.5" />
              <span>返回系统 (HUB)</span>
            </Link>
          )}
          <div>
            <h1 className="font-pixel text-xs sm:text-sm tracking-widest text-[#242019] flex items-center gap-2">
              <span>RETRO-1977</span>
              <span className="text-[9px] bg-[#d5c39e] text-[#4a3e2a] px-1.5 py-0.5 rounded border border-[#a89775]">
                PERSONAL COMPUTER
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 font-led text-base sm:text-lg">
          <button
            type="button"
            onClick={handleSoundToggle}
            className="flex items-center gap-1 bg-[#ded0b3] hover:bg-[#ebdcc0] px-2.5 py-1 rounded border border-[#9b8b6e] text-[#413624] shadow-sm transition-all"
            title={soundOn ? "静音 (Mute)" : "开启声音 (Unmute)"}
          >
            {soundOn ? <Volume2 className="size-4 text-[#22c55e]" /> : <VolumeX className="size-4 text-[#ef4444]" />}
            <span className="font-pixel text-[8px]">{soundOn ? "AUDIO ON" : "MUTED"}</span>
          </button>
        </div>
      </header>

      {/* Main Container with LEFT Rack, CENTER Computer, and RIGHT Rack */}
      <div className="w-full max-w-7xl flex flex-col lg:flex-row items-center lg:items-start justify-center gap-4 sm:gap-6 my-auto">
        {/* ============================================================ */}
        {/* LEFT CARTRIDGE RACK TOWER (VOL.01 - VOL.10)                   */}
        {/* ============================================================ */}
        <aside className="w-full lg:w-56 cartridge-rack-tower p-3 flex flex-col gap-2 order-2 lg:order-1">
          <div className="flex items-center justify-between pb-1.5 border-b border-[#a89775]">
            <div className="font-pixel text-[9px] text-[#352c1f] flex items-center gap-1.5">
              <span>🗃️ 左侧卡带架 A</span>
            </div>
            <span className="font-pixel text-[7px] text-[#70624a]">VOL.01-10</span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-2 gap-2 overflow-y-auto max-h-[580px] p-0.5">
            {leftCartridges.map((g, idx) => renderCartridgeItem(g, idx, false))}
          </div>
        </aside>

        {/* ============================================================ */}
        {/* CENTER RETRO COMPUTER RIG (CRT + DESKTOP CASE + KEYBOARD)    */}
        {/* ============================================================ */}
        <main className="w-full max-w-3xl flex flex-col items-center relative order-1 lg:order-2">
          {/* 1. CRT MONITOR (TOP) */}
          <div className="crt-monitor-case w-full p-4 sm:p-6 relative z-20">
            {/* Bezel Inset */}
            <div className="crt-bezel-recess">
              {/* CRT Glass Face */}
              <div
                className={`crt-glass-screen relative w-full aspect-[4/3] sm:aspect-[16/10] max-h-[440px] flex flex-col justify-between p-3 sm:p-4 ${
                  screenPower ? (bootStep === 2 ? "screen-power-on" : "") : "screen-power-off"
                }`}
                style={{ filter: `brightness(${brightness}%)` }}
              >
                {/* Glass Glare Highlight */}
                <div className="crt-glass-glare" />

                {/* Scanlines Effect */}
                <div className="crt-scanlines" />

                {/* Screen Content */}
                <div className="relative z-10 w-full h-full flex flex-col overflow-hidden">
                  {bootStep > 0 ? (
                    /* BIOS Booting Screen */
                    <div className="h-full flex flex-col items-center justify-center text-center p-4">
                      <div className="font-pixel text-[10px] sm:text-xs glow-amber mb-3 tracking-widest animate-pulse">
                        ▶ RETRO-1977 BIOS v2.4 ◀
                      </div>
                      <div className="font-led text-xl sm:text-2xl text-screen-glow/90 space-y-1">
                        <p>640K SYSTEM RAM ... OK</p>
                        {bootStep >= 2 && (
                          <p className="glow-green animate-bounce">
                            CARTRIDGE DETECTED: [{currentGame.subtitle}]
                          </p>
                        )}
                        {bootStep >= 3 && (
                          <p className="text-amber glow-gold text-lg">
                            LOADING PROGRAM INTO VRAM...
                          </p>
                        )}
                      </div>
                      <div className="w-48 sm:w-64 h-3 border border-screen-glow/50 p-0.5 mt-4 rounded-sm">
                        <div
                          className="h-full bg-screen-glow transition-all duration-700 ease-out"
                          style={{ width: bootStep === 1 ? "30%" : bootStep === 2 ? "70%" : "100%" }}
                        />
                      </div>
                    </div>
                  ) : (
                    children
                  )}
                </div>
              </div>
            </div>

            {/* Monitor Bottom Control Bar */}
            <div className="mt-3 flex items-center justify-between px-2 sm:px-4">
              {/* Left: Molded Logo & Slits */}
              <div className="flex items-center gap-3">
                <div className="font-pixel text-[7px] sm:text-[8px] text-[#70624a] tracking-widest uppercase">
                  CRT-1400 COLOR DISPLAY
                </div>
                <div className="hidden sm:flex gap-1">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <span key={i} className="w-1 h-2.5 bg-[#b5a587] rounded-full inline-block shadow-inner" />
                  ))}
                </div>
              </div>

              {/* Right: Controls */}
              <div className="flex items-center gap-3 sm:gap-4">
                {/* Brightness Dial */}
                <div className="flex items-center gap-1" title="调整屏幕亮度">
                  <span className="font-pixel text-[6px] text-[#70624a]">BRIGHT</span>
                  <div
                    className="w-6 h-3.5 bg-[#42392b] border border-[#2b241a] rounded-sm flex items-center justify-center cursor-pointer shadow-inner"
                    onClick={() => setBrightness((b) => (b >= 120 ? 80 : b + 20))}
                  >
                    <div className="w-3.5 h-1 bg-[#8e7e64] rounded-full" />
                  </div>
                </div>

                {/* Power LED */}
                <div className="flex items-center gap-1">
                  <div
                    className={`size-2.5 rounded-full border border-black/40 ${
                      screenPower ? "power-led-green" : "bg-[#1f402b]"
                    }`}
                  />
                  <span className="font-pixel text-[6px] text-[#70624a]">POWER</span>
                </div>

                {/* Power Switch */}
                <button
                  type="button"
                  onClick={handlePowerToggle}
                  className="retro-key retro-key-cream px-2 py-0.5 h-6 font-pixel text-[7px] text-[#413624] shadow-sm"
                  title="电源开关"
                >
                  {screenPower ? "ON" : "OFF"}
                </button>
              </div>
            </div>
          </div>

          {/* 2. CRT MONITOR STAND */}
          <div className="crt-stand-pedestal" />

          {/* 3. PC DESKTOP CHASSIS */}
          <div className="pc-desktop-chassis w-full p-3 sm:p-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              {/* Left Section: Logo & Louvers */}
              <div className="md:col-span-5 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="size-6 bg-[#ded0b3] border border-[#9b8b6e] rounded-sm shadow-inner flex items-center justify-center">
                    <span className="font-pixel text-[7px] text-[#70624a]">1977</span>
                  </div>
                  <div className="font-pixel text-[8px] text-[#413624] tracking-wider">
                    RETRO COMPUTING UNIT
                  </div>
                </div>

                {/* Cooling Louver Grille */}
                <div className="cooling-louver-grille h-12 flex items-center justify-between px-2">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <span key={i} className="cooling-fin !min-h-[38px]" />
                  ))}
                </div>
              </div>

              {/* Right Section: Badges & Cartridge Slot Bay */}
              <div className="md:col-span-7 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="pro-cpu-badge px-2 py-0.5">
                    <span className="font-pixel text-[7px] font-bold text-white tracking-widest">
                      PRO 133
                    </span>
                    <span className="font-pixel text-[5px] text-[#fde047]">
                      TURBO 16-BIT
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <span
                        className={`size-2 rounded-full ${
                          isInserting || isCartridgeInserted
                            ? "drive-led-active bg-[#f59e0b]"
                            : "bg-[#4a3a1e]"
                        }`}
                      />
                      <span className="font-pixel text-[6px] text-[#70624a]">DRIVE ACT</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="size-2 rounded-full power-led-green" />
                      <span className="font-pixel text-[6px] text-[#70624a]">PWR</span>
                    </div>
                  </div>
                </div>

                {/* Upper Cartridge Drive Bay */}
                <div className="cartridge-drive-bay p-2 flex items-center justify-between gap-2">
                  <div className="flex-1 flex flex-col gap-1">
                    <div className="flex items-center justify-between px-1">
                      <span className="font-pixel text-[6px] text-[#4a3e2a] font-bold">
                        CARTRIDGE DRIVE SLOT
                      </span>
                      <span className="font-pixel text-[6px] text-[#6b593a]">
                        {isCartridgeInserted ? `[NO.${currentGame.number} LOADED]` : "[EMPTY - INSERT TAPE]"}
                      </span>
                    </div>

                    <div className="cartridge-slot-door flex items-center justify-center relative">
                      {isCartridgeInserted ? (
                        <div className="font-pixel text-[8px] text-[#fbbf24] z-10 flex items-center gap-1.5">
                          <span>{currentGame.icon}</span>
                          <span>{currentGame.subtitle}</span>
                        </div>
                      ) : (
                        <span className="font-pixel text-[6px] text-[#554a3a] z-10">
                          INSERT GAME CARTRIDGE
                        </span>
                      )}
                    </div>
                  </div>

                  {/* EJECT BUTTON */}
                  <button
                    type="button"
                    onClick={handleEjectCartridge}
                    disabled={!isCartridgeInserted || isInserting || isEjecting}
                    className="retro-key retro-key-cream px-2.5 h-8 font-pixel text-[8px] text-[#413624] disabled:opacity-40"
                    title="弹出卡带"
                  >
                    {isEjecting ? "..." : "EJECT"}
                  </button>
                </div>

                {/* Lower 5.25" Bay */}
                <div className="expansion-drive-bay px-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1b3020]" />
                    <span className="font-pixel text-[6px] text-[#68593f]">EXPANSION ROM BAY</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-14 h-1 bg-[#403627] rounded-full" />
                    <div className="size-2 rounded-full bg-[#332b20]" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4. MECHANICAL KEYBOARD */}
          <div className="w-full mt-3 sm:mt-4 relative z-30">
            <RetroKeyboard onKeyPress={onKeyAction} />
          </div>

          {/* Quick Action Button */}
          {isCartridgeInserted && (
            <div className="mt-3">
              <button
                type="button"
                onClick={handleEjectCartridge}
                disabled={isInserting || isEjecting}
                className="retro-key retro-key-grey px-5 py-1.5 font-pixel text-[9px] text-[#f1ebd9] shadow-md hover:scale-105 active:scale-95 transition-transform"
              >
                {isEjecting ? "⏏ 正在弹出卡带..." : "⏏ 弹出卡带 (EJECT & CLEAR SCREEN)"}
              </button>
            </div>
          )}
        </main>

        {/* ============================================================ */}
        {/* RIGHT CARTRIDGE RACK TOWER (VOL.11 - VOL.20)                  */}
        {/* ============================================================ */}
        <aside className="w-full lg:w-56 cartridge-rack-tower p-3 flex flex-col gap-2 order-3">
          <div className="flex items-center justify-between pb-1.5 border-b border-[#a89775]">
            <div className="font-pixel text-[9px] text-[#352c1f] flex items-center gap-1.5">
              <span>🗃️ 右侧卡带架 B</span>
            </div>
            <span className="font-pixel text-[7px] text-[#70624a]">VOL.11-20</span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-2 gap-2 overflow-y-auto max-h-[580px] p-0.5">
            {rightCartridges.map((g, idx) => renderCartridgeItem(g, idx + 10, true))}
          </div>
        </aside>
      </div>

      {/* Footer */}
      <footer className="w-full max-w-5xl text-center py-3 text-[#4a3e2a] font-led text-base sm:text-lg">
        RETRO PERSONAL COMPUTER SYSTEM · 20 VINTAGE CARTRIDGE FLANKS
      </footer>
    </div>
  );
}
