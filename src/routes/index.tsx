import { createFileRoute } from "@tanstack/react-router";
import { RetroComputerLayout } from "@/components/RetroComputerLayout";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "复古游戏电脑 — Retro Computer 1977" },
      { name: "description", content: "70/80年代复古游戏电脑，包含CRT显示器、机箱驱动器、机械键盘与10款怀旧卡带游戏。" },
      { property: "og:title", content: "复古游戏电脑 — Retro Computer 1977" },
      { property: "og:description", content: "70/80年代复古游戏电脑，包含CRT显示器、机箱驱动器、机械键盘与10款怀旧卡带游戏。" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ArcadeHubPage,
});

function ArcadeHubPage() {
  return (
    <RetroComputerLayout>
      {/* Clear Screen / No Game Displayed State */}
      <div className="h-full flex flex-col justify-between items-start text-left p-4 font-pixel text-[#38ef7d] select-none">
        {/* Top BIOS / OS info */}
        <div className="space-y-1.5">
          <p className="text-[9px] sm:text-[10px] text-screen-glow/90 tracking-wider">
            RETRO-1977 PERSONAL COMPUTER SYSTEM
          </p>
          <p className="text-[7px] sm:text-[8px] text-screen-glow/70">
            640KB RAM SYSTEM · 38911 BYTES FREE
          </p>
          <p className="text-[7px] sm:text-[8px] text-screen-glow/60">
            BIOS v2.4 (C) 1977 RETROCORP
          </p>
        </div>

        {/* Center Prompt */}
        <div className="my-auto py-4 border-l-2 border-screen-glow/30 pl-3 sm:pl-4 space-y-2">
          <p className="text-[8px] sm:text-[10px] glow-amber font-bold">
            [ DRIVE BAY: EMPTY ]
          </p>
          <p className="text-[7px] sm:text-[9px] text-screen-glow/80">
            NO CARTRIDGE INSERTED.
          </p>
          <p className="text-[7px] sm:text-[8px] text-screen-glow/60 leading-relaxed max-w-md">
            PLEASE SELECT AND INSERT A GAME CARTRIDGE FROM THE DESK TO BOOT.
          </p>
        </div>

        {/* Command Line / Cursor Prompt */}
        <div className="w-full pt-2 border-t border-screen-glow/20 flex items-center gap-1 text-[8px] sm:text-[9px]">
          <span className="text-screen-glow/80">C:\&gt;</span>
          <span className="w-2.5 h-3.5 bg-screen-glow inline-block animate-pulse" />
        </div>
      </div>
    </RetroComputerLayout>
  );
}
