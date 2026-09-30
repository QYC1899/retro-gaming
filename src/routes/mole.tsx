import { createFileRoute } from "@tanstack/react-router";
import { MoleGame } from "@/components/retro-games-pack2";
export const Route = createFileRoute("/mole")({
  head: () => ({
    meta: [
      { title: "欢乐打地鼠 — 复古电脑" },
      { name: "description", content: "经典机械式九孔打地鼠反应游戏。" },
      { property: "og:title", content: "欢乐打地鼠 — 复古电脑" },
    ],
  }),
  component: MoleGame,
});
