import { createFileRoute } from "@tanstack/react-router";
import { InvadersGame } from "@/components/bonus-games";
export const Route = createFileRoute("/invaders")({ head:()=>({meta:[{title:"太空侵略者 — 复古电脑"},{name:"description",content:"复古电脑卡带游戏：太空侵略者。"},{property:"og:title",content:"太空侵略者 — 复古电脑"},{property:"og:description",content:"复古电脑卡带游戏：太空侵略者。"},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary"}]}), component:InvadersGame });
