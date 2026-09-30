import { createFileRoute } from "@tanstack/react-router";
import { LunarLanderGame } from "@/components/retro-games-pack2";
export const Route = createFileRoute("/lander")({
  head: () => ({
    meta: [
      { title: "月球着陆器 — 复古电脑" },
      { name: "description", content: "阿波罗月球飞船软着陆模拟游戏。" },
      { property: "og:title", content: "月球着陆器 — 复古电脑" },
    ],
  }),
  component: LunarLanderGame,
});
