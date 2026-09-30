import { createFileRoute } from "@tanstack/react-router";
import { RoadRaceGame } from "@/components/retro-games-pack2";
export const Route = createFileRoute("/race")({
  head: () => ({
    meta: [
      { title: "极速公路赛 — 复古电脑" },
      { name: "description", content: "80年代经典俯视角公路赛车游戏。" },
      { property: "og:title", content: "极速公路赛 — 复古电脑" },
    ],
  }),
  component: RoadRaceGame,
});
