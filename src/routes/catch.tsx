import { createFileRoute } from "@tanstack/react-router";
import { CatchGame } from "@/components/bonus-games";
export const Route = createFileRoute("/catch")({ head:()=>({meta:[{title:"接金币 — 复古电脑"},{name:"description",content:"复古电脑卡带游戏：移动篮子接住金币。"},{property:"og:title",content:"接金币 — 复古电脑"},{property:"og:description",content:"复古电脑卡带游戏：移动篮子接住金币。"},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary"}]}), component:CatchGame });
