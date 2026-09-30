import { createFileRoute } from "@tanstack/react-router";
import { AsteroidsGame } from "@/components/retro-games-pack2";
export const Route = createFileRoute("/asteroids")({
  head: () => ({
    meta: [
      { title: "小行星防御 — 复古电脑" },
      { name: "description", content: "1979 年经典小行星太空防御射击游戏。" },
      { property: "og:title", content: "小行星防御 — 复古电脑" },
    ],
  }),
  component: AsteroidsGame,
});
