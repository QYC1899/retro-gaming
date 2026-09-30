import { createFileRoute } from "@tanstack/react-router";
import { TypingGame } from "@/components/retro-games-pack2";
export const Route = createFileRoute("/typing")({
  head: () => ({
    meta: [
      { title: "极速打字机 — 复古电脑" },
      { name: "description", content: "80年代终端极速敲击消除打字防御游戏。" },
      { property: "og:title", content: "极速打字机 — 复古电脑" },
    ],
  }),
  component: TypingGame,
});
