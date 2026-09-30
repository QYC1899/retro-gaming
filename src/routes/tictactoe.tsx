import { createFileRoute } from "@tanstack/react-router";
import { TicTacToeGame } from "@/components/bonus-games";
export const Route = createFileRoute("/tictactoe")({ head:()=>({meta:[{title:"井字棋 — 复古电脑"},{name:"description",content:"复古电脑卡带游戏：与电脑对弈井字棋。"},{property:"og:title",content:"井字棋 — 复古电脑"},{property:"og:description",content:"复古电脑卡带游戏：与电脑对弈井字棋。"},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary"}]}), component:TicTacToeGame });
