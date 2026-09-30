import { createFileRoute } from "@tanstack/react-router";
import { MissileGame } from "@/components/retro-games-pack2";
export const Route = createFileRoute("/missile")({
  head: () => ({
    meta: [
      { title: "导弹防御 — 复古电脑" },
      { name: "description", content: "1980年经典弹道导弹防空拦截街机游戏。" },
      { property: "og:title", content: "导弹防御 — 复古电脑" },
    ],
  }),
  component: MissileGame,
});
