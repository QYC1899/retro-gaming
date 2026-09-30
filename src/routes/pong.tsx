import { createFileRoute } from "@tanstack/react-router";
import { PongGame } from "@/components/bonus-games";
export const Route = createFileRoute("/pong")({ head:()=>({meta:[{title:"乒乓球 — 复古电脑"},{name:"description",content:"复古电脑卡带游戏：电子乒乓球。"},{property:"og:title",content:"乒乓球 — 复古电脑"},{property:"og:description",content:"复古电脑卡带游戏：电子乒乓球。"},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary"}]}), component:PongGame });
