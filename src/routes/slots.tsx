import { createFileRoute } from "@tanstack/react-router";
import { SlotsGame } from "@/components/retro-games-pack2";
export const Route = createFileRoute("/slots")({
  head: () => ({
    meta: [
      { title: "幸运老虎机 — 复古电脑" },
      { name: "description", content: "70年代经典三滚轮机械老虎机。" },
      { property: "og:title", content: "幸运老虎机 — 复古电脑" },
    ],
  }),
  component: SlotsGame,
});
