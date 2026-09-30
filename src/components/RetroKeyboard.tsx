import { useEffect, useState } from "react";
import { playKeyClick } from "@/lib/retro-audio";

interface RetroKeyboardProps {
  onKeyPress?: (key: string) => void;
  className?: string;
}

export function RetroKeyboard({ onKeyPress, className = "" }: RetroKeyboardProps) {
  const [activeKey, setActiveKey] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if inside an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      setActiveKey(e.code);
      playKeyClick();
      if (onKeyPress) {
        onKeyPress(e.key);
      }
    };

    const handleKeyUp = () => {
      setActiveKey(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [onKeyPress]);

  const handleKeyClick = (code: string, label: string) => {
    setActiveKey(code);
    playKeyClick();
    if (onKeyPress) {
      onKeyPress(label);
    }
    setTimeout(() => setActiveKey(null), 120);
  };

  const isPressed = (code: string) => activeKey === code;

  return (
    <div className={`retro-keyboard-case p-2 sm:p-4 mx-auto w-full max-w-4xl select-none ${className}`}>
      <div className="keyboard-well p-1.5 sm:p-2.5 flex flex-col gap-1 sm:gap-1.5 overflow-x-auto">
        {/* Row 1: Function / Esc */}
        <div className="flex gap-1 sm:gap-1.5 text-[9px] sm:text-[11px]">
          <button
            type="button"
            onClick={() => handleKeyClick("Escape", "Escape")}
            className={`retro-key retro-key-grey px-2 min-w-[28px] sm:min-w-[36px] ${isPressed("Escape") ? "retro-key-pressed" : ""}`}
          >
            ESC
          </button>
          <div className="flex-1" />
          {["F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12"].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => handleKeyClick(f, f)}
              className={`retro-key retro-key-grey hidden md:flex flex-1 ${isPressed(f) ? "retro-key-pressed" : ""}`}
            >
              {f}
            </button>
          ))}
          <div className="flex-1" />
          <button
            type="button"
            onClick={() => handleKeyClick("PrintScreen", "PrtSc")}
            className={`retro-key retro-key-grey px-1.5 hidden sm:flex ${isPressed("PrintScreen") ? "retro-key-pressed" : ""}`}
          >
            PRT
          </button>
          <button
            type="button"
            onClick={() => handleKeyClick("Pause", "Pause")}
            className={`retro-key retro-key-grey px-1.5 hidden sm:flex ${isPressed("Pause") ? "retro-key-pressed" : ""}`}
          >
            PAUSE
          </button>
        </div>

        {/* Row 2: Numbers */}
        <div className="flex gap-1 sm:gap-1.5 text-[11px] sm:text-[14px]">
          {["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "="].map((k, i) => {
            const code = k === "`" ? "Backquote" : i <= 10 ? `Digit${k}` : k === "-" ? "Minus" : "Equal";
            return (
              <button
                key={k}
                type="button"
                onClick={() => handleKeyClick(code, k)}
                className={`retro-key retro-key-cream flex-1 ${isPressed(code) ? "retro-key-pressed" : ""}`}
              >
                {k}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => handleKeyClick("Backspace", "Backspace")}
            className={`retro-key retro-key-grey min-w-[50px] sm:min-w-[70px] text-[10px] sm:text-[12px] ${isPressed("Backspace") ? "retro-key-pressed" : ""}`}
          >
            BACK
          </button>
        </div>

        {/* Row 3: QWERTY */}
        <div className="flex gap-1 sm:gap-1.5 text-[11px] sm:text-[14px]">
          <button
            type="button"
            onClick={() => handleKeyClick("Tab", "Tab")}
            className={`retro-key retro-key-grey min-w-[38px] sm:min-w-[54px] text-[10px] sm:text-[12px] ${isPressed("Tab") ? "retro-key-pressed" : ""}`}
          >
            TAB
          </button>
          {["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "[", "]"].map((k) => {
            const code = `Key${k}`;
            return (
              <button
                key={k}
                type="button"
                onClick={() => handleKeyClick(code, k.toLowerCase())}
                className={`retro-key retro-key-cream flex-1 ${isPressed(code) ? "retro-key-pressed" : ""}`}
              >
                {k}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => handleKeyClick("Backslash", "\\")}
            className={`retro-key retro-key-grey min-w-[32px] sm:min-w-[42px] ${isPressed("Backslash") ? "retro-key-pressed" : ""}`}
          >
            \
          </button>
        </div>

        {/* Row 4: ASDF */}
        <div className="flex gap-1 sm:gap-1.5 text-[11px] sm:text-[14px]">
          <button
            type="button"
            onClick={() => handleKeyClick("CapsLock", "CapsLock")}
            className={`retro-key retro-key-grey min-w-[46px] sm:min-w-[64px] text-[10px] sm:text-[12px] ${isPressed("CapsLock") ? "retro-key-pressed" : ""}`}
          >
            CAPS
          </button>
          {["A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "'"].map((k) => {
            const code = `Key${k}`;
            return (
              <button
                key={k}
                type="button"
                onClick={() => handleKeyClick(code, k.toLowerCase())}
                className={`retro-key retro-key-cream flex-1 ${isPressed(code) ? "retro-key-pressed" : ""}`}
              >
                {k}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => handleKeyClick("Enter", "Enter")}
            className={`retro-key retro-key-grey min-w-[55px] sm:min-w-[78px] text-[10px] sm:text-[12px] ${isPressed("Enter") ? "retro-key-pressed" : ""}`}
          >
            ENTER
          </button>
        </div>

        {/* Row 5: ZXCV + Arrows */}
        <div className="flex gap-1 sm:gap-1.5 text-[11px] sm:text-[14px]">
          <button
            type="button"
            onClick={() => handleKeyClick("ShiftLeft", "Shift")}
            className={`retro-key retro-key-grey min-w-[60px] sm:min-w-[84px] text-[10px] sm:text-[12px] ${isPressed("ShiftLeft") ? "retro-key-pressed" : ""}`}
          >
            SHIFT
          </button>
          {["Z", "X", "C", "V", "B", "N", "M", ",", ".", "/"].map((k) => {
            const code = `Key${k}`;
            return (
              <button
                key={k}
                type="button"
                onClick={() => handleKeyClick(code, k.toLowerCase())}
                className={`retro-key retro-key-cream flex-1 ${isPressed(code) ? "retro-key-pressed" : ""}`}
              >
                {k}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => handleKeyClick("ArrowUp", "ArrowUp")}
            className={`retro-key retro-key-grey min-w-[32px] sm:min-w-[42px] font-pixel text-[10px] ${isPressed("ArrowUp") ? "retro-key-pressed" : ""}`}
          >
            ▲
          </button>
          <button
            type="button"
            onClick={() => handleKeyClick("ShiftRight", "Shift")}
            className={`retro-key retro-key-grey min-w-[45px] sm:min-w-[60px] text-[10px] sm:text-[12px] hidden sm:flex ${isPressed("ShiftRight") ? "retro-key-pressed" : ""}`}
          >
            SHIFT
          </button>
        </div>

        {/* Row 6: Bottom Mods & Space & Arrow Cluster */}
        <div className="flex gap-1 sm:gap-1.5 text-[10px] sm:text-[12px]">
          <button
            type="button"
            onClick={() => handleKeyClick("ControlLeft", "Ctrl")}
            className={`retro-key retro-key-grey min-w-[40px] sm:min-w-[54px] ${isPressed("ControlLeft") ? "retro-key-pressed" : ""}`}
          >
            CTRL
          </button>
          <button
            type="button"
            onClick={() => handleKeyClick("AltLeft", "Alt")}
            className={`retro-key retro-key-grey min-w-[40px] sm:min-w-[50px] ${isPressed("AltLeft") ? "retro-key-pressed" : ""}`}
          >
            ALT
          </button>
          <button
            type="button"
            onClick={() => handleKeyClick("Space", " ")}
            className={`retro-key retro-key-cream flex-1 ${isPressed("Space") ? "retro-key-pressed" : ""}`}
          >
            <span className="font-led tracking-[0.2em] text-xs text-wood-dark/60">RETRO-1977</span>
          </button>
          <button
            type="button"
            onClick={() => handleKeyClick("AltRight", "Alt")}
            className={`retro-key retro-key-grey min-w-[38px] sm:min-w-[48px] hidden sm:flex ${isPressed("AltRight") ? "retro-key-pressed" : ""}`}
          >
            ALT
          </button>
          {/* Arrow cluster */}
          <button
            type="button"
            onClick={() => handleKeyClick("ArrowLeft", "ArrowLeft")}
            className={`retro-key retro-key-grey min-w-[32px] sm:min-w-[40px] font-pixel text-[10px] ${isPressed("ArrowLeft") ? "retro-key-pressed" : ""}`}
          >
            ◀
          </button>
          <button
            type="button"
            onClick={() => handleKeyClick("ArrowDown", "ArrowDown")}
            className={`retro-key retro-key-grey min-w-[32px] sm:min-w-[40px] font-pixel text-[10px] ${isPressed("ArrowDown") ? "retro-key-pressed" : ""}`}
          >
            ▼
          </button>
          <button
            type="button"
            onClick={() => handleKeyClick("ArrowRight", "ArrowRight")}
            className={`retro-key retro-key-grey min-w-[32px] sm:min-w-[40px] font-pixel text-[10px] ${isPressed("ArrowRight") ? "retro-key-pressed" : ""}`}
          >
            ▶
          </button>
        </div>
      </div>
    </div>
  );
}
