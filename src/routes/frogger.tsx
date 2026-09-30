import { createFileRoute } from "@tanstack/react-router";
import { FroggerGame } from "@/components/bonus-games";
export const Route = createFileRoute("/frogger")({ head:()=>({meta:[{title:"青蛙过河 — 复古电脑"},{name:"description",content:"复古电脑卡带游戏：穿过车流抵达河岸。"},{property:"og:title",content:"青蛙过河 — 复古电脑"},{property:"og:description",content:"复古电脑卡带游戏：穿过车流抵达河岸。"},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary"}]}), component:FroggerGame });
