import { createFileRoute } from "@tanstack/react-router";
import { ReactionGame } from "@/components/bonus-games";
export const Route = createFileRoute("/reaction")({ head:()=>({meta:[{title:"反应测试 — 复古电脑"},{name:"description",content:"复古电脑卡带游戏：测试你的反应速度。"},{property:"og:title",content:"反应测试 — 复古电脑"},{property:"og:description",content:"复古电脑卡带游戏：测试你的反应速度。"},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary"}]}), component:ReactionGame });
