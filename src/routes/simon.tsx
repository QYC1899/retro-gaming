import { createFileRoute } from "@tanstack/react-router";
import { SimonGame } from "@/components/retro-games-pack2";
export const Route = createFileRoute("/simon")({
  head: () => ({
    meta: [
      { title: "声光记忆 — 复古电脑" },
      { name: "description", content: "1978年风靡全球的Simon声光电子记忆游戏。" },
      { property: "og:title", content: "声光记忆 — 复古电脑" },
    ],
  }),
  component: SimonGame,
});
