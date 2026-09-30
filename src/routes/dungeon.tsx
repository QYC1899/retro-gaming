import { createFileRoute } from "@tanstack/react-router";
import { DungeonGame } from "@/components/retro-games-pack2";
export const Route = createFileRoute("/dungeon")({
  head: () => ({
    meta: [
      { title: "地牢探险 — 复古电脑" },
      { name: "description", content: "经典8位像素ASCII地牢RPG探险游戏。" },
      { property: "og:title", content: "地牢探险 — 复古电脑" },
    ],
  }),
  component: DungeonGame,
});
