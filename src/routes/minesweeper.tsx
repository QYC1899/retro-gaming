import { createFileRoute } from "@tanstack/react-router";
import { MinesweeperGame } from "@/components/retro-games-pack2";
export const Route = createFileRoute("/minesweeper")({
  head: () => ({
    meta: [
      { title: "扫雷终端 — 复古电脑" },
      { name: "description", content: "经典8位复古电脑扫雷游戏。" },
      { property: "og:title", content: "扫雷终端 — 复古电脑" },
    ],
  }),
  component: MinesweeperGame,
});
